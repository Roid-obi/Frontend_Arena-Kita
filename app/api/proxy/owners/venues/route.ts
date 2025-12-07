import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Read cookies from incoming request
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));

    const token = tokenCookie ? tokenCookie.split("=")[1] : null;

    if (!token) {
      return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    }

    // Use HTTPS backend to avoid HTTP -> HTTPS redirect during preflight
    const backendUrl = "https://dev.api.arenakita.my.id/api/v1/owners/venues";

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      // forward credentials server-side (no-cors issues)
    });

    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (err: any) {
    console.error("Proxy error:", err);
    return NextResponse.json({ status: "error", message: err.message || "Proxy error" }, { status: 500 });
  }
}
