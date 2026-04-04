import { TRUST_METRICS, TRUST_GUARANTEES } from '../_constants';

export function TrustSignals(): React.ReactElement {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-content mx-auto">
        <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-stone mb-4">
          Why trust us
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink">
          Built for transparency. No surprises.
        </h2>

        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="card text-center animate-on-enter"
            >
              <div className="font-display text-3xl font-bold text-ink">
                {metric.number}
              </div>
              <p className="mt-2 text-sm text-stone">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TRUST_GUARANTEES.map((guarantee) => (
            <div
              key={guarantee}
              className="flex items-center gap-2 text-sm text-stone"
            >
              <svg
                className="w-4 h-4 text-emerald-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {guarantee}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-md border border-border p-6 text-center">
          <p className="text-sm text-stone leading-relaxed max-w-prose mx-auto">
            30-day free trial on every plan. If you are not seeing results, we
            will help you optimize your flow or refund you in full.
          </p>
        </div>
      </div>
    </section>
  );
}
