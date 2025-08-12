import React from 'react';
import SEO from '@/components/SEO';

export interface Crumb {
  name: string;
  href?: string;
}

const Breadcrumbs: React.FC<{ trail: Crumb[]; jsonLdBaseUrl?: string }> = ({ trail, jsonLdBaseUrl = '' }) => {
  const itemListElement = trail.map((c, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: c.name,
    item: c.href ? `${jsonLdBaseUrl}${c.href}` : undefined
  }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  };
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <SEO title="" jsonLd={jsonLd as any} />
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        {trail.map((c, i) => (
          <li key={i} className="flex items-center">
            {c.href ? (
              <a href={c.href} className="hover:text-primary underline-offset-2 hover:underline">{c.name}</a>
            ) : (
              <span className="text-foreground">{c.name}</span>
            )}
            {i < trail.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;