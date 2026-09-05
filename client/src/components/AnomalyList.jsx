import React from 'react';
import { ShieldAlert, AlertCircle, ArrowRight } from 'lucide-react';

export default function AnomalyList({ anomalies }) {
  return (
    <div className="dh-card">
      <div className="dh-card-title">
        <ShieldAlert size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Detected Anomalies
        <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 'normal', marginTop: '4px' }}>
          AI-assisted signals indicating unusual deal behaviour or revenue risk.
        </span>
      </div>
      
      <div className="dh-anomaly-list">
        {anomalies.map((anomaly, i) => {
          const isCritical = anomaly.severity.toLowerCase() === 'critical';
          
          return (
            <div key={i} className="dh-anomaly-card">
              <div className={`dh-anomaly-icon ${anomaly.severity.toLowerCase()}`}>
                {isCritical ? <ShieldAlert size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="dh-anomaly-content">
                <div className="dh-anomaly-header">
                  <div>
                    <div className="dh-anomaly-deal">{anomaly.deal}</div>
                    <div className="dh-anomaly-customer">{anomaly.customer}</div>
                  </div>
                  <div className={`dh-severity-badge ${anomaly.severity.toLowerCase()}`}>
                    {anomaly.severity}
                  </div>
                </div>
                
                <div className={`dh-anomaly-desc ${anomaly.severity.toLowerCase()}`}>
                  <strong>Anomaly:</strong> {anomaly.description}
                </div>
                
                <div className="dh-anomaly-action">
                  <ArrowRight size={14} />
                  Suggested Action: {anomaly.recommendation}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
