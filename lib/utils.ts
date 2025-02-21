import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CartItem } from "@/types";
import qs from "query-string";
import { PAYMENT_METHOD_MAPPINGS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convert prisma object into a regular JS object
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

// Format number with decimal places
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

// format errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any) {
  if (error.name === "ZodError") {
    // handle zod error
    return error.errors
      .map((e: { message: string }) => `${e.message}.`)
      .join(" ");
  } else if (
    error.name === "PrismaClientKnownRequestError" &&
    error.code === "P2002"
  ) {
    // handle prisma error
    const field = error.meta?.target ? error.meta?.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // handle other errors
    return typeof error.message === "string"
      ? error.message
      : JSON.stringify(error.message);
  }
}

// round number to 2 decimal places
export function round2(value: number | string) {
  if (typeof value === "number") {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  } else if (typeof value === "string") {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error("Value is not a number or string");
  }
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-MY", {
  currency: "MYR",
  style: "currency",
  minimumFractionDigits: 2,
});

// format currency using the formatter above
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === "number") {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === "string") {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return "NaN";
  }
}

// format number
const NUMBER_FORMATTER = new Intl.NumberFormat("en-MY");

export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}

export const calcPrice = (items: CartItem[]) => {
  // Ensure we have valid items
  if (!Array.isArray(items) || items.length === 0) {
    return {
      itemsPrice: "0.00",
      shippingPrice: "0.00",
      taxPrice: "0.00",
      totalPrice: "0.00",
    };
  }

  const itemsPrice = items.reduce((acc, item) => {
    const price =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return acc + price * (item.qty || 0);
  }, 0);

  const roundedItemsPrice = round2(itemsPrice);
  const shippingPrice = roundedItemsPrice > 100 ? 0 : 10;
  const taxPrice = round2(roundedItemsPrice * 0.15);
  const totalPrice = round2(roundedItemsPrice + shippingPrice + taxPrice);

  return {
    itemsPrice: roundedItemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};

// shorten uuid
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

// format date and times
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-MY",
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-MY",
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-MY",
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

// cookies for checkout-steps
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
}

// form pagination links
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);
  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    {
      skipNull: true,
    }
  );
}

export const normalizePaymentMethod = (method: string): string => {
  const normalized = method
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/\s+/g, "")
    .trim();

  // Return matching internal name
  const internalName = Object.keys(PAYMENT_METHOD_MAPPINGS).find(
    (key) => key.toLowerCase() === normalized
  );

  return internalName || normalized;
};

// Convert internal name to display name
export const getPaymentMethodDisplay = (method: string): string => {
  return (
    PAYMENT_METHOD_MAPPINGS[method as keyof typeof PAYMENT_METHOD_MAPPINGS] ||
    method
  );
};

// format rating
export function formatRating(rating: number): string {
  return rating.toFixed(2);
}
