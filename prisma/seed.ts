import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { testSitePages } from "../src/lib/test-site-data";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const site = await prisma.site.upsert({
    where: {
      slug: "test-site",
    },
    update: {},
    create: {
      name: "WebLoom Test Site",
      slug: "test-site",
    },
  });

  for (const page of testSitePages) {
    await prisma.page.upsert({
      where: {
        siteId_path: {
          siteId: site.id,
          path: page.path,
        },
      },
      update: {
        title: page.title,
        content: page.content,
      },
      create: {
        siteId: site.id,
        path: page.path,
        title: page.title,
        content: page.content,
      },
    });
  }

  console.log(`Seeded ${testSitePages.length} pages.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });