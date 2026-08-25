import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "WebLoom Test Site",
    template: "%s | WebLoom Test Site",
  },
  description:
    "A realistic test website for testing web crawler behaviour.",
};

export default function TestSiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}