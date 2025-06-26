
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { ChartData } from '@/lib/types';

interface VolumeProfileProps {
  data: ChartData[];
  height?: number;
}

const VolumeProfile: React.FC<VolumeProfileProps> = ({ data, height = 100 }) => {
  const volumeData = data.slice(-50).map((candle, index) => ({
    index,
    volume: candle.volume,
    color: candle.close >= candle.open ? '#22c55e' : '#ef4444'
  }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={volumeData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis hide />
          <YAxis hide />
          <Bar 
            dataKey="volume" 
            fill="#3b82f6"
            opacity={0.7}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VolumeProfile;
