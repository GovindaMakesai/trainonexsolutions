import { motion, useReducedMotion } from 'framer-motion';
import { site } from '@/content/site';

export function Services() {
  const reduce = useReducedMotion();

  return (
    <section id="services" className="border-t border-line bg-cream py-24">
      <div className="mx-auto grid max-w-site gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="text-xs uppercase tracking-[0.22em] text-stone">Services</p>
          <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">What we take on.</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted">
            Hire the slice you need, or the full path from a vague brief to a product your team can run.
          </p>
        </div>
        <div className="lg:col-span-8">
          <ul className="divide-y divide-line border-y border-line">
            {site.services.map((service, index) => (
              <motion.li
                key={service.index}
                initial={reduce ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.04 }}
                className="grid gap-3 py-7 transition hover:bg-paper/60 sm:grid-cols-[5rem_1fr] sm:gap-6 sm:px-3"
              >
                <p className="text-sm tracking-[0.16em] text-accent-deep">{service.index}</p>
                <div>
                  <h3 className="font-serif text-3xl">{service.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{service.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
