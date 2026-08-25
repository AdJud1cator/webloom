import { prisma } from "@/lib/prisma";

export async function updateTestSitePage(
  path: string,
  content: string,
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
      content,
      ...(html !== undefined ? { html } : {}),
    },
  });
}

export async function addTestSitePage({
  path,
  title,
  content,
  html,
  links = [],
}: {
  path: string;
  title: string;
  content: string;
  html?: string;
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
      html,
      links,
    },
  });
}

export async function deleteTestSitePage(path: string) {
  return prisma.page.deleteMany({
    where: {
      site: {
        slug: "test-site",
      },
      path,
    },
  });
}