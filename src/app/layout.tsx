import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { cookies } from "next/headers";
import 'react-loading-skeleton/dist/skeleton.css';
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  weight: ["100", "300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "Mmeko | %s",
    default: "Mmeko - Welcome",
  },
  description: "",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('session')?.value;
  const isAuthenticated = !!authToken?.length;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
         <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />

        </head>
      <body className={`${inter.className} antialiased bg-background`}>
        <Providers>
          <ConditionalLayout isAuthenticated={isAuthenticated}>
            {children}
          </ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
