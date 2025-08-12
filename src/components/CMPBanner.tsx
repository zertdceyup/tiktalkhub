import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const CMPBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const val = localStorage.getItem('cmp_consent');
    if (!val) setVisible(true);
  }, []);
  const consent = (value: 'accepted'|'declined') => {
    localStorage.setItem('cmp_consent', value);
    setVisible(false);
  };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-background/95 border-t p-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">We use cookies to improve your experience and show contextual ads. See our Privacy Policy.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => consent('declined')}>Decline</Button>
          <Button className="btn-gold" onClick={() => consent('accepted')}>Accept</Button>
        </div>
      </div>
    </div>
  );
};

export default CMPBanner;