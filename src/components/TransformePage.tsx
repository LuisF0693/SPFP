import React from 'react';
import { Hero } from './landing/Hero';
import { ProblemSection } from './landing/ProblemSection';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { Testimonials } from './landing/Testimonials';
import { TrustIndicators } from './landing/TrustIndicators';
import { Footer } from './landing/Footer';

export const TransformePage: React.FC = () => {
  return (
    <main className="w-full overflow-hidden">
      <Hero />
      <ProblemSection />
      <Features />
      <Pricing />
      <FAQ />
      <Testimonials />
      <TrustIndicators />
      <Footer />
    </main>
  );
};

export default TransformePage;
