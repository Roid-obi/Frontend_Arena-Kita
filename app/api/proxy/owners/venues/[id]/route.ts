import { NextResponse } from "next/server";

async function getTokenFromCookie(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("token="));

  return tokenCookie ? tokenCookie.split("=")[1] : null;
}

export async function GET(req: Request, _ctx: any) {
  try {
    const token = await getTokenFromCookie(req);
    if (!token) {
      console.warn("Proxy GET missing token");
      return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 1];

    const backendUrl = `https://dev.api.arenakita.my.id/api/v1/owners/venues/${encodeURIComponent(id)}`;
    const maskedToken = token ? `${token.slice(0, 8)}...(${token.length} chars)` : null;
    console.log("Proxy GET forwarding to backend:", backendUrl, "token:", maskedToken);
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });

    const text = await res.text();
    console.log(`Backend response for id=${id}:`, res.status, text?.slice ? text.slice(0, 500) : text);

    // Try to parse JSON, otherwise return a consistent JSON error
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: res.status });
    } catch (e) {
      if (res.ok) {
        // If backend returned non-JSON but OK, return raw text
        return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "text/plain" } });
      }
      return NextResponse.json({ status: "error", message: text || "Backend error" }, { status: res.status });
    }
  } catch (err: any) {
    console.error("Proxy GET /:id error", err);
    return NextResponse.json({ status: "error", message: err.message || "Proxy error" }, { status: 500 });
  }
}

export async function PUT(req: Request, _ctx: any) {
  try {
    const token = await getTokenFromCookie(req);
    if (!token) return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 1];

    const backendUrl = `https://dev.api.arenakita.my.id/api/v1/owners/venues/${encodeURIComponent(id)}`;
    const body = await req.text();
    const res = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": req.headers.get("content-type") || "application/json",
      },
      body,
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
  } catch (err: any) {
    console.error("Proxy PUT /:id error", err);
    return NextResponse.json({ status: "error", message: err.message || "Proxy PUT error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, _ctx: any) {
  try {
    const token = await getTokenFromCookie(req);
    if (!token) return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[pathParts.length - 1];

    const backendUrl = `https://dev.api.arenakita.my.id/api/v1/owners/venues/${encodeURIComponent(id)}`;
    const res = await fetch(backendUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
  } catch (err: any) {
    console.error("Proxy DELETE /:id error", err);
    return NextResponse.json({ status: "error", message: err.message || "Proxy DELETE error" }, { status: 500 });
  }
}
