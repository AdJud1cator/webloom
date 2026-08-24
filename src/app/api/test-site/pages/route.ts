import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const site = await prisma.site.findUnique({
    where: {
      slug: "test-site",
    },
    include: {
      pages: {
        orderBy: {
          path: "asc",
        },
      },
    },
  });

  if (!site) {
    return NextResponse.json(
      { error: "Test site not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(site.pages);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const { id, title, content, links } = body;

    if (!id || typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid page data" },
        { status: 400 },
      );
    }

    const updatedPage = await prisma.page.update({
      where: {
        id,
      },
      data: {
        title,
        content,
        links: Array.isArray(links) ? links : [],
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Failed to update page:", error);

    return NextResponse.json(
      { error: "Failed to update page" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { path, title, content, links } = body;

    if (
      typeof path !== "string" ||
      typeof title !== "string" ||
      typeof content !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid page data" },
        { status: 400 },
      );
    }

    const normalisedPath =
      path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;

    const site = await prisma.site.findUnique({
      where: {
        slug: "test-site",
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Test site not found" },
        { status: 404 },
      );
    }

    const existingPage = await prisma.page.findUnique({
      where: {
        siteId_path: {
          siteId: site.id,
          path: normalisedPath,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this path already exists" },
        { status: 409 },
      );
    }

    const page = await prisma.page.create({
      data: {
        siteId: site.id,
        path: normalisedPath,
        title,
        content,
        links: Array.isArray(links) ? links : [],
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Failed to create page:", error);

    return NextResponse.json(
      { error: "Failed to create page" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid page ID" },
        { status: 400 },
      );
    }

    const page = await prisma.page.findUnique({
      where: {
        id,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 },
      );
    }

    await prisma.page.delete({
      where: {
        id,
      },
    });

    // Remove references to this page from other pages.
    const pages = await prisma.page.findMany({
      where: {
        links: {
          array_contains: page.path,
        },
      },
    });

    for (const otherPage of pages) {
      const updatedLinks = (otherPage.links as string[]).filter(
        (link) => link !== page.path,
      );

      await prisma.page.update({
        where: {
          id: otherPage.id,
        },
        data: {
          links: updatedLinks,
        },
      });
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      deletedPath: page.path,
    });
  } catch (error) {
    console.error("Failed to delete page:", error);

    return NextResponse.json(
      { error: "Failed to delete page" },
      { status: 500 },
    );
  }
}