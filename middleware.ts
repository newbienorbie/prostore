import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
