import React from 'react';
import { Target, FileText, ShieldCheck, MessageSquare, Truck, FileOutput, CreditCard } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    { num: '01', label: 'Sales', icon: Target },
    { num: '02', label: 'Quotation', icon: FileText },
    { num: '03', label: 'Approval', icon: ShieldCheck },
    { num: '04', label: 'Negotiation', icon: MessageSquare },
    { num: '05', label: 'Fulfillment', icon: Truck },
    { num: '06', label: 'Invoice', icon: FileOutput },
    { num: '07', label: 'Payment', icon: CreditCard }
  ];

  return (
    <section id="how-it-works" className="landing-section">
      <div className="text-center">
        <h2 className="landing-title">One deal. One connected journey.</h2>
        <p className="landing-subtitle">
          Watch your deals progress smoothly across every business stage without missing a beat.
        </p>
      </div>

      <div className="workflow-container">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} className="workflow-step">
              <div className="workflow-icon">
                <Icon size={24} />
              </div>
              <span className="workflow-number">{step.num}</span>
              <span className="workflow-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
