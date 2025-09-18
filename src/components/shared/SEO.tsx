import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  imageUrl?: string;
}

export default function SEO({ title, description, name, type, imageUrl }: SEOProps) {
  const fullTitle = `${title} | Siddhi Divine`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {/* End standard metadata tags */}
      
      {/* Open Graph tags */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {/* End Open Graph tags */}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || 'SiddhiDivine'} />
      <meta name="twitter:card" content={type || 'summary_large_image'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {/* End Twitter tags */}
    </Helmet>
  );
}