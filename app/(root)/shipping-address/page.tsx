import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { ShippingAddress } from "@/types";
import { redirect } from "next/navigation";
import ShippingAddressForm from "./shipping-address-form";
import { convertToPlainObject } from "@/lib/utils";

export const metadata = {
  title: "Shipping Address",
};

async function getShippingAddress() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { address: true },
  });

  if (user?.address) {
    // Convert the JSON data to ShippingAddress type
    return convertToPlainObject(user.address) as ShippingAddress;
  }

  return null;
}

export default async function ShippingAddressPage() {
  const address = await getShippingAddress();

  return (
    <main className="container">
      <ShippingAddressForm address={address} />
    </main>
  );
}
