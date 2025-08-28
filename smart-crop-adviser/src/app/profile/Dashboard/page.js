'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Import icons
import {
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  LogIn,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
  Download,
  Leaf,
  Sun,
  Plus,
  Save,
  BarChart,
  X,
  Eye,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Thermometer,
  Droplet,
  CloudRain,
  LineChart,
  MessageSquare,
  Send,
  Paperclip,
  Users,
  UserCheck,
  UserPlus,
  Image,
  Phone,
  Video,
  Search,
  Filter
} from 'lucide-react';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Translations for the dashboard
const translations = {
  en: {
    title: "User Dashboard",
    noData: "No data available",
    
    // Sections
    sections: {
      predictionHistory: "Prediction History",
      lastPrediction: "Last Prediction",
      adviserDocuments: "Documents from Adviser",
      cultivationDates: "Cultivation Dates",
      fertilizerCalendar: "Fertilizer Application Calendar",
      notifications: "Notifications",
      timer: "Timer",
      contactAdvisor: "Contact Advisor",
      messages: "Messages"
    },

    // Contact Advisor
    contactAdvisor: {
      title: "Contact Advisor",
      subtitle: "Connect with agricultural advisors for guidance and support",
      availableAdvisors: "Available Advisors",
      sendRequest: "Send Request",
      requestSent: "Request Sent",
      requestAccepted: "Request Accepted",
      requestPending: "Request Pending",
      selectAdvisor: "Select an advisor to send a request",
      searchAdvisors: "Search advisors...",
      filterBySpecialty: "Filter by specialty",
      experience: "Experience",
      years: "years",
      specialty: "Specialty",
      rating: "Rating",
      noAdvisors: "No advisors available",
      requestMessage: "Request message",
      enterRequestMessage: "Enter your request message...",
      sendingRequest: "Sending Request...",
      requestSuccess: "Request sent successfully!",
      requestError: "Failed to send request. Please try again."
    },

    // Messages
    messages: {
      title: "Messages",
      subtitle: "Chat with your advisor",
      startConversation: "Start a conversation",
      typeMessage: "Type your message...",
      sendMessage: "Send Message",
      attachFile: "Attach File",
      attachImage: "Attach Image",
      noMessages: "No messages yet",
      today: "Today",
      yesterday: "Yesterday",
      online: "Online",
      offline: "Offline",
      typing: "typing...",
      delivered: "Delivered",
      read: "Read",
      sending: "Sending...",
      failed: "Failed to send",
      retryMessage: "Retry",
      deleteMessage: "Delete",
      copyMessage: "Copy",
      downloadFile: "Download",
      viewImage: "View Image",
      fileUploaded: "File uploaded successfully",
      fileUploadError: "Failed to upload file",
      maxFileSize: "File size must be less than 10MB",
      supportedFormats: "Supported formats: PDF, JPG, PNG, DOC, DOCX"
    },
    
    // Enhanced Notifications
    notifications: {
      title: "Notifications",
      subtitle: "Important updates and reminders",
      markAllRead: "Mark All as Read",
      noNotifications: "No notifications",
      fertilizerReminder: "Fertilizer Application Reminder",
      newDocument: "New Document Available",
      newPrediction: "New Prediction Result",
      messageFromAdviser: "Message from Adviser",
      newMessage: "New Message",
      requestAccepted: "Request Accepted",
      requestReceived: "New Request Received",
      requestRejected: "Request Rejected",
      daysAgo: "days ago",
      today: "today",
      yesterday: "yesterday",
      markRead: "Mark as Read",
      dismiss: "Dismiss",
      viewMessage: "View Message",
      viewRequest: "View Request"
    },

    // Existing sections remain the same...
    predictionHistory: {
      title: "Prediction History",
      subtitle: "View your crop prediction history",
      date: "Date",
      crop: "Crop",
      district: "District",
      suitability: "Suitability",
      viewDetails: "View Details",
      noPredictions: "No prediction history available",
      highSuitability: "High Suitability",
      mediumSuitability: "Medium Suitability",
      lowSuitability: "Low Suitability",
      predictionResult: "Prediction Result",
      adviserName: "Adviser Name",
      soilParameters: "Soil Parameters",
      soilType: "Soil Type",
      soilPh: "Soil pH",
      nitrogen: "Nitrogen",
      phosphate: "Phosphate",
      potassium: "Potassium",
      environmentalConditions: "Environmental Conditions",
      temperature: "Temperature",
      humidity: "Humidity",
      rainfall: "Rainfall",
      backToPredictions: "Back to Predictions"
    },
    
    lastPrediction: {
      title: "Last Prediction",
      subtitle: "Details of your most recent crop prediction",
      date: "Date",
      crop: "Crop",
      suitability: "Suitability",
      noPrediction: "No recent prediction available",
      viewAllPredictions: "View All Predictions"
    },

    // Other existing translations...
    adviserDocuments: {
      title: "Documents from Adviser",
      subtitle: "Resources and guides provided by your adviser",
      noDocuments: "No documents available",
      downloadDocument: "Download",
      viewDocument: "View",
      documentType: "Document Type",
      uploadDate: "Upload Date",
      description: "Description"
    },

    cultivationDates: {
      title: "Cultivation Dates",
      subtitle: "Track your cultivation timeline",
      addDate: "Add Cultivation Date",
      crop: "Crop",
      plantingDate: "Planting Date",
      expectedHarvest: "Expected Harvest",
      status: "Status",
      notes: "Notes",
      noDates: "No cultivation dates recorded",
      save: "Save",
      cancel: "Cancel",
      active: "Active",
      completed: "Completed",
      planned: "Planned",
      selectCrop: "Select crop",
      enterNotes: "Enter notes about this cultivation cycle...",
      daysToHarvest: "Days to harvest",
      selectDate: "Select date"
    },

    fertilizerCalendar: {
      title: "Fertilizer Application Calendar",
      subtitle: "Schedule and track fertilizer applications",
      today: "Today",
      addApplication: "Add Application",
      month: "Month",
      week: "Week",
      day: "Day",
      crop: "Crop",
      date: "Date",
      fertilizerType: "Fertilizer Type",
      quantity: "Quantity (kg/ha)",
      notes: "Notes",
      noApplications: "No fertilizer applications scheduled",
      save: "Save",
      cancel: "Cancel",
      previous: "Previous",
      next: "Next",
      selectCrop: "Select crop",
      selectFertilizer: "Select fertilizer type",
      enterNotes: "Enter notes about this application...",
      upcoming: "Upcoming Application",
      daysUntil: "days until application",
      tomorrow: "tomorrow",
      today: "today"
    },

    timer: {
      title: "Cultivation Timer",
      subtitle: "Track time since planting",
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      selectCrop: "Select cultivation to track",
      days: "days",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
      elapsed: "Time elapsed since planting",
      noCultivation: "No active cultivation to track",
      remaining: "Time remaining until harvest"
    }
  },
  
  si: {
    title: "පරිශීලක උපකරණ පුවරුව",
    noData: "දත්ත නොමැත",
    
    // Sections
    sections: {
      predictionHistory: "පුරෝකථන ඉතිහාසය",
      lastPrediction: "අවසාන පුරෝකථනය",
      adviserDocuments: "උපදේශකගෙන් ලැබුණු ලේඛන",
      cultivationDates: "වගා දින",
      fertilizerCalendar: "පොහොර යෙදීමේ දින දර්ශනය",
      notifications: "දැනුම්දීම්",
      timer: "කාල ගණකය"
    },
    
    // Prediction history
    predictionHistory: {
      title: "පුරෝකථන ඉතිහාසය",
      subtitle: "ඔබගේ බෝග පුරෝකථන ඉතිහාසය බලන්න",
      date: "දිනය",
      crop: "බෝගය",
      district: "දිස්ත්‍රික්කය",
      suitability: "සුදුසුකම",
      viewDetails: "විස්තර බලන්න",
      noPredictions: "පුරෝකථන ඉතිහාසයක් නොමැත",
      highSuitability: "ඉහළ සුදුසුකම",
      mediumSuitability: "මධ්‍යම සුදුසුකම",
      lowSuitability: "අඩු සුදුසුකම",
      predictionResult: "පුරෝකථන ප්‍රතිඵලය",
      adviserName: "උපදේශකගේ නම",
      soilParameters: "පස් පරාමිතීන්",
      soilType: "පස් වර්ගය",
      soilPh: "පසෙහි pH අගය",
      nitrogen: "නයිට්‍රජන්",
      phosphate: "පොස්පේට්",
      potassium: "පොටෑසියම්",
      environmentalConditions: "පාරිසරික තත්වයන්",
      temperature: "උෂ්ණත්වය",
      humidity: "ආර්ද්‍රතාවය",
      rainfall: "වර්ෂාපතනය"
    },
    
    // Last prediction
    lastPrediction: {
      title: "අවසාන පුරෝකථනය",
      subtitle: "ඔබගේ නවතම බෝග පුරෝකථනය පිළිබඳ විස්තර",
      date: "දිනය",
      crop: "බෝගය",
      suitability: "සුදුසුකම",
      noPrediction: "මෑත පුරෝකථනයක් නොමැත",
      viewAllPredictions: "සියලු පුරෝකථන බලන්න"
    },
    
    // Adviser documents
    adviserDocuments: {
      title: "උපදේශකගෙන් ලැබුණු ලේඛන",
      subtitle: "ඔබගේ උපදේශක විසින් සපයන ලද සම්පත් සහ මාර්ගෝපදේශ",
      noDocuments: "ලේඛන නොමැත",
      downloadDocument: "බාගත කරන්න",
      viewDocument: "බලන්න",
      documentType: "ලේඛන වර්ගය",
      uploadDate: "උඩුගත කළ දිනය",
      description: "විස්තරය"
    },
    
    // Cultivation dates
    cultivationDates: {
      title: "වගා දින",
      subtitle: "ඔබගේ වගා කාලසටහන ලුහුබඳින්න",
      addDate: "වගා දිනයක් එකතු කරන්න",
      crop: "බෝගය",
      plantingDate: "සිටුවීමේ දිනය",
      expectedHarvest: "අපේක්ෂිත අස්වනු නෙලීම",
      status: "තත්වය",
      notes: "සටහන්",
      noDates: "වගා දින වාර්තා කර නොමැත",
      save: "සුරකින්න",
      cancel: "අවලංගු කරන්න",
      active: "ක්‍රියාකාරී",
      completed: "සම්පූර්ණයි",
      planned: "සැලසුම් කළ",
      selectCrop: "බෝගය තෝරන්න",
      enterNotes: "මෙම වගා චක්‍රය ගැන සටහන් ඇතුළත් කරන්න...",
      daysToHarvest: "අස්වනු නෙලීමට දින",
      selectDate: "දිනය තෝරන්න"
    },
    
    // Fertilizer calendar
    fertilizerCalendar: {
      title: "පොහොර යෙදීමේ දින දර්ශනය",
      subtitle: "පොහොර යෙදීම් සැලසුම් කර පසුවිපරම් කරන්න",
      today: "අද",
      addApplication: "යෙදීමක් එකතු කරන්න",
      month: "මාසය",
      week: "සතිය",
      day: "දවස",
      crop: "බෝගය",
      date: "දිනය",
      fertilizerType: "පොහොර වර්ගය",
      quantity: "ප්‍රමාණය (kg/ha)",
      notes: "සටහන්",
      noApplications: "සැලසුම් කළ පොහොර යෙදීම් නොමැත",
      save: "සුරකින්න",
      cancel: "අවලංගු කරන්න",
      previous: "පෙර",
      next: "ඊළඟ",
      selectCrop: "බෝගය තෝරන්න",
      selectFertilizer: "පොහොර වර්ගය තෝරන්න",
      enterNotes: "මෙම යෙදීම ගැන සටහන් ඇතුළත් කරන්න...",
      upcoming: "ඉදිරි යෙදීම",
      daysUntil: "යෙදීමට පෙර දින",
      tomorrow: "හෙට",
      today: "අද",
      deleteConfirm: "ඔබට මෙම යෙදීම මැකීමට අවශ්‍ය බව විශ්වාසද?",
      yes: "ඔව්",
      no: "නැත"
    },
    
    // Notifications
    notifications: {
      title: "දැනුම්දීම්",
      subtitle: "වැදගත් යාවත්කාලීන කිරීම් සහ සිහිකැඳවීම්",
      markAllRead: "සියල්ල කියවූ ලෙස සලකුණු කරන්න",
      noNotifications: "දැනුම්දීම් නොමැත",
      fertilizerReminder: "පොහොර යෙදීමේ සිහිකැඳවීම",
      newDocument: "නව ලේඛනයක් තිබේ",
      newPrediction: "නව පුරෝකථන ප්‍රතිඵලයක්",
      messageFromAdviser: "උපදේශකගෙන් පණිවිඩයක්",
      daysAgo: "දින කට පෙර",
      today: "අද",
      yesterday: "ඊයේ",
      markRead: "කියවූ ලෙස සලකුණු කරන්න",
      dismiss: "ඉවත් කරන්න"
    },
    
    // Timer
    timer: {
      title: "වගා කාල ගණකය",
      subtitle: "සිටුවීමේ සිට කාලය පසුවිපරම් කරන්න",
      start: "ආරම්භ කරන්න",
      pause: "විරාම කරන්න",
      reset: "යළි පිහිටුවන්න",
      selectCrop: "පසුවිපරම් කිරීමට වගාව තෝරන්න",
      days: "දින",
      hours: "පැය",
      minutes: "මිනිත්තු",
      seconds: "තත්පර",
      elapsed: "සිටුවීමේ සිට ගතවූ කාලය",
      noCultivation: "පසුවිපරම් කිරීමට සක්‍රිය වගාවක් නොමැත",
      remaining: "අස්වනු නෙලීමට ඉතිරි කාලය"
    }
  },
  
  ta: {
    title: "பயனர் டாஷ்போர்டு",
    noData: "தரவு இல்லை",
    
    // Sections
    sections: {
      predictionHistory: "முன்னறிவிப்பு வரலாறு",
      lastPrediction: "கடைசி முன்னறிவிப்பு",
      adviserDocuments: "ஆலோசகரிடமிருந்து ஆவணங்கள்",
      cultivationDates: "பயிரிடும் தேதிகள்",
      fertilizerCalendar: "உர பயன்பாட்டு காலண்டர்",
      notifications: "அறிவிப்புகள்",
      timer: "டைமர்"
    },
    
    // Prediction history
    predictionHistory: {
      title: "முன்னறிவிப்பு வரலாறு",
      subtitle: "உங்கள் பயிர் முன்னறிவிப்பு வரலாற்றைக் காண்க",
      date: "தேதி",
      crop: "பயிர்",
      district: "மாவட்டம்",
      suitability: "பொருத்தம்",
      viewDetails: "விவரங்களைக் காண",
      noPredictions: "முன்னறிவிப்பு வரலாறு இல்லை",
      highSuitability: "உயர் பொருத்தம்",
      mediumSuitability: "நடுத்தர பொருத்தம்",
      lowSuitability: "குறைந்த பொருத்தம்",
      predictionResult: "முன்னறிவிப்பு முடிவு",
      adviserName: "ஆலோசகர் பெயர்",
      soilParameters: "மண் அளவுருக்கள்",
      soilType: "மண் வகை",
      soilPh: "மண் pH",
      nitrogen: "நைட்ரஜன்",
      phosphate: "பாஸ்பேட்",
      potassium: "பொட்டாசியம்",
      environmentalConditions: "சுற்றுச்சூழல் நிலைமைகள்",
      temperature: "வெப்பநிலை",
      humidity: "ஈரப்பதம்",
      rainfall: "மழைப்பொழிவு"
    },
    
    // Last prediction
    lastPrediction: {
      title: "கடைசி முன்னறிவிப்பு",
      subtitle: "உங்கள் சமீபத்திய பயிர் முன்னறிவிப்பு விவரங்கள்",
      date: "தேதி",
      crop: "பயிர்",
      suitability: "பொருத்தம்",
      noPrediction: "சமீபத்திய முன்னறிவிப்பு இல்லை",
      viewAllPredictions: "அனைத்து முன்னறிவிப்புகளையும் காண"
    },
    
    // Adviser documents
    adviserDocuments: {
      title: "ஆலோசகரிடமிருந்து ஆவணங்கள்",
      subtitle: "உங்கள் ஆலோசகரால் வழங்கப்பட்ட வளங்கள் மற்றும் வழிகாட்டிகள்",
      noDocuments: "ஆவணங்கள் இல்லை",
      downloadDocument: "பதிவிறக்கம்",
      viewDocument: "காண்க",
      documentType: "ஆவண வகை",
      uploadDate: "பதிவேற்றிய தேதி",
      description: "விளக்கம்"
    },
    
    // Cultivation dates
    cultivationDates: {
      title: "பயிரிடும் தேதிகள்",
      subtitle: "உங்கள் பயிர் காலவரிசையைக் கண்காணிக்கவும்",
      addDate: "பயிரிடும் தேதியைச் சேர்க்கவும்",
      crop: "பயிர்",
      plantingDate: "நடவு தேதி",
      expectedHarvest: "எதிர்பார்க்கப்படும் அறுவடை",
      status: "நிலை",
      notes: "குறிப்புகள்",
      noDates: "பயிரிடும் தேதிகள் பதிவு செய்யப்படவில்லை",
      save: "சேமி",
      cancel: "ரத்து செய்",
      active: "செயலில்",
      completed: "முடிந்தது",
      planned: "திட்டமிடப்பட்டது",
      selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
      enterNotes: "இந்த பயிர்ச்சுழற்சி பற்றிய குறிப்புகளை உள்ளிடவும்...",
      daysToHarvest: "அறுவடைக்கு நாட்கள்",
      selectDate: "தேதியைத் தேர்ந்தெடுக்கவும்"
    },
    
    // Fertilizer calendar
    fertilizerCalendar: {
      title: "உர பயன்பாட்டு காலண்டர்",
      subtitle: "உர பயன்பாட்டை திட்டமிட்டு கண்காணிக்கவும்",
      today: "இன்று",
      addApplication: "பயன்பாட்டைச் சேர்க்கவும்",
      month: "மாதம்",
      week: "வாரம்",
      day: "நாள்",
      crop: "பயிர்",
      date: "தேதி",
      fertilizerType: "உர வகை",
      quantity: "அளவு (kg/ha)",
      notes: "குறிப்புகள்",
      noApplications: "திட்டமிடப்பட்ட உர பயன்பாடுகள் இல்லை",
      save: "சேமி",
      cancel: "ரத்து செய்",
      previous: "முந்தைய",
      next: "அடுத்த",
      selectCrop: "பயிரைத் தேர்ந்தெடுக்கவும்",
      selectFertilizer: "உர வகையைத் தேர்ந்தெடுக்கவும்",
      enterNotes: "இந்த பயன்பாட்டைப் பற்றிய குறிப்புகளை உள்ளிடவும்...",
      upcoming: "வரவிருக்கும் பயன்பாடு",
      daysUntil: "பயன்பாட்டிற்கு முன் நாட்கள்",
      tomorrow: "நாளை",
      today: "இன்று",
      deleteConfirm: "இந்த பயன்பாட்டை நீக்க விரும்புகிறீர்களா?",
      yes: "ஆம்",
      no: "இல்லை"
    },
    
    // Notifications
    notifications: {
      title: "அறிவிப்புகள்",
      subtitle: "முக்கியமான புதுப்பிப்புகள் மற்றும் நினைவூட்டல்கள்",
      markAllRead: "அனைத்தையும் படித்ததாகக் குறிக்கவும்",
      noNotifications: "அறிவிப்புகள் இல்லை",
      fertilizerReminder: "உர பயன்பாட்டு நினைவூட்டல்",
      newDocument: "புதிய ஆவணம் கிடைக்கிறது",
      newPrediction: "புதிய முன்னறிவிப்பு முடிவு",
      messageFromAdviser: "ஆலோசகரிடமிருந்து செய்தி",
      daysAgo: "நாட்களுக்கு முன்",
      today: "இன்று",
      yesterday: "நேற்று",
      markRead: "படித்ததாகக் குறிக்கவும்",
      dismiss: "நிராகரி"
    },
    
    // Timer
    timer: {
      title: "பயிர்ச்செய்கை டைமர்",
      subtitle: "நடவு செய்த நேரத்தைக் கண்காணிக்கவும்",
      start: "தொடங்கு",
      pause: "இடைநிறுத்து",
      reset: "மீட்டமை",
      selectCrop: "கண்காணிக்க பயிரைத் தேர்ந்தெடுக்கவும்",
      days: "நாட்கள்",
      hours: "மணிநேரம்",
      minutes: "நிமிடங்கள்",
      seconds: "வினாடிகள்",
      elapsed: "நடவு செய்த பிறகு கடந்த நேரம்",
      noCultivation: "கண்காணிக்க செயலில் உள்ள பயிர் இல்லை",
      remaining: "அறுவடைக்கு மீதமுள்ள நேரம்"
    }
  }
};


