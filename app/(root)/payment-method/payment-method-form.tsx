"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useEffect, useState } from "react";
import { paymentMethodSchema } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { setCookie } from "@/lib/utils";

interface PaymentMethodFormProps {
  preferredPaymentMethod: string | null;
  completedSteps: number[];
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  preferredPaymentMethod,
  completedSteps,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof paymentMethodSchema>>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateCompletedSteps = () => {
    const newSteps = Array.from(new Set([...completedSteps, 2]));
    setCookie("completedSteps", JSON.stringify(newSteps));
  };

  const onSubmit = async (values: z.infer<typeof paymentMethodSchema>) => {
    startTransition(async () => {
      const res = await updateUserPaymentMethod(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      updateCompletedSteps();
      router.push("/place-order");
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4 text-center">Payment Method</h1>
      <p className="text-sm text-muted-foreground text-center">
        Select a payment method
      </p>
      <Form {...form}>
        <form
          method="post"
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    className="flex flex-col space-y-2"
                  >
                    {PAYMENT_METHODS.map((paymentMethod) => (
                      <FormItem
                        key={paymentMethod}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem value={paymentMethod} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {paymentMethod}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending} className="mt-5">
              {isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}{" "}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentMethodForm;
