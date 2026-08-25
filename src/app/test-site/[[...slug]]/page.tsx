import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type TestSitePageProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export async function generateMetadata({
  params,
}: TestSitePageProps): Promise<Metadata> {
  const { slug } = await params;

  const path = slug ? `/${slug.join("/")}` : "/";

  const page = await prisma.page.findFirst({
    where: {
      site: {
        slug: "test-site",
      },
      path,
    },
  });

  if (!page) {
    return {};
  }

  return {
    title: page.title,
    description: page.content,
  };
}

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

    if (page.sourceUrl) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: page.html ?? page.content,
        }}
      />
    );
  }

  const links = Array.isArray(page.links)
    ? (page.links as string[])
    : [];

  const linkedPages = site.pages.filter((candidate) =>
    links.includes(candidate.path),
  );

  return (
    <main>
      <header>
        <h1>WebLoom Test Site</h1>

        <nav aria-label="Main navigation">
          <Link href="/test-site">Home</Link>{" "}
          <Link href="/test-site/about">About</Link>{" "}
          <Link href="/test-site/services">Services</Link>{" "}
          <Link href="/test-site/resources">Resources</Link>{" "}
          <Link href="/test-site/news">News</Link>{" "}
          <Link href="/test-site/contact">Contact</Link>
        </nav>
      </header>

      <article>
        <h2>{page.title}</h2>

        {page.html ? (
          <div dangerouslySetInnerHTML={{ __html: page.html }} />
        ) : (
          <p>{page.content}</p>
        )}

        {linkedPages.length > 0 && (
          <section>
            <h3>Related information</h3>

            <ul>
              {linkedPages.map((linkedPage) => (
                <li key={linkedPage.id}>
                  <Link href={`/test-site${linkedPage.path}`}>
                    {linkedPage.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <footer>
        <p>
          WebLoom crawler testing environment.
        </p>
      </footer>
    </main>
  );
}