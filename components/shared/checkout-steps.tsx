"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const steps = [
  { name: "User Login", path: "/sign-in" },
  { name: "Shipping Address", path: "/shipping-address" },
  { name: "Payment Method", path: "/payment-method" },
  { name: "Place Order", path: "/place-order" },
] as const;

interface CheckoutStepsProps {
  current: number;
  allowNavigation?: boolean;
  completedSteps?: number[];
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  current = 0,
  allowNavigation = true,
  completedSteps = [0],
}) => {
  const router = useRouter();
  const safeCompletedSteps = completedSteps ?? [0];

  const handleStepClick = (stepIndex: number, path: string) => {
    if (
      allowNavigation &&
      (safeCompletedSteps.includes(stepIndex) || stepIndex === current)
    ) {
      router.push(path);
    }
  };

  return (
    <div className="flex-between flex-col md:flex-row space-x-2 space-y-2 mb-10">
      {steps.map((step, index) => (
        <React.Fragment key={step.name}>
          <Button
            variant="ghost"
            className={cn(
              "p-2 w-56 rounded-full text-center text-sm",
              index === current ? "bg-secondary" : "",
              safeCompletedSteps.includes(index)
                ? "text-primary"
                : "text-muted-foreground",
              !allowNavigation ||
                (!safeCompletedSteps.includes(index) && index !== current)
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-secondary/80"
            )}
            onClick={() => handleStepClick(index, step.path)}
            disabled={
              !allowNavigation ||
              (!safeCompletedSteps.includes(index) && index !== current)
            }
          >
            {step.name}
          </Button>
          {step.name !== "Place Order" && (
            <hr className="w-16 border-t border-gray-300 mx-2" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutSteps;
