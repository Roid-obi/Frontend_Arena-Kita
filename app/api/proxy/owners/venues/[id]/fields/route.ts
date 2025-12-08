import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));

    const token = tokenCookie ? tokenCookie.split("=")[1] : null;

    if (!token) {
      return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    }

    const backendUrl = `https://dev.api.arenakita.my.id/api/v1/owners/venues/${id}/fields`;

    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", res.status, errorText);
      return NextResponse.json({ status: "error", message: `Backend error: ${res.status}` }, { status: res.status });
    }

    const json = await res.json();

    return NextResponse.json(json);
  } catch (err: unknown) {
    console.error("Proxy error:", err);
    const errorMessage = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));

    const token = tokenCookie ? tokenCookie.split("=")[1] : null;

    if (!token) {
      return NextResponse.json({ status: "error", message: "Token tidak ditemukan" }, { status: 401 });
    }

    const backendUrl = `https://dev.api.arenakita.my.id/api/v1/owners/venues/${id}/fields`;
    const formData = await req.formData();

    // Log detail untuk debugging
    const formDataEntries: Record<string, string> = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataEntries[key] = `File: ${value.name} (${value.type}, ${value.size} bytes)`;
      } else {
        formDataEntries[key] = String(value);
      }
    });

    console.log("=== Proxy POST Fields Request ===");
    console.log("URL:", backendUrl);
    console.log("Token:", token.substring(0, 20) + "...");
    console.log("FormData entries:", formDataEntries);

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("Backend response status:", res.status);
    const contentType = res.headers.get("content-type");
    console.log("Backend response content-type:", contentType);

    // Baca response body
    const responseText = await res.text();
    console.log("Backend response body:", responseText);

    if (!res.ok) {
      console.error("=== Backend Error ===");
      console.error("Status:", res.status);
      console.error("Response:", responseText);

      // Try to parse as JSON if possible
      let errorJson;
      try {
        errorJson = JSON.parse(responseText);
      } catch {
        errorJson = { raw: responseText };
      }

      return NextResponse.json(
        {
          status: "error",
          message: `Backend error: ${res.status}`,
          details: errorJson,
        },
        { status: res.status }
      );
    }

    // Parse JSON response
    try {
      const json = JSON.parse(responseText);
      console.log("Success response:", json);
      return NextResponse.json(json);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      return NextResponse.json({ status: "error", message: "Invalid response format", details: responseText }, { status: 500 });
    }
  } catch (err: unknown) {
    console.error("=== Proxy Error ===");
    console.error(err);
    const errorMessage = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ status: "error", message: errorMessage }, { status: 500 });
  }
}