// Sample available crops
const AVAILABLE_CROPS = [
  { id: 'big_onion', name: 'Big Onion' },
  { id: 'red_onion', name: 'Red Onion' },
  { id: 'maize', name: 'Maize' },
  { id: 'potato', name: 'Potato' },
  { id: 'carrot', name: 'Carrot' }
];

// Sample fertilizer types
const FERTILIZER_TYPES = [
  { id: 'npk', name: 'NPK (10-10-10)' },
  { id: 'urea', name: 'Urea' },
  { id: 'organic', name: 'Organic Compost' },
  { id: 'ammonium_sulfate', name: 'Ammonium Sulfate' },
  { id: 'potassium_nitrate', name: 'Potassium Nitrate' }
];

// Calendar view options
const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

export default function UserDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme.name === 'dark';
  
  const [trans, setTrans] = useState(translations.en);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [activeSection, setActiveSection] = useState('lastPrediction');
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Prediction history state
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);
  
  // Documents state
  const [documents, setDocuments] = useState([]);
  
  // Cultivation dates state
  const [cultivationDates, setCultivationDates] = useState([]);
  const [showAddCultivation, setShowAddCultivation] = useState(false);
  const [cultivationForm, setCultivationForm] = useState({
    crop_id: '',
    planting_date: '',
    expected_harvest: '',
    status: 'planned',
    notes: ''
  });
  
  // Fertilizer calendar state
  const [calendarView, setCalendarView] = useState(CALENDAR_VIEWS.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fertilizerApplications, setFertilizerApplications] = useState([]);
  const [showAddApplication, setShowAddApplication] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    crop_id: '',
    date: '',
    fertilizer_type: '',
    quantity: '',
    notes: ''
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  
  // Timer state
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedCultivation, setSelectedCultivation] = useState(null);
  const timerRef = useRef(null);

  // Advisor and messaging state
  const [advisors, setAdvisors] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [advisorRequests, setAdvisorRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    advisor_id: '',
    message: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [fileUpload, setFileUpload] = useState(null);
  const messagesEndRef = useRef(null);

  // Search and filter state
  const [advisorSearch, setAdvisorSearch] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState('');
  
  // Update translations when language changes
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

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch advisors
  const fetchAdvisors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/users?userlevel=advisor`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAdvisors(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching advisors:', error);
    }
  }, []);

  // Fetch real prediction data
  const fetchPredictionHistory = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/predictions`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Filter predictions for current user
          const userPredictions = result.data.filter(prediction => prediction.user_id === user.id);
          setPredictionHistory(userPredictions);
        }
      } else {
        // Mock data if API fails
        const mockPredictions = [
          {
            id: 1,
            user_id: user.id,
            crop_name: 'Potato',
            district: 'Kandy',
            soil_type: 'Red Yellow Podzolic',
            soil_ph_level: 6.5,
            nitrogen: 120,
            phosphate: 90,
            potassium: 80,
            temp: 24.5,
            avg_humidity: 78,
            avg_rainfall: 150,
            suitability_score: 0.85,
            adviser_name: 'John Smith',
            created_at: new Date(2025, 7, 15)
          }
        ];
        setPredictionHistory(mockPredictions);
      }
    } catch (error) {
      console.error('Error fetching prediction history:', error);
    }
  }, [user]);

  // Fetch messages for user
  const fetchMessages = useCallback(async () => {
    if (!user || !user.id) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/messages/user/${user.id}?page=1&limit=20`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMessages(result.data.messages || []);
          setUnreadMessageCount(result.data.unreadCount || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  // Fetch conversation thread
  const fetchConversationThread = useCallback(async (userA, userB) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/v1/messages/thread?userA=${userA}&userB=${userB}&page=1&limit=30`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setMessages(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async () => {
    if (!messageInput.trim() && !fileUpload) return;
    if (!selectedConversation) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem('token');
      
      let fileUrl = null;
      if (fileUpload) {
        const formData = new FormData();
        formData.append('file', fileUpload);
        
        const uploadResponse = await fetch(`${API_URL}/api/v1/files/upload`, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          fileUrl = uploadResult.data.url;
        } else {
          throw new Error('File upload failed');
        }
      }

      const messageData = {
        recipient_id: selectedConversation.id,
        message: messageInput.trim(),
        file_url: fileUrl,
        file_name: fileUpload ? fileUpload.name : null,
        message_type: fileUrl ? 'file' : 'text'
      };

      const response = await fetch(`${API_URL}/api/v1/messages`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMessages(prev => [...prev, result.data]);
          setMessageInput('');
          setFileUpload(null);
          
          const newNotification = {
            id: Date.now(),
            user_id: user.id,
            type: 'new_message',
            title: 'Message Sent',
            message: `Message sent to ${selectedConversation.name}`,
            read: false,
            created_at: new Date()
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  }, [messageInput, fileUpload, selectedConversation, user]);

  // Send advisor request
  const sendAdvisorRequest = useCallback(async () => {
    if (!requestForm.advisor_id || !requestForm.message.trim()) return;

    setRequestLoading(true);
    try {
      const token = localStorage.getItem('token');
      const requestData = {
        advisor_id: parseInt(requestForm.advisor_id),
        message: requestForm.message.trim(),
        request_type: 'advisor_request'
      };

      const response = await fetch(`${API_URL}/api/v1/messages`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const newRequest = {
            id: Date.now(),
            advisor_id: parseInt(requestForm.advisor_id),
            status: 'pending',
            message: requestForm.message,
            created_at: new Date()
          };
          setAdvisorRequests(prev => [...prev, newRequest]);

          const newNotification = {
            id: Date.now() + 1,
            user_id: user.id,
            type: 'request_sent',
            title: 'Request Sent',
            message: `Request sent to advisor`,
            read: false,
            created_at: new Date()
          };
          setNotifications(prev => [newNotification, ...prev]);

          setShowRequestForm(false);
          setRequestForm({ advisor_id: '', message: '' });
        }
      }
    } catch (error) {
      console.error('Error sending request:', error);
    } finally {
      setRequestLoading(false);
    }
  }, [requestForm, user]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert(trans.messages.maxFileSize);
        return;
      }
      setFileUpload(file);
    }
  };

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!user || !user.id) {
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      
      await Promise.all([
        fetchPredictionHistory(),
        fetchAdvisors(),
        fetchMessages()
      ]);

      // Mock documents
      const mockDocuments = [
        {
          id: 1,
          title: 'Potato Cultivation Guide',
          description: 'Complete guide for potato cultivation in highland areas',
          type: 'PDF',
          url: '/documents/potato_guide.pdf',
          adviser_name: 'John Smith',
          created_at: new Date(2025, 7, 10)
        }
      ];
      setDocuments(mockDocuments);

      // Mock cultivation dates
      const mockCultivation = [
        {
          id: 1,
          user_id: user.id,
          crop_id: 'potato',
          crop_name: 'Potato',
          planting_date: new Date(2025, 7, 5),
          expected_harvest: new Date(2025, 10, 5),
          status: 'active',
          notes: 'Using seed potatoes from last harvest'
        }
      ];
      setCultivationDates(mockCultivation);

      // Mock fertilizer applications
      const mockFertilizer = [
        {
          id: 1,
          user_id: user.id,
          crop_id: 'potato',
          crop_name: 'Potato',
          date: new Date(2025, 8, 20),
          fertilizer_type: 'NPK (10-10-10)',
          quantity: 250,
          notes: 'Apply around the base of plants'
        }
      ];
      setFertilizerApplications(mockFertilizer);

      // Mock conversations
      const mockConversations = [
        {
          id: 4, // Advisor ID
          name: 'Dr. John Smith',
          lastMessage: 'Your soil test results look good',
          unreadCount: 2,
          online: true
        }
      ];
      setConversations(mockConversations);

      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          user_id: user.id,
          type: 'fertilizer_reminder',
          title: 'Fertilizer Application Due',
          message: 'Reminder: Apply NPK fertilizer to your potato crop tomorrow',
          read: false,
          created_at: new Date(2025, 7, 19)
        },
        {
          id: 2,
          user_id: user.id,
          type: 'new_message',
          title: 'New Message from Advisor',
          message: 'Dr. John Smith sent you a message about soil preparation',
          read: false,
          created_at: new Date(2025, 7, 18)
        }
      ];
      setNotifications(mockNotifications);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data. Please try again later.');
    } finally {
      setDataLoading(false);
    }
  }, [user, fetchPredictionHistory, fetchAdvisors, fetchMessages]);

  // Check authentication and fetch data
  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      fetchUserData();
    } else {
      setDataLoading(false);
    }
  }, [user, authLoading, fetchUserData]);

  // Timer setup
  useEffect(() => {
    if (timerRunning && selectedCultivation) {
      timerRef.current = setInterval(() => {
        const plantingDate = new Date(selectedCultivation.planting_date);
        const now = new Date();
        const elapsed = now.getTime() - plantingDate.getTime();
        setElapsedTime(Math.floor(elapsed / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    
    return () => {
      clearInterval(timerRef.current);
    };
  }, [timerRunning, selectedCultivation]);

  // Utility functions
  const getTextStyle = (baseStyle = {}) => {
    const langLineHeight = language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5;
    return {
      ...baseStyle,
      lineHeight: langLineHeight,
      transition: 'all 0.3s ease'
    };
  };

  const daysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
    return diffDays;
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = seconds % 60;
    
    return { days, hours, minutes, seconds: secs };
  };

  // Filter advisors based on search and filter
  const filteredAdvisors = advisors.filter(advisor => {
    const matchesSearch = advisor.name?.toLowerCase().includes(advisorSearch.toLowerCase()) ||
                         advisor.email?.toLowerCase().includes(advisorSearch.toLowerCase());
    const matchesFilter = !advisorFilter || advisor.specialty === advisorFilter;
    return matchesSearch && matchesFilter;
  });

  // Show loading state
  if (authLoading || dataLoading) {
    return (
      <ThemeWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.colors.primary }}></div>
        </div>
      </ThemeWrapper>
    );
  }

  // Show not authenticated state
  if (!user) {
    return (
      <ThemeWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="rounded-md p-4 mb-6" style={{ 
            backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#FEF9C3',
            borderLeftWidth: '4px',
            borderLeftColor: isDark ? '#EAB308' : '#CA8A04'
          }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#FACC15' : '#CA8A04' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#FACC15' : '#854D0E' }}>
                  You need to be logged in to view your dashboard.
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/login')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Go to Login
          </button>
        </div>
      </ThemeWrapper>
    );
  }

  return (
    <ThemeWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            {trans.title}
          </h1>
          
          <div className="flex space-x-2">
            {/* Messages Badge */}
            <button
              onClick={() => setActiveSection('messages')}
              className="relative inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm hover:opacity-90"
              style={{ 
                backgroundColor: activeSection === 'messages' ? theme.colors.primary : 'transparent',
                color: activeSection === 'messages' ? 'white' : theme.colors.text,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              }}
            >
              <MessageSquare className="h-5 w-5" />
              {unreadMessageCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs" 
                      style={{ backgroundColor: '#EF4444', color: 'white' }}>
                  {unreadMessageCount}
                </span>
              )}
            </button>

            {/* Notifications Badge */}
            <button
              onClick={() => setActiveSection('notifications')}
              className="relative inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm hover:opacity-90"
              style={{ 
                backgroundColor: activeSection === 'notifications' ? theme.colors.primary : 'transparent',
                color: activeSection === 'notifications' ? 'white' : theme.colors.text,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
              }}
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs" 
                      style={{ backgroundColor: '#EF4444', color: 'white' }}>
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-md" style={{ 
            backgroundColor: isDark ? 'rgba(220, 38, 38, 0.2)' : '#FEF2F2',
            borderLeftWidth: '4px',
            borderLeftColor: isDark ? '#EF4444' : '#DC2626'
          }}>
            <div className="flex">
              <AlertTriangle className="h-5 w-5" style={{ color: isDark ? '#F87171' : '#DC2626' }} />
              <div className="ml-3">
                <p className="text-sm" style={{ color: isDark ? '#F87171' : '#B91C1C' }}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {Object.keys(trans.sections).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className="flex flex-col items-center p-4 rounded-lg transition-all"
              style={{ 
                backgroundColor: activeSection === section 
                  ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                borderWidth: '1px',
                borderColor: activeSection === section 
                  ? theme.colors.primary 
                  : 'transparent',
                color: theme.colors.text
              }}
            >
              {section === 'lastPrediction' && <BarChart className="h-6 w-6 mb-2" />}
              {section === 'predictionHistory' && <LineChart className="h-6 w-6 mb-2" />}
              {section === 'adviserDocuments' && <FileText className="h-6 w-6 mb-2" />}
              {section === 'cultivationDates' && <Calendar className="h-6 w-6 mb-2" />}
              {section === 'fertilizerCalendar' && <Calendar className="h-6 w-6 mb-2" />}
              {section === 'notifications' && (
                <div className="relative mb-2">
                  <Bell className="h-6 w-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs" 
                          style={{ backgroundColor: '#EF4444', color: 'white' }}>
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </div>
              )}
              {section === 'timer' && <Clock className="h-6 w-6 mb-2" />}
              {section === 'contactAdvisor' && <Users className="h-6 w-6 mb-2" />}
              {section === 'messages' && (
                <div className="relative mb-2">
                  <MessageSquare className="h-6 w-6" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-xs" 
                          style={{ backgroundColor: '#EF4444', color: 'white' }}>
                      {unreadMessageCount}
                    </span>
                  )}
                </div>
              )}
              <span className="text-sm text-center" style={getTextStyle()}>
                {trans.sections[section]}
              </span>
            </button>
          ))}
        </div>

        {/* Last Prediction Section */}
        {activeSection === 'lastPrediction' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                <BarChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.lastPrediction.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.lastPrediction.subtitle}
              </p>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {predictionHistory.length > 0 ? (
                <div>
                  {(() => {
                    const latestPrediction = [...predictionHistory].sort(
                      (a, b) => new Date(b.created_at) - new Date(a.created_at)
                    )[0];
                    
                    const suitabilityScore = latestPrediction.suitability_score || 0.8;
                    let suitabilityLabel = '';
                    let suitabilityColor = '';
                    
                    if (suitabilityScore > 0.7) {
                      suitabilityLabel = trans.predictionHistory.highSuitability;
                      suitabilityColor = isDark ? '#4ADE80' : '#22C55E';
                    } else if (suitabilityScore > 0.4) {
                      suitabilityLabel = trans.predictionHistory.mediumSuitability;
                      suitabilityColor = isDark ? '#FACC15' : '#CA8A04';
                    } else {
                      suitabilityLabel = trans.predictionHistory.lowSuitability;
                      suitabilityColor = isDark ? '#F87171' : '#DC2626';
                    }
                    
                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                          <div className="lg:col-span-2 bg-opacity-10 rounded-lg p-4" style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                          }}>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 p-3 rounded-lg" style={{
                                backgroundColor: isDark ? 'rgba(75, 192, 192, 0.2)' : 'rgba(75, 192, 192, 0.1)'
                              }}>
                                <Leaf className="h-6 w-6" style={{ color: '#4BC0C0' }} />
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                                  {latestPrediction.crop_name}
                                </h3>
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                                    {trans.lastPrediction.date}: {new Date(latestPrediction.created_at).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                                    {trans.predictionHistory.district}: {latestPrediction.district}
                                  </p>
                                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                                    {trans.predictionHistory.adviserName}: {latestPrediction.adviser_name}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="lg:col-span-2 bg-opacity-10 rounded-lg p-4" style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                          }}>
                            <div className="flex items-start">
                              <div className="flex-shrink-0 p-3 rounded-lg" style={{
                                backgroundColor: `${suitabilityColor}20`
                              }}>
                                <BarChart className="h-6 w-6" style={{ color: suitabilityColor }} />
                              </div>
                              <div className="ml-4">
                                <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                                  {trans.lastPrediction.suitability}
                                </h3>
                                <div className="mt-1">
                                  <span 
                                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{ 
                                      backgroundColor: isDark ? `${suitabilityColor}20` : `${suitabilityColor}15`,
                                      color: suitabilityColor
                                    }}
                                  >
                                    {suitabilityLabel}
                                  </span>
                                  <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden" style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                  }}>
                                    <div 
                                      className="h-full rounded-full" 
                                      style={{
                                        width: `${suitabilityScore * 100}%`,
                                        backgroundColor: suitabilityColor
                                      }}
                                    ></div>
                                  </div>
                                  <p className="mt-1 text-right text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                    {Math.round(suitabilityScore * 100)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <button
                            onClick={() => setActiveSection('predictionHistory')}
                            className="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md shadow-sm hover:opacity-90"
                            style={{ 
                              backgroundColor: 'transparent',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text
                            }}
                          >
                            <LineChart className="mr-2 h-4 w-4" />
                            {trans.lastPrediction.viewAllPredictions}
                          </button>
                          
                          <button
                            onClick={() => {
                              setActiveSection('predictionHistory');
                              setSelectedPrediction(latestPrediction);
                              setShowPredictionDetails(true);
                            }}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {trans.predictionHistory.viewDetails}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.lastPrediction.noPrediction}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prediction History Section */}
        {activeSection === 'predictionHistory' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                <LineChart className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.predictionHistory.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.predictionHistory.subtitle}
              </p>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {showPredictionDetails && selectedPrediction ? (
                <div>
                  <button
                    onClick={() => {
                      setShowPredictionDetails(false);
                      setSelectedPrediction(null);
                    }}
                    className="inline-flex items-center px-3 py-2 mb-4 border text-sm font-medium rounded-md shadow-sm hover:opacity-90"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {trans.predictionHistory.backToPredictions}
                  </button>
                  
                  {/* Detailed Prediction View */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium" style={{ color: theme.colors.text }}>
                      {trans.predictionHistory.predictionResult}: {selectedPrediction.crop_name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {trans.predictionHistory.date}
                          </h4>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {new Date(selectedPrediction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {trans.predictionHistory.district}
                          </h4>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedPrediction.district}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {trans.predictionHistory.adviserName}
                          </h4>
                          <p className="text-sm" style={{ color: theme.colors.text }}>
                            {selectedPrediction.adviser_name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {trans.predictionHistory.soilParameters}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {trans.predictionHistory.soilType}
                              </p>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.soil_type}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {trans.predictionHistory.soilPh}
                              </p>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.soil_ph_level}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {trans.predictionHistory.nitrogen} (kg/ha)
                              </p>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.nitrogen}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {trans.predictionHistory.phosphate} (kg/ha)
                              </p>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.phosphate}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                {trans.predictionHistory.potassium} (kg/ha)
                              </p>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.potassium}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="text-sm font-medium" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>
                            {trans.predictionHistory.environmentalConditions}
                          </h4>
                          
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Thermometer className="h-3 w-3" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.predictionHistory.temperature} (°C)
                                </p>
                              </div>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.temp}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <Droplet className="h-3 w-3" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.predictionHistory.humidity} (%)
                                </p>
                              </div>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.avg_humidity}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <CloudRain className="h-3 w-3" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.predictionHistory.rainfall} (mm)
                                </p>
                              </div>
                              <p className="text-sm" style={{ color: theme.colors.text }}>
                                {selectedPrediction.avg_rainfall}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {predictionHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y" style={{ 
                        divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                      }}>
                        <thead>
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {trans.predictionHistory.date}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {trans.predictionHistory.crop}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {trans.predictionHistory.district}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {trans.predictionHistory.suitability}
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y" style={{ 
                          divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }}>
                          {predictionHistory
                            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                            .map((prediction) => {
                              const suitabilityScore = prediction.suitability_score || 0.8;
                              let suitabilityLabel = '';
                              let suitabilityColor = '';
                              
                              if (suitabilityScore > 0.7) {
                                suitabilityLabel = trans.predictionHistory.highSuitability;
                                suitabilityColor = isDark ? '#4ADE80' : '#22C55E';
                              } else if (suitabilityScore > 0.4) {
                                suitabilityLabel = trans.predictionHistory.mediumSuitability;
                                suitabilityColor = isDark ? '#FACC15' : '#CA8A04';
                              } else {
                                suitabilityLabel = trans.predictionHistory.lowSuitability;
                                suitabilityColor = isDark ? '#F87171' : '#DC2626';
                              }
                              
                              return (
                                <tr key={prediction.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                    {new Date(prediction.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                    {prediction.crop_name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                    {prediction.district || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span 
                                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                      style={{ 
                                        backgroundColor: isDark ? `${suitabilityColor}20` : `${suitabilityColor}15`,
                                        color: suitabilityColor
                                      }}
                                    >
                                      {suitabilityLabel}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => {
                                        setSelectedPrediction(prediction);
                                        setShowPredictionDetails(true);
                                      }}
                                      className="text-indigo-600 hover:text-indigo-900"
                                      style={{ color: theme.colors.primary }}
                                    >
                                      {trans.predictionHistory.viewDetails}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        {trans.predictionHistory.noPredictions}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Advisor Section */}
        {activeSection === 'contactAdvisor' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                    <Users className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                    {trans.contactAdvisor.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.contactAdvisor.subtitle}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {/* Search and Filter */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                  <input
                    type="text"
                    placeholder={trans.contactAdvisor.searchAdvisors}
                    value={advisorSearch}
                    onChange={(e) => setAdvisorSearch(e.target.value)}
                    className="pl-10 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text,
                      borderWidth: '1px',
                      padding: '0.5rem 0.75rem'
                    }}
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }} />
                  <select
                    value={advisorFilter}
                    onChange={(e) => setAdvisorFilter(e.target.value)}
                    className="pl-10 block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text,
                      borderWidth: '1px',
                      padding: '0.5rem 0.75rem'
                    }}
                  >
                    <option value="">{trans.contactAdvisor.filterBySpecialty}</option>
                    <option value="crop_science">Crop Science</option>
                    <option value="soil_management">Soil Management</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="irrigation">Irrigation</option>
                  </select>
                </div>
              </div>

              {/* Request Form */}
              {showRequestForm && (
                <div className="mb-6 bg-opacity-10 rounded-lg p-4" style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                      {trans.contactAdvisor.sendRequest}
                    </h3>
                    <button
                      onClick={() => setShowRequestForm(false)}
                      className="p-1 rounded-full hover:opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.contactAdvisor.selectAdvisor}
                      </label>
                      <select
                        value={requestForm.advisor_id}
                        onChange={(e) => setRequestForm({...requestForm, advisor_id: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <option value="">{trans.contactAdvisor.selectAdvisor}</option>
                        {filteredAdvisors.map(advisor => (
                          <option key={advisor.id} value={advisor.id}>
                            {advisor.name} - {advisor.specialty || 'General'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.contactAdvisor.requestMessage}
                      </label>
                      <textarea
                        value={requestForm.message}
                        onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                        placeholder={trans.contactAdvisor.enterRequestMessage}
                        rows={4}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setShowRequestForm(false)}
                        className="px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90"
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={sendAdvisorRequest}
                        disabled={requestLoading || !requestForm.advisor_id || !requestForm.message.trim()}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        {requestLoading ? trans.contactAdvisor.sendingRequest : trans.contactAdvisor.sendRequest}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Advisors */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                    {trans.contactAdvisor.availableAdvisors}
                  </h3>
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {trans.contactAdvisor.sendRequest}
                  </button>
                </div>
                
                {filteredAdvisors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAdvisors.map(advisor => {
                      const existingRequest = advisorRequests.find(req => req.advisor_id === advisor.id);
                      
                      return (
                        <div 
                          key={advisor.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                          style={{ 
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div 
                                className="h-12 w-12 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: theme.colors.primary + '20' }}
                              >
                                <User className="h-6 w-6" style={{ color: theme.colors.primary }} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>
                                {advisor.name}
                              </p>
                              <p className="text-sm truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                                {advisor.email}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-1">
                            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              <span className="font-medium">{trans.contactAdvisor.specialty}:</span> {advisor.specialty || 'General'}
                            </p>
                            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              <span className="font-medium">{trans.contactAdvisor.experience}:</span> {advisor.experience || 5} {trans.contactAdvisor.years}
                            </p>
                          </div>
                          
                          <div className="mt-4">
                            {existingRequest ? (
                              <span 
                                className="px-3 py-1 text-xs font-medium rounded-full"
                                style={{ 
                                  backgroundColor: existingRequest.status === 'accepted' 
                                    ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)')
                                    : existingRequest.status === 'pending'
                                    ? (isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)')
                                    : (isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)'),
                                  color: existingRequest.status === 'accepted' 
                                    ? (isDark ? '#4ADE80' : '#16A34A')
                                    : existingRequest.status === 'pending'
                                    ? (isDark ? '#FACC15' : '#D97706')
                                    : (isDark ? '#F87171' : '#DC2626')
                                }}
                              >
                                {existingRequest.status === 'accepted' ? trans.contactAdvisor.requestAccepted :
                                 existingRequest.status === 'pending' ? trans.contactAdvisor.requestPending :
                                 'Request Rejected'}
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setRequestForm({ ...requestForm, advisor_id: advisor.id.toString() });
                                  setShowRequestForm(true);
                                }}
                                className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                                style={{ backgroundColor: theme.colors.primary }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {trans.contactAdvisor.sendRequest}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      {trans.contactAdvisor.noAdvisors}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Section */}
        {activeSection === 'messages' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                <MessageSquare className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.messages.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.messages.subtitle}
              </p>
            </div>
            
            <div className="border-t" style={{ borderColor: theme.colors.border }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 h-96">
                {/* Conversations List */}
                <div className="border-r" style={{ borderColor: theme.colors.border }}>
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-4" style={{ color: theme.colors.text }}>
                      Conversations
                    </h3>
                    
                    {conversations.length > 0 ? (
                      <div className="space-y-2">
                        {conversations.map(conversation => (
                          <button
                            key={conversation.id}
                            onClick={() => {
                              setSelectedConversation(conversation);
                              fetchConversationThread(user.id, conversation.id);
                            }}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedConversation?.id === conversation.id 
                                ? 'ring-2 ring-offset-2' 
                                : 'hover:opacity-70'
                            }`}
                            style={{ 
                              backgroundColor: selectedConversation?.id === conversation.id
                                ? (isDark ? theme.colors.primary + '30' : theme.colors.primary + '15')
                                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'),
                              ringColor: theme.colors.primary,
                              ringOffsetColor: theme.colors.card
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div 
                                  className="h-10 w-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: theme.colors.primary + '20' }}
                                >
                                  <User className="h-5 w-5" style={{ color: theme.colors.primary }} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>
                                  {conversation.name}
                                </p>
                                <p className="text-xs truncate" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                                  {conversation.lastMessage || 'No messages yet'}
                                </p>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs" 
                                      style={{ backgroundColor: '#EF4444', color: 'white' }}>
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.messages.startConversation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Chat Area */}
                <div className="lg:col-span-2 flex flex-col">
                  {selectedConversation ? (
                    <>
                      {/* Chat Header */}
                      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-8 w-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.colors.primary + '20' }}
                          >
                            <User className="h-4 w-4" style={{ color: theme.colors.primary }} />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium" style={{ color: theme.colors.text }}>
                              {selectedConversation.name}
                            </h4>
                            <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {selectedConversation.online ? trans.messages.online : trans.messages.offline}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="p-2 rounded-lg hover:opacity-70" style={{ color: theme.colors.text }}>
                            <Phone className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:opacity-70" style={{ color: theme.colors.text }}>
                            <Video className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length > 0 ? (
                          messages.map(message => (
                            <div 
                              key={message.id} 
                              className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user.id 
                                  ? 'rounded-br-none' 
                                  : 'rounded-bl-none'
                              }`} style={{
                                backgroundColor: message.sender_id === user.id 
                                  ? theme.colors.primary 
                                  : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                color: message.sender_id === user.id ? 'white' : theme.colors.text
                              }}>
                                {message.message_type === 'file' ? (
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <Paperclip className="h-4 w-4" />
                                      <span className="text-sm">{message.file_name}</span>
                                    </div>
                                    <button 
                                      className="text-xs underline hover:no-underline"
                                      onClick={() => window.open(message.file_url, '_blank')}
                                    >
                                      {trans.messages.downloadFile}
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-sm">{message.message}</p>
                                )}
                                
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs opacity-70">
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </p>
                                  {message.sender_id === user.id && (
                                    <span className="text-xs opacity-70">
                                      {message.is_read ? trans.messages.read : 
                                       message.is_delivered ? trans.messages.delivered : 
                                       trans.messages.sending}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                              {trans.messages.noMessages}
                            </p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                      
                      {/* Message Input */}
                      <div className="p-4 border-t" style={{ borderColor: theme.colors.border }}>
                        {fileUpload && (
                          <div className="mb-2 flex items-center space-x-2 p-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{fileUpload.name}</span>
                            <button 
                              onClick={() => setFileUpload(null)}
                              className="ml-auto p-1 rounded-full hover:opacity-70"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                          
                          <button
                            onClick={() => document.getElementById('file-upload').click()}
                            className="flex-shrink-0 p-2 rounded-lg hover:opacity-70"
                            style={{ color: theme.colors.text }}
                          >
                            <Paperclip className="h-5 w-5" />
                          </button>
                          
                          <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder={trans.messages.typeMessage}
                            className="flex-1 px-3 py-2 rounded-lg border"
                            style={{ 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                              borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                              color: theme.colors.text
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                              }
                            }}
                          />
                          
                          <button
                            onClick={sendMessage}
                            disabled={sendingMessage || (!messageInput.trim() && !fileUpload)}
                            className="flex-shrink-0 px-4 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: theme.colors.primary }}
                          >
                            <Send className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                        Select a conversation to start messaging
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                    <Bell className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                    {trans.notifications.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.notifications.subtitle}
                  </p>
                </div>
                
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                    className="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md shadow-sm hover:opacity-90"
                    style={{ 
                      backgroundColor: 'transparent',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {trans.notifications.markAllRead}
                  </button>
                )}
              </div>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map(notification => {
                      const now = new Date();
                      const createdDate = new Date(notification.created_at);
                      const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
                      
                      let timeStr = '';
                      if (diffDays === 0) {
                        timeStr = trans.notifications.today;
                      } else if (diffDays === 1) {
                        timeStr = trans.notifications.yesterday;
                      } else {
                        timeStr = `${diffDays} ${trans.notifications.daysAgo}`;
                      }
                      
                      let iconElement = null;
                      let bgColor = '';
                      let borderColor = '';
                      
                      switch (notification.type) {
                        case 'fertilizer_reminder':
                          iconElement = <Calendar className="h-5 w-5" style={{ color: isDark ? '#F9A8D4' : '#DB2777' }} />;
                          bgColor = isDark ? 'rgba(236, 72, 153, 0.1)' : '#FCE7F3';
                          borderColor = isDark ? '#EC4899' : '#DB2777';
                          break;
                        case 'new_document':
                          iconElement = <FileText className="h-5 w-5" style={{ color: isDark ? '#93C5FD' : '#2563EB' }} />;
                          bgColor = isDark ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF';
                          borderColor = isDark ? '#3B82F6' : '#2563EB';
                          break;
                        case 'new_prediction':
                          iconElement = <BarChart className="h-5 w-5" style={{ color: isDark ? '#6EE7B7' : '#059669' }} />;
                          bgColor = isDark ? 'rgba(16, 185, 129, 0.1)' : '#ECFDF5';
                          borderColor = isDark ? '#10B981' : '#059669';
                          break;
                        case 'message_from_adviser':
                        case 'new_message':
                          iconElement = <MessageSquare className="h-5 w-5" style={{ color: isDark ? '#FCD34D' : '#D97706' }} />;
                          bgColor = isDark ? 'rgba(245, 158, 11, 0.1)' : '#FFFBEB';
                          borderColor = isDark ? '#F59E0B' : '#D97706';
                          break;
                        case 'request_accepted':
                          iconElement = <UserCheck className="h-5 w-5" style={{ color: isDark ? '#4ADE80' : '#22C55E' }} />;
                          bgColor = isDark ? 'rgba(34, 197, 94, 0.1)' : '#F0FDF4';
                          borderColor = isDark ? '#22C55E' : '#16A34A';
                          break;
                        case 'request_received':
                          iconElement = <UserPlus className="h-5 w-5" style={{ color: isDark ? '#A5B4FC' : '#4F46E5' }} />;
                          bgColor = isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF';
                          borderColor = isDark ? '#6366F1' : '#4F46E5';
                          break;
                        default:
                          iconElement = <Bell className="h-5 w-5" style={{ color: isDark ? '#A5B4FC' : '#4F46E5' }} />;
                          bgColor = isDark ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF';
                          borderColor = isDark ? '#6366F1' : '#4F46E5';
                      }
                      
                      return (
                        <div 
                          key={notification.id}
                          className={`rounded-lg p-4 ${notification.read ? 'opacity-70' : ''}`}
                          style={{ 
                            backgroundColor: bgColor,
                            borderLeft: `4px solid ${borderColor}`
                          }}
                        >
                          <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                              {iconElement}
                            </div>
                            <div className="ml-3 flex-1">
                              <h3 className="text-sm font-medium" style={{ 
                                color: notification.read 
                                  ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)')
                                  : theme.colors.text
                              }}>
                                {notification.title}
                              </h3>
                              <p className="mt-1 text-sm" style={{ 
                                color: notification.read 
                                  ? (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)')
                                  : (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)')
                              }}>
                                {notification.message}
                              </p>
                              <div className="mt-2 flex justify-between items-center">
                                <p className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {timeStr}
                                </p>
                                
                                <div className="flex space-x-2">
                                  {(notification.type === 'new_message' || notification.type === 'message_from_adviser') && (
                                    <button
                                      onClick={() => setActiveSection('messages')}
                                      className="inline-flex items-center px-2 py-1 text-xs rounded-md hover:opacity-90"
                                      style={{ 
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                        color: theme.colors.text
                                      }}
                                    >
                                      <MessageSquare className="mr-1 h-3 w-3" />
                                      {trans.notifications.viewMessage}
                                    </button>
                                  )}
                                  
                                  {!notification.read && (
                                    <button
                                      onClick={() => {
                                        setNotifications(notifications.map(n => 
                                          n.id === notification.id ? { ...n, read: true } : n
                                        ));
                                      }}
                                      className="inline-flex items-center px-2 py-1 text-xs rounded-md hover:opacity-90"
                                      style={{ 
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                        color: theme.colors.text
                                      }}
                                    >
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                      {trans.notifications.markRead}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.notifications.noNotifications}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Adviser Documents Section */}
        {activeSection === 'adviserDocuments' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                <FileText className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.adviserDocuments.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.adviserDocuments.subtitle}
              </p>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {documents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ 
                    divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.adviserDocuments.documentType}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          Title
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.adviserDocuments.description}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.adviserDocuments.uploadDate}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ 
                      divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }}>
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                            <span 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              style={{ 
                                backgroundColor: isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(75, 85, 99, 0.1)',
                                color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'
                              }}
                            >
                              {document.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: theme.colors.text }}>
                            {document.title}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: theme.colors.text }}>
                            {document.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                            {new Date(document.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <a
                                href={document.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-900"
                                style={{ color: theme.colors.primary }}
                              >
                                {trans.adviserDocuments.viewDocument}
                              </a>
                              <a
                                href={document.url}
                                download
                                className="text-indigo-600 hover:text-indigo-900"
                                style={{ color: theme.colors.primary }}
                              >
                                {trans.adviserDocuments.downloadDocument}
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.adviserDocuments.noDocuments}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cultivation Dates Section */}
        {activeSection === 'cultivationDates' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                    <Calendar className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                    {trans.cultivationDates.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.cultivationDates.subtitle}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAddCultivation(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {trans.cultivationDates.addDate}
                </button>
              </div>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {showAddCultivation && (
                <div className="bg-opacity-10 rounded-lg p-4 mb-6" style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                      {trans.cultivationDates.addDate}
                    </h3>
                    <button
                      onClick={() => setShowAddCultivation(false)}
                      className="p-1 rounded-full hover:opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.cultivationDates.crop}
                      </label>
                      <select
                        name="crop_id"
                        value={cultivationForm.crop_id}
                        onChange={(e) => setCultivationForm({...cultivationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <option value="">{trans.cultivationDates.selectCrop}</option>
                        {AVAILABLE_CROPS.map(crop => (
                          <option key={crop.id} value={crop.id}>{crop.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.cultivationDates.plantingDate}
                      </label>
                      <input
                        type="date"
                        name="planting_date"
                        value={cultivationForm.planting_date}
                        onChange={(e) => setCultivationForm({...cultivationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.cultivationDates.expectedHarvest}
                      </label>
                      <input
                        type="date"
                        name="expected_harvest"
                        value={cultivationForm.expected_harvest}
                        onChange={(e) => setCultivationForm({...cultivationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.cultivationDates.status}
                      </label>
                      <select
                        name="status"
                        value={cultivationForm.status}
                        onChange={(e) => setCultivationForm({...cultivationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <option value="planned">{trans.cultivationDates.planned}</option>
                        <option value="active">{trans.cultivationDates.active}</option>
                        <option value="completed">{trans.cultivationDates.completed}</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.cultivationDates.notes}
                      </label>
                      <textarea
                        name="notes"
                        value={cultivationForm.notes}
                        onChange={(e) => setCultivationForm({...cultivationForm, [e.target.name]: e.target.value})}
                        placeholder={trans.cultivationDates.enterNotes}
                        rows={3}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddCultivation(false)}
                      className="px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90"
                      style={{ 
                        backgroundColor: 'transparent',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: theme.colors.text
                      }}
                    >
                      {trans.cultivationDates.cancel}
                    </button>
                    <button
                      onClick={() => {
                        const newCultivation = {
                          id: Date.now(),
                          user_id: user.id,
                          crop_id: cultivationForm.crop_id,
                          crop_name: AVAILABLE_CROPS.find(crop => crop.id === cultivationForm.crop_id)?.name || cultivationForm.crop_id,
                          planting_date: new Date(cultivationForm.planting_date),
                          expected_harvest: new Date(cultivationForm.expected_harvest),
                          status: cultivationForm.status,
                          notes: cultivationForm.notes
                        };
                        setCultivationDates([newCultivation, ...cultivationDates]);
                        setShowAddCultivation(false);
                        setCultivationForm({
                          crop_id: '',
                          planting_date: '',
                          expected_harvest: '',
                          status: 'planned',
                          notes: ''
                        });

                        // Add notification
                        const newNotification = {
                          id: Date.now() + 1,
                          user_id: user.id,
                          type: 'cultivation_added',
                          title: 'Cultivation Date Added',
                          message: `New cultivation cycle added for ${newCultivation.crop_name}`,
                          read: false,
                          created_at: new Date()
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white hover:opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {trans.cultivationDates.save}
                    </button>
                  </div>
                </div>
              )}
              
              {cultivationDates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ 
                    divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.cultivationDates.crop}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.cultivationDates.plantingDate}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.cultivationDates.expectedHarvest}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.cultivationDates.status}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.cultivationDates.daysToHarvest}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ 
                      divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }}>
                      {cultivationDates.map((cultivation) => {
                        let statusColor = '';
                        if (cultivation.status === 'active') {
                          statusColor = isDark ? '#4ADE80' : '#22C55E';
                        } else if (cultivation.status === 'planned') {
                          statusColor = isDark ? '#3B82F6' : '#2563EB';
                        } else {
                          statusColor = isDark ? '#F87171' : '#DC2626';
                        }
                        
                        const now = new Date();
                        const harvestDate = new Date(cultivation.expected_harvest);
                        const daysToHarvest = daysBetween(now, harvestDate);
                        const isPast = harvestDate < now;
                        
                        return (
                          <tr key={cultivation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                              {cultivation.crop_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                              {new Date(cultivation.planting_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                              {new Date(cultivation.expected_harvest).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span 
                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                style={{ 
                                  backgroundColor: isDark ? `${statusColor}20` : `${statusColor}15`,
                                  color: statusColor
                                }}
                              >
                                {cultivation.status === 'active' ? trans.cultivationDates.active :
                                 cultivation.status === 'planned' ? trans.cultivationDates.planned :
                                 trans.cultivationDates.completed}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                              {cultivation.status === 'completed' ? '-' : (
                                <div className="flex items-center">
                                  {isPast ? (
                                    <span className="px-2 py-1 text-xs rounded-md" style={{ 
                                      backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                                      color: isDark ? '#FCA5A5' : '#DC2626'
                                    }}>
                                      <ArrowUp className="inline-block h-3 w-3 mr-1" />
                                      {daysToHarvest} {trans.timer.days}
                                    </span>
                                  ) : (
                                    <span className="px-2 py-1 text-xs rounded-md" style={{ 
                                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                      color: isDark ? '#6EE7B7' : '#047857'
                                    }}>
                                      <ArrowDown className="inline-block h-3 w-3 mr-1" />
                                      {daysToHarvest} {trans.timer.days}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.cultivationDates.noDates}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fertilizer Calendar Section */}
        {activeSection === 'fertilizerCalendar' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                    <Calendar className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                    {trans.fertilizerCalendar.title}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.fertilizerCalendar.subtitle}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowAddApplication(true)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                  style={{ backgroundColor: theme.colors.primary }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {trans.fertilizerCalendar.addApplication}
                </button>
              </div>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              {showAddApplication && (
                <div className="bg-opacity-10 rounded-lg p-4 mb-6" style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium" style={{ color: theme.colors.text }}>
                      {trans.fertilizerCalendar.addApplication}
                    </h3>
                    <button
                      onClick={() => setShowAddApplication(false)}
                      className="p-1 rounded-full hover:opacity-70"
                      style={{ color: theme.colors.text }}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.fertilizerCalendar.crop}
                      </label>
                      <select
                        name="crop_id"
                        value={applicationForm.crop_id}
                        onChange={(e) => setApplicationForm({...applicationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <option value="">{trans.fertilizerCalendar.selectCrop}</option>
                        {AVAILABLE_CROPS.map(crop => (
                          <option key={crop.id} value={crop.id}>{crop.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.fertilizerCalendar.date}
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={applicationForm.date}
                        onChange={(e) => setApplicationForm({...applicationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.fertilizerCalendar.fertilizerType}
                      </label>
                      <select
                        name="fertilizer_type"
                        value={applicationForm.fertilizer_type}
                        onChange={(e) => setApplicationForm({...applicationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      >
                        <option value="">{trans.fertilizerCalendar.selectFertilizer}</option>
                        {FERTILIZER_TYPES.map(fertilizer => (
                          <option key={fertilizer.id} value={fertilizer.name}>{fertilizer.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.fertilizerCalendar.quantity}
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={applicationForm.quantity}
                        onChange={(e) => setApplicationForm({...applicationForm, [e.target.name]: e.target.value})}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1" style={{ color: theme.colors.text }}>
                        {trans.fertilizerCalendar.notes}
                      </label>
                      <textarea
                        name="notes"
                        value={applicationForm.notes}
                        onChange={(e) => setApplicationForm({...applicationForm, [e.target.name]: e.target.value})}
                        placeholder={trans.fertilizerCalendar.enterNotes}
                        rows={3}
                        className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                        style={{ 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text,
                          borderWidth: '1px',
                          padding: '0.5rem 0.75rem'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowAddApplication(false)}
                      className="px-4 py-2 border rounded-md text-sm font-medium hover:opacity-90"
                      style={{ 
                        backgroundColor: 'transparent',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: theme.colors.text
                      }}
                    >
                      {trans.fertilizerCalendar.cancel}
                    </button>
                    <button
                      onClick={() => {
                        const newApplication = {
                          id: Date.now(),
                          user_id: user.id,
                          crop_id: applicationForm.crop_id,
                          crop_name: AVAILABLE_CROPS.find(crop => crop.id === applicationForm.crop_id)?.name || applicationForm.crop_id,
                          date: new Date(applicationForm.date),
                          fertilizer_type: applicationForm.fertilizer_type,
                          quantity: applicationForm.quantity,
                          notes: applicationForm.notes
                        };
                        setFertilizerApplications([newApplication, ...fertilizerApplications]);
                        setShowAddApplication(false);
                        setApplicationForm({
                          crop_id: '',
                          date: '',
                          fertilizer_type: '',
                          quantity: '',
                          notes: ''
                        });

                        // Add notification
                        const newNotification = {
                          id: Date.now() + 1,
                          user_id: user.id,
                          type: 'fertilizer_scheduled',
                          title: 'Fertilizer Application Scheduled',
                          message: `${newApplication.fertilizer_type} scheduled for ${newApplication.crop_name}`,
                          read: false,
                          created_at: new Date()
                        };
                        setNotifications(prev => [newNotification, ...prev]);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white hover:opacity-90"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {trans.fertilizerCalendar.save}
                    </button>
                  </div>
                </div>
              )}
              
              {fertilizerApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y" style={{ 
                    divideColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.fertilizerCalendar.date}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.fertilizerCalendar.crop}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.fertilizerCalendar.fertilizerType}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.fertilizerCalendar.quantity}
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                          {trans.fertilizerCalendar.notes}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ 
                      divideColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }}>
                      {fertilizerApplications
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(application => {
                          const appDate = new Date(application.date);
                          const isToday = new Date().toDateString() === appDate.toDateString();
                          const isPast = appDate < new Date();
                          
                          return (
                            <tr key={application.id}>
                              <td 
                                className="px-6 py-4 whitespace-nowrap text-sm" 
                                style={{ 
                                  color: isToday 
                                    ? (isDark ? '#F9A8D4' : '#DB2777')
                                    : isPast
                                    ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
                                    : theme.colors.text,
                                  fontWeight: isToday ? 'bold' : 'normal'
                                }}
                              >
                                {appDate.toLocaleDateString()}
                                {isToday && (
                                  <span 
                                    className="ml-2 px-2 py-0.5 text-xs rounded-full"
                                    style={{
                                      backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3',
                                      color: isDark ? '#F9A8D4' : '#DB2777'
                                    }}
                                  >
                                    {trans.fertilizerCalendar.today}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                {application.crop_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                {application.fertilizer_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: theme.colors.text }}>
                                {application.quantity} kg/ha
                              </td>
                              <td className="px-6 py-4 text-sm" style={{ color: theme.colors.text }}>
                                {application.notes}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                    {trans.fertilizerCalendar.noApplications}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timer Section */}
        {activeSection === 'timer' && (
          <div className="shadow overflow-hidden sm:rounded-lg" style={{ 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            color: theme.colors.text
          }}>
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg leading-6 font-medium flex items-center" style={{ color: theme.colors.text }}>
                <Clock className="mr-2 h-5 w-5" style={{ color: theme.colors.primary }} />
                {trans.timer.title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                {trans.timer.subtitle}
              </p>
            </div>
            
            <div className="border-t px-4 py-5" style={{ borderColor: theme.colors.border }}>
              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: theme.colors.text }}>
                    {trans.timer.selectCrop}
                  </label>
                  <select
                    className="block w-full rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#fff',
                      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                      color: theme.colors.text,
                      borderWidth: '1px',
                      padding: '0.5rem 0.75rem'
                    }}
                    value={selectedCultivation ? selectedCultivation.id : ''}
                    onChange={(e) => {
                      const cultivationId = parseInt(e.target.value);
                      const selected = cultivationDates.find(cultivation => cultivation.id === cultivationId);
                      setSelectedCultivation(selected);
                      if (selected) {
                        const plantingDate = new Date(selected.planting_date);
                        const now = new Date();
                        const elapsed = now.getTime() - plantingDate.getTime();
                        setElapsedTime(Math.floor(elapsed / 1000));
                      }
                    }}
                  >
                    <option value="">-- {trans.timer.selectCrop} --</option>
                    {cultivationDates
                      .filter(cultivation => cultivation.status === 'active')
                      .map(cultivation => (
                        <option key={cultivation.id} value={cultivation.id}>
                          {cultivation.crop_name} ({new Date(cultivation.planting_date).toLocaleDateString()})
                        </option>
                      ))}
                  </select>
                </div>
                
                {selectedCultivation ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg text-center" style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.025)'
                    }}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                        {trans.timer.elapsed}
                      </h3>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {(() => {
                          const time = formatTime(elapsedTime);
                          return (
                            <>
                              <div className="flex flex-col">
                                <div className="text-3xl font-mono" style={{ color: theme.colors.text }}>
                                  {time.days}
                                </div>
                                <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.timer.days}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-3xl font-mono" style={{ color: theme.colors.text }}>
                                  {time.hours.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.timer.hours}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-3xl font-mono" style={{ color: theme.colors.text }}>
                                  {time.minutes.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.timer.minutes}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="text-3xl font-mono" style={{ color: theme.colors.text }}>
                                  {time.seconds.toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
                                  {trans.timer.seconds}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
                          {trans.timer.remaining}
                        </h3>
                        {(() => {
                          const now = new Date();
                          const harvestDate = new Date(selectedCultivation.expected_harvest);
                          const timeToHarvest = Math.max(0, Math.floor((harvestDate - now) / 1000));
                          const time = formatTime(timeToHarvest);
                          return (
                            <div className="text-lg font-medium" style={{ color: theme.colors.text }}>
                              {time.days} {trans.timer.days}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      {timerRunning ? (
                        <button
                          onClick={() => setTimerRunning(false)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                          style={{ backgroundColor: isDark ? '#EC4899' : '#DB2777' }}
                        >
                          <Pause className="mr-2 h-4 w-4" />
                          {trans.timer.pause}
                        </button>
                      ) : (
                        <button
                          onClick={() => setTimerRunning(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {trans.timer.start}
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setTimerRunning(false);
                          setElapsedTime(0);
                          if (selectedCultivation) {
                            const plantingDate = new Date(selectedCultivation.planting_date);
                            const now = new Date();
                            const elapsed = now.getTime() - plantingDate.getTime();
                            setElapsedTime(Math.floor(elapsed / 1000));
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm hover:opacity-90"
                        style={{ 
                          backgroundColor: 'transparent',
                          borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                          color: theme.colors.text
                        }}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {trans.timer.reset}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-sm" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }}>
                      {trans.timer.noCultivation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeWrapper>
  );
}