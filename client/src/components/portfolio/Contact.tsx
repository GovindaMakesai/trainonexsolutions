import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field, fieldClass } from '@/components/ui/Field';
import { photos } from '@/content/photos';
import { site } from '@/content/site';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';
import { sendContact } from '@/services/studio';
import { BUDGET_OPTIONS } from '@/types';

type ContactValues = {
  name: string;
  email: string;
  company: string;
  budget: string;
  message: string;
  website: string;
};

const empty: ContactValues = { name: '', email: '', company: '', budget: '', message: '', website: '' };

function validate(values: ContactValues) {
  const errors: Partial<Record<keyof ContactValues, string>> = {};
  if (values.name.trim().length < 2) errors.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (values.message.trim().length < 10) errors.message = 'Tell us a little more — at least a sentence.';
  if (values.company.trim().length > 120) errors.company = 'Company name is too long.';
  return errors;
}

export function Contact() {
  const [values, setValues] = useState<ContactValues>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [sent, setSent] = useState(false);

  function update<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await sendContact({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        budget: values.budget || undefined,
        message: values.message.trim(),
        website: values.website,
      });
      setSent(true);
      setValues(empty);
    } catch (error) {
      const fieldErrors = getFieldErrors(error) || [];
      const mapped: Partial<Record<keyof ContactValues, string>> = {};
      fieldErrors.forEach((issue) => {
        if (issue.field in empty) mapped[issue.field as keyof ContactValues] = issue.message;
      });
      setErrors(mapped);
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden bg-[#140818] py-24 text-cream">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#6D4AFF]/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-site gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.22em] text-[#D6FF4A]">{site.contact.eyebrow}</p>
          <h2 className="mt-3 font-serif text-5xl tracking-tight sm:text-6xl">{site.contact.title}</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-cream/75">{site.contact.summary}</p>
          <a className="mt-8 inline-block text-sm text-[#D6FF4A] underline decoration-[#D6FF4A]/40 underline-offset-4" href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <img src={photos.office} alt="A bright studio workspace with plants and a desk" className="mt-8 hidden aspect-[16/9] w-full rounded-[28px] object-cover lg:block" />
        </div>

        <div className="rounded-[28px] bg-white p-6 text-ink shadow-card ring-4 ring-[#D6FF4A]/40 sm:p-8 lg:col-span-7">
          {sent ? (
            <div className="flex min-h-[320px] flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.2em] text-stone">Received</p>
              <h3 className="mt-3 font-serif text-4xl">Thank you. We’ll write back shortly.</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                Your note is in the studio inbox. If the work is urgent, email {site.email} directly.
              </p>
              <Button type="button" variant="secondary" className="mt-8 w-fit" onClick={() => setSent(false)}>
                Send another note
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-5">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update('website', event.target.value)} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="name" error={errors.name}>
                  <input id="name" className={fieldClass(Boolean(errors.name))} value={values.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" required />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input id="email" type="email" className={fieldClass(Boolean(errors.email))} value={values.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" required />
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Company" htmlFor="company" error={errors.company} hint="Optional">
                  <input id="company" className={fieldClass(Boolean(errors.company))} value={values.company} onChange={(event) => update('company', event.target.value)} autoComplete="organization" />
                </Field>
                <Field label="Budget" htmlFor="budget" hint="Optional">
                  <select id="budget" className={fieldClass()} value={values.budget} onChange={(event) => update('budget', event.target.value)}>
                    <option value="">Select a range</option>
                    {BUDGET_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="What should we know?" htmlFor="message" error={errors.message}>
                <textarea id="message" rows={6} className={fieldClass(Boolean(errors.message))} value={values.message} onChange={(event) => update('message', event.target.value)} required />
              </Field>
              {formError && <p className="text-sm text-danger">{formError}</p>}
              <div>
                <Button type="submit" loading={submitting}>
                  Send message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
