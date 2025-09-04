import { useState, useEffect } from 'react';
import { Leaf, Database, Download, FileText, AlertTriangle, Info, PenTool } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { generateFertilizerPDF } from './pdfGenerator';

// Component to integrate into the main dashboard
const FertilizerReportSection = ({ 
  soilData, 
  predictions, 
  selectedFarmer, 
  theme,
  isDark 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [generating, setGenerating] = useState(false);
  const [fertilizerData, setFertilizerData] = useState(null);
  const [customNotes, setCustomNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  // Translations for UI elements
  const translations = {
    english: {
      title: 'Crop Fertilizer Requirements',
      subtitle: 'Generate detailed fertilizer recommendations',
      generating: 'Generating report...',
      generate: 'Generate PDF Report',
      customizeReport: 'Customize Report',
      additionalNotes: 'Additional Notes',
      saveCustomization: 'Save Changes',
      cancel: 'Cancel',
      notesPlaceholder: 'Add any additional notes or specific recommendations...',
      basedOn: 'Based on recommended crop:',
      seedingMethod: 'Seeding Method:',
      varieties: 'Varieties:',
      fertilizerType: 'Fertilizer Type',
      ratePerHectare: 'Rate per hectare',
      purpose: 'Purpose',
      totalRequired: 'Total Required',
      directPlanting: 'Direct planting using seed tubers',
      directSeeding: 'Direct seeding (no nursery)',
      nurseryTransplant: 'Nursery stage then transplanting',
      noData: 'Get crop recommendations first to see fertilizer requirements'
    },
    sinhala: {
      title: 'බෝග පොහොර අවශ්‍යතා',
      subtitle: 'විස්තරාත්මක පොහොර නිර්දේශ ජනනය කරන්න',
      generating: 'වාර්තාව ජනනය වෙමින්...',
      generate: 'PDF වාර්තාව ජනනය කරන්න',
      customizeReport: 'වාර්තාව අභිරුචිකරණය කරන්න',
      additionalNotes: 'අමතර සටහන්',
      saveCustomization: 'වෙනස්කම් සුරකින්න',
      cancel: 'අවලංගු කරන්න',
      notesPlaceholder: 'ඕනෑම අමතර සටහන් හෝ නිශ්චිත නිර්දේශ එකතු කරන්න...',
      basedOn: 'නිර්දේශිත බෝගය මත පදනම්ව:',
      seedingMethod: 'බීජ රෝපණ ක්‍රමය:',
      varieties: 'ප්‍රභේද:',
      fertilizerType: 'පොහොර වර්ගය',
      ratePerHectare: 'හෙක්ටයාරයකට අනුපාතය',
      purpose: 'අරමුණ',
      totalRequired: 'මුළු අවශ්‍යතාවය',
      directPlanting: 'බීජ අල භාවිතයෙන් සෘජු රෝපණය',
      directSeeding: 'සෘජු බීජ රෝපණය (තවාන් අවධියක් නැත)',
      nurseryTransplant: 'තවාන් අවධිය පසුව සිටුවීම',
      noData: 'පොහොර අවශ්‍යතා බැලීමට පළමුව බෝග නිර්දේශ ලබා ගන්න'
    },
    tamil: {
      title: 'பயிர் உர தேவைகள்',
      subtitle: 'விரிவான உர பரிந்துரைகளை உருவாக்கவும்',
      generating: 'அறிக்கை உருவாக்கப்படுகிறது...',
      generate: 'PDF அறிக்கையை உருவாக்கு',
      customizeReport: 'அறிக்கையை தனிப்பயனாக்குக',
      additionalNotes: 'கூடுதல் குறிப்புகள்',
      saveCustomization: 'மாற்றங்களை சேமி',
      cancel: 'ரத்து செய்',
      notesPlaceholder: 'கூடுதல் குறிப்புகள் அல்லது குறிப்பிட்ட பரிந்துரைகளைச் சேர்க்கவும்...',
      basedOn: 'பரிந்துரைக்கப்பட்ட பயிரின் அடிப்படையில்:',
      seedingMethod: 'விதை முறை:',
      varieties: 'வகைகள்:',
      fertilizerType: 'உர வகை',
      ratePerHectare: 'ஹெக்டேருக்கான விகிதம்',
      purpose: 'நோக்கம்',
      totalRequired: 'மொத்த தேவை',
      directPlanting: 'விதை கிழங்குகளைப் பயன்படுத்தி நேரடி நடவு',
      directSeeding: 'நேரடி விதைப்பு (நாற்றங்கால் இல்லை)',
      nurseryTransplant: 'நாற்றங்கால் நிலை பின்னர் நடவு',
      noData: 'உர தேவைகளைப் பார்க்க முதலில் பயிர் பரிந்துரைகளைப் பெறவும்'
    }
  };
  
  // Get active translation based on selected language
  const t = translations[selectedLanguage] || translations.english;
  
  // Map crop fertilizer data based on predicted crop
  useEffect(() => {
    if (!predictions?.mlResult?.predicted_crop) {
      setFertilizerData(null);
      return;
    }
    
    const cropName = predictions.mlResult.predicted_crop.toLowerCase();
    
    // Create a mapping between crop types and their fertilizer data
    const cropFertilizerMapping = {
      potato: {
        varieties: ["Granola", "Desiree"],
        seedingMethod: "directPlanting",
        fertilizers: [
          { type: "Urea", rate: "225 kg (75 kg basal + 150 kg top dressed in 2 splits)", purpose: "Main nitrogen source" },
          { type: "TSP (Triple Super Phosphate)", rate: "150 kg", purpose: "Phosphorus" },
          { type: "MOP (Muriate of Potash)", rate: "150 kg (100 kg basal + 50 kg top dressed)", purpose: "Potassium" },
          { type: "SOP (Sulfate of Potash)", rate: "160-180 kg", purpose: "Safer for tubers" },
          { type: "FYM / Compost", rate: "10-15 tons", purpose: "Organic matter" },
          { type: "Dolomite (if pH < 5.5)", rate: "1-2 tons", purpose: "pH correction + Mg" }
        ]
      },
      carrot: {
        varieties: ["New Kuroda", "Chantenay"],
        seedingMethod: "directSeeding",
        fertilizers: [
          { type: "Urea", rate: "110 kg (55 kg basal + 55 kg top dressed)", purpose: "Nitrogen" },
          { type: "TSP", rate: "100 kg", purpose: "Phosphorus" },
          { type: "SOP (preferred)", rate: "75 kg", purpose: "Potassium" },
          { type: "Compost / FYM", rate: "15-20 tons", purpose: "Organic matter" },
          { type: "Dolomite (optional)", rate: "1-1.5 tons", purpose: "pH correction + Mg" }
        ]
      },
      maize: {
        varieties: ["Pacific 984", "Arjun"],
        seedingMethod: "directSeeding",
        fertilizers: [
          { type: "Urea", rate: "150 kg (50 kg basal + 100 kg top dressed in 2 splits)", purpose: "Nitrogen" },
          { type: "TSP", rate: "100 kg", purpose: "Phosphorus" },
          { type: "MOP", rate: "100 kg (75 basal + 25 top)", purpose: "Potassium" },
          { type: "FYM / Compost", rate: "10-15 tons", purpose: "Improves water retention" },
          { type: "Dolomite (if acidic soil)", rate: "1-2 tons", purpose: "pH correction" }
        ]
      },
      onion: {
        varieties: ["Hybrid 62", "Bhima Shakti", "Vethalan", "LKRON 1"],
        seedingMethod: "nurseryTransplant",
        nurseryFertilizers: [
          { type: "Ammonium Sulphate", rate: "2-3 g per 1m²", purpose: "Light N + S source" },
          { type: "TSP", rate: "4 g per 1m²", purpose: "Phosphorus" },
          { type: "MOP", rate: "2 g per 1m²", purpose: "Potassium" },
          { type: "FYM / Compost", rate: "1-2 kg per 1m²", purpose: "Soil texture, nutrients" }
        ],
        fertilizers: [
          { type: "Urea", rate: "100 kg (50 basal + 50 top)", purpose: "Nitrogen" },
          { type: "Ammonium Sulphate", rate: "210 kg", purpose: "Alternative N & S" },
          { type: "TSP", rate: "100 kg", purpose: "Phosphorus" },
          { type: "MOP", rate: "75 kg (50 + 25)", purpose: "Potassium" },
          { type: "FYM / Compost", rate: "20 tons", purpose: "Organic matter" },
          { type: "Dolomite", rate: "1-2 tons (if required)", purpose: "pH & Mg correction" }
        ]
      },
      tomato: {
        varieties: ["Maheshi", "Thilina"],
        seedingMethod: "nurseryTransplant",
        nurseryFertilizers: [
          { type: "Ammonium Sulphate", rate: "2-3 g per 1m²", purpose: "Nitrogen" },
          { type: "TSP", rate: "4 g per 1m²", purpose: "Phosphorus" },
          { type: "SOP (preferred)", rate: "2 g per 1m²", purpose: "Potassium" },
          { type: "FYM / Compost", rate: "1-2 kg per 1m²", purpose: "Better rooting, structure" }
        ],
        fertilizers: [
          { type: "Urea", rate: "110 kg (55 + 55)", purpose: "Nitrogen" },
          { type: "TSP", rate: "100 kg", purpose: "Strong root establishment" },
          { type: "MOP / SOP", rate: "100 kg (75 + 25)", purpose: "SOP improves fruit taste" },
          { type: "FYM / Compost", rate: "10-15 tons", purpose: "Nutrient buffering" },
          { type: "Dolomite", rate: "1-1.5 tons", purpose: "Neutralize acidity" }
        ]
      }
    };
    
    // Find the matching crop or use a fallback
    let matchedCrop = null;
    for (const [crop, data] of Object.entries(cropFertilizerMapping)) {
      if (cropName.includes(crop)) {
        matchedCrop = { name: crop, ...data };
        break;
      }
    }
    
    // If no match found, use a generic fallback
    if (!matchedCrop) {
      matchedCrop = {
        name: "generic",
        varieties: ["Various local varieties"],
        seedingMethod: "directSeeding",
        fertilizers: [
          { type: "Urea", rate: "100-200 kg split application", purpose: "Nitrogen supply" },
          { type: "TSP/SSP", rate: "100-150 kg", purpose: "Phosphorus" },
          { type: "MOP", rate: "75-150 kg", purpose: "Potassium" },
          { type: "Organic Matter", rate: "10-20 tons", purpose: "Soil health" }
        ]
      };
    }
    
    setFertilizerData(matchedCrop);
  }, [predictions]);
  
  const generatePDF = async () => {
    setGenerating(true);
    
    try {
      // Generate PDF with the selected language
      const pdf = generateFertilizerPDF(
        predictions.mlResult.predicted_crop,
        soilData,
        predictions,
        selectedFarmer,
        selectedLanguage,
        customNotes
      );
      
      // Save the PDF
      pdf.save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };
  
  // Function to get seedingMethod display text
  const getSeedingMethodText = (method) => {
    switch(method) {
      case 'directPlanting': return t.directPlanting;
      case 'directSeeding': return t.directSeeding;
      case 'nurseryTransplant': return t.nurseryTransplant;
      default: return method;
    }
  };
  
  // Calculate total fertilizer needed based on land area
  const calculateTotalNeeded = (rate) => {
    const landArea = parseFloat(soilData.landArea) || 1; // Default to 1 hectare if not specified
    
    // Extract numbers from rate string
    const rateMatch = rate.match(/(\d+)(?:\-|\-\-)(\d+)/);
    if (rateMatch) {
      // If range like 10-15
      const min = parseFloat(rateMatch[1]) * landArea;
      const max = parseFloat(rateMatch[2]) * landArea;
      return `${min.toFixed(1)} - ${max.toFixed(1)} ${rate.includes('tons') ? 'tons' : 'kg'}`;
    }
    
    const singleMatch = rate.match(/(\d+)\s*kg/);
    if (singleMatch) {
      // If single value like 100 kg
      const amount = parseFloat(singleMatch[1]) * landArea;
      return `${amount.toFixed(1)} kg`;
    }
    
    return '-';
  };
  
  return (
    <div className="rounded-lg shadow-lg p-6 border mb-6"
         style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2" 
            style={{ color: theme.colors.text }}>
          <Leaf className="h-5 w-5 text-green-500" />
          {t.title}
        </h2>
        
        {fertilizerData && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 rounded-lg flex items-center gap-1 text-sm"
            style={{
              backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
              color: isDark ? '#93C5FD' : '#2563EB'
            }}
          >
            <PenTool className="h-3.5 w-3.5" />
            <span>{t.customizeReport}</span>
          </button>
        )}
      </div>
      
      <p className="text-sm mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
        {t.subtitle}
      </p>
      
      {/* Language Selector */}
      <div className="mb-4">
        <LanguageToggle
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          isDark={isDark}
          theme={theme}
        />
      </div>
      
      {/* Content */}
      {!fertilizerData ? (
        <div className="p-6 text-center rounded-lg border" 
             style={{ 
               borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
               color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
             }}>
          <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>{t.noData}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Crop Info */}
          <div>
            <div className="p-3 rounded-lg"
                 style={{ 
                   backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                   color: isDark ? '#6EE7B7' : '#059669'
                 }}>
              <p>
                <span className="font-medium">{t.basedOn}</span> {predictions.mlResult.predicted_crop}
              </p>
              <div className="mt-1 text-sm grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>{t.seedingMethod} {getSeedingMethodText(fertilizerData.seedingMethod)}</p>
                <p>{t.varieties} {fertilizerData.varieties.join(", ")}</p>
              </div>
            </div>
          </div>
          
          {/* Custom Notes (Editable) */}
          {isEditing ? (
            <div className="border rounded-lg p-3"
                 style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}>
              <label className="block text-sm font-medium mb-1"
                     style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                {t.additionalNotes}
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={3}
                className="w-full p-2 text-sm border rounded-md"
                style={{
                  backgroundColor: isDark ? 'rgba(30,30,30,0.9)' : '#fff',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  color: isDark ? '#fff' : '#000'
                }}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm rounded-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(107,114,128,0.2)' : 'rgba(107,114,128,0.1)',
                    color: isDark ? '#D1D5DB' : '#6B7280'
                  }}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-sm rounded-md"
                  style={{
                    backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                    color: isDark ? '#6EE7B7' : '#059669'
                  }}
                >
                  {t.saveCustomization}
                </button>
              </div>
            </div>
          ) : customNotes && (
            <div className="p-3 rounded-lg border text-sm"
                 style={{ 
                   backgroundColor: isDark ? 'rgba(30,30,30,0.4)' : 'rgba(243,244,246,0.7)',
                   borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                   color: theme.colors.text
                 }}>
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" 
                      style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }} />
                <div>
                  <p className="font-medium text-xs mb-1"
                     style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {t.additionalNotes}
                  </p>
                  <p>{customNotes}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Fertilizer Table */}
          <div className="border rounded-lg overflow-hidden"
               style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-1 p-3"
                 style={{ 
                   backgroundColor: isDark ? 'rgba(75,85,99,0.2)' : 'rgba(243,244,246,1)',
                   borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                 }}>
              <div className="col-span-4 text-xs font-medium"
                   style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {t.fertilizerType}
              </div>
              <div className="col-span-3 text-xs font-medium"
                   style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {t.ratePerHectare}
              </div>
              <div className="col-span-3 text-xs font-medium"
                   style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {t.purpose}
              </div>
              <div className="col-span-2 text-xs font-medium"
                   style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                {t.totalRequired}
              </div>
            </div>
            
            {/* Field Fertilizers */}
            <div style={{ backgroundColor: theme.colors.card }}>
              {fertilizerData.fertilizers.map((fert, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-12 gap-1 p-3 text-sm"
                  style={{
                    backgroundColor: index % 2 === 0 
                      ? 'transparent' 
                      : (isDark ? 'rgba(30,30,30,0.3)' : 'rgba(243,244,246,0.7)'),
                    borderBottom: index !== fertilizerData.fertilizers.length - 1 
                      ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                      : 'none',
                    color: theme.colors.text
                  }}
                >
                  <div className="col-span-4 font-medium">{fert.type}</div>
                  <div className="col-span-3">{fert.rate}</div>
                  <div className="col-span-3">{fert.purpose}</div>
                  <div className="col-span-2 text-sm">
                    {calculateTotalNeeded(fert.rate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Nursery Fertilizers if applicable */}
          {fertilizerData.nurseryFertilizers && (
            <div>
              <div className="p-2 rounded-lg text-center mb-2 text-sm font-medium"
                   style={{ 
                     backgroundColor: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.1)',
                     color: isDark ? '#93C5FD' : '#2563EB'
                   }}>
                Nursery Stage Fertilizers (per 1m²)
              </div>
              
              <div className="border rounded-lg overflow-hidden"
                   style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-1 p-3"
                     style={{ 
                       backgroundColor: isDark ? 'rgba(75,85,99,0.2)' : 'rgba(243,244,246,1)',
                       borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                     }}>
                  <div className="col-span-5 text-xs font-medium"
                       style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {t.fertilizerType}
                  </div>
                  <div className="col-span-3 text-xs font-medium"
                       style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {t.ratePerHectare}
                  </div>
                  <div className="col-span-4 text-xs font-medium"
                       style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                    {t.purpose}
                  </div>
                </div>
                
                {/* Nursery Fertilizers */}
                <div style={{ backgroundColor: theme.colors.card }}>
                  {fertilizerData.nurseryFertilizers.map((fert, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-12 gap-1 p-3 text-sm"
                      style={{
                        backgroundColor: index % 2 === 0 
                          ? 'transparent' 
                          : (isDark ? 'rgba(30,30,30,0.3)' : 'rgba(243,244,246,0.7)'),
                        borderBottom: index !== fertilizerData.nurseryFertilizers.length - 1 
                          ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                          : 'none',
                        color: theme.colors.text
                      }}
                    >
                      <div className="col-span-5 font-medium">{fert.type}</div>
                      <div className="col-span-3">{fert.rate}</div>
                      <div className="col-span-4">{fert.purpose}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Warning for pH if necessary */}
          {soilData.pH && parseFloat(soilData.pH) < 5.5 && (
            <div className="p-3 rounded-lg"
                 style={{ 
                   backgroundColor: isDark ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.1)',
                   color: isDark ? '#FDBA74' : '#EA580C'
                 }}>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Soil pH is below 5.5 (currently {soilData.pH}). Consider applying dolomite as indicated in the fertilizer requirements.
                </p>
              </div>
            </div>
          )}
          
          {/* Generate PDF Button */}
          <button
            onClick={generatePDF}
            disabled={generating}
            className="w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            style={{
              backgroundColor: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
              color: isDark ? '#6EE7B7' : '#059669',
              border: `2px solid ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)'}`,
              opacity: generating ? 0.7 : 1,
              cursor: generating ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? (
              <>
                <div className="h-5 w-5 border-2 border-t-transparent rounded-full animate-spin"
                     style={{ borderColor: `${isDark ? '#6EE7B7' : '#059669'} transparent` }} />
                <span>{t.generating}</span>
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                <span>{t.generate}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FertilizerReportSection;