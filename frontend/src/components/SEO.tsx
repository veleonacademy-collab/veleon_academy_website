import React from "react";
import { Helmet } from "react-helmet-async";
import { APP_NAME } from "../utils/constants";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "course";
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description = "Empowering the next generation of tech leaders through hands-on learning and mentorship. Start your journey today.",
  image = "/veleonacademy_logo.png",
  url = "https://veleonacademy.veleonex.com",
  type = "website",
  keywords = "tech academy, software engineering, data science, coding bootcamp, tech training, mentor-led learning",
}) => {
  const fullTitle = title ? `${title} | ${APP_NAME}` : APP_NAME;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
