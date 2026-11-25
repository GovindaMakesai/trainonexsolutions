import { Component, type ReactNode } from 'react';
import { buttonClass } from '@/components/ui/Button';

type State = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-6">
        <div className="max-w-md text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-stone">Something shifted</p>
          <h1 className="mt-4 font-serif text-5xl">This view couldn’t be shown.</h1>
          <p className="mt-4 text-muted">Reload the page. If it keeps happening, the studio can pick it up from the server logs.</p>
          <button type="button" className={`${buttonClass('primary')} mt-8`} onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      </div>
    );
  }
}
