import Link from "next/link";
import HomePage from "../HomePage";

export const metadata = {
  title: "Impress Cleaning Services | Residential and Commercial Cleaning in Central Texas",
  description:
    "Professional residential and commercial cleaning serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998. Deep cleaning, move-in/out, regular maintenance. Licensed and insured.",
  keywords:
    "house cleaning Georgetown TX, Round Rock cleaning service, Cedar Park maid service, Leander house cleaning, Pflugerville cleaning, Hutto residential cleaning, Austin commercial cleaning, Lakeway cleaning service, Bee Cave house cleaning, Liberty Hill maid service, Jarrell cleaning, Florence TX cleaning service, Taylor house cleaning, Jonestown residential cleaning, Central Texas cleaning service, deep cleaning, move in out cleaning",
  openGraph: {
    title: "Impress Cleaning Services | Residential and Commercial Cleaning in Central Texas",
    description:
      "Professional residential and commercial cleaning serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998.",
    url: "https://impressyoucleaning.com",
    siteName: "Impress Cleaning Services",
    images: [
      {
        url: "https://impressyoucleaning.com/impress-logo.png",
        width: 1200,
        height: 630,
        alt: "Impress Cleaning Services Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Impress Cleaning Services | Residential and Commercial Cleaning in Central Texas",
    description:
      "Professional residential and commercial cleaning serving Georgetown, Round Rock, Cedar Park, Leander, Pflugerville, Hutto, and Austin since 1998.",
    images: ["https://impressyoucleaning.com/impress-logo.png"],
  },
};

function GoogleBrandingCompliance() {
  return (
    <section className="sr-only" aria-label="Application information">
      <h1>Impress Cleaning Services, LLC</h1>
      <p>
        This website includes a secure customer portal that allows clients to sign in,
        manage appointments, view invoices, and submit service requests.
      </p>
      <p>
        <a href="/privacy">Privacy Policy</a> ·{" "}
        <a href="/terms">Terms of Service</a>
      </p>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <GoogleBrandingCompliance />
      <HomePage />
    </>
  );
}
