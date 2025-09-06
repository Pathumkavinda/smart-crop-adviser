'use client';

import ThemeWrapper from '@/components/ThemeWrapper'; 
import NotificationsPage from '@/components/NotificationsPage';
import { useLanguage } from '@/context/LanguageContext';

export default function Notifications() {
  // Get the current language from context
  const { language } = useLanguage();

  return (
    <ThemeWrapper>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <NotificationsPage farmerOnly language={language} />
      </div>
    </ThemeWrapper>
  ); 
}