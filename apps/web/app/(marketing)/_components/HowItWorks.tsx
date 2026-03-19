import { STEPS } from '../_constants';
import {
  FlowBuilderIllustration,
  EmbedSnippetIllustration,
  ScoredLeadsIllustration,
} from './StepIllustrations';

const ILLUSTRATIONS = [
  FlowBuilderIllustration,
  EmbedSnippetIllustration,
  ScoredLeadsIllustration,
] as const;

export function HowItWorks(): React.ReactElement {
  return (
    <section id="how-it-works" className="py-24 px-6 bg-surface-alt border-y border-border">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink">
          Three steps. Five minutes.
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          {STEPS.map((step, index) => {
            const Illustration = ILLUSTRATIONS[index];
            return (
              <div key={step.num} className={`animate-on-enter stagger-${index + 1}`}>
                {Illustration !== undefined && (
                  <div className="mb-5 rounded-md border border-border bg-surface overflow-hidden">
                    <Illustration />
                  </div>
                )}
                <div className="font-mono text-4xl font-light text-border-dark select-none">
                  {step.num}
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
