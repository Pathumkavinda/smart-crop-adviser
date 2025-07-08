'use client';

import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register all Chart.js components
Chart.register(...registerables);

export default function ChartComponent({ data, options, theme }) {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Ensure chart is registered before rendering
    setReady(true);
  }, []);
  
  if (!ready) return null;
  
  return (
    <div className="h-64">
      <Line 
        data={data} 
        options={{
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }} 
      />
    </div>
  );
}