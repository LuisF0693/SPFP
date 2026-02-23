import React from 'react';
import { Hero } from './landing/Hero';
import { Features } from './landing/Features';
import { Pricing } from './landing/Pricing';
import { FAQ } from './landing/FAQ';
import { Testimonials } from './landing/Testimonials';
import { Footer } from './landing/Footer';

export const TransformePage: React.FC = () => {
  return (
    <main className="w-full">
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Testimonials />
      <Footer />
    </main>
  );
};

export default TransformePage;
