"use client";

import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition, useEffect, useCallback } from "react";
import { shippingAddressSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { shippingAddressDefaultValue } from "@/lib/constants";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { updateUserAddress } from "@/lib/actions/user.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { malaysiaStatesAndCities } from "@/lib/constants/locations";
import { setCookie } from "@/lib/utils";

interface ShippingAddressFormProps {
  address: ShippingAddress | null;
  completedSteps: number[];
}

const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  address,
  completedSteps,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [cities, setCities] = useState<string[]>([]);

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: address?.fullName || shippingAddressDefaultValue.fullName,
      streetAddress:
        address?.streetAddress || shippingAddressDefaultValue.streetAddress,
      city: address?.city || shippingAddressDefaultValue.city,
      state: address?.state || shippingAddressDefaultValue.state,
      postalCode: address?.postalCode || shippingAddressDefaultValue.postalCode,
      country: address?.country || shippingAddressDefaultValue.country,
    },
  });

  // Initialize cities based on default state
  useEffect(() => {
    const currentState = form.getValues("state");
    if (currentState) {
      setCities(
        malaysiaStatesAndCities[
          currentState as keyof typeof malaysiaStatesAndCities
        ] || []
      );
    }
  }, [form]);

  const handleStateChange = (value: string) => {
    form.setValue("state", value);
    form.setValue("city", ""); // Reset city when state changes
    const newCities =
      malaysiaStatesAndCities[value as keyof typeof malaysiaStatesAndCities] ||
      [];
    setCities(newCities);
  };

  const updateCompletedSteps = useCallback(() => {
    const newSteps = [...completedSteps];
    if (!newSteps.includes(1)) {
      newSteps.push(1);
    }
    setCookie("completedSteps", JSON.stringify(newSteps));
  }, [completedSteps]);

  const onSubmit: SubmitHandler<z.infer<typeof shippingAddressSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      const res = await updateUserAddress(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
        return;
      }

      updateCompletedSteps();
      router.push("/payment-method");
    });
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4 text-center">Shipping Address</h1>
      <p className="text-sm text-muted-foreground text-center">
        Enter an address to ship to
      </p>
      <Form {...form}>
        <form
          method="post"
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/* name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "fullName"
              >;
            }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* street */}
          <FormField
            control={form.control}
            name="streetAddress"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "streetAddress"
              >;
            }) => (
              <FormItem>
                <FormLabel>Street Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* state */}
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select
                  onValueChange={handleStateChange}
                  value={field.value || undefined}
                  defaultValue={field.value || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(malaysiaStatesAndCities).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* city */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  defaultValue={field.value || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.length === 0 ? (
                      <SelectItem value="placeholder" disabled>
                        Select state first
                      </SelectItem>
                    ) : (
                      cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* postal code */}
          <FormField
            control={form.control}
            name="postalCode"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "postalCode"
              >;
            }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* country */}
          <FormField
            control={form.control}
            name="country"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof shippingAddressSchema>,
                "country"
              >;
            }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Enter country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
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

export default ShippingAddressForm;
