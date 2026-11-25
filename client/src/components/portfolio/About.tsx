import { photos } from '@/content/photos';
import { site } from '@/content/site';

export function About() {
  return (
    <section id="about" className="pb-24">
      <div className="mx-auto grid max-w-site items-center gap-10 px-5 sm:px-8 lg:grid-cols-12">
        <div className="media-frame relative rounded-[32px] lg:col-span-5">
          <img
            src={photos.meeting}
            alt="Two people in a working session at a bright table"
            className="aspect-[4/5] w-full object-cover"
          />
          <p className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink shadow-lift">
            One team, start to launch
          </p>
        </div>
        <div className="lg:col-span-7">
          <p className="text-xs uppercase tracking-[0.22em] text-accent-deep">{site.about.eyebrow}</p>
          <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">{site.about.title}</h2>
          <blockquote className="mt-8 font-serif text-3xl leading-snug text-ink sm:text-4xl">“{site.about.quote}”</blockquote>
          <div className="mt-8 space-y-4 text-base leading-7 text-muted">
            {site.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-site gap-4 px-5 sm:grid-cols-3 sm:px-8">
        {site.about.facts.map((fact) => (
          <div key={fact.label} className="panel hover-lift rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">{fact.label}</p>
            <p className="mt-3 font-serif text-3xl">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-4 grid max-w-site gap-4 px-5 md:grid-cols-3 sm:px-8">
        {site.about.principles.map((principle, index) => (
          <article key={principle.title} className={`hover-lift rounded-3xl p-6 ${index === 0 ? 'bg-ink text-cream shadow-lift' : 'panel'}`}>
            <h3 className="font-serif text-3xl">{principle.title}</h3>
            <p className="mt-3 text-sm leading-6 opacity-80">{principle.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
