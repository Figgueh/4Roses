import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

export default function SEO({ title, description, image, url, type = "website", structuredData }) {
  const location = useLocation();

  const finalUrl = url || window.location.origin + location.pathname;

  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    image,
    url: finalUrl,
  };

  const finalSchema = structuredData ? { ...baseSchema, ...structuredData } : baseSchema;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={finalUrl} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />

      <script type="application/ld+json">{JSON.stringify(finalSchema)}</script>
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf(["website", "article", "product", "profile", "book"]),
  structuredData: PropTypes.oneOfType([PropTypes.object, PropTypes.arrayOf(PropTypes.object)]),
};

SEO.defaultProps = {
  image: undefined,
  type: "website",
  structuredData: undefined,
};
