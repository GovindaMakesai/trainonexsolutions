import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';
import { photos } from '@/content/photos';
import { marqueeItems, site } from '@/content/site';

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const stepTones = ['bg-accent text-white', 'bg-[#6D4AFF] text-white', 'bg-[#D6FF4A] text-ink'];

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#140818] text-cream">
      <div className="pointer-events-none absolute -left-24 top-16 h-80 w-80 rounded-full bg-accent/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-[#6D4AFF]/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#D6FF4A]/20 blur-3xl" />

      <div className="mx-auto grid max-w-site items-center gap-12 px-5 pb-10 pt-32 sm:px-8 lg:grid-cols-12 lg:pt-36">
        <motion.div
          className="lg:col-span-7"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[#D6FF4A]">
            <span className="h-2 w-2 rounded-full bg-[#D6FF4A]" />
            {site.hero.eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-[3.3rem] leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl">
            {site.hero.title}
            <span className="mt-1 block italic text-[#D6FF4A]">{site.hero.titleEmphasis}</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-cream/80 sm:text-lg">{site.hero.summary}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => scrollTo('work')} className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-14px_rgba(255,77,28,0.95)]">
              View the work
            </button>
            <button
              type="button"
              onClick={() => scrollTo('contact')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-cream"
            >
              Start a project
              <ArrowDownRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        <div className="relative lg:col-span-5">
          <img
            src={photos.team}
            alt="A product team working together around a table"
            className="aspect-[4/5] w-full rounded-[32px] object-cover shadow-card ring-4 ring-white/10"
          />
          <img
            src={photos.desk}
            alt="A laptop open on a design desk"
            className="absolute -left-6 bottom-8 hidden w-36 rounded-3xl border-4 border-[#140818] object-cover shadow-card sm:block sm:h-36"
          />
          <p className="absolute right-4 top-4 rounded-full bg-[#D6FF4A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink">
            {site.availability}
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-site gap-3 px-5 pb-12 sm:grid-cols-3 sm:px-8">
        {site.steps.map((step, index) => (
          <article key={step.index} className={`rounded-3xl p-5 ${stepTones[index] || stepTones[0]}`}>
            <p className="text-xs tracking-[0.18em] opacity-80">{step.index}</p>
            <h2 className="mt-2 font-serif text-3xl">{step.title}</h2>
            <p className="mt-2 text-sm leading-6 opacity-90">{step.text}</p>
          </article>
        ))}
      </div>

      <div className="overflow-hidden border-t border-white/10 bg-white/5 py-4">
        <div className="flex w-max animate-marquee gap-8 pr-8">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-8 text-xs uppercase tracking-[0.22em] text-cream">
              {item}
              <span className="text-[#D6FF4A]" aria-hidden>
                ●
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
