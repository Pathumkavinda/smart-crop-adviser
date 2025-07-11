'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { 
  Leaf, 
  MapPin, 
  BarChart3, 
  AlertTriangle, 
  CheckCircle, 
  Droplets, 
  Thermometer, 
  Calendar, 
  ArrowRight
} from 'lucide-react';

// Translations for the home page
const translations = {
  en: {
    brand: "Smart Crop Adviser",
    hero: {
      title: {
        line1: "Smart Crop Adviser",
        line2: "for",
        line3: "Sri Lankan Agriculture"
      },
      subtitle: "Get personalized crop recommendations based on your soil conditions, location, and season.",
      getStarted: "Get Started",
      learnMore: "Learn More",
      dashboard: "Go to Dashboard"
    },
    features: {
      title: "Features",
      subtitle: "Why use Smart Crop Adviser?",
      items: [
        {
          title: "Personalized Recommendations",
          description: "Get crop recommendations tailored to your specific soil conditions, location, and growing season."
        },
        {
          title: "Data-Driven Insights",
          description: "Powered by machine learning and comprehensive agricultural data for accurate, science-based recommendations."
        },
        {
          title: "Location-Based Analysis",
          description: "Recommendations customized for your specific region within Sri Lanka and its unique growing conditions."
        },
        {
          title: "Weather Integration",
          description: "Access real-time weather data to make informed decisions about planting and crop management."
        }
      ]
    },
    howItWorks: {
      title: "How It Works",
      subtitle: "Get your personalized crop recommendations in just a few simple steps.",
      steps: [
        {
          title: "Enter Your Soil Data",
          description: "Input your soil test results or select your soil type for more accurate recommendations."
        },
        {
          title: "Specify Your Location",
          description: "Select your district and agricultural zone to receive region-specific advice."
        },
        {
          title: "Choose the Growing Season",
          description: "Indicate whether you're planning for Yala, Maha, or intermonsoon cultivation."
        },
        {
          title: "Get Recommendations",
          description: "Receive a list of suitable crops with detailed growing instructions and expected yields."
        }
      ]
    },
    cultivation: {
      title: "Tips for Successful Cultivation",
      description: "Maximize your yield through proper crop selection, maintaining soil nutrient levels, and effective water management."
    },
    crops: {
      title: "Major Crops of Sri Lanka",
      subtitle: "Information about key crops grown across different regions.",
      categories: {
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
          name: "Red Yellow Podzolic",
          description: "Common in the wet zone, this soil is well-drained but acidic. Good for tea cultivation and some vegetables with proper management."
        },
        {
          name: "Reddish Brown Earth",
          description: "Found in the dry zone, suitable for many field crops. Has good fertility when adequate water is available."
        },
        {
          name: "Low Humic Gley",
          description: "Common in lowland paddy fields, has poor drainage but good water-holding capacity. Ideal for rice cultivation."
        },
        {
          name: "Alluvial Soils",
          description: "Found along river valleys and flood plains, these soils are highly fertile and suitable for intensive cultivation of vegetables and other crops."
        }
      ]
    },
    cta: {
      title: "Ready to improve your farming?",
      subtitle: "Start using Smart Crop Adviser today.",
      buttonStart: "Get Started",
      buttonLogin: "Sign In"
    }
  },
  si: {
    brand: "බෝග උපදේශක",
    hero: {
      title: {
        line1: "ශ්‍රී ලාංකික කෘෂිකර්මාන්තය",
        line2: "සඳහා",
        line3: "බෝග උපදේශක"  // Moved "for" to line3 as it makes more sense in Sinhala
      },
      subtitle: "ඔබේ පස තත්වයන්, පිහිටීම සහ කන්නය මත පදනම්ව පුද්ගලීකරණය කරන ලද බෝග නිර්දේශ ලබා ගන්න.",
      getStarted: "ආරම්භ කරන්න",
      learnMore: "තව දැනගන්න",
      dashboard: "විස්තර පුවරුවට යන්න"
    },
    features: {
      title: "විශේෂාංග",
      subtitle: "ස්මාට් බෝග උපදේශක භාවිතා කිරීමට හේතු",
      items: [
        {
          title: "පුද්ගලීකරණය කළ නිර්දේශ",
          description: "ඔබේ විශේෂිත පස තත්වයන්, පිහිටීම සහ වගා කන්නය සඳහා විශේෂයෙන් සැකසූ බෝග නිර්දේශ ලබා ගන්න."
        },
        {
          title: "දත්ත මත පදනම් වූ නිරූපක මගින් ලබාදෙන උපදෙස්",
          description: "යන්ත්‍ර භාෂාව ඔගින් සහ පුළුල් කෘෂිකාර්මික දත්ත මගින් බලගැන්වුණු, නිවැරදි, විද්‍යාත්මක උපදෙස් සඳහා."
        },
        {
          title: "ස්ථාන-පාදක විශ්ලේෂණය",
          description: "ශ්‍රී ලංකාව තුළ ඔබේ නිශ්චිත ප්‍රදේශය සහ එහි අනන්‍ය වගා තත්වයන් සඳහා අනුකූල කරන ලද නිර්දේශ."
        },
        {
          title: "කාලගුණ ඒකාබද්ධ කිරීම",
          description: "රෝපණය සහ බෝග කළමනාකරණය පිළිබඳ තොරතුරු සහිත තීරණ ගැනීමට තත්‍ය-කාලීන කාලගුණ දත්ත වෙත ප්‍රවේශ වන්න."
        }
      ]
    },
    howItWorks: {
      title: "එය ක්‍රියා කරන ආකාරය",
      subtitle: "සරල පියවර කිහිපයකින් ඔබේ පුද්ගලීකරණය කළ බෝග උපදෙස් ලබා ගන්න.",
      steps: [
        {
          title: "ඔබේ පස දත්ත ඇතුළත් කරන්න",
          description: "වඩාත් නිවැරදි නිර්දේශ සඳහා ඔබේ පස පරීක්ෂා ප්‍රතිඵල ඇතුළත් කරන්න හෝ ඔබේ පස වර්ගය තෝරන්න."
        },
        {
          title: "ඔබේ ස්ථානය සඳහන් කරන්න",
          description: "ප්‍රදේශයට විශේෂිත උපදෙස් ලබා ගැනීමට ඔබේ දිස්ත්‍රික්කය සහ කෘෂිකාර්මික කලාපය තෝරන්න."
        },
        {
          title: "වගා කන්නය තෝරන්න",
          description: "ඔබ යල, මහ හෝ අන්තර් කන්න වගාව සඳහා සැලසුම් කරන්නේද යන්න දක්වන්න."
        },
        {
          title: "නිර්දේශ ලබා ගන්න",
          description: "විස්තරාත්මක වගා උපදෙස් සහ අපේක්ෂිත අස්වැන්න සමඟ සුදුසු බෝග ලැයිස්තුවක් ලබා ගන්න."
        }
      ]
    },
    cultivation: {
      title: "වඩාත් සාර්ථක වගාවක් සඳහා උපදෙස්",
      description: "නිවැරදි බෝග තේරීම, පසෙහි පෝෂක මට්ටම් පවත්වා ගැනීම, සහ නිසි ජල කළමනාකරණය මගින් ඔබේ අස්වැන්න වැඩි කර ගන්න."
    },
    crops: {
      title: "ශ්‍රී ලංකාවේ ප්‍රධාන බෝග",
      subtitle: "විවිධ ප්‍රදේශවල වගා කරන ප්‍රධාන බෝග පිළිබඳ තොරතුරු.",
      categories: {
        rice: {
          name: "සහල් (වී)",
          description: "ශ්‍රී ලංකාවේ ප්‍රධාන ආහාර බෝගය, මහ සහ යල කන්න දෙකෙහිම වගා කරයි. නිසි වාරිමාර්ග සමඟ විවිධ ප්‍රදේශ සඳහා සුදුසුය. විවිධ වර්ධන කාල සීමා සහිත සාම්ප්‍රදායික සහ වැඩිදියුණු කළ ප්‍රභේද තිබේ."
        },
        vegetables: {
          name: "එළවළු",
          varieties: [
            {
              name: "තක්කාලි",
              description: "තිලිණ සහ මහේෂි වැනි ප්‍රභේද පුළුල් ලෙස වගා කරයි. හොඳින් ජලය බැස යන පස pH 6.0-7.0 සමඟ කැමතියි."
            },
            {
              name: "ලූනු",
              description: "ලොකු ලූනු ප්‍රභේද (හයිබ්‍රිඩ් 62, භීමා ශක්ති) සහ රතු ලූනු ප්‍රභේද (වෙතලන්, LKRON 1) වැදගත් මුදල් බෝග වේ."
            },
            {
              name: "අර්තාපල්",
              description: "ග්‍රැනෝලා සහ ඩිසියර් වැනි ප්‍රභේද උඩරට ප්‍රදේශවල මහ කන්නයේදී හොඳින් වැඩෙයි."
            },
            {
              name: "කැරට්",
              description: "නව කුරෝඩා සහ චැන්ටේනේ ප්‍රභේද ලිහිල්, ගැඹුරු පස සහිත සිසිල් ප්‍රදේශවල ජනප්‍රිය වේ."
            }
          ]
        },
        fieldCrops: {
          name: "ක්ෂේත්‍ර බෝග",
          varieties: [
            {
              name: "බඩ ඉරිඟු",
              description: "පැසිෆික් 984 සහ අර්ජුන් වැනි ප්‍රභේද මිනිස් පරිභෝජනය සහ සත්ව ආහාර යන දෙකටම වැදගත් වේ."
            },
            {
              name: "මුං",
              description: "අඩු වර්ෂාපතනය සහිත ප්‍රදේශ සඳහා සුදුසු කෙටි කාලීන බෝගයකි."
            },
            {
              name: "කව්පි",
              description: "වියළි සහ අතරමැදි කලාප සඳහා සුදුසු නියඟයට ඔරොත්තු දෙන බෝගයකි."
            },
            {
              name: "රටකජු",
              description: "ප්‍රධාන වශයෙන් වියළි කලාපයේ මහ සහ යල කන්න දෙකෙහිම වගා කරයි."
            }
          ]
        },
        plantation: {
          name: "වතු බෝග",
          varieties: [
            {
              name: "තේ",
              description: "විවිධ ගුණාත්මක ලක්ෂණ සහිත ඉහළ, මැද සහ පහළ උන්නතාංශවල වගා කරයි."
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
      title: "ශ්‍රී ලංකාවේ පස වර්ග",
      subtitle: "රට පුරා දක්නට ලැබෙන ප්‍රධාන පස වර්ග සහ ඒවායේ ලක්ෂණ.",
      types: [
        {
          name: "රතු කහ පොඩ්සොලික්",
          description: "තෙත් කලාපයේ බහුලව දක්නට ලැබෙන මෙම පස හොඳින් ජලය බැස යන නමුත් අම්ලිකය. නිසි කළමනාකරණය සමඟ තේ වගාව සහ සමහර එළවළු සඳහා හොඳයි."
        },
        {
          name: "රතු දුඹුරු පස",
          description: "වියළි කලාපයේ දක්නට ලැබෙන, බොහෝ ක්ෂේත්‍ර බෝග සඳහා සුදුසුය. ප්‍රමාණවත් ජලය ලබා ගත හැකි විට හොඳ සාරවත් බවක් ඇත."
        },
        {
          name: "අඩු හියුමික් ග්ලෙයි",
          description: "පහළ බිම් කුඹුරුවල බහුලව දක්නට ලැබෙන, දුර්වල ජලාපවහනයක් නමුත් හොඳ ජල ධාරණ ධාරිතාවක් ඇත. වී වගාව සඳහා ආදර්ශයි."
        },
        {
          name: "අවසාදිත පස",
          description: "ගංගා නිම්න සහ ගංවතුර තැනිතලාවල දක්නට ලැබෙන, මෙම පස ඉතා සාරවත් වන අතර එළවළු සහ වෙනත් බෝග සඳහා ඉතා සුදුසු වේ."
        }
      ]
    },
    cta: {
      title: "ඔබේ ගොවිතැන වැඩිදියුණු කිරීමට සූදානම්ද?",
      subtitle: "අද දිනයේම ස්මාර්ට් බෝග උපදේශක භාවිතා කිරීම ආරම්භ කරන්න.",
      buttonStart: "ආරම්භ කරන්න",
      buttonLogin: "පිවිසෙන්න"
    }
  },
  ta: {
    brand: "ஸ்மார்ட் பயிர் ஆலோசகர்",
    hero: {
      title: {
        line1: "ஸ்மார்ட் பயிர் ஆலோசகர்",
        line2: "இலங்கை",
        line3: "விவசாயத்திற்கான"
      },
      subtitle: "உங்கள் மண் நிலைமைகள், இருப்பிடம் மற்றும் பருவத்தின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளைப் பெறுங்கள்.",
      getStarted: "தொடங்குங்கள்",
      learnMore: "மேலும் அறிக",
      dashboard: "டாஷ்போர்டுக்குச் செல்லுங்கள்"
    },
    features: {
      title: "அம்சங்கள்",
      subtitle: "ஸ்மார்ட் பயிர் ஆலோசகரைப் பயன்படுத்த வேண்டிய காரணங்கள்",
      items: [
        {
          title: "தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்",
          description: "உங்கள் குறிப்பிட்ட மண் நிலைமைகள், இருப்பிடம் மற்றும் வளரும் பருவத்திற்கு ஏற்ப தயாரிக்கப்பட்ட பயிர் பரிந்துரைகளைப் பெறுங்கள்."
        },
        {
          title: "தரவு சார்ந்த நுண்ணறிவுகள்",
          description: "மெஷின் லெர்னிங் மற்றும் விரிவான விவசாய தரவுகளால் இயக்கப்படுகிறது, துல்லியமான, அறிவியல் சார்ந்த பரிந்துரைகளுக்கு."
        },
        {
          title: "இருப்பிட அடிப்படையிலான பகுப்பாய்வு",
          description: "இலங்கையில் உங்கள் குறிப்பிட்ட பகுதி மற்றும் அதன் தனித்துவமான வளர்ப்பு நிலைமைகளுக்காக தனிப்பயனாக்கப்பட்ட பரிந்துரைகள்."
        },
        {
          title: "வானிலை ஒருங்கிணைப்பு",
          description: "நடவு மற்றும் பயிர் மேலாண்மை பற்றிய தகவலறிந்த முடிவுகளை எடுக்க நிகழ்நேர வானிலை தரவை அணுகவும்."
        }
      ]
    },
    howItWorks: {
      title: "இது எப்படி செயல்படுகிறது",
      subtitle: "சில எளிய படிகளில் உங்கள் தனிப்பயனாக்கப்பட்ட பயிர் பரிந்துரைகளைப் பெறுங்கள்.",
      steps: [
        {
          title: "உங்கள் மண் தரவை உள்ளிடவும்",
          description: "மிகவும் துல்லியமான பரிந்துரைகளுக்கு உங்கள் மண் சோதனை முடிவுகளை உள்ளிடவும் அல்லது உங்கள் மண் வகையைத் தேர்ந்தெடுக்கவும்."
        },
        {
          title: "உங்கள் இருப்பிடத்தைக் குறிப்பிடவும்",
          description: "பகுதி சார்ந்த ஆலோசனைகளைப் பெற உங்கள் மாவட்டம் மற்றும் விவசாய மண்டலத்தைத் தேர்ந்தெடுக்கவும்."
        },
        {
          title: "வளரும் பருவத்தைத் தேர்வுசெய்க",
          description: "நீங்கள் யாலா, மஹா அல்லது இடைப்பருவ சாகுபடிக்குத் திட்டமிடுகிறீர்களா என்பதைக் குறிப்பிடவும்."
        },
        {
          title: "பரிந்துரைகளைப் பெறுங்கள்",
          description: "விரிவான வளர்ப்பு வழிமுறைகள் மற்றும் எதிர்பார்க்கப்படும் விளைச்சல்களுடன் பொருத்தமான பயிர்களின் பட்டியலைப் பெறுங்கள்."
        }
      ]
    },
    cultivation: {
      title: "வெற்றிகரமான பயிர்களுக்கான குறிப்புகள்",
      description: "சரியான பயிர்களைத் தேர்ந்தெடுப்பது, மண் ஊட்டச்சத்து அளவைப் பராமரிப்பது மற்றும் சரியான நீர் மேலாண்மை மூலம் உங்கள் விளைச்சலை அதிகரிக்கவும்."
    },
    crops: {
      title: "இலங்கையின் முக்கிய பயிர்கள்",
      subtitle: "வெவ்வேறு பகுதிகளில் வளர்க்கப்படும் முக்கிய பயிர்கள் பற்றிய தகவல்.",
      categories: {
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
          name: "சிவப்பு மஞ்சள் போட்சோலிக்",
          description: "ஈரமான மண்டலத்தில் பொதுவானது, இந்த மண் நன்கு வடிகட்டப்பட்டுள்ளது ஆனால் அமிலத்தன்மை கொண்டது. சரியான மேலாண்மையுடன் தேயிலை சாகுபடி மற்றும் சில காய்கறிகளுக்கு நல்லது."
        },
        {
          name: "சிவப்பு பழுப்பு நிலம்",
          description: "வறண்ட மண்டலத்தில் காணப்படுகிறது, பல களப் பயிர்களுக்கு ஏற்றது. போதுமான நீர் கிடைக்கும்போது நல்ல வளத்தைக் கொண்டுள்ளது."
        },
        {
          name: "குறைந்த ஹ்யூமிக் கிளே",
          description: "தாழ்வான நெற்பயிர்களில் பொதுவானது, மோசமான வடிகால் ஆனால் நல்ல நீர் பிடிப்புத் திறன் கொண்டது. நெல் சாகுபடிக்கு சிறந்தது."
        },
        {
          name: "வண்டல் மண்",
          description: "ஆற்று பள்ளத்தாக்குகள் மற்றும் வெள்ளச் சமவெளிகளில் காணப்படும் இந்த மண் மிகவும் வளமானது மற்றும் காய்கறிகள் மற்றும் பிற பயிர்களின் தீவிர சாகுபடிக்கு ஏற்றது."
        }
      ]
    },
    cta: {
      title: "உங்கள் விவசாயத்தை மேம்படுத்த தயாரா?",
      subtitle: "இன்றே ஸ்மார்ட் பயிர் ஆலோசகரைப் பயன்படுத்தத் தொடங்குங்கள்.",
      buttonStart: "தொடங்குங்கள்",
      buttonLogin: "உள்நுழைக"
    }
  }
};

// CSS styles for animations
const animationStyles = `
@keyframes pulseFlow {
  0% { transform: translateY(-100%); }
  100% { transform: translateY(100%); }
}

@keyframes fadeSlideIn {
  0% { 
    opacity: 0; 
    transform: translateY(20px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

@keyframes fadeSlideInRight {
  0% { 
    opacity: 0; 
    transform: translateX(20px);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0);
  }
}

@keyframes fadeSlideInLeft {
  0% { 
    opacity: 0; 
    transform: translateX(-20px);
  }
  100% { 
    opacity: 1; 
    transform: translateX(0);
  }
}

@keyframes numberPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color-rgb), 0.7);
    transform: scale(1);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--pulse-color-rgb), 0);
    transform: scale(1.05);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color-rgb), 0);
    transform: scale(1);
  }
}

/* Added transition for empty space filling */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.empty-space-filler {
  background: linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(46, 125, 50, 0.2), rgba(76, 175, 80, 0.1));
  background-size: 200% 200%;
  animation: gradientShift 8s ease infinite;
  border-radius: 8px;
  padding: 2rem;
  margin: 1rem 0;
  border-left: 3px solid var(--primary-color);
  transition: all 0.3s ease;
}

.empty-space-filler:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.step-card {
  transition: all 0.3s ease;
}

.step-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--hover-shadow);
}

.step-number {
  animation: numberPulse 2s infinite;
  animation-delay: calc(var(--step-index) * 0.5s);
}

.step-appear {
  opacity: 0;
  animation: fadeSlideIn 0.6s forwards;
  animation-delay: calc(var(--step-index) * 0.3s);
}

.step-appear-right {
  opacity: 0;
  animation: fadeSlideInRight 0.6s forwards;
  animation-delay: calc(var(--step-index) * 0.3s);
}

.step-appear-left {
  opacity: 0;
  animation: fadeSlideInLeft 0.6s forwards;
  animation-delay: calc(var(--step-index) * 0.3s);
}
`;

export default function Home() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme.name === 'dark';
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add custom CSS to document
  useEffect(() => {
    // Add the animation styles to the document head
    const styleEl = document.createElement('style');
    styleEl.textContent = animationStyles;
    document.head.appendChild(styleEl);
    
    // Set CSS variables for animations
    document.documentElement.style.setProperty(
      '--pulse-color-rgb', 
      isDark ? '46, 125, 50' : '76, 175, 80'
    );
    document.documentElement.style.setProperty(
      '--hover-shadow',
      isDark ? '0 12px 20px rgba(0, 0, 0, 0.3)' : '0 12px 20px rgba(0, 0, 0, 0.1)'
    );
    document.documentElement.style.setProperty(
      '--primary-color',
      isDark ? '#4ADE80' : '#4CAF50'
    );
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, [isDark]);

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

  // Set html lang attribute for language-specific styling
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.classList.remove('light-mode', 'dark-mode');
    document.documentElement.classList.add(isDark ? 'dark-mode' : 'light-mode');
  }, [language, isDark]);

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

  return (
    <ThemeWrapper>
      {/* Hero Section with 3-line heading */}
      <div 
        className="text-white"
        style={{ 
          background: isDark 
            ? `linear-gradient(to right, #1e4620, #2c5f31)` 
            : `linear-gradient(to right, #4CAF50, #2E7D32)` 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2" style={contentStyle}>
              {/* Fixed title structure - properly displays in Sinhala */}
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={getTextStyle()}>
                <span className="block mb-2">{trans.hero.title.line1}</span>
                <span className="block mb-2 text-3xl md:text-4xl">{trans.hero.title.line2}</span>
                {trans.hero.title.line3 && (
                  <span className="block mb-4">{trans.hero.title.line3}</span>
                )}
              </h1>
              <p className="text-xl md:text-2xl mb-6 text-green-100" style={getTextStyle()}>
                {trans.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-all duration-300"
                  >
                    {trans.hero.dashboard}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/adviser"
                      className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-all duration-300"
                    >
                      {trans.hero.getStarted}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link
                      href="/info"
                      className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-800 hover:bg-opacity-30 transition-all duration-300"
                    >
                      {trans.hero.learnMore}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="mt-10 md:mt-0 md:w-1/2 flex justify-center">
              <div className="rounded-lg shadow-xl overflow-hidden w-full max-w-md">
                <img
                  src="/images/1.png"
                  alt="Sri Lankan paddy field"
                  className="w-full h-64 object-cover"
                  style={{ objectPosition: "center 70%" }}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x400?text=Sri+Lankan+Agriculture";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section with Fixed Heights */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center" style={contentStyle}>
            <h2 
              className="text-base font-semibold tracking-wide uppercase"
              style={{ color: theme.colors.primary }}
            >
              {trans.features.title}
            </h2>
            <p 
              className="mt-1 text-4xl font-extrabold sm:text-5xl sm:tracking-tight"
              style={{ ...getTextStyle(), color: theme.colors.text }}
            >
              {trans.features.subtitle}
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {trans.features.items.map((feature, index) => {
                const Icon = index === 0 ? Leaf : index === 1 ? BarChart3 : index === 2 ? MapPin : Calendar;
                const iconColors = [
                  { bg: isDark ? 'rgba(74, 222, 128, 0.2)' : '#f0fdf4', color: '#22c55e' },
                  { bg: isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', color: '#a855f7' },
                  { bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', color: '#3b82f6' },
                  { bg: isDark ? 'rgba(14, 165, 233, 0.2)' : '#e0f2fe', color: '#0ea5e9' }
                ];
                
                return (
                  <div key={index} className="pt-6">
                    <div 
                      className="rounded-lg px-6 pb-8 transition-all duration-300 h-full"
                      style={{ 
                        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(249, 250, 251, 0.8)',
                        boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                        minHeight: '280px' // Fixed height to maintain consistent shape
                      }}
                    >
                      <div className="-mt-6" style={contentStyle}>
                        <div>
                          <span 
                            className="inline-flex items-center justify-center p-3 rounded-md shadow-lg" 
                            style={{ backgroundColor: iconColors[index].bg, transition: 'all 0.3s ease' }}
                          >
                            <Icon className="h-6 w-6" style={{ color: iconColors[index].color }} />
                          </span>
                        </div>
                        <h3 
                          className="mt-8 text-lg font-medium tracking-tight min-h-[3rem]" // Fixed height for title
                          style={{ ...getTextStyle(), color: theme.colors.text }}
                        >
                          {feature.title}
                        </h3>
                        <div className="mt-5 min-h-[6rem]"> {/* Fixed height for description container */}
                          <p 
                            className="text-base"
                            style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

{/* How It Works Section - Fixed Layout with Both Sides */}
<div 
  className="py-20 relative overflow-hidden"
  style={{ 
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(243, 244, 246, 0.5)',
    position: 'relative'
  }}
>
  {/* Background decorative elements */}
  <div 
    className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23${isDark ? '4CAF50' : '4CAF50'}' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      transition: 'opacity 0.5s ease'
    }}
  />

  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
    {/* Section header with proper spacing */}
    <div className="text-center mb-16" style={contentStyle}>
      
      {/* Small Subtitle / Label */}
      <h2 
        className="text-base font-semibold tracking-wide uppercase relative inline-block mb-4"
        style={{ 
          color: theme.colors.primary,
          paddingBottom: '8px'
        }}
      >
        {trans.howItWorks.title}
        <span 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: '2px',
            backgroundColor: theme.colors.primary,
            transition: 'width 0.3s ease'
          }}
        />
      </h2>

      {/* Main Subtitle */}
      <div className="relative mt-6"> {/* Increased top margin for space */}
        <h3 
          className="text-3xl sm:text-4xl font-bold relative z-10 leading-snug"
          style={{ 
            ...getTextStyle(),
            color: theme.colors.text,
            paddingBottom: '12px',
            transition: 'all 0.5s ease'
          }}
        >
          {trans.howItWorks.subtitle}
          <span 
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: '3px',
              background: `linear-gradient(to right, ${theme.colors.primary}, ${isDark ? '#689F38' : '#8BC34A'})`,
              transition: 'transform 0.5s ease',
              transform: isTransitioning ? 'scaleX(0)' : 'scaleX(1)',
              transformOrigin: 'left'
            }}
          />
        </h3>
      </div>
    </div>

          
          {/* New content for the empty space */}
          <div className="empty-space-filler mb-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-3/4">
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: theme.colors.primary }}
                >
                  {language === 'si' ? 'වඩාත් සාර්ථක වගාවක් සඳහා උපදෙස්' : 
                   language === 'ta' ? 'வெற்றிகரமான பயிர்களுக்கான குறிப்புகள்' : 
                   'Tips for Successful Cultivation'}
                </h4>
                <p 
                  className="text-base"
                  style={{ 
                    color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
                    ...getTextStyle()
                  }}
                >
                  {language === 'si' ? 
                    'නිවැරදි බෝග තේරීම, පසෙහි පෝෂක මට්ටම් පවත්වා ගැනීම, සහ නිසි ජල කළමනාකරණය මගින් ඔබේ අස්වැන්න වැඩි කර ගන්න.' : 
                   language === 'ta' ? 
                    'சரியான பயிர்களைத் தேர்ந்தெடுப்பது, மண் ஊட்டச்சத்து அளவைப் பராமரிப்பது மற்றும் சரியான நீர் மேலாண்மை மூலம் உங்கள் விளைச்சலை அதிகரிக்கவும்.' : 
                    'Maximize your yield through proper crop selection, maintaining soil nutrient levels, and effective water management.'}
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Droplets 
                  className="h-12 w-12 md:h-16 md:w-16" 
                  style={{ 
                    color: isDark ? 'rgba(74, 222, 128, 0.7)' : 'rgba(76, 175, 80, 0.7)'
                  }} 
                />
              </div>
            </div>
          </div>
          
          {/* Steps with enhanced timeline and animations */}
          <div className="relative mt-20">
            {/* Timeline line with pulsing animation */}
            <div 
              className="absolute inset-0 flex items-center justify-center hidden md:flex"
              style={{ width: '6px', left: 'calc(50% - 3px)', height: '100%', top: 0 }}
            >
              <div 
                className="h-full w-full transition-all duration-300 relative overflow-hidden"
                style={{ backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(76, 175, 80, 0.1)' }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                    animation: 'pulseFlow 3s infinite',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Mobile timeline line */}
            <div 
              className="absolute inset-0 flex items-center justify-center md:hidden"
              style={{ width: '4px', left: '24px', height: '100%', top: '40px' }}
            >
              <div 
                className="h-full w-full transition-all duration-300 relative overflow-hidden"
                style={{ backgroundColor: isDark ? 'rgba(74, 222, 128, 0.1)' : 'rgba(76, 175, 80, 0.1)' }}
              >
                <div 
                  className="absolute top-0 left-0 w-full h-full"
                  style={{
                    backgroundColor: isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(76, 175, 80, 0.3)',
                    animation: 'pulseFlow 3s infinite',
                    transition: 'background-color 0.3s ease'
                  }}
                />
              </div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col space-y-16 md:space-y-24">
                {trans.howItWorks.steps.map((step, index) => (
                  <div key={index} className={`flex items-start ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    
                    {/* Desktop left side content */}
                    <div className="hidden md:block md:w-5/12">
                      {index % 2 === 0 && (
                        <div 
                          className={`step-card p-8 rounded-lg shadow-lg md:mr-12 relative ${!isTransitioning ? 'step-appear-right' : ''}`}
                          style={{ 
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                            boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 8px 16px rgba(0, 0, 0, 0.05)',
                            borderLeft: `4px solid ${theme.colors.primary}`,
                            '--step-index': index
                          }}
                        >
                          <div style={contentStyle}>
                            <h3 
                              className="text-xl font-bold mb-3"
                              style={{ ...getTextStyle(), color: theme.colors.primary }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="text-base"
                              style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Middle number step for desktop */}
                    <div className="hidden md:flex md:w-2/12 items-center justify-center">
                      <div className="z-10">
                        <span 
                          className="flex h-12 w-12 items-center justify-center rounded-full step-number"
                          style={{ 
                            backgroundColor: isDark ? '#2E7D32' : '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            '--step-index': index
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mobile step number */}
                    <div className="flex-shrink-0 z-10 flex h-12 w-12 items-center justify-center rounded-full md:hidden step-number"
                      style={{ 
                        backgroundColor: isDark ? '#2E7D32' : '#4CAF50',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        marginRight: '20px',
                        '--step-index': index
                      }}
                    >
                      {index + 1}
                    </div>
                    
                    {/* Desktop right side content */}
                    <div className="hidden md:block md:w-5/12">
                      {index % 2 === 1 && (
                        <div 
                          className={`step-card p-8 rounded-lg shadow-lg md:ml-12 relative ${!isTransitioning ? 'step-appear-left' : ''}`}
                          style={{ 
                            backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                            boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 8px 16px rgba(0, 0, 0, 0.05)',
                            borderRight: `4px solid ${theme.colors.primary}`,
                            '--step-index': index
                          }}
                        >
                          <div style={contentStyle}>
                            <h3 
                              className="text-xl font-bold mb-3"
                              style={{ ...getTextStyle(), color: theme.colors.primary }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="text-base"
                              style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
                            >
                              {step.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Mobile content */}
                    <div 
                      className={`md:hidden flex-1 p-6 rounded-lg shadow-lg mb-4 ${!isTransitioning ? 'step-appear' : ''}`}
                      style={{ 
                        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                        boxShadow: isDark ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 8px 16px rgba(0, 0, 0, 0.05)',
                        borderLeft: `4px solid ${theme.colors.primary}`,
                        '--step-index': index
                      }}
                    >
                      <div style={contentStyle}>
                        <h3 
                          className="text-lg font-bold mb-2"
                          style={{ ...getTextStyle(), color: theme.colors.primary }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crops Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden sm:rounded-lg mb-8 transition-all duration-300" 
            style={{ 
              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.9)',
              boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <Leaf className="h-6 w-6 mr-2" style={{ color: isDark ? '#4ADE80' : '#22C55E' }} />
                <h2 className="text-lg leading-6 font-medium transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                  {trans.crops.title}
                </h2>
              </div>
              <p className="mt-1 max-w-2xl text-sm transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                {trans.crops.subtitle}
              </p>
            </div>
            <div className="border-t transition-all duration-300" style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)' }}>
              <dl>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 transition-all duration-300" 
                  style={{ backgroundColor: isDark ? 'rgba(17, 24, 39, 0.3)' : 'rgba(249, 250, 251, 0.5)' }}>
                  <dt className="text-sm font-medium transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.crops.categories.rice.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                    <div style={contentStyle}>
                      {trans.crops.categories.rice.description}
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.crops.categories.vegetables.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                    <div style={contentStyle}>
                      {trans.crops.categories.vegetables.varieties.map((veg, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                          <strong>{veg.name}:</strong> {veg.description}
                        </p>
                      ))}
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 transition-all duration-300" 
                  style={{ backgroundColor: isDark ? 'rgba(17, 24, 39, 0.3)' : 'rgba(249, 250, 251, 0.5)' }}>
                  <dt className="text-sm font-medium transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.crops.categories.fieldCrops.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                    <div style={contentStyle}>
                      {trans.crops.categories.fieldCrops.varieties.map((crop, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                          <strong>{crop.name}:</strong> {crop.description}
                        </p>
                      ))}
                    </div>
                  </dd>
                </div>
                <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.crops.categories.plantation.name}
                  </dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                    <div style={contentStyle}>
                      {trans.crops.categories.plantation.varieties.map((crop, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                          <strong>{crop.name}:</strong> {crop.description}
                        </p>
                      ))}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Soil Types Section */}
          <div className="shadow overflow-hidden sm:rounded-lg mb-8 transition-all duration-300" 
            style={{ 
              backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.9)',
              boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.2)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <Droplets className="h-6 w-6 mr-2" style={{ color: isDark ? '#b78846' : '#8B4513' }} />
                <h2 className="text-lg leading-6 font-medium transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                  {trans.soil.title}
                </h2>
              </div>
              <p className="mt-1 max-w-2xl text-sm transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                {trans.soil.subtitle}
              </p>
            </div>
            <div className="border-t transition-all duration-300" style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)' }}>
              <dl>
                {trans.soil.types.map((soil, index) => (
                  <div key={index} className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 transition-all duration-300 ${index % 2 === 0 ? (isDark ? 'bg-opacity-30 bg-gray-900' : 'bg-opacity-50 bg-gray-50') : ''}`}>
                    <dt className="text-sm font-medium transition-all duration-300" style={{ ...getTextStyle(), color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                      {soil.name}
                    </dt>
                    <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 transition-all duration-300" style={{ ...getTextStyle(), color: theme.colors.text }}>
                      <div style={contentStyle}>
                        {soil.description}
                      </div>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        className="transition-all duration-300"
        style={{ 
          backgroundColor: isDark ? '#1e4620' : theme.colors.primary,
          color: 'white'
        }}
      >
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div style={contentStyle}>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl transition-all duration-300" style={getTextStyle()}>
              <span className="block">{trans.cta.title}</span>
              <span className="block text-green-100">{trans.cta.subtitle}</span>
            </h2>
          </div>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            {user ? (
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-all duration-300"
                >
                  {trans.hero.dashboard}
                </Link>
              </div>
            ) : (
              <div className="inline-flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/adviser"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50 transition-all duration-300"
                  >
                    {trans.cta.buttonStart}
                  </Link>
                </div>
                <div className="inline-flex rounded-md shadow">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-green-800 transition-all duration-300"
                  >
                    {trans.cta.buttonLogin}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeWrapper>
  );
}