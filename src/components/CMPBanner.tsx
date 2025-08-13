import React, { useEffect, useState } from 'react';

const CMPBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [ads, setAds] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cmp_consent');
      if (!saved) setVisible(true);
    } catch {}
  }, []);

  const save = (consent: { ads: boolean; analytics: boolean }) => {
    localStorage.setItem('cmp_consent', JSON.stringify({ ...consent, ts: Date.now() }));
  };

  const accept = () => { save({ ads: true, analytics: true }); setVisible(false); };
  const decline = () => { save({ ads: false, analytics: false }); setVisible(false); };
  const customize = () => { save({ ads, analytics }); setVisible(false); };

  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 border-t">
      <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="text-sm text-muted-foreground">
          We use cookies for analytics and ads. Manage your preferences.
        </div>
        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} /> Ads</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /> Analytics</label>
          <button className="btn btn-sm" onClick={customize}>Save</button>
          <button className="btn btn-sm" onClick={decline}>Decline</button>
          <button className="btn btn-sm btn-gold" onClick={accept}>Accept</button>
        </div>
      </div>
    </div>
  );
};

export default CMPBanner;