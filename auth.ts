import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "./lib/encrypt";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { CartItem } from "./types";
import { calcPrice } from "./lib/utils";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXT_AUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        // find user in database
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // check if user exists and if the password matches
        if (user && user.password) {
          const isMatch = await compare(
            credentials.password as string,
            user.password,
          );

          // if password is correct, return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }

        // if user does not exist or password does not match, return null
        return null;
      },
    }),
  ],

  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // if there is an update, set the user name
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },

    async jwt({ token, user, trigger, session }: any) {
      // assign user fields to token
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // if user has no name then use email
        if (user.name === "NO_NAME") {
          token.name = user.email.split("@")[0];

          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }

        // Handle cart merging during sign in/sign up
        if (trigger === "signIn" || trigger === "signUp") {
          try {
            const cookiesObject = await cookies();
            const sessionCartId = cookiesObject.get("sessionCartId")?.value;

            if (sessionCartId) {
              const sessionCart = await prisma.cart.findFirst({
                where: { sessionCartId },
              });

              if (sessionCart) {
                // Try to find existing user cart
                const userCart = await prisma.cart.findFirst({
                  where: { userId: user.id },
                });

                if (userCart) {
                  // Merge items from session cart into user cart
                  const sessionItems = sessionCart.items as CartItem[];
                  const userItems = userCart.items as CartItem[];

                  // Combine items, merging quantities for same products
                  const mergedItems = [...userItems];

                  sessionItems.forEach((sessionItem) => {
                    const existingItem = mergedItems.find(
                      (item) => item.productId === sessionItem.productId,
                    );
                    if (existingItem) {
                      existingItem.qty += sessionItem.qty;
                    } else {
                      mergedItems.push(sessionItem);
                    }
                  });

                  // Calculate new prices
                  const prices = calcPrice(mergedItems);

                  // Update user cart with merged items and new prices
                  await prisma.cart.update({
                    where: { id: userCart.id },
                    data: {
                      items: mergedItems as Prisma.CartUpdateitemsInput[],
                      ...prices,
                    },
                  });
                } else {
                  // Convert session cart to user cart
                  await prisma.cart.update({
                    where: { id: sessionCart.id },
                    data: {
                      userId: user.id,
                      sessionCartId: undefined,
                    },
                  });
                }
              }
            }
          } catch (error) {
            console.error("Error merging carts:", error);
          }
        }
      }

      // handle session updates
      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }

      return token;
    },

    authorized({ request, auth }: any) {
      // array of regex patterns of paths we want to protect
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];

      // get pathname from the req URL object
      const { pathname } = request.nextUrl;

      // check if user is not authenticated and accessing a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      // check for session cart cookie from user's cart uuid
      if (!request.cookies.get("sessionCartId")) {
        // generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // clone the request headers
        const newRequestHeaders = new Headers(request.headers);

        // create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);
        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
