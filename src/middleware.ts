import { type NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get("authorization")

  if (!basicAuth) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    })
  }

  const authValue = basicAuth.split(" ")[1]

  if (!authValue) {
    return new NextResponse("Invalid authentication", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    })
  }

  try {
    const [user, pwd] = atob(authValue).split(":")

    const validUser = process.env.BASIC_AUTH_USER
    const validPassword = process.env.BASIC_AUTH_PASSWORD

    if (user === validUser && pwd === validPassword) {
      return NextResponse.next()
    }
  } catch (_error) {
    return new NextResponse("Invalid authentication", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    })
  }

  return new NextResponse("Authentication failed", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
