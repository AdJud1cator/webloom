import { prisma } from "@/lib/prisma";

export async function updateTestSitePage(
  path: string,
  content: string,
  html?: string,
  title?: string,
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
      ...(title !== undefined ? { title } : {}),
    },
  });
}

export async function addTestSitePage({
  path,
  title,
  content,
  html,
  links = [],
  sourceUrl,
}: {
  path: string;
  title: string;
  content: string;
  html?: string;
  links?: string[];
  sourceUrl?: string;
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
      sourceUrl,
    },
  });
}

export async function upsertTestSitePage({
  path,
  title,
  content,
  html,
  links = [],
  sourceUrl,
}: {
  path: string;
  title: string;
  content: string;
  html?: string;
  links?: string[];
  sourceUrl?: string;
}) {
  const site = await prisma.site.findUnique({
    where: {
      slug: "test-site",
    },
  });

  if (!site) {
    throw new Error("Test site not found");
  }

  return prisma.page.upsert({
    where: {
      siteId_path: {
        siteId: site.id,
        path,
      },
    },
    create: {
      siteId: site.id,
      path,
      title,
      content,
      html,
      links,
      sourceUrl,
    },
    update: {
      title,
      content,
      html,
      links,
      sourceUrl,
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