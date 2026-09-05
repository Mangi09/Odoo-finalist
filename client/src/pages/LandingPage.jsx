import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import TrustStrip from '../components/landing/TrustStrip';
import FeatureSection from '../components/landing/FeatureSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import BenefitsSection from '../components/landing/BenefitsSection';
import WhyDealFlowSection from '../components/landing/WhyDealFlowSection';
import Testimonials from '../components/landing/Testimonials';
import CTASection from '../components/landing/CTASection';
import LandingFooter from '../components/landing/LandingFooter';
import '../components/landing/LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <HeroSection />
      <TrustStrip />
      <FeatureSection />
      <WorkflowSection />
      <BenefitsSection />
      <WhyDealFlowSection />
      <Testimonials />
      <CTASection />
      <LandingFooter />
    </div>
  );
}
