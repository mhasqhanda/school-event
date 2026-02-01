import { NextResponse, type NextRequest } from "next/server";

/**
 * Pure demo: tidak ada Supabase auth. Hanya pass-through.
 */
export async function middleware(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
