// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Decimal } from "@prisma/client/runtime/library";
import { Product } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// convert prisma object into regular JS object while preserving Decimal types
export function convertToPlainObject<T>(value: T): T {
  const plainObj = JSON.parse(JSON.stringify(value));

  // If the value is an array, process each item
  if (Array.isArray(plainObj)) {
    return plainObj.map((item) => ({
      ...item,
      price: new Decimal(item.price),
      rating: new Decimal(item.rating),
    })) as T;
  }

  // If it's a single object
  return {
    ...plainObj,
    price: new Decimal(plainObj.price),
    rating: new Decimal(plainObj.rating),
  } as T;
}

// format number with decimal places for price
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}
