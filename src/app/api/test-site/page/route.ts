import { NextResponse } from "next/server";

import { updateTestSitePage } from "@/lib/test-site/mutations";

export async function POST(request: Request) {
  const body = await request.json();

  const path = body.path;
  const content = body.content;

  if (
    typeof path !== "string" ||
    typeof content !== "string"
  ) {
    return NextResponse.json(
      {
        error: "path and content are required",
      },
      { status: 400 },
    );
  }

  const result = await updateTestSitePage(path, content);

  if (result.count === 0) {
    return NextResponse.json(
      {
        error: "Page not found",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    path,
    content,
  });
}