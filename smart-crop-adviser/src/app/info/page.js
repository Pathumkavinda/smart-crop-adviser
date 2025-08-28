'use client';

import React, { useState, useEffect } from 'react';
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
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';

// Translations for the information page
const translations = {
  en: {
    title: "Crop Information",
    about: {
      title: "About Smart Crop Adviser",
      subtitle: "Learn how our system helps farmers make data-driven decisions for better yields.",
      content: [
        "Smart Crop Adviser uses machine learning algorithms to analyze soil conditions, weather patterns, and local agro-ecological data to provide personalized crop recommendations. Our system is designed specifically for Sri Lankan agriculture, taking into account the unique growing conditions across different regions and seasons.",
        "By inputting your soil parameters, location, and season, you'll receive recommendations for crops most likely to thrive in your specific conditions, along with management tips and fertilizer recommendations to optimize your yields."
      ]
    },
    crops: {
      title: "Major Crops of Sri Lanka",
      subtitle: "Information about key crops grown across different regions.",
      types: {
        rice: {
          name: "Rice (Paddy)",
          description: "The staple food crop of Sri Lanka, grown in both Maha and Yala seasons. Suitable for various regions with proper irrigation. Traditional and improved varieties are available with different growth durations."
        },
        vegetables: {
          name: "Vegetables",
          varieties: [
            {
              name: "Tomato",
              description: "Varieties like Thilina and Maheshi are widely grown. Prefers well-drained soils with pH 6.0-7.0."
            },
            {
              name: "Onions",
              description: "Big onion varieties (Hybrid 62, Bhima Shakti) and Red onion varieties (Vethalan, LKRON 1) are important cash crops."
            },
            {
              name: "Potato",
              description: "Varieties like Granola and Desiree grow well in up-country regions during Maha season."
            },
            {
              name: "Carrot",
              description: "New Kuroda and Chantenay varieties are popular in cooler regions with loose, deep soils."
            }
          ]
        },
        fieldCrops: {
          name: "Field Crops",
          varieties: [
            {
              name: "Maize",
              description: "Varieties like Pacific 984 and Arjun are important for both human consumption and animal feed."
            },
            {
              name: "Green Gram",
              description: "Short duration crop suitable for areas with less rainfall."
            },
            {
              name: "Cowpea",
              description: "Drought-tolerant crop suitable for dry and intermediate zones."
            },
            {
              name: "Groundnut",
              description: "Grown mainly in the dry zone during both Maha and Yala seasons."
            }
          ]
        },
        plantation: {
          name: "Plantation Crops",
          varieties: [
            {
              name: "Tea",
              description: "Grown in high, mid, and low elevations with different quality characteristics."
            },
            {
              name: "Rubber",
              description: "Mainly in wet and intermediate zones."
            },
            {
              name: "Coconut",
              description: "Grown in the \"Coconut Triangle\" and other suitable areas."
            }
          ]
        }
      }
    },
    soil: {
      title: "Soil Types in Sri Lanka",
      subtitle: "Major soil types found across the country and their characteristics.",
      types: [
        {
          name: "Red-Yellow Podzolic Soils",
          description: "Common in the wet zone. Moderately acidic, well-drained, and suitable for tea, rubber, and various vegetable crops. Requires regular liming and organic matter addition."
        },
        {
          name: "Reddish Brown Earth",
          description: "Predominant in the dry zone. Well-drained, slightly acidic to neutral. Suitable for various field crops like paddy, maize, and pulses."
        },
        {
          name: "Red-Yellow Latosols",
          description: "Found in intermediate zones. Deep, well-drained, and moderately fertile. Good for vegetables, fruits, and some field crops."
        },
        {
          name: "Low Humic Gley Soils",
          description: "Poorly drained soils found in low-lying areas. Suitable for paddy cultivation."
        },
        {
          name: "Alluvial Soils",
          description: "Found along river basins and floodplains. Fertile and suitable for intensive cultivation of vegetables and other crops."
        },
        {
          name: "Regosols",
          description: "Sandy soils found in coastal areas. Suitable for coconut cultivation and some vegetable crops with proper management."
        }
      ]
    },
    zones: {
      title: "Agro-Ecological Zones",
      subtitle: "Understanding Sri Lanka's different growing regions.",
      types: [
        {
          name: "Wet Zone (WL, WM, WU)",
          description: [
            "Receives over 2,500mm of rainfall annually. Suitable for plantation crops and vegetables.",
            "WL - Wet zone low country (e.g., WL1a, WL2a)",
            "WM - Wet zone mid country (e.g., WM1a, WM2b)",
            "WU - Wet zone up country (e.g., WU1, WU2a)"
          ]
        },
        {
          name: "Intermediate Zone (IL, IM, IU)",
          description: [
            "Receives between 1,750-2,500mm of rainfall annually. Suitable for a wide range of crops.",
            "IL - Intermediate zone low country (e.g., IL1a, IL1b)",
            "IM - Intermediate zone mid country (e.g., IM1a, IM2a)",
            "IU - Intermediate zone up country (e.g., IU1, IU2)"
          ]
        },
        {
          name: "Dry Zone (DL)",
          description: [
            "Receives less than 1,750mm of rainfall annually. Major cultivation depends on irrigation.",
            "DL - Dry zone low country (e.g., DL1a, DL1b, DL2a)"
          ]
        }
      ]
    },
    seasons: {
      title: "Growing Seasons in Sri Lanka",
      subtitle: "Understanding the major cultivation seasons.",
      types: [
        {
          name: "Maha Season",
          description: "Main cultivation season from September/October to January/February. Coincides with the Northeast monsoon, which brings higher rainfall to many areas. Suitable for a wide range of crops across most regions."
        },
        {
          name: "Yala Season",
          description: "Secondary cultivation season from May to August/September. Coincides with the Southwest monsoon, which brings rainfall mainly to the southwestern parts of the country. In dry zone areas, cultivation during Yala often depends on irrigation."
        },
        {
          name: "Intermonsoon",
          description: "The periods between Maha and Yala (February to April) and between Yala and Maha (September to October) are considered intermonsoon periods. Some short-duration crops can be grown during these periods, especially in areas that receive convectional rainfall."
        }
      ]
    },
    resources: {
      title: "Additional Resources",
      subtitle: "Useful links and references for more information.",
      categories: {
        government: {
          name: "Government Resources",
          links: [
            {
              text: "Department of Agriculture, Sri Lanka",
              url: "https://www.doa.gov.lk/"
            },
            {
              text: "Ministry of Agriculture",
              url: "https://www.agrimin.gov.lk/"
            }
          ]
        },
        research: {
          name: "Research Institutes",
          links: [
            {
              text: "Horticultural Crops Research and Development Institute",
              url: "https://www.hordi.lk/"
            },
            {
              text: "Field Crops Research and Development Institute",
              url: "https://www.fcrdi.gov.lk/"
            }
          ]
        },
        guides: {
          name: "Agricultural Guides",
          links: [
            {
              text: "Crop Cultivation Guide (PDF)",
              url: "#"
            },
            {
              text: "Soil Management Handbook (PDF)",
              url: "#"
            }
          ]
        }
      }
    }
  },
  si: {
    title: "බෝග තොරතුරු",
    about: {
      title: "ස්මාර්ට් බෝග උපදේශක ගැන",
      subtitle: "අපගේ පද්ධතිය ගොවීන්ට හොඳ අස්වැන්නක් සඳහා දත්ත-පාදක තීරණ ගැනීමට උපකාර වන ආකාරය දැන ගන්න.",
      content: [
        "ස්මාර්ට් බෝග උපදේශක පුද්ගලීකරණය කළ බෝග නිර්දේශ සැපයීමට පස් තත්ත්වයන්, කාලගුණ රටා සහ ප්‍රාදේශීය කෘෂි-පරිසර විද්‍යාත්මක දත්ත විශ්ලේෂණය කිරීමට යන්ත්‍ර ඉගෙනුම් ඇල්ගොරිතම භාවිතා කරයි. අපගේ පද්ධතිය විශේෂයෙන් ශ්‍රී ලාංකික කෘෂිකර්මාන්තය සඳහා නිර්මාණය කර ඇති අතර, විවිධ ප්‍රදේශ හා කන්න වල සුවිශේෂී වගා තත්ත්වයන් සැලකිල්ලට ගනී.",
        "ඔබගේ පස් පරාමිතීන්, ස්ථානය සහ කන්නය ඇතුළත් කිරීමෙන්, ඔබගේ විශේෂිත තත්ත්වයන් යටතේ වඩාත්ම සාර්ථක විය හැකි බෝග සඳහා නිර්දේශ ලබා ගන්න, අස්වැන්න ඉහළ නැංවීමට කළමනාකරණ ඉඟි සහ පොහොර නිර්දේශ සමඟ."
      ]
    },
    crops: {
      title: "ශ්‍රී ලංකාවේ ප්‍රධාන බෝග",
      subtitle: "විවිධ ප්‍රදේශවල වගා කරන ප්‍රධාන බෝග පිළිබඳ තොරතුරු.",
      types: {
        rice: {
          name: "සහල් (වී)",
          description: "ශ්‍රී ලංකාවේ ප්‍රධාන ආහාර බෝගය, මහ සහ යල කන්න දෙකෙහිම වගා කරයි. නිසි වාරිමාර්ග සමඟ විවිධ ප්‍රදේශවලට සුදුසුය. විවිධ වර්ධන කාල සීමාවන් සහිත සම්ප්‍රදායික සහ වැඩිදියුණු කළ ප්‍රභේද ලබා ගත හැකිය."
        },
        vegetables: {
          name: "එළවළු",
          varieties: [
            {
              name: "තක්කාලි",
              description: "තිලිනා සහ මහේෂි වැනි ප්‍රභේද පුළුල් ලෙස වගා කරයි. pH 6.0-7.0 සහිත හොඳින් ජලය බැස යන පස් කැමතියි."
            },
            {
              name: "ලූනු",
              description: "ලොකු ලූනු ප්‍රභේද (හයිබ්‍රිඩ් 62, භීමා ශක්ති) සහ රතු ලූනු ප්‍රභේද (වෙතලන්, LKRON 1) වැදගත් මුදල් බෝග වේ."
            },
            {
              name: "අර්තාපල්",
              description: "ග්‍රැනෝලා සහ ඩෙසියර් වැනි ප්‍රභේද මහ කන්නයේ උඩරට ප්‍රදේශවල හොඳින් වැඩේ."
            },
            {
              name: "කැරට්",
              description: "නිව් කුරෝඩා සහ චන්ටේනේ ප්‍රභේද ලිහිල්, ගැඹුරු පස් සහිත සිසිල් ප්‍රදේශවල ජනප්‍රිය වේ."
            }
          ]
        },
        fieldCrops: {
          name: "ක්ෂේත්‍ර බෝග",
          varieties: [
            {
              name: "බඩ ඉරිඟු",
              description: "පැසිෆික් 984 සහ අර්ජුන් වැනි ප්‍රභේද මිනිස් පරිභෝජනය සහ සත්ත්ව ආහාර යන දෙකටම වැදගත් වේ."
            },
            {
              name: "මුං",
              description: "අඩු වර්ෂාපතනය සහිත ප්‍රදේශ සඳහා සුදුසු කෙටි කාලීන බෝගයකි."
            },
            {
              name: "කව්පි",
              description: "වියළි සහ අතරමැදි කලාප සඳහා සුදුසු නියඟ-ඔරොත්තු දෙන බෝගයකි."
            },
            {
              name: "රටකජු",
              description: "මහ සහ යල කන්න දෙකෙහිම ප්‍රධාන වශයෙන් වියළි කලාපයේ වගා කරයි."
            }
          ]
        },
        plantation: {
          name: "වතු බෝග",
          varieties: [
            {
              name: "තේ",
              description: "විවිධ ගුණාත්මක ලක්ෂණ සහිත ඉහළ, මධ්‍යම සහ පහළ උන්නතාංශවල වගා කරයි."
            },
            {
              name: "රබර්",
              description: "ප්‍රධාන වශයෙන් තෙත් සහ අතරමැදි කලාපවල."
            },
            {
              name: "පොල්",
              description: "\"පොල් ත්‍රිකෝණය\" සහ වෙනත් සුදුසු ප්‍රදේශවල වගා කරයි."
            }
          ]
        }
      }
    },
    soil: {
      title: "ශ්‍රී ලංකාවේ පස් වර්ග",
      subtitle: "රට පුරා දක්නට ලැබෙන ප්‍රධාන පස් වර්ග සහ ඒවායේ ලක්ෂණ.",
      types: [
        {
          name: "රතු-කහ පොඩ්සොලික් පස්",
          description: "තෙත් කලාපයේ බහුලව දක්නට ලැබේ. මධ්‍යස්ථ අම්ලික, හොඳින් ජලය බැස යන, සහ තේ, රබර් සහ විවිධ එළවළු බෝග සඳහා සුදුසුය. නිතිපතා හුණු එකතු කිරීම සහ කාබනික ද්‍රව්‍ය එකතු කිරීම අවශ්‍ය වේ."
        },
        {
          name: "රතු දුඹුරු පස",
          description: "වියළි කලාපයේ ප්‍රධාන වශයෙන් දක්නට ලැබේ. හොඳින් ජලය බැස යන, සුළු වශයෙන් අම්ලික සිට උදාසීන දක්වා. වී, බඩ ඉරිඟු, සහ මිරිස් වැනි විවිධ ක්ෂේත්‍ර බෝග සඳහා සුදුසුය."
        },
        {
          name: "රතු-කහ ලැටොසෝල්",
          description: "අතරමැදි කලාපවල දක්නට ලැබේ. ගැඹුරු, හොඳින් ජලය බැස යන, සහ මධ්‍යස්ථ සාරවත්. එළවළු, පලතුරු, සහ සමහර ක්ෂේත්‍ර බෝග සඳහා හොඳයි."
        },
        {
          name: "අඩු හියුමික් ග්ලේ පස්",
          description: "පහත් බිම් ප්‍රදේශවල දක්නට ලැබෙන දුර්වල ජලය බැස යන පස්. වී වගාව සඳහා සුදුසුය."
        },
        {
          name: "මිටියාවත පස්",
          description: "ගංගා දොළ අසල සහ ගංවතුර තැනිතලාවල දක්නට ලැබේ. සාරවත් සහ එළවළු සහ වෙනත් බෝග වල දැඩි වගාව සඳහා සුදුසුය."
        },
        {
          name: "රෙගොසෝල්",
          description: "වෙරළබඩ ප්‍රදේශවල දක්නට ලැබෙන වැලි පස්. පොල් වගාව සහ නිසි කළමනාකරණය සමඟ සමහර එළවළු බෝග සඳහා සුදුසුය."
        }
      ]
    },
    zones: {
      title: "කෘෂි-පාරිසරික කලාප",
      subtitle: "ශ්‍රී ලංකාවේ විවිධ වගා ප්‍රදේශ අවබෝධ කර ගැනීම.",
      types: [
        {
          name: "තෙත් කලාපය (WL, WM, WU)",
          description: [
            "වාර්ෂිකව 2,500mm ට වැඩි වර්ෂාපතනයක් ලැබේ. වතු බෝග සහ එළවළු සඳහා සුදුසුය.",
            "WL - තෙත් කලාපීය පහතරට (උදා: WL1a, WL2a)",
            "WM - තෙත් කලාපීය මැදරට (උදා: WM1a, WM2b)",
            "WU - තෙත් කලාපීය උඩරට (උදා: WU1, WU2a)"
          ]
        },
        {
          name: "අතරමැදි කලාපය (IL, IM, IU)",
          description: [
            "වාර්ෂිකව 1,750-2,500mm අතර වර්ෂාපතනයක් ලැබේ. පුළුල් පරාසයක බෝග සඳහා සුදුසුය.",
            "IL - අතරමැදි කලාපීය පහතරට (උදා: IL1a, IL1b)",
            "IM - අතරමැදි කලාපීය මැදරට (උදා: IM1a, IM2a)",
            "IU - අතරමැදි කලාපීය උඩරට (උදා: IU1, IU2)"
          ]
        },
        {
          name: "වියළි කලාපය (DL)",
          description: [
            "වාර්ෂිකව 1,750mm ට අඩු වර්ෂාපතනයක් ලැබේ. ප්‍රධාන වගාවන් වාරිමාර්ග මත රඳා පවතී.",
            "DL - වියළි කලාපීය පහතරට (උදා: DL1a, DL1b, DL2a)"
          ]
        }
      ]
    },
    seasons: {
      title: "ශ්‍රී ලංකාවේ වගා කන්න",
      subtitle: "ප්‍රධාන වගා කන්න තේරුම් ගැනීම.",
      types: [
        {
          name: "මහ කන්නය",
          description: "සැප්තැම්බර්/ඔක්තෝබර් සිට ජනවාරි/පෙබරවාරි දක්වා ප්‍රධාන වගා කන්නය. බොහෝ ප්‍රදේශවලට වැඩි වර්ෂාපතනයක් ගෙන එන ඊසාන දිග මෝසම් සමඟ ගැළපේ. බොහෝ ප්‍රදේශවල පුළුල් පරාසයක බෝග සඳහා සුදුසුය."
        },
        {
          name: "යල කන්නය",
          description: "මැයි සිට අගෝස්තු/සැප්තැම්බර් දක්වා ද්විතීයික වගා කන්නය. රටේ නිරිත දිග කොටස්වලට ප්‍රධාන වශයෙන් වර්ෂාපතනය ගෙන එන නිරිත දිග මෝසම සමඟ ගැළපේ. වියළි කලාප ප්‍රදේශවල, යල කන්නයේ වගාව බොහෝ විට වාරිමාර්ග මත රඳා පවතී."
        },
        {
          name: "අන්තර් මෝසම්",
          description: "මහ සහ යල අතර කාලය (පෙබරවාරි සිට අප්‍රේල් දක්වා) සහ යල සහ මහ අතර කාලය (සැප්තැම්බර් සිට ඔක්තෝබර් දක්වා) අන්තර් මෝසම් කාල වශයෙන් සැලකේ. සංවහන වර්ෂාපතනය ලැබෙන ප්‍රදේශවල විශේෂයෙන් මෙම කාල වකවානුවල කෙටි කාලීන බෝග වගා කළ හැකිය."
        }
      ]
    },
    resources: {
      title: "අතිරේක සම්පත්",
      subtitle: "වැඩිදුර තොරතුරු සඳහා ප්‍රයෝජනවත් සබැඳි සහ යොමු.",
      categories: {
        government: {
          name: "රජයේ සම්පත්",
          links: [
            {
              text: "කෘෂිකර්ම දෙපාර්තමේන්තුව, ශ්‍රී ලංකාව",
              url: "https://www.doa.gov.lk/"
            },
            {
              text: "කෘෂිකර්ම අමාත්‍යාංශය",
              url: "https://www.agrimin.gov.lk/"
            }
          ]
        },
        research: {
          name: "පර්යේෂණ ආයතන",
          links: [
            {
              text: "එළවළු බෝග පර්යේෂණ හා සංවර්ධන ආයතනය",
              url: "https://www.hordi.lk/"
            },
            {
              text: "ක්ෂේත්‍ර බෝග පර්යේෂණ හා සංවර්ධන ආයතනය",
              url: "https://www.fcrdi.gov.lk/"
            }
          ]
        },
        guides: {
          name: "කෘෂිකාර්මික මාර්ගෝපදේශ",
          links: [
            {
              text: "බෝග වගා මාර්ගෝපදේශය (PDF)",
              url: "#"
            },
            {
              text: "පස් කළමනාකරණ අත්පොත (PDF)",
              url: "#"
            }
          ]
        }
      }
    }
  },
  ta: {
    title: "பயிர் தகவல்",
    about: {
      title: "ஸ்மார்ட் பயிர் ஆலோசகர் பற்றி",
      subtitle: "எங்கள் அமைப்பு விவசாயிகள் சிறந்த மகசூலுக்கான தரவு சார்ந்த முடிவுகளை எடுக்க உதவும் விதம்.",
      content: [
        "ஸ்மார்ட் பயிர் ஆலோசகர் தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளை வழங்க மண் நிலைமைகள், வானிலை முறைகள் மற்றும் உள்ளூர் விவசாய-சுற்றுச்சூழல் தரவுகளை பகுப்பாய்வு செய்ய மெஷின் லெர்னிங் அல்காரிதம்களைப் பயன்படுத்துகிறது. எங்கள் அமைப்பு குறிப்பாக இலங்கை விவசாயத்திற்காக வடிவமைக்கப்பட்டுள்ளது, வெவ்வேறு பகுதிகள் மற்றும் பருவங்களில் தனித்துவமான வளர்ப்பு நிலைமைகளைக் கருத்தில் கொண்டு.",
        "உங்கள் மண் அளவுருக்கள், இருப்பிடம் மற்றும் பருவத்தை உள்ளிடுவதன் மூலம், உங்கள் குறிப்பிட்ட நிலைமைகளில் மிகவும் செழிப்பாக வளரக்கூடிய பயிர்களுக்கான பரிந்துரைகளைப் பெறுவீர்கள், உங்கள் மகசூலை உகந்ததாக்க மேலாண்மை குறிப்புகள் மற்றும் உர பரிந்துரைகளுடன்."
      ]
    },
    crops: {
      title: "இலங்கையின் முக்கிய பயிர்கள்",
      subtitle: "வெவ்வேறு பகுதிகளில் வளர்க்கப்படும் முக்கிய பயிர்கள் பற்றிய தகவல்.",
      types: {
        rice: {
          name: "அரிசி (நெல்)",
          description: "இலங்கையின் முக்கிய உணவுப் பயிர், மஹா மற்றும் யாலா பருவங்களில் வளர்க்கப்படுகிறது. சரியான நீர்ப்பாசனத்துடன் பல்வேறு பகுதிகளுக்கு ஏற்றது. வெவ்வேறு வளர்ச்சி காலங்களுடன் பாரம்பரிய மற்றும் மேம்படுத்தப்பட்ட வகைகள் உள்ளன."
        },
        vegetables: {
          name: "காய்கறிகள்",
          varieties: [
            {
              name: "தக்காளி",
              description: "திலினா மற்றும் மகேஷி போன்ற வகைகள் பரவலாக வளர்க்கப்படுகின்றன. pH 6.0-7.0 கொண்ட நன்கு வடிகட்டப்பட்ட மண்ணை விரும்புகிறது."
            },
            {
              name: "வெங்காயம்",
              description: "பெரிய வெங்காய வகைகள் (ஹைபிரிட் 62, பீமா சக்தி) மற்றும் சிவப்பு வெங்காய வகைகள் (வெத்தலன், LKRON 1) முக்கியமான பணப்பயிர்கள்."
            },
            {
              name: "உருளைக்கிழங்கு",
              description: "கிரனோலா மற்றும் டெசியர் போன்ற வகைகள் மலைநாட்டுப் பகுதிகளில் மஹா பருவத்தில் நன்றாக வளரும்."
            },
            {
              name: "காரட்",
              description: "நியூ குரோடா மற்றும் சான்டெனே வகைகள் தளர்வான, ஆழமான மண் கொண்ட குளிர்ந்த பகுதிகளில் பிரபலமானவை."
            }
          ]
        },
        fieldCrops: {
          name: "களப் பயிர்கள்",
          varieties: [
            {
              name: "மக்காச்சோளம்",
              description: "பசிபிக் 984 மற்றும் அர்ஜுன் போன்ற வகைகள் மனித நுகர்வு மற்றும் விலங்கு உணவு ஆகிய இரண்டுக்கும் முக்கியமானவை."
            },
            {
              name: "பச்சைப் பயறு",
              description: "குறைந்த மழையுள்ள பகுதிகளுக்கு ஏற்ற குறுகிய கால பயிர்."
            },
            {
              name: "கவுப்பி",
              description: "வறண்ட மற்றும் இடைநிலை மண்டலங்களுக்கு ஏற்ற வறட்சியைத் தாங்கும் பயிர்."
            },
            {
              name: "நிலக்கடலை",
              description: "முக்கியமாக வறண்ட மண்டலத்தில் மஹா மற்றும் யாலா இரண்டு பருவங்களிலும் வளர்க்கப்படுகிறது."
            }
          ]
        },
        plantation: {
          name: "தோட்டப் பயிர்கள்",
          varieties: [
            {
              name: "தேயிலை",
              description: "வெவ்வேறு தர அம்சங்களுடன் உயர், நடுத்தர மற்றும் குறைந்த உயரங்களில் வளர்க்கப்படுகிறது."
            },
            {
              name: "ரப்பர்",
              description: "முக்கியமாக ஈரமான மற்றும் இடைநிலை மண்டலங்களில்."
            },
            {
              name: "தென்னை",
              description: "\"தென்னை முக்கோணம்\" மற்றும் பிற பொருத்தமான பகுதிகளில் வளர்க்கப்படுகிறது."
            }
          ]
        }
      }
    },
    soil: {
      title: "இலங்கையில் உள்ள மண் வகைகள்",
      subtitle: "நாடு முழுவதும் காணப்படும் முக்கிய மண் வகைகள் மற்றும் அவற்றின் பண்புகள்.",
      types: [
        {
          name: "சிவப்பு-மஞ்சள் போட்சோலிக் மண்",
          description: "ஈரமான மண்டலத்தில் பொதுவானது. மிதமான அமிலத்தன்மை, நன்கு வடிகட்டப்பட்டு, தேயிலை, ரப்பர் மற்றும் பல்வேறு காய்கறி பயிர்களுக்கு ஏற்றது. வழக்கமான சுண்ணாம்பு மற்றும் கரிம பொருள் சேர்ப்பது தேவை."
        },
        {
          name: "சிவப்பு பழுப்பு நிலம்",
          description: "வறண்ட மண்டலத்தில் முக்கியமானது. நன்கு வடிகட்டப்பட்ட, சிறிது அமிலத்தன்மை முதல் நடுநிலை வரை. நெல், மக்காச்சோளம் மற்றும் பருப்பு வகைகள் போன்ற பல்வேறு வயல் பயிர்களுக்கு ஏற்றது."
        },
        {
          name: "சிவப்பு-மஞ்சள் லேட்டோசோல்கள்",
          description: "இடைநிலை மண்டலங்களில் காணப்படுகிறது. ஆழமான, நன்கு வடிகட்டப்பட்ட மற்றும் மிதமான வளமான. காய்கறிகள், பழங்கள் மற்றும் சில வயல் பயிர்களுக்கு நல்லது."
        },
        {
          name: "குறைந்த ஹ்யூமிக் கிளே மண்",
          description: "தாழ்வான பகுதிகளில் காணப்படும் மோசமாக வடிகட்டப்பட்ட மண். நெல் சாகுபடிக்கு ஏற்றது."
        },
        {
          name: "வண்டல் மண்",
          description: "ஆற்றங்கரைகள் மற்றும் வெள்ளச் சமவெளிகளில் காணப்படுகிறது. வளமான மற்றும் காய்கறிகள் மற்றும் பிற பயிர்களின் தீவிர சாகுபடிக்கு ஏற்றது."
        },
        {
          name: "ரெகோசோல்கள்",
          description: "கடலோர பகுதிகளில் காணப்படும் மணல் மண். சரியான மேலாண்மையுடன் தென்னை சாகுபடி மற்றும் சில காய்கறி பயிர்களுக்கு ஏற்றது."
        }
      ]
    },
    zones: {
      title: "விவசாய-சூழலியல் மண்டலங்கள்",
      subtitle: "இலங்கையின் வெவ்வேறு வளர்ப்பு பகுதிகளைப் புரிந்துகொள்ளுதல்.",
      types: [
        {
          name: "ஈரமான மண்டலம் (WL, WM, WU)",
          description: [
            "ஆண்டுக்கு 2,500மிமீ க்கும் அதிகமான மழையைப் பெறுகிறது. தோட்டப் பயிர்கள் மற்றும் காய்கறிகளுக்கு ஏற்றது.",
            "WL - ஈரமான மண்டல தாழ்நிலம் (எ.கா., WL1a, WL2a)",
            "WM - ஈரமான மண்டல நடுநிலம் (எ.கா., WM1a, WM2b)",
            "WU - ஈரமான மண்டல மேல்நிலம் (எ.கா., WU1, WU2a)"
          ]
        },
        {
          name: "இடைநிலை மண்டலம் (IL, IM, IU)",
          description: [
            "ஆண்டுக்கு 1,750-2,500மிமீ மழையைப் பெறுகிறது. பரந்த அளவிலான பயிர்களுக்கு ஏற்றது.",
            "IL - இடைநிலை மண்டல தாழ்நிலம் (எ.கா., IL1a, IL1b)",
            "IM - இடைநிலை மண்டல நடுநிலம் (எ.கா., IM1a, IM2a)",
            "IU - இடைநிலை மண்டல மேல்நிலம் (எ.கா., IU1, IU2)"
          ]
        },
        {
          name: "வறண்ட மண்டலம் (DL)",
          description: [
            "ஆண்டுக்கு 1,750மிமீ க்கும் குறைவான மழையைப் பெறுகிறது. முக்கிய பயிர்ச்செய்கை நீர்ப்பாசனத்தை சார்ந்துள்ளது.",
            "DL - வறண்ட மண்டல தாழ்நிலம் (எ.கா., DL1a, DL1b, DL2a)"
          ]
        }
      ]
    },
    seasons: {
      title: "இலங்கையில் பயிரிடும் பருவங்கள்",
      subtitle: "முக்கிய சாகுபடி பருவங்களைப் புரிந்துகொள்ளுதல்.",
      types: [
        {
          name: "மஹா பருவம்",
          description: "செப்டம்பர்/அக்டோபர் முதல் ஜனவரி/பிப்ரவரி வரை முக்கிய சாகுபடி பருவம். வடகிழக்கு பருவக்காற்றுடன் பொருந்துகிறது, இது பல பகுதிகளுக்கு அதிக மழையைக் கொண்டு வருகிறது. பெரும்பாலான பகுதிகளில் பரந்த அளவிலான பயிர்களுக்கு ஏற்றது."
        },
        {
          name: "யாலா பருவம்",
          description: "மே முதல் ஆகஸ்ட்/செப்டம்பர் வரை இரண்டாம் சாகுபடி பருவம். தென்மேற்கு பருவக்காற்றுடன் பொருந்துகிறது, இது நாட்டின் தென்மேற்கு பகுதிகளுக்கு முக்கியமாக மழையைக் கொண்டு வருகிறது. வறண்ட மண்டல பகுதிகளில், யாலா காலத்தில் சாகுபடி பெரும்பாலும் நீர்ப்பாசனத்தை சார்ந்துள்ளது."
        },
        {
          name: "இடைப்பருவம்",
          description: "மஹா மற்றும் யாலா இடையேயான காலங்கள் (பிப்ரவரி முதல் ஏப்ரல் வரை) மற்றும் யாலா மற்றும் மஹா இடையேயான காலங்கள் (செப்டம்பர் முதல் அக்டோபர் வரை) இடைப்பருவ காலங்களாகக் கருதப்படுகின்றன. குறிப்பாக கன்வெக்ஷனல் மழையைப் பெறும் பகுதிகளில் இந்த காலங்களில் சில குறுகிய கால பயிர்களை வளர்க்கலாம்."
        }
      ]
    },
    resources: {
      title: "கூடுதல் வளங்கள்",
      subtitle: "மேலும் தகவலுக்கான பயனுள்ள இணைப்புகள் மற்றும் குறிப்புகள்.",
      categories: {
        government: {
          name: "அரசாங்க வளங்கள்",
          links: [
            {
              text: "விவசாயத் துறை, இலங்கை",
              url: "https://www.doa.gov.lk/"
            },
            {
              text: "விவசாய அமைச்சகம்",
              url: "https://www.agrimin.gov.lk/"
            }
          ]
        },
        research: {
          name: "ஆராய்ச்சி நிறுவனங்கள்",
          links: [
            {
              text: "தோட்டக்கலை பயிர்கள் ஆராய்ச்சி மற்றும் மேம்பாட்டு நிறுவனம்",
              url: "https://www.hordi.lk/"
            },
            {
              text: "வயல் பயிர்கள் ஆராய்ச்சி மற்றும் மேம்பாட்டு நிறுவனம்",
              url: "https://www.fcrdi.gov.lk/"
            }
          ]
        },
        guides: {
          name: "விவசாய வழிகாட்டிகள்",
          links: [
            {
              text: "பயிர் சாகுபடி வழிகாட்டி (PDF)",
              url: "#"
            },
            {
              text: "மண் மேலாண்மை கையேடு (PDF)",
              url: "#"
            }
          ]
        }
      }
    }
  }
};

