import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CustomCursor from "@/components/effects/CustomCursor";
import { site } from "@/data/profile";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#1b1a1f",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description:
    "Sai Manikanta Eswar Machara, an AI researcher specializing in computer vision, deep learning, and medical imaging. B.Tech student at RGUKT Nuzvid, India.",
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
  verification: {
    google: "5UPBS4ahIoOay91wKM3dwcxd9NjPOFTcrwVzokoQWaw",
  },
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
    images: [{ url: "/images/profile/headshot.webp", width: 1024, height: 900, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: `${site.name} | Homepage`,
    images: ["/images/profile/headshot.webp"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: ["Eswar Machara", "S. M. E. Machara"],
  url: site.url,
  image: `${site.url}/images/profile/headshot.webp`,
  sameAs: [site.github, site.linkedin, site.scholar],
  jobTitle: "Undergraduate Researcher, Medical Imaging and Computer Vision",
  description:
    "Final-year B.Tech Computer Science and Engineering student researching medical imaging, computer vision, and computational biology, with papers accepted at ICCV and MICCAI.",
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Rajiv Gandhi University of Knowledge Technologies (RGUKT), Nuzvid, India",
    url: "https://rguktn.ac.in/",
  },
  worksFor: [
    { "@type": "Organization", name: "TANUH, The AI Centre of Excellence, IISc Bangalore" },
    { "@type": "Organization", name: "MBZUAI" },
  ],
  email: site.email,
  knowsAbout: [
    "Computer Vision",
    "Deep Learning",
    "Medical Imaging",
    "Vision-Language Models",
    "Computational Biology",
    "Computational Pathology",
    "Echocardiography Analysis",
    "Histopathology Image Analysis",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: `${site.name} | Portfolio`,
  url: site.url,
  description: "Academic portfolio of Sai Manikanta Eswar Machara: research publications, experience, and CV.",
  author: { "@type": "Person", name: site.name },
  publisher: { "@type": "Person", name: site.name },
  inLanguage: "en-US",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <CustomCursor />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
