import { STATS } from '../_constants';

export function StatsSection(): React.ReactElement {
  return (
    <section className="py-16 px-6 bg-surface-alt border-y border-border">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-2xl font-semibold text-ink text-center mb-10">
          Most businesses lose deals before they even respond.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
          {STATS.map((stat, index) => (
            <div key={stat.number} className={`animate-on-enter stagger-${index + 1}`}>
              <div className="font-display text-5xl font-bold text-ink">
                {stat.number}
              </div>
              <p className="mt-2 text-sm text-stone max-w-[240px] mx-auto">
                {stat.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-base text-stone text-center max-w-prose mx-auto">
          HawkLeads fixes this by scoring leads the moment they submit.
        </p>
      </div>
    </section>
  );
}
