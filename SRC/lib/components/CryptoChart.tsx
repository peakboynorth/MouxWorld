import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

interface DataPoint {
  time: string;
  value: number;
}

export const CryptoChart = ({ data }: { data: DataPoint[] }) => {
  const [zoom, setZoom] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  // Simple mock function to filter data based on zoom level
  const filteredData = data.slice(- (zoom === 'daily' ? 24 : zoom === 'monthly' ? 30 : 365));

  return (
    <div className="w-full h-80 bg-black rounded-3xl p-6 border border-white/10">
      <div className="flex gap-2 mb-4">
        {(['daily', 'monthly', 'yearly'] as const).map((z) => (
          <button
            key={z}
            onClick={() => setZoom(z)}
            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${zoom === z ? 'bg-moux-cyan text-black' : 'text-gray-500 hover:text-white'}`}
          >
            {z}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
            itemStyle={{ color: '#00ff00' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#00ff00"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Brush dataKey="time" height={30} stroke="#444" fill="#111" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
