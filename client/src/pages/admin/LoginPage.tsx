import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { photos } from '@/content/photos';
import { Field, fieldClass } from '@/components/ui/Field';
import { Seo } from '@/components/ui/Seo';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage, getFieldErrors } from '@/lib/errors';

export function LoginPage() {
  const { admin, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!loading && admin) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const from = (location.state as { from?: string } | null)?.from || '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      const fieldErrors = getFieldErrors(error) || [];
      const mapped: typeof errors = { form: getErrorMessage(error, 'Invalid email or password.') };
      fieldErrors.forEach((issue) => {
        if (issue.field === 'email' || issue.field === 'password') mapped[issue.field] = issue.message;
      });
      setErrors(mapped);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Seo title="Studio login — Trainonex" description="Sign in to the Trainonex studio." noIndex />
      <section className="relative hidden overflow-hidden lg:block">
        <img src={photos.color} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#140818] via-[#140818]/75 to-[#140818]/25" />
        <div className="relative flex h-full flex-col justify-between px-12 py-12 text-cream">
          <p className="text-sm tracking-[0.18em]">TRAINONEX</p>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-accent">Studio</p>
            <h1 className="mt-4 max-w-md font-serif text-6xl leading-[0.95]">The studio, behind the work.</h1>
            <p className="mt-6 max-w-sm text-sm leading-6 text-cream/80">
              Publish case studies, keep drafts private, and update the public site without touching the code.
            </p>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-cream/70">Authorized accounts only</p>
        </div>
      </section>
      <section className="flex items-center justify-center bg-paper px-5 py-16">
        <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] text-stone lg:hidden">Trainonex</p>
          <h2 className="mt-3 font-serif text-5xl">Sign in</h2>
          <p className="mt-3 text-sm text-muted">Use the studio account created during setup.</p>
          <div className="mt-8 space-y-5">
            <Field label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className={fieldClass(Boolean(errors.email))}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password}>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={fieldClass(Boolean(errors.password))}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </div>
          {errors.form && (
            <p className="mt-4 text-sm text-danger" role="alert">
              {errors.form}
            </p>
          )}
          <Button type="submit" className="mt-6 w-full" loading={submitting || loading}>
            Enter studio
          </Button>
        </form>
      </section>
    </div>
  );
}
