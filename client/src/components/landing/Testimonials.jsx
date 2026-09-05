import React from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "DealFlow360 gives our sales and operations teams one shared view of every deal. It completely eliminated our internal communication bottlenecks.",
      name: "Priya Sharma",
      role: "Sales Operations Manager",
      initials: "PS"
    },
    {
      quote: "The automated financial recalculations and discount governance saved us thousands in leaked revenue within the first quarter.",
      name: "Marcus Chen",
      role: "VP of Finance",
      initials: "MC"
    },
    {
      quote: "Finally, a platform that connects the initial quotation directly to warehouse fulfillment. Our delivery times have improved by 30%.",
      name: "Sarah Jenkins",
      role: "Director of Logistics",
      initials: "SJ"
    }
  ];

  return (
    <section className="landing-section" style={{ paddingTop: '40px', paddingBottom: '120px' }}>
      <div className="testimonial-grid">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <p className="testimonial-quote">"{t.quote}"</p>
            <div className="testimonial-author">
              <div className="author-avatar">{t.initials}</div>
              <div className="author-info">
                <span className="author-name">{t.name}</span>
                <span className="author-role">{t.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
