import { BEFORE_ITEMS, AFTER_ITEMS } from '../_constants';

export function BeforeAfter(): React.ReactElement {
  return (
    <section className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink text-center">
          Before and after.
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-body text-base font-semibold text-stone">
              Before SignalBox
            </h3>
            <ul className="mt-4 space-y-3">
              {BEFORE_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone">
                  <svg
                    className="w-4 h-4 text-border-dark flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card border-signal border-2">
            <h3 className="font-body text-base font-semibold text-ink">
              After SignalBox
            </h3>
            <ul className="mt-4 space-y-3">
              {AFTER_ITEMS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink">
                  <svg
                    className="w-4 h-4 text-signal flex-shrink-0 mt-0.5"
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
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
