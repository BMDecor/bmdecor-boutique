'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('bmdecor_consent');
    if (!consent) setVisible(true);
  }, []);

  const accept = (level: 'essential' | 'all') => {
    localStorage.setItem('bmdecor_consent', JSON.stringify({
      level,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-[#2C2C2C]/90 backdrop-blur-md rounded-xl border border-white/10 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
        <div className="flex-1 text-sm text-white/80 leading-relaxed">
          We use essential cookies to keep you signed in and remember your cart. With your
          permission, we may also use analytics cookies to improve our service.{' '}
          <a href="/privacy-policy" className="text-[#C9A86C] hover:underline">
            Privacy Policy
          </a>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => accept('essential')}
            className="px-4 py-2 text-sm font-medium text-white/70 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
          >
            Essential Only
          </button>
          <button
            onClick={() => accept('all')}
            className="px-4 py-2 text-sm font-medium bg-[#C9A86C] text-[#2C2C2C] rounded-lg hover:bg-[#D4B896] transition-colors"
          >
            Allow All
          </button>
        </div>
      </div>
    </div>
  );
}
