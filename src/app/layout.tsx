import type { Metadata } from "next";
import { DataStoreProvider } from "@/lib/data-store";
import "./globals.css";

export const metadata: Metadata = {
  title: "EFT International — Member Hub",
  description:
    "Private information hub for EFT International members. Demo prototype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans">
        <DataStoreProvider>{children}</DataStoreProvider>
      </body>
    </html>
  );
}
