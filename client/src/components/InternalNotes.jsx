import React, { useState } from 'react';
import { StickyNote } from 'lucide-react';

export default function InternalNotes() {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="qd-card">
      <div className="qd-card-header">
        <StickyNote size={18} />
        Internal Notes
      </div>
      <textarea 
        className="notes-textarea" 
        placeholder="Add notes for internal sales or approval teams..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      ></textarea>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
        {saved && <span style={{ fontSize: '12px', color: '#10b981' }}>Note saved</span>}
        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleSave}>
          Save Note
        </button>
      </div>
    </div>
  );
}
