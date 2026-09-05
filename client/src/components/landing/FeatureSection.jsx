import React from 'react';
import { FileText, ShieldCheck, MessageSquare, Truck, FileOutput, Lightbulb } from 'lucide-react';

export default function FeatureSection() {
  const features = [
    {
      icon: FileText,
      title: "Smart Quotations",
      desc: "Create and manage quotations efficiently."
    },
    {
      icon: ShieldCheck,
      title: "Approval Workflows",
      desc: "Move deals through structured approval processes."
    },
    {
      icon: MessageSquare,
      title: "Negotiation Management",
      desc: "Track negotiations, discounts and deal changes."
    },
    {
      icon: Truck,
      title: "Fulfillment Tracking",
      desc: "Connect sales commitments with operational execution."
    },
    {
      icon: FileOutput,
      title: "Invoice Management",
      desc: "Keep financial documentation connected to every deal."
    },
    {
      icon: Lightbulb,
      title: "Intelligent Deal Insights",
      desc: "Identify deal risks, anomalies and opportunities."
    }
  ];

  return (
    <section id="features" className="landing-section">
      <div className="text-center">
        <h2 className="landing-title">Everything your deal needs.<br/>One connected system.</h2>
        <p className="landing-subtitle">
          Manage the complete journey from the first quotation to final payment.
        </p>
      </div>

      <div className="feature-grid">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="feature-card">
              <div className="feature-icon-wrapper">
                <Icon size={24} />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
