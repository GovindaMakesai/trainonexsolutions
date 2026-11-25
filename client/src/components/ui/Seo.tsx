import { useEffect } from 'react';

type SeoProps = {
  title: string;
  description?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
};

function setMeta(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function Seo({ title, description, noIndex, jsonLd }: SeoProps) {
  const serialized = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title;
    if (description) setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    let script: HTMLScriptElement | null = null;
    if (serialized) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'page-jsonld';
      script.text = serialized;
      document.getElementById('page-jsonld')?.remove();
      document.head.appendChild(script);
    }

    return () => {
      script?.remove();
    };
  }, [title, description, noIndex, serialized]);

  return null;
}
