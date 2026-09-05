import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';

export default function AIInsightsPanel({ insights }) {
  return (
    <div className="dh-card" style={{ backgroundColor: 'var(--lavender-light)', border: '1px solid var(--lavender)' }}>
      <div className="dh-card-title">
        <Lightbulb size={18} style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--blue-slate)' }} />
        AI Insights
      </div>
      
      <div className="dh-insights-list">
        {insights.map((insight, i) => (
          <div key={i} className="dh-insight-item">
            <TrendingUp size={16} className="dh-insight-icon" />
            <div className="dh-insight-text">
              {insight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
