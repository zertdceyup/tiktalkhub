import React, { useEffect } from 'react';

const AdSlot: React.FC<{ id: string; height?: number; className?: string }> = ({ id, height = 250, className }) => {
  useEffect(() => {
    // Hook for Google Ads or other providers can go here
  }, [id]);
  return (
    <div className={className}>
      <div id={id} style={{ minHeight: height, width: '100%' }} className="bg-secondary/30 rounded flex items-center justify-center text-xs text-muted-foreground">
        Ad space
      </div>
    </div>
  );
};

export default AdSlot;