import React from 'react';
import { Info } from 'lucide-react';

export default function AlertPanel() {
  return (
    <div className="inv-alert-panel">
      <Info size={18} />
      <span>Partial payments are supported with a complete audit history and remain linked to the original deal.</span>
    </div>
  );
}
