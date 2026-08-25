import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type SnapshotRouteProps = {
  params: Promise<{
    path?: string[];
  }>;
};

export async function GET(
  _request: Request,
  { params }: SnapshotRouteProps,
) {
  const { path } = await params;

  const snapshotPath = path?.length
    ? `/snapshots/${path.join("/")}`
    : "/snapshots";

  const page = await prisma.page.findFirst({
    where: {
      site: {
        slug: "test-site",
      },
      path: snapshotPath,
    },
  });

  if (!page) {
    return new NextResponse("Snapshot not found", {
      status: 404,
    });
  }

  return new NextResponse(page.html ?? page.content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}