import React, { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image';
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ title, description, keywords, canonical, openGraph, twitter, jsonLd }) => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;

    const head = document.head;
    const tags: HTMLMetaElement[] = [];

    const setMeta = (name: string, content: string) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      head.appendChild(meta);
      tags.push(meta);
    };

    const setProperty = (property: string, content: string) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.content = content;
      head.appendChild(meta);
      tags.push(meta);
    };

    if (description) setMeta('description', description);
    if (keywords && keywords.length > 0) setMeta('keywords', keywords.join(', '));

    if (canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonical;
      head.appendChild(link);
    }

    if (openGraph) {
      if (openGraph.title) setProperty('og:title', openGraph.title);
      if (openGraph.description) setProperty('og:description', openGraph.description);
      if (openGraph.type) setProperty('og:type', openGraph.type);
      if (openGraph.image) setProperty('og:image', openGraph.image);
      if (openGraph.url) setProperty('og:url', openGraph.url);
    }

    if (twitter) {
      setMeta('twitter:card', twitter.card || 'summary_large_image');
      if (twitter.title) setMeta('twitter:title', twitter.title);
      if (twitter.description) setMeta('twitter:description', twitter.description);
      if (twitter.image) setMeta('twitter:image', twitter.image);
    }

    let jsonLdEl: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdEl = document.createElement('script');
      jsonLdEl.type = 'application/ld+json';
      jsonLdEl.text = JSON.stringify(jsonLd);
      head.appendChild(jsonLdEl);
    }

    return () => {
      document.title = prevTitle;
      tags.forEach(tag => head.removeChild(tag));
      if (jsonLdEl && jsonLdEl.parentNode) jsonLdEl.parentNode.removeChild(jsonLdEl);
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink && canonicalLink.parentNode) canonicalLink.parentNode.removeChild(canonicalLink);
    };
  }, [title, description, JSON.stringify(keywords), canonical, JSON.stringify(openGraph), JSON.stringify(twitter), JSON.stringify(jsonLd)]);

  return null;
};

export default SEO;