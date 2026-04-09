import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

const SITE_NAME = "Total Foundation Calculator";
const SITE_URL  = "https://foundationcalculator.com";
const OG_IMAGE  = `${SITE_URL}/og-image.png`;

export function SEO({ title, description, canonical, noIndex }: SEOProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ?? (typeof window !== "undefined" ? window.location.href : SITE_URL);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
      {/* OG — overrides the static values in index.html per-route */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={OG_IMAGE} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
    </Helmet>
  );
}
