'use client';

import React from 'react';
import {
  Leaf,
  Thermometer,
  Droplets,
  CloudRain,
  MapPin,
  Book,
  Info,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';

export default function Information() {
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';

  // Dynamic styles based on theme
  const styles = {
    cardBg: { backgroundColor: theme.colors.card },
    sectionBg: { backgroundColor: isDark ? 'rgba(30, 30, 30, 0.5)' : '#f9fafb' },
    heading: { color: theme.colors.text },
    subHeading: { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' },
    text: { color: theme.colors.text },
    mutedText: { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' },
    link: { color: isDark ? '#63B3ED' : '#3182CE' },
    iconColors: {
      green: { color: theme.colors.primary },
      brown: { color: isDark ? '#C4A484' : '#8B5A2B' },
      blue: { color: isDark ? '#63B3ED' : '#3182CE' },
      indigo: { color: isDark ? '#A5B4FC' : '#6366F1' },
      purple: { color: isDark ? '#D8B4FE' : '#9061F9' },
      gray: { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }
    },
    border: { borderColor: theme.colors.border }
  };

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={styles.heading}>Crop Information</h1>
        </div>

        {/* Intro Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Info className="h-6 w-6 mr-2" style={styles.iconColors.green} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                About Smart Crop Adviser
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Learn how our system helps farmers make data-driven decisions for better yields.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <div className="px-4 py-5 sm:p-6">
              <p className="text-base" style={styles.text}>
                Smart Crop Adviser uses machine learning algorithms to analyze soil conditions, 
                weather patterns, and local agro-ecological data to provide personalized crop 
                recommendations. Our system is designed specifically for Sri Lankan agriculture, 
                taking into account the unique growing conditions across different regions and seasons.
              </p>
              <p className="mt-3 text-base" style={styles.text}>
                By inputting your soil parameters, location, and season, you&apos;ll receive recommendations 
                for crops most likely to thrive in your specific conditions, along with 
                management tips and fertilizer recommendations to optimize your yields.
              </p>
            </div>
          </div>
        </div>

        {/* Crops Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Leaf className="h-6 w-6 mr-2" style={styles.iconColors.green} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                Major Crops of Sri Lanka
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Information about key crops grown across different regions.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Rice (Paddy)</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  The staple food crop of Sri Lanka, grown in both Maha and Yala seasons. 
                  Suitable for various regions with proper irrigation. Traditional and 
                  improved varieties are available with different growth durations.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Vegetables</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p><strong>Tomato:</strong> Varieties like Thilina and Maheshi are widely grown. Prefers well-drained soils with pH 6.0-7.0.</p>
                  <p className="mt-2"><strong>Onions:</strong> Big onion varieties (Hybrid 62, Bhima Shakti) and Red onion varieties (Vethalan, LKRON 1) are important cash crops.</p>
                  <p className="mt-2"><strong>Potato:</strong> Varieties like Granola and Desiree grow well in up-country regions during Maha season.</p>
                  <p className="mt-2"><strong>Carrot:</strong> New Kuroda and Chantenay varieties are popular in cooler regions with loose, deep soils.</p>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Field Crops</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p><strong>Maize:</strong> Varieties like Pacific 984 and Arjun are important for both human consumption and animal feed.</p>
                  <p className="mt-2"><strong>Green Gram:</strong> Short duration crop suitable for areas with less rainfall.</p>
                  <p className="mt-2"><strong>Cowpea:</strong> Drought-tolerant crop suitable for dry and intermediate zones.</p>
                  <p className="mt-2"><strong>Groundnut:</strong> Grown mainly in the dry zone during both Maha and Yala seasons.</p>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Plantation Crops</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p><strong>Tea:</strong> Grown in high, mid, and low elevations with different quality characteristics.</p>
                  <p className="mt-2"><strong>Rubber:</strong> Mainly in wet and intermediate zones.</p>
                  <p className="mt-2"><strong>Coconut:</strong> Grown in the &quot;Coconut Triangle&quot; and other suitable areas.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Soil Types Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Droplets className="h-6 w-6 mr-2" style={styles.iconColors.brown} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                Soil Types in Sri Lanka
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Major soil types found across the country and their characteristics.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Red-Yellow Podzolic Soils</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Common in the wet zone. Moderately acidic, well-drained, and suitable for tea, 
                  rubber, and various vegetable crops. Requires regular liming and organic matter addition.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Reddish Brown Earth</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Predominant in the dry zone. Well-drained, slightly acidic to neutral. 
                  Suitable for various field crops like paddy, maize, and pulses.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Red-Yellow Latosols</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Found in intermediate zones. Deep, well-drained, and moderately fertile. 
                  Good for vegetables, fruits, and some field crops.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Low Humic Gley Soils</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Poorly drained soils found in low-lying areas. Suitable for paddy cultivation.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Alluvial Soils</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Found along river basins and floodplains. Fertile and suitable for 
                  intensive cultivation of vegetables and other crops.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Regosols</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Sandy soils found in coastal areas. Suitable for coconut cultivation 
                  and some vegetable crops with proper management.
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Agro-Ecological Zones Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 mr-2" style={styles.iconColors.blue} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                Agro-Ecological Zones
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Understanding Sri Lanka&apos;s different growing regions.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Wet Zone (WL, WM, WU)</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p>Receives over 2,500mm of rainfall annually. Suitable for plantation crops and vegetables.</p>
                  <p className="mt-2"><strong>WL</strong> - Wet zone low country (e.g., WL1a, WL2a)</p>
                  <p className="mt-2"><strong>WM</strong> - Wet zone mid country (e.g., WM1a, WM2b)</p>
                  <p className="mt-2"><strong>WU</strong> - Wet zone up country (e.g., WU1, WU2a)</p>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Intermediate Zone (IL, IM, IU)</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p>Receives between 1,750-2,500mm of rainfall annually. Suitable for a wide range of crops.</p>
                  <p className="mt-2"><strong>IL</strong> - Intermediate zone low country (e.g., IL1a, IL1b)</p>
                  <p className="mt-2"><strong>IM</strong> - Intermediate zone mid country (e.g., IM1a, IM2a)</p>
                  <p className="mt-2"><strong>IU</strong> - Intermediate zone up country (e.g., IU1, IU2)</p>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Dry Zone (DL)</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <p>Receives less than 1,750mm of rainfall annually. Major cultivation depends on irrigation.</p>
                  <p className="mt-2"><strong>DL</strong> - Dry zone low country (e.g., DL1a, DL1b, DL2a)</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Growing Seasons Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <CloudRain className="h-6 w-6 mr-2" style={styles.iconColors.indigo} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                Growing Seasons in Sri Lanka
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Understanding the major cultivation seasons.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Maha Season</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Main cultivation season from September/October to January/February. 
                  Coincides with the Northeast monsoon, which brings higher rainfall 
                  to many areas. Suitable for a wide range of crops across most regions.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Yala Season</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  Secondary cultivation season from May to August/September. 
                  Coincides with the Southwest monsoon, which brings rainfall 
                  mainly to the southwestern parts of the country. In dry zone areas, 
                  cultivation during Yala often depends on irrigation.
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Intermonsoon</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  The periods between Maha and Yala (February to April) and between 
                  Yala and Maha (September to October) are considered intermonsoon periods. 
                  Some short-duration crops can be grown during these periods, especially 
                  in areas that receive convectional rainfall.
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Resources Section */}
        <div className="shadow overflow-hidden sm:rounded-lg" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Book className="h-6 w-6 mr-2" style={styles.iconColors.purple} />
              <h2 className="text-lg leading-6 font-medium" style={styles.heading}>
                Additional Resources
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={styles.mutedText}>
              Useful links and references for more information.
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Government Resources</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="https://www.doa.gov.lk/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Department of Agriculture, Sri Lanka
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="https://www.agrimin.gov.lk/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Ministry of Agriculture
                      </a>
                    </li>
                  </ul>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Research Institutes</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="https://www.hordi.lk/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Horticultural Crops Research and Development Institute
                      </a>
                    </li>
                    <li className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="https://www.fcrdi.gov.lk/" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Field Crops Research and Development Institute
                      </a>
                    </li>
                  </ul>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={styles.mutedText}>Agricultural Guides</dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={styles.text}>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="#" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Crop Cultivation Guide (PDF)
                      </a>
                    </li>
                    <li className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                      <a 
                        href="#" 
                        className="hover:underline"
                        style={styles.link}
                      >
                        Soil Management Handbook (PDF)
                      </a>
                    </li>
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}