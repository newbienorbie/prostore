// page.tsx
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";
import { convertToPlainObject } from "@/lib/utils";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { cookies } from "next/headers";

export const metadata = {
  title: "Shipping Address",
};

async function getShippingAddress(): Promise<ShippingAddress | null> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { address: true },
  });

  if (user?.address) {
    return convertToPlainObject(user.address) as ShippingAddress;
  }

  return null;
}

async function getCompletedSteps(): Promise<number[]> {
  try {
    const cookieStore = await cookies();
    const completedStepsStr = cookieStore.get("completedSteps")?.value;
    return completedStepsStr ? JSON.parse(completedStepsStr) : [0];
  } catch (error) {
    console.error("Error parsing completed steps:", error);
    return [0]; // Default to first step completed if there's an error
  }
}

export default async function ShippingAddressPage() {
  const [address, completedSteps] = await Promise.all([
    getShippingAddress(),
    getCompletedSteps(),
  ]);

  return (
    <main className="container">
      <CheckoutSteps current={1} completedSteps={completedSteps} />
      <ShippingAddressForm address={address} completedSteps={completedSteps} />
    </main>
  );
}
