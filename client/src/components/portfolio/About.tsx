import { site } from '@/content/site';

export function About() {
  return (
    <section id="about" className="bg-paper py-24">
      <div className="mx-auto grid max-w-site gap-14 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-stone">{site.about.eyebrow}</p>
          <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">{site.about.title}</h2>
        </div>
        <div className="lg:col-span-7">
          <blockquote className="font-serif text-3xl leading-snug text-ink sm:text-4xl">“{site.about.quote}”</blockquote>
          <div className="mt-8 space-y-4 text-base leading-7 text-muted">
            {site.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 grid max-w-site gap-4 px-5 sm:grid-cols-3 sm:px-8">
        {site.about.facts.map((fact) => (
          <div key={fact.label} className="rounded-3xl border border-line bg-white p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-stone">{fact.label}</p>
            <p className="mt-3 font-serif text-3xl">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 grid max-w-site gap-4 px-5 md:grid-cols-3 sm:px-8">
        {site.about.principles.map((principle) => (
          <article key={principle.title} className="rounded-3xl bg-ink p-6 text-cream">
            <h3 className="font-serif text-3xl">{principle.title}</h3>
            <p className="mt-3 text-sm leading-6 text-cream/70">{principle.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
