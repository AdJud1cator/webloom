import { prisma } from "@/lib/prisma";

export async function updateTestSitePage(
  path: string,
  content?: string,
  html?: string,
) {
  return prisma.page.updateMany({
    where: {
      site: {
        slug: "test-site",
      },
      path,
    },
    data: {
      ...(content !== undefined ? { content } : {}),
      ...(html !== undefined ? { html } : {}),
    },
  });
}

export async function addTestSitePage({
  path,
  title,
  content,
  links = [],
}: {
  path: string;
  title: string;
  content: string;
  links?: string[];
}) {
  const site = await prisma.site.findUnique({
    where: {
      slug: "test-site",
    },
  });

  if (!site) {
    throw new Error("Test site not found");
  }

  return prisma.page.create({
    data: {
      siteId: site.id,
      path,
      title,
      content,
      links,
    },
  });
}