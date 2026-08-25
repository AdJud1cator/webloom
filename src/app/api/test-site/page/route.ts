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

function isValidPath(path: unknown): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    path.length > 1
  );
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string")
  );
}

async function getJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await getJsonBody(request);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const {
    path,
    title,
    content,
    html,
    links,
  } = body as {
    path?: unknown;
    title?: unknown;
    content?: unknown;
    html?: unknown;
    links?: unknown;
  };

  if (!isValidPath(path)) {
    return NextResponse.json(
      {
        error: "path must start with / and must not be empty",
      },
      { status: 400 },
    );
  }

  if (typeof title !== "string" || title.length === 0) {
    return NextResponse.json(
      {
        error: "title is required and must be a string",
      },
      { status: 400 },
    );
  }

  if (typeof content !== "string") {
    return NextResponse.json(
      {
        error: "content is required and must be a string",
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

  if (links !== undefined && !isStringArray(links)) {
    return NextResponse.json(
      {
        error: "links must be an array of strings",
      },
      { status: 400 },
    );
  }

  try {
    const result = await addTestSitePage({
      path,
      title,
      content,
      html,
      links,
    });

    return NextResponse.json(
      {
        success: true,
        operation: "created",
        path: result.path,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json(
        {
          error: "A page already exists at this path",
        },
        { status: 409 },
      );
    }

    throw error;
  }
}

export async function PUT(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = await getJsonBody(request);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const {
    path,
    title,
    content,
    html,
  } = body as {
    path?: unknown;
    title?: unknown;
    content?: unknown;
    html?: unknown;
  };

  if (!isValidPath(path)) {
    return NextResponse.json(
      {
        error: "path must start with / and must not be empty",
      },
      { status: 400 },
    );
  }

  if (typeof content !== "string") {
    return NextResponse.json(
      {
        error: "content is required and must be a string",
      },
      { status: 400 },
    );
  }

  if (title !== undefined && typeof title !== "string") {
    return NextResponse.json(
      {
        error: "title must be a string",
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

  const result = await updateTestSitePage(
    path,
    content,
    html,
    title,
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

  const body = await getJsonBody(request);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be an object" },
      { status: 400 },
    );
  }

  const { path } = body as {
    path?: unknown;
  };

  if (!isValidPath(path)) {
    return NextResponse.json(
      {
        error: "path must start with / and must not be empty",
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