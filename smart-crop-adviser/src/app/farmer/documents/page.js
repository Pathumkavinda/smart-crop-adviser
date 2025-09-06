'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import DocumentsForAdvisers from '@/components/document-for-adviser';

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, '');

// Translations for multi-language support
const translations = {
  en: {
    pageTitle: 'Documents from Adviser',
    noFarmerSelected: 'No farmer selected. Please open this page with',
    urlParameter: 'in the URL, or ensure you are logged in as a farmer. If you previously selected a farmer from the adviser dashboard, that selection will also be used automatically.'
  },
  si: {
    pageTitle: 'උපදේශකගෙන් ලැබුණු ලේඛන',
    noFarmerSelected: 'ගොවියෙකු තෝරාගෙන නැත. කරුණාකර මෙම පිටුව විවෘත කරන්න',
    urlParameter: 'URL එකෙහි, හෝ ඔබ ගොවියෙකු ලෙස ඇතුළු වී ඇති බව සහතික කරන්න. ඔබ කලින් උපදේශක ඩැෂ්බෝඩ් එකෙන් ගොවියෙකු තෝරාගෙන ඇත්නම්, එම තේරීම ද ස්වයංක්‍රීයව භාවිතා වනු ඇත.'
  },
  ta: {
    pageTitle: 'ஆலோசகரின் ஆவணங்கள்',
    noFarmerSelected: 'விவசாயி தேர்ந்தெடுக்கப்படவில்லை. இந்தப் பக்கத்தை திறக்கவும்',
    urlParameter: 'URL இல், அல்லது நீங்கள் விவசாயியாக உள்நுழைந்துள்ளீர்கள் என்பதை உறுதிசெய்யவும். முன்னதாக ஆலோசகர் டாஷ்போர்டிலிருந்து ஒரு விவசாயியைத் தேர்ந்தெடுத்திருந்தால், அந்தத் தேர்வும் தானாகவே பயன்படுத்தப்படும்.'
  }
};

export default function FarmerDocumentsPage() {
  const params = useSearchParams();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const { language } = useLanguage();
  
  // Get translations for the selected language
  const trans = translations[language] || translations.en;

  // 1) From URL (?farmerId=)
  const paramFarmerId = useMemo(() => {
    const v = params?.get('farmerId');
    const n = v ? Number(v) : null;
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [params]);

  // 2) Resolve farmerId with fallbacks (cache -> auth -> null)
  const [farmerId, setFarmerId] = useState(paramFarmerId);

  useEffect(() => {
    let id = paramFarmerId;

    // Fallback: cached selection from Adviser flow
    if (!id && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('adviser_docs_selected_farmer');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.id) {
            const n = Number(parsed.id);
            if (Number.isFinite(n) && n > 0) id = n;
          }
        }
      } catch {}
    }

    // Fallback: logged-in user's own id (farmer portal)
    if (!id && authUser?.id) {
      const n = Number(authUser.id);
      if (Number.isFinite(n) && n > 0) id = n;
    }

    setFarmerId(id ?? null);
  }, [paramFarmerId, authUser?.id]);

  // Get text style based on language
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: language === 'si' ? 1.7 : language === 'ta' ? 1.8 : 1.5 
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 
        className="text-2xl font-semibold mb-4" 
        style={{ 
          color: theme.colors.text,
          ...getTextStyle()
        }}
      >
        {trans.pageTitle}
      </h1>

      {!farmerId ? (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: theme.colors.text,
            ...getTextStyle()
          }}
        >
          {trans.noFarmerSelected} <code>?farmerId=</code> {trans.urlParameter}
        </div>
      ) : (
        <DocumentsForAdvisers
          apiBase={API_URL}
          farmerId={farmerId}
          language={language}
          readOnly={true}   // 👈 Farmer can only view/download
        />
      )}
    </div>
  );
}