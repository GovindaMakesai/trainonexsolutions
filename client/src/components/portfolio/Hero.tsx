import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';
import { marqueeItems, site } from '@/content/site';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-ink text-cream">
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      <div className="mx-auto grid min-h-screen max-w-site items-end gap-12 px-5 pb-16 pt-32 sm:px-8 lg:grid-cols-12 lg:pt-36">
        <motion.div
          className="lg:col-span-8"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cream/55">{site.hero.eyebrow}</p>
          <h1 className="mt-6 max-w-4xl font-serif text-[3.3rem] leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
            {site.hero.title}
            <span className="mt-1 block italic text-cream/75">{site.hero.titleEmphasis}</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-cream/75 sm:text-lg">{site.hero.summary}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollTo('work')} className="rounded-full bg-accent-deep px-6 py-3 text-sm font-medium text-white">
              View the work
            </button>
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-cream"
            >
              Start a project
              <ArrowDownRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <aside className="border border-white/15 bg-white/[0.03] p-6 sm:p-8 lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.22em] text-cream/50">How an engagement runs</p>
          <ol className="mt-8 space-y-7">
            {site.steps.map((step) => (
              <li key={step.index}>
                <p className="text-xs tracking-[0.18em] text-accent">{step.index}</p>
                <h2 className="mt-1 font-serif text-3xl">{step.title}</h2>
                <p className="mt-2 text-sm leading-6 text-cream/65">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 border-t border-white/10 pt-5 text-sm leading-6 text-cream/55">
            {site.availability}. Most product engagements run six to fourteen weeks.
          </p>
        </aside>
      </div>

      <div className="overflow-hidden border-t border-white/10 py-4">
        <div className="flex w-max animate-marquee gap-8 pr-8">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-8 text-xs uppercase tracking-[0.22em] text-cream/70">
              {item}
              <span className="text-accent" aria-hidden>
                ●
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
