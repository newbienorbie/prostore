import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.actions";
import PaymentMethodForm from "./payment-method-form";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentMethodType, PAYMENT_METHODS_INTERNAL } from "@/lib/constants";

async function getCompletedSteps(): Promise<number[]> {
  try {
    const cookieStore = await cookies();
    const completedStepsStr = cookieStore.get("completedSteps")?.value;
    return completedStepsStr ? JSON.parse(completedStepsStr) : [0];
  } catch (error) {
    console.error("Error parsing completed steps:", error);
    return [0];
  }
}

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/sign-in");

  const [user, completedSteps] = await Promise.all([
    getUserById(userId),
    getCompletedSteps(),
  ]);

  // Redirect if shipping address is not set
  if (!user.address) {
    redirect("/shipping-address");
  }

  // Convert user.paymentMethod to PaymentMethodType or null
  const paymentMethod =
    user.paymentMethod &&
    PAYMENT_METHODS_INTERNAL.includes(user.paymentMethod as PaymentMethodType)
      ? (user.paymentMethod as PaymentMethodType)
      : null;

  // If we're here, both login and shipping are done
  const updatedSteps = Array.from(new Set([...completedSteps, 0, 1]));

  return (
    <main className="container">
      <CheckoutSteps current={2} completedSteps={updatedSteps} />
      <PaymentMethodForm preferredPaymentMethod={paymentMethod} />
    </main>
  );
};

export default PaymentMethodPage;
