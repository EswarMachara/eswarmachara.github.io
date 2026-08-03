import type { Metadata, Viewport } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { site } from "@/data/profile";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-open-sans",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#20364c",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description:
    "Sai Manikanta Eswar Machara — AI Researcher specializing in computer vision, deep learning, and medical imaging. B.Tech student at RGUKT Nuzvid, India.",
  keywords: [
    "Sai Manikanta Eswar Machara",
    "Eswar Machara",
    "AI researcher",
    "computer vision",
    "deep learning",
    "medical imaging",
    "RGUKT Nuzvid",
    "ICCV 2025",
  ],
  authors: [{ name: site.name }],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    locale: "en_US",
    type: "website",
    title: site.name,
    description: `${site.name} | Homepage`,
    url: site.url,
    siteName: `${site.name} | Homepage`,
    images: ["/images/profile/headshot.png"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: ["Eswar Machara", "S. M. E. Machara"],
  url: site.url,
  image: `${site.url}/images/profile/headshot.png`,
  sameAs: [site.github, site.linkedin, site.scholar],
  jobTitle: "Undergraduate Researcher - Medical Imaging and Computer Vision",
  affiliation: {
    "@type": "Organization",
    name: "Rajiv Gandhi University of Knowledge Technologies (RGUKT), Nuzvid, India",
  },
  email: site.email,
  knowsAbout: ["Computer Vision", "Deep Learning", "Medical Imaging", "Vision-Language Models"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
