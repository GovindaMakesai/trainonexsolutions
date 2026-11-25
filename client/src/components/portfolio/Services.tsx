import { motion, useReducedMotion } from 'framer-motion';
import { photos } from '@/content/photos';
import { site } from '@/content/site';

const tones = [
  'bg-accent text-white',
  'bg-[#6D4AFF] text-white',
  'bg-ink text-cream',
  'bg-[#D6FF4A] text-ink',
  'bg-white text-ink',
  'bg-[#2EE6C7] text-ink',
];

const images = [photos.notes, photos.phone, photos.desk, photos.abstract, photos.paint, photos.hands];

export function Services() {
  const reduce = useReducedMotion();

  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-site px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[#6D4AFF]">Services</p>
          <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">What we take on.</h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-muted">
            Hire the slice you need, or the full path from a vague brief to a product your team can run.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {site.services.map((service, index) => (
            <motion.li
              key={service.index}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: reduce ? 0 : index * 0.04 }}
              className={`overflow-hidden rounded-[28px] shadow-card ${tones[index] || tones[0]}`}
            >
              <img src={images[index]} alt="" className="h-36 w-full object-cover" />
              <div className="p-6">
                <p className="text-xs tracking-[0.16em] opacity-70">{service.index}</p>
                <h3 className="mt-2 font-serif text-3xl">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 opacity-90">{service.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
