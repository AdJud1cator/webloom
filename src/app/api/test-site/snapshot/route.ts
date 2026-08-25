import dns from "node:dns/promises";
import net from "node:net";

import { NextResponse } from "next/server";

import { upsertTestSitePage } from "@/lib/test-site/mutations";

function isAuthorized(request: Request) {
  const expectedKey = process.env.TEST_SITE_API_KEY;

  if (!expectedKey) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${expectedKey}`;
}

function isValidUrl(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

async function isSafeSnapshotUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    return false;
  }

  if (net.isIP(hostname)) {
    if (net.isIPv4(hostname)) {
      return !isPrivateIpv4(hostname);
    }

    return !isPrivateIpv6(hostname);
  }

  try {
    const addresses = await dns.lookup(hostname, {
      all: true,
      verbatim: true,
    });

    if (addresses.length === 0) {
      return false;
    }

    return addresses.every(({ address }) => {
      if (net.isIPv4(address)) {
        return !isPrivateIpv4(address);
      }

      return !isPrivateIpv6(address);
    });
  } catch {
    return false;
  }
}

function createSnapshotPath(url: URL) {
  const hostname = url.hostname.replace(/\./g, "-");

  const pathname =
    url.pathname === "/"
      ? ""
      : url.pathname
          .replace(/^\/+/, "")
          .replace(/\/+$/, "");

  const suffix = pathname ? `/${pathname}` : "";

  return `/snapshots/${hostname}${suffix}`;
}

function getTitle(html: string, url: URL) {
  const match = html.match(
    /<title[^>]*>([\s\S]*?)<\/title>/i,
  );

  if (match?.[1]) {
    return match[1].replace(/\s+/g, " ").trim();
  }

  return url.hostname;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const { url } = body as {
    url?: unknown;
  };

  if (!isValidUrl(url)) {
    return NextResponse.json(
      {
        error: "url must be a valid http or https URL",
      },
      { status: 400 },
    );
  }

  if (!(await isSafeSnapshotUrl(url))) {
    return NextResponse.json(
      {
        error: "URL must resolve to a public HTTP or HTTPS address",
      },
      { status: 400 },
    );
  }

  const sourceUrl = new URL(url);

  let response: Response;

  try {
    response = await fetch(sourceUrl);
  } catch {
    return NextResponse.json(
      {
        error: "Failed to fetch URL",
      },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        error: `Source returned HTTP ${response.status}`,
      },
      { status: 502 },
    );
  }

  const html = await response.text();

  const path = createSnapshotPath(sourceUrl);
  const title = getTitle(html, sourceUrl);

  const result = await upsertTestSitePage({
    path,
    title,
    content: html,
    html,
    sourceUrl: sourceUrl.toString(),
  });

  return NextResponse.json({
    success: true,
    operation: "snapshotted",
    path: result.path,
    sourceUrl: sourceUrl.toString(),
  });
}