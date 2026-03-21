import { FEATURES } from '../_constants';
import {
  LeadScoringIllustration,
  InstantAlertsIllustration,
  ConversionAnalyticsIllustration,
  CustomBrandingIllustration,
  LeadRoutingIllustration,
  AbTestingIllustration,
  DripSequencesIllustration,
  IntegrationsIllustration,
  SharedAnalyticsIllustration,
} from './FeatureIllustrations';

import type { ReactElement } from 'react';

const ILLUSTRATIONS: ReadonlyArray<(() => ReactElement) | undefined> = [
  LeadScoringIllustration,
  InstantAlertsIllustration,
  ConversionAnalyticsIllustration,
  CustomBrandingIllustration,
  LeadRoutingIllustration,
  AbTestingIllustration,
  DripSequencesIllustration,
  IntegrationsIllustration,
  SharedAnalyticsIllustration,
];

export function FeaturesSection(): React.ReactElement {
  return (
    <section className="py-24 px-6 bg-surface-alt border-y border-border">
      <div className="max-w-content mx-auto">
        <h2 className="font-display text-3xl font-semibold text-ink">
          What you get.
        </h2>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURES.map((feature, index) => {
            const Illustration = ILLUSTRATIONS[index];
            return (
              <div
                key={feature.title}
                className={`card animate-on-enter stagger-${String((index % 4) + 1)}`}
              >
                {Illustration !== undefined && (
                  <div className="mb-4 -mx-5 -mt-5 rounded-t-md border-b border-border bg-surface-alt overflow-hidden">
                    <Illustration />
                  </div>
                )}
                <h3 className="font-body text-base font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-stone leading-relaxed">
                  {feature.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
