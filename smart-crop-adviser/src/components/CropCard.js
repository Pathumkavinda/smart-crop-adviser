// src/components/CropCard.js
"use client";
import { useContext } from 'react';
import { ThemeContext } from '@/context/ThemeContext';

export default function CropCard({ crop }) {
  const { theme } = useContext(ThemeContext);
  
  return (
    <div 
      style={{ 
        backgroundColor: theme.colors.card,
        color: theme.colors.text,
        borderColor: theme.colors.border
      }}
      className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <h3 style={{ color: theme.colors.primary }} className="text-lg font-semibold mb-2">
        {crop.Crop} {crop.Variety && `- ${crop.Variety}`}
      </h3>
      
      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">AEZ:</span> {crop['Agro-Ecological Zones (AEZs)']}
        </p>
        <p>
          <span className="font-medium">Growing Conditions:</span> {crop['Temperature (°C)']}°C, 
          {crop['Rainfall (mm)']} rainfall, {crop['Humidity (%)']} humidity
        </p>
        <p>
          <span className="font-medium">Nutrients (N-P-K):</span> {crop['N (kg/ha)']} - {crop['P (kg/ha)']} - {crop['K (kg/ha)']} kg/ha
        </p>
        <p>
          <span className="font-medium">Soil:</span> pH {crop['Soil pH']}, {crop['Soil Types']}
        </p>
        <p>
          <span className="font-medium">Season:</span> {crop['Cultivation Season']}
        </p>
      </div>
    </div>
  );
}