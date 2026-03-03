import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Mmeko",
  description: "Mmeko blog — tips, updates, and stories for creators. Coming soon.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
