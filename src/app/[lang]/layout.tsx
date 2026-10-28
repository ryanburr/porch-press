import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Amiri, Hind, IBM_Plex_Sans_Arabic, Inter, Martel, Noto_Naskh_Arabic, Playfair_Display, Source_Serif_4 } from "next/font/google";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/i18n";
import { getDictionary } from "@/lib/dictionaries";
import { LANGUAGES, LOCALES, hasLocale } from "@/lib/i18n";
import "../globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700", "900"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Faces for the Arabic and Hindi editions. They include matching Latin letters for place names and sources.
// Not preloaded, so the other editions never download them.
const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  preload: false,
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  preload: false,
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const martel = Martel({
  variable: "--font-martel",
  weight: ["400", "600", "700", "900"],
  preload: false,
});

const hind = Hind({
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const fontVariables = [playfair, sourceSerif, inter, amiri, naskh, plexArabic, martel, hind].map((f) => f.variable).join(" ");

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = await getDictionary(lang);
  return {
    title: "The Porch Press",
    description: t.meta.description,
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} dir={LANGUAGES[lang].dir} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full">
        <I18nProvider lang={lang} dict={dict}>
          {children}
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
