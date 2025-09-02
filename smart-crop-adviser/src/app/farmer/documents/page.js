'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import DocumentsForAdvisers from '@/components/document-for-adviser';

const RAW_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_URL = RAW_API.replace(/\/+$/, '');

export default function FarmerDocumentsPage() {
  const params = useSearchParams();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4" style={{ color: theme.colors.text }}>
        Documents from Adviser
      </h1>

      {!farmerId ? (
        <div
          className="rounded-md px-4 py-3 text-sm"
          style={{
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: 'rgba(0,0,0,0.06)',
            color: theme.colors.text,
          }}
        >
          No farmer selected. Please open this page with <code>?farmerId=</code> in the URL,
          or ensure you are logged in as a farmer. If you previously selected a farmer from the adviser
          dashboard, that selection will also be used automatically.
        </div>
      ) : (
        <DocumentsForAdvisers
          apiBase={API_URL}
          farmerId={farmerId}
          readOnly={true}   // 👈 Farmer can only view/download
        />
      )}
    </div>
  );
}
