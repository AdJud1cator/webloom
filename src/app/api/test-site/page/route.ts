import { NextResponse } from "next/server";

import { updateTestSitePage } from "@/lib/test-site/mutations";

export async function POST(request: Request) {
  const body = await request.json();

  const path = body.path;
  const content = body.content;
  const html = body.html;

  if (typeof path !== "string") {
    return NextResponse.json(
      {
        error: "path is required",
      },
      { status: 400 },
    );
  }

  if (
    content !== undefined &&
    typeof content !== "string"
  ) {
    return NextResponse.json(
      {
        error: "content must be a string",
      },
      { status: 400 },
    );
  }

  if (
    html !== undefined &&
    typeof html !== "string"
  ) {
    return NextResponse.json(
      {
        error: "html must be a string",
      },
      { status: 400 },
    );
  }

  if (
    content === undefined &&
    html === undefined
  ) {
    return NextResponse.json(
      {
        error: "content or html is required",
      },
      { status: 400 },
    );
  }

  const result = await updateTestSitePage(
    path,
    content,
    html,
  );

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
    ...(content !== undefined ? { content } : {}),
    ...(html !== undefined ? { html } : {}),
  });
}