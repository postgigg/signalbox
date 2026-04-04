import { INDUSTRY_HOOKS } from '../_constants';

export function IndustryHooks(): React.ReactElement {
  return (
    <section className="py-24 px-6 bg-black">
      <div className="max-w-content mx-auto">
        <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-zinc-500 mb-4">
          Built for your industry
        </p>
        <h2 className="font-display text-3xl font-semibold text-white">
          Built for businesses that sell by phone.
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {INDUSTRY_HOOKS.map((hook, index) => (
            <div
              key={hook.title}
              className={`rounded-md border border-zinc-800 bg-zinc-900 p-5 animate-on-enter stagger-${String(index + 1)}`}
            >
              <h3 className="font-body text-base font-semibold text-white">
                {hook.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {hook.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
