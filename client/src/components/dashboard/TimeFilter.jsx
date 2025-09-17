import React from 'react';
import { Button } from '@/components/ui/button';

export const TimeFilter = ({ activeFilter, onChange }) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-[#94A3B8] mr-2">View:</span>
      <Button 
        variant={activeFilter === 'day' ? 'default' : 'outline'} 
        size="sm"
        className={activeFilter === 'day' ? 'bg-[#5FB1E8]' : 'bg-[#343230]'}
        onClick={() => onChange('day')}
      >
        Day
      </Button>
      <Button 
        variant={activeFilter === 'month' ? 'default' : 'outline'} 
        size="sm"
        className={activeFilter === 'month' ? 'bg-[#5FB1E8]' : 'bg-[#343230]'}
        onClick={() => onChange('month')}
      >
        Month
      </Button>
      <Button 
        variant={activeFilter === 'year' ? 'default' : 'outline'} 
        size="sm"
        className={activeFilter === 'year' ? 'bg-[#5FB1E8]' : 'bg-[#343230]'}
        onClick={() => onChange('year')}
      >
        Year
      </Button>
    </div>
  );
};
