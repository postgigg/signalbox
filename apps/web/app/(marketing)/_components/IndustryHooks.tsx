import { INDUSTRY_HOOKS } from '../_constants';

export function IndustryHooks(): React.ReactElement {
  return (
    <section className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Built for businesses that sell by phone.
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {INDUSTRY_HOOKS.map((hook, index) => (
            <div
              key={hook.title}
              className={`card animate-on-enter stagger-${index + 1}`}
            >
              <h3 className="font-body text-base font-semibold text-ink">
                {hook.title}
              </h3>
              <p className="mt-2 text-sm text-stone leading-relaxed">
                {hook.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
