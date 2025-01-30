"use client";

import { createOrder } from "@/lib/actions/order.actions";
import { Check, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setCookie } from "@/lib/utils";

interface PlaceOrderFormProps {
  completedSteps: number[];
}

const PlaceOrderForm: React.FC<PlaceOrderFormProps> = ({ completedSteps }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const updateCompletedSteps = () => {
    const newSteps = Array.from(new Set([...completedSteps, 3]));
    setCookie("completedSteps", JSON.stringify(newSteps));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const res = await createOrder();

      if (!res) {
        throw new Error("No response from createOrder");
      }

      if (res.success) {
        updateCompletedSteps();

        if (res.redirectTo) {
          router.push(res.redirectTo);
        } else {
          router.push("/order/success");
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: res.message || "Failed to place order",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="w-full" onSubmit={handleSubmit}>
      <Button disabled={isLoading} className="w-full">
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Check className="w-4 h-4 mr-2" />
        )}
        {isLoading ? "Processing..." : "Place Order"}
      </Button>
    </form>
  );
};

export default PlaceOrderForm;
