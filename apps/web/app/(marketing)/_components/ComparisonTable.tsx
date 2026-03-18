import { COMPARISON_ROWS } from '../_constants';

export function ComparisonTable(): React.ReactElement {
  return (
    <section className="py-24 px-6">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Why not just use a form?
        </h2>
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-md">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-left py-3 px-5 font-body font-medium text-stone">
                  Regular contact forms
                </th>
                <th className="text-left py-3 px-5 font-body font-medium text-ink">
                  SignalBox
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.form} className="border-b border-border last:border-b-0">
                  <td className="py-3 px-5 text-stone">{row.form}</td>
                  <td className="py-3 px-5 text-ink font-medium">{row.signalbox}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
