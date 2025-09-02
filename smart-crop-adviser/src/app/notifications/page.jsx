'use client';

import ThemeWrapper from '@/components/ThemeWrapper';
import NotificationsPage from '@/components/NotificationsPage';

export default function Notifications() {
  return (
    <ThemeWrapper>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <NotificationsPage farmerOnly />
      </div>
    </ThemeWrapper>
  );
}
