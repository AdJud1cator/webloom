import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await prisma.site.findUnique({
    where: {
      slug: "test-site",
    },
    include: {
      pages: true,
    },
  });

  if (!site) {
    return [];
  }

  return site.pages.map((page) => ({
    url: `http://localhost:3000/test-site${page.path === "/" ? "" : page.path}`,
    lastModified: page.updatedAt,
  }));
}