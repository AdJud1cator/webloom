import { NextResponse } from "next/server";

import {
  addTestSitePage,
  deleteTestSitePage,
  updateTestSitePage,
} from "@/lib/test-site/mutations";

function isAuthorized(request: Request) {
  const expectedKey = process.env.TEST_SITE_API_KEY;

  if (!expectedKey) {
    return false;
  }

  const authorization = request.headers.get("authorization");

  return authorization === `Bearer ${expectedKey}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await request.json();

  const path = body.path;
  const title = body.title;
  const content = body.content;
  const html = body.html;
  const links = body.links;

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

  if (html !== undefined && typeof html !== "string") {
    return NextResponse.json(
      {
        error: "html must be a string",
      },
      { status: 400 },
    );
  }

  if (links !== undefined && !Array.isArray(links)) {
    return NextResponse.json(
      {
        error: "links must be an array",
      },
      { status: 400 },
    );
  }

  if (typeof title === "string") {
    const result = await addTestSitePage({
      path,
      title,
      content,
      html,
      links,
    });

    return NextResponse.json({
      success: true,
      operation: "created",
      path: result.path,
    });
  }

  const result = await updateTestSitePage(path, content, html);

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
    operation: "updated",
    path,
  });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
  const body = await request.json();

  const path = body.path;

  if (typeof path !== "string") {
    return NextResponse.json(
      {
        error: "path is required",
      },
      { status: 400 },
    );
  }

  const result = await deleteTestSitePage(path);

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
    operation: "deleted",
    path,
  });
}