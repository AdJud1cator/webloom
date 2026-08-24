import Link from "next/link";
import { notFound } from "next/navigation";
import { testSitePages } from "@/lib/test-site-data";

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

  const page = testSitePages.find((page) => page.path === path);

  if (!page) {
    notFound();
  }

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

        {page.links.length > 0 && (
          <>
            <h3>Related pages</h3>

            <ul>
              {page.links.map((link) => (
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