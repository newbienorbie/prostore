export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Prostore";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A modern ecommerce store built with Next.js";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;
export const signInDefaultValues = {
  email: "",
  password: "",
};
export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const shippingAddressDefaultValue = {
  fullName: "",
  streetAddress: "",
  state: "",
  city: "",
  postalCode: "",
  country: "",
};

export const PAYMENT_METHODS_INTERNAL = [
  "Paypal",
  "Stripe",
  "Touchngo",
  "Cashondelivery",
] as const;

export type PaymentMethodType = (typeof PAYMENT_METHODS_INTERNAL)[number];

export const PAYMENT_METHOD_MAPPINGS: Record<PaymentMethodType, string> = {
  Paypal: "PayPal",
  Stripe: "Stripe",
  Touchngo: "Touch 'n Go",
  Cashondelivery: "Cash on Delivery",
};

export const PAYMENT_METHODS_DISPLAY = Object.values(PAYMENT_METHOD_MAPPINGS);

export const DEFAULT_PAYMENT_METHOD: PaymentMethodType = "Touchngo";

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 12;

export const productDefaultValues = {
  name: "",
  slug: "",
  category: "",
  images: [],
  brand: "",
  description: "",
  price: "0",
  stock: 0,
  rating: "0",
  numReviews: "0",
  isFeatured: false,
  banner: null,
};

export const USER_ROLES = process.env.USER_ROLES
  ? process.env.USER_ROLES.split(", ")
  : ["admin", "user"];

export const reviewFormDefaultValues = {
  title: "",
  comment: "",
  rating: 0,
};
