"use client";

/**
 * Route-level backstop. The 3D has its own boundary inside SiteShell, so
 * reaching this means something in the page itself threw — the reader still
 * gets a NOVA-shaped screen with a way forward instead of a blank document.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main"
      className="relative z-10 grid min-h-screen place-items-center px-6 text-center"
    >
      <div className="nova-shell">
        <p className="nova-label text-accent-soft">SOMETHING BROKE</p>
        <h1 className="nova-h2 mt-5">This page stopped short.</h1>
        <p className="nova-lead mx-auto mt-5 max-w-[52ch]">
          NOVA is a concept study, and the concept just tripped over itself.
          Reloading usually clears it.
        </p>
        {error.digest ? (
          <p className="mt-4 text-[13px] text-faint">ref {error.digest}</p>
        ) : null}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            data-testid="error-retry"
            className="nova-tap inline-flex h-[45px] items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-[#050507]"
          >
            Try again
          </button>
          <a href="/" className="nova-ghost nova-tap h-[45px] px-6 text-[14px]">
            Back to the start
          </a>
        </div>
      </div>
    </main>
  );
}
