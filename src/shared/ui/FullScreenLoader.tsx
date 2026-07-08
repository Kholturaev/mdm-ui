import { Spinner } from './Spinner';

/** Shown while `AuthGate` confirms the httpOnly session cookie is still valid on boot. */
export function FullScreenLoader() {
  return (
    <div className="bg-bg flex h-screen w-screen items-center justify-center">
      <Spinner className="text-fg-muted size-8" />
    </div>
  );
}
