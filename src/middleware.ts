import { NextResponse } from "next/server";

export function middleware() {
  // For now, let's disable server-side route protection
  // Client-side protection will be handled by the components themselves
  return NextResponse.next();
}

// Only apply middleware to API routes that need server-side protection
export const config = {
  matcher: [
    /*
     * Apply middleware only to API routes that need server-side protection
     * Currently no specific admin routes needed since we only have Supplier and Owner roles
     */
  ],
};