export default function Information() {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const isDark = theme.name === 'dark';

  // Update translations when language changes with a transition effect
  useEffect(() => {
    if (language) {
      setIsTransitioning(true);
      setTimeout(() => {
        setTrans(translations[language] || translations.en);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 300);
    }
  }, [language]);

  // Inline styles for language transition
  const contentStyle = {
    opacity: isTransitioning ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
  };

  // Utility function to apply language-specific line height adjustments
  const getTextStyle = (baseStyle = {}) => {
    const langLineHeight = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return {
      ...baseStyle,
      lineHeight: langLineHeight,
      transition: 'all 0.3s ease'
    };
  };

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
          <h1 className="text-2xl font-bold" style={{...styles.heading, ...contentStyle}}>
            {trans.title}
          </h1>
        </div>

        {/* Intro Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Info className="h-6 w-6 mr-2" style={styles.iconColors.green} />
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.about.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.about.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <div className="px-4 py-5 sm:p-6">
              {trans.about.content.map((paragraph, index) => (
                <p 
                  key={index} 
                  className={index > 0 ? "mt-3 text-base" : "text-base"} 
                  style={{...styles.text, ...contentStyle, ...getTextStyle()}}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Crops Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Leaf className="h-6 w-6 mr-2" style={styles.iconColors.green} />
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.crops.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.crops.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.crops.types.rice.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle, ...getTextStyle()}}>
                  {trans.crops.types.rice.description}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.crops.types.vegetables.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  {trans.crops.types.vegetables.varieties.map((veg, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""} style={getTextStyle()}>
                      <strong>{veg.name}:</strong> {veg.description}
                    </p>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.crops.types.fieldCrops.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  {trans.crops.types.fieldCrops.varieties.map((crop, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""} style={getTextStyle()}>
                      <strong>{crop.name}:</strong> {crop.description}
                    </p>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.crops.types.plantation.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  {trans.crops.types.plantation.varieties.map((plant, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-2" : ""} style={getTextStyle()}>
                      <strong>{plant.name}:</strong> {plant.description}
                    </p>
                  ))}
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
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.soil.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.soil.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              {trans.soil.types.map((soil, index) => (
                <div 
                  key={index} 
                  className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" 
                  style={index % 2 === 0 ? styles.sectionBg : styles.cardBg}
                >
                  <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                    {soil.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle, ...getTextStyle()}}>
                    {soil.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Agro-Ecological Zones Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <MapPin className="h-6 w-6 mr-2" style={styles.iconColors.blue} />
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.zones.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.zones.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              {trans.zones.types.map((zone, index) => (
                <div 
                  key={index} 
                  className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" 
                  style={index % 2 === 0 ? styles.sectionBg : styles.cardBg}
                >
                  <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                    {zone.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                    {Array.isArray(zone.description) ? (
                      zone.description.map((desc, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""} style={getTextStyle()}>
                          {desc}
                        </p>
                      ))
                    ) : (
                      <p style={getTextStyle()}>{zone.description}</p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Growing Seasons Section */}
        <div className="shadow overflow-hidden sm:rounded-lg mb-8" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <CloudRain className="h-6 w-6 mr-2" style={styles.iconColors.indigo} />
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.seasons.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.seasons.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              {trans.seasons.types.map((season, index) => (
                <div 
                  key={index} 
                  className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" 
                  style={index % 2 === 0 ? styles.sectionBg : styles.cardBg}
                >
                  <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                    {season.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle, ...getTextStyle()}}>
                    {season.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Resources Section */}
        <div className="shadow overflow-hidden sm:rounded-lg" style={styles.cardBg}>
          <div className="px-4 py-5 sm:px-6">
            <div className="flex items-center">
              <Book className="h-6 w-6 mr-2" style={styles.iconColors.purple} />
              <h2 className="text-lg leading-6 font-medium" style={{...styles.heading, ...contentStyle, ...getTextStyle()}}>
                {trans.resources.title}
              </h2>
            </div>
            <p className="mt-1 max-w-2xl text-sm" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
              {trans.resources.subtitle}
            </p>
          </div>
          <div className="border-t" style={styles.border}>
            <dl>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.resources.categories.government.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  <ul className="space-y-2">
                    {trans.resources.categories.government.links.map((link, idx) => (
                      <li key={idx} className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                          style={{...styles.link, ...getTextStyle()}}
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.cardBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.resources.categories.research.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  <ul className="space-y-2">
                    {trans.resources.categories.research.links.map((link, idx) => (
                      <li key={idx} className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline"
                          style={{...styles.link, ...getTextStyle()}}
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6" style={styles.sectionBg}>
                <dt className="text-sm font-medium" style={{...styles.mutedText, ...contentStyle, ...getTextStyle()}}>
                  {trans.resources.categories.guides.name}
                </dt>
                <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2" style={{...styles.text, ...contentStyle}}>
                  <ul className="space-y-2">
                    {trans.resources.categories.guides.links.map((link, idx) => (
                      <li key={idx} className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" style={styles.iconColors.gray} />
                        <a 
                          href={link.url} 
                          className="hover:underline"
                          style={{...styles.link, ...getTextStyle()}}
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
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