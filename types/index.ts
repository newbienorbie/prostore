import { z } from "zod";
import { insertProductSchema } from "@/lib/validators";
import { Decimal } from "@prisma/client/runtime/library";

export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: Decimal;
  numReviews: number;
  createdAt: Date;
};
