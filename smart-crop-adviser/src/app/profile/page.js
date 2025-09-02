// app/profile/page.js
'use client';
import ThemeWrapper from '@/components/ThemeWrapper';
import ProfileSettings from '@/components/ProfileSettings';

export default function ProfilePage() {
  return (
    <ThemeWrapper>
      <div className="min-h-[80vh] py-8 px-4">
        <ProfileSettings />
      </div>
    </ThemeWrapper>
  );
}
