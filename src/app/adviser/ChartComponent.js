'use client';

import React, { useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '@/context/ThemeContext';

// Register all Chart.js components
Chart.register(...registerables);

export default function ChartComponent({ data, options }) {
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  
  useEffect(() => {
    // Ensure chart is registered before rendering
    setReady(true);
  }, []);
  
  if (!ready) return null;
  
  // Default chart options with theme-aware styling
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.colors.text,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.colors.border,
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme.colors.text
        }
      },
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme.colors.text
        }
      }
    }
  };
  
  // Merge default options with provided options
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...(options?.plugins || {})
    },
    scales: {
      ...defaultOptions.scales,
      ...(options?.scales || {})
    }
  };
  
  return (
    <div className="h-64">
      <Line 
        data={data} 
        options={mergedOptions} 
      />
    </div>
  );
}