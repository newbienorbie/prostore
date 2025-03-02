"use server";

import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
  updateUserSchema,
} from "../validators";
import { auth, signIn, signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { compare, hash } from "../encrypt";
import { prisma } from "@/db/prisma";
import {
  formatError,
  getPaymentMethodDisplay,
  normalizePaymentMethod,
} from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod";
import {
  DEFAULT_PAYMENT_METHOD,
  PAGE_SIZE,
  PAYMENT_METHODS_INTERNAL,
  type PaymentMethodType,
} from "../constants";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getMyCart } from "./cart.actions";

// sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData,
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    // First verify the credentials
    const dbUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    if (!dbUser || !dbUser.password) {
      return { success: false, message: "Invalid email or password" };
    }

    const isMatch = await compare(user.password, dbUser.password);
    if (!isMatch) {
      return { success: false, message: "Invalid email or password" };
    }

    // If credentials are valid, proceed with sign in
    await signIn("credentials", user);

    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: formatError(error) };
  }
}

// sign user out
export async function signOutUser() {
  const currentCart = await getMyCart();
  await prisma.cart.delete({ where: { id: currentCart?.id } });
  await signOut({ redirect: true, redirectTo: "/sign-in" });
}

// sign up user
export async function signUpuser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    const plainPassword = user.password;

    user.password = await hash(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    // sign user in right after signing up
    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: formatError(error) };
  }
}

// get user by the ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");

  // Get internal format for payment method
  const paymentMethod = normalizePaymentMethod(
    user.paymentMethod || DEFAULT_PAYMENT_METHOD,
  );

  // Return user with normalized payment method
  return {
    ...user,
    paymentMethod,
    paymentMethodDisplay: getPaymentMethodDisplay(paymentMethod),
  };
}

// update user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>,
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (!currentUser) throw new Error("User not found");

    // Validate the payment method
    const paymentMethod = paymentMethodSchema.parse(data);

    // Convert to internal format
    const internalPaymentMethod = normalizePaymentMethod(paymentMethod.type);

    // Check if the normalized payment method is in our allowed list
    // Type assertion here is safe because we've validated it through the schema
    if (
      !PAYMENT_METHODS_INTERNAL.includes(
        internalPaymentMethod as PaymentMethodType,
      )
    ) {
      throw new Error("Invalid payment method");
    }

    // Store internal format in database
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        paymentMethod: internalPaymentMethod as PaymentMethodType,
      },
    });

    return {
      success: true,
      message: "Payment method updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// update user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: user.name,
      },
    });
    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return { data, totalPages: Math.ceil(dataCount / limit) };
}

// delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
