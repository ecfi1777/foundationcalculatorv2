import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  noIndex?: boolean;
}

export function SEO({ title, description, canonical, noIndex }: SEOProps) {
  return (
    <Helmet>
      <title>{title} | Total Foundation Calculator</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical ?? window.location.href} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow"} />
    </Helmet>
  );
}
