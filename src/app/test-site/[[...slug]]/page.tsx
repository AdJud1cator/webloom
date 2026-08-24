import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type TestSitePageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function TestSitePage({
  params,
}: TestSitePageProps) {
  const { slug } = await params;

  const path = slug ? `/${slug.join("/")}` : "/";

  const site = await prisma.site.findUnique({
    where: {
      slug: "test-site",
    },
    include: {
      pages: true,
    },
  });

  if (!site) {
    notFound();
  }

  const page = site.pages.find((page) => page.path === path);

  if (!page) {
    notFound();
  }

  const links = Array.isArray(page.links)
    ? page.links.filter(
        (link): link is string => typeof link === "string",
      )
    : [];

  return (
    <main>
      <header>
        <h1>WebLoom Test Site</h1>

        <nav>
          <Link href="/test-site">Home</Link>
          {" | "}
          <Link href="/test-site/about">About</Link>
          {" | "}
          <Link href="/test-site/services">Services</Link>
          {" | "}
          <Link href="/test-site/resources">Resources</Link>
          {" | "}
          <Link href="/test-site/news">News</Link>
          {" | "}
          <Link href="/test-site/contact">Contact</Link>
        </nav>
      </header>

      <article>
        <h2>{page.title}</h2>

        <p>{page.content}</p>

        {links.length > 0 && (
          <>
            <h3>Related pages</h3>

            <ul>
              {links.map((link) => (
                <li key={link}>
                  <Link href={`/test-site${link}`}>
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </article>
    </main>
  );
}