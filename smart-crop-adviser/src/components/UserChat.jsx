'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext'; // Import language context
import { Paperclip, Send, MessageSquare, Search, X, Users, AlertTriangle, Download, ChevronUp } from 'lucide-react';

// ---------- ENV ----------
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ---------- helpers ----------
const toInt = (v) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};
const safeText = (s) => (typeof s === 'string' ? s : '');
const safeFilename = (name, fallback = 'download') => {
  const n = (name || '').trim().replace(/[\\/:*?"<>|]+/g, '_').slice(0, 150);
  return n || fallback;
};

// download helper: streams a blob and triggers a file save
async function downloadFile(url, filename) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download (${res.status})`);
  const blob = await res.blob();
  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = safeFilename(filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

// export helpers
function exportThreadAsTxt(messages, myId) {
  const lines = messages.map((m) => {
    const ts = m.created_at ? new Date(m.created_at).toISOString() : '';
    const who = toInt(m.sender_id) === toInt(myId) ? 'Me' : `User #${m.sender_id}`;
    const text = (m.text || '').replace(/\r?\n/g, ' ');
    const files = Array.isArray(m.files) && m.files.length
      ? ` [files: ${m.files.map((f) => f.original_name || 'file').join(', ')}]`
      : '';
    return `[${ts}] ${who}: ${text}${files}`;
  });
  return lines.join('\n');
}
function triggerDownloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename(filename);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function UserChat({ onUnreadChange }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { language, translations } = useLanguage(); // Get language and translations

  // Translations for UserChat component
  const chatTranslations = {
    en: {
      tabs: {
        conversations: 'Conversations',
        agents: 'Agents',
      },
      search: {
        searchConversations: 'Search conversations...',
        searchAgents: 'Search agents...',
      },
      chat: {
        selectConversation: 'Select a conversation',
        pickAgent: 'Pick an agent to start chat',
        noConversations: 'No conversations',
        noAgents: 'No agents available',
        noMessages: 'No messages yet',
        typeMessage: 'Type your message…',
        send: 'Send',
        sending: 'Sending…',
        attached: 'Attached:',
        remove: 'remove',
        chat: 'Chat',
      },
      status: {
        read: 'Read',
        delivered: 'Delivered',
        sent: 'Sent',
      },
      export: {
        exportAsTxt: 'TXT',
        exportAsJson: 'JSON',
      },
      errors: {
        notLoggedIn: 'You are not logged in.',
        selectRecipient: 'Select a valid recipient to send a message.',
        cannotSendToSelf: 'You cannot send messages to yourself.',
        invalidRecipient: 'Invalid recipient ID for this conversation.',
        invalidAgent: 'Invalid agent ID.',
        fileTooLarge: 'File size must be less than 10MB',
        downloadFailed: 'Download failed',
        sendFailed: 'Failed to send message.',
      },
      scrollToTop: 'Scroll to top',
    },
    si: {
      tabs: {
        conversations: 'සංවාද',
        agents: 'නියෝජිතයන්',
      },
      search: {
        searchConversations: 'සංවාද සොයන්න...',
        searchAgents: 'නියෝජිතයන් සොයන්න...',
      },
      chat: {
        selectConversation: 'සංවාදයක් තෝරන්න',
        pickAgent: 'කතාබහ ආරම්භ කිරීමට නියෝජිතයෙකු තෝරන්න',
        noConversations: 'සංවාද නැත',
        noAgents: 'නියෝජිතයන් නොමැත',
        noMessages: 'තවම පණිවිඩ නැත',
        typeMessage: 'ඔබේ පණිවිඩය ටයිප් කරන්න…',
        send: 'යවන්න',
        sending: 'යවමින්…',
        attached: 'අමුණා ඇත:',
        remove: 'ඉවත් කරන්න',
        chat: 'කතාබහ',
      },
      status: {
        read: 'කියවා ඇත',
        delivered: 'ලැබී ඇත',
        sent: 'යවා ඇත',
      },
      export: {
        exportAsTxt: 'TXT',
        exportAsJson: 'JSON',
      },
      errors: {
        notLoggedIn: 'ඔබ පුරනය වී නැත.',
        selectRecipient: 'පණිවිඩයක් යැවීමට වලංගු ලබන්නෙකු තෝරන්න.',
        cannotSendToSelf: 'ඔබට ඔබටම පණිවිඩ යැවිය නොහැක.',
        invalidRecipient: 'මෙම සංවාදය සඳහා වලංගු නොවන ලබන්නා ID එකක්.',
        invalidAgent: 'වලංගු නොවන නියෝජිත ID එකක්.',
        fileTooLarge: 'ගොනු ප්‍රමාණය 10MB ට වඩා අඩු විය යුතුය',
        downloadFailed: 'බාගත කිරීම අසාර්ථක විය',
        sendFailed: 'පණිවිඩය යැවීම අසාර්ථක විය.',
      },
      scrollToTop: 'ඉහළට ස්ක්‍රෝල් කරන්න',
    },
    ta: {
      tabs: {
        conversations: 'உரையாடல்கள்',
        agents: 'முகவர்கள்',
      },
      search: {
        searchConversations: 'உரையாடல்களைத் தேடுங்கள்...',
        searchAgents: 'முகவர்களைத் தேடுங்கள்...',
      },
      chat: {
        selectConversation: 'உரையாடலைத் தேர்ந்தெடுக்கவும்',
        pickAgent: 'அரட்டையைத் தொடங்க ஒரு முகவரைத் தேர்ந்தெடுக்கவும்',
        noConversations: 'உரையாடல்கள் இல்லை',
        noAgents: 'முகவர்கள் இல்லை',
        noMessages: 'இன்னும் செய்திகள் இல்லை',
        typeMessage: 'உங்கள் செய்தியை தட்டச்சு செய்யவும்…',
        send: 'அனுப்பு',
        sending: 'அனுப்புகிறது…',
        attached: 'இணைக்கப்பட்டது:',
        remove: 'அகற்று',
        chat: 'அரட்டை',
      },
      status: {
        read: 'படித்தது',
        delivered: 'வழங்கப்பட்டது',
        sent: 'அனுப்பப்பட்டது',
      },
      export: {
        exportAsTxt: 'TXT',
        exportAsJson: 'JSON',
      },
      errors: {
        notLoggedIn: 'நீங்கள் உள்நுழையவில்லை.',
        selectRecipient: 'செய்தி அனுப்ப சரியான பெறுநரைத் தேர்ந்தெடுக்கவும்.',
        cannotSendToSelf: 'உங்களுக்கு நீங்களே செய்திகளை அனுப்ப முடியாது.',
        invalidRecipient: 'இந்த உரையாடலுக்கு தவறான பெறுநர் ஐடி.',
        invalidAgent: 'தவறான முகவர் ஐடி.',
        fileTooLarge: 'கோப்பு அளவு 10MB க்கும் குறைவாக இருக்க வேண்டும்',
        downloadFailed: 'பதிவிறக்கம் தோல்வியடைந்தது',
        sendFailed: 'செய்தி அனுப்புவது தோல்வியடைந்தது.',
      },
      scrollToTop: 'மேலே ஸ்க்ரோல் செய்யவும்',
    }
  };

  // Get translations for current language or fallback to English
  const t = chatTranslations[language] || chatTranslations.en;

  // Font size adjustments for non-English languages
  const getLocalizedFontSize = (defaultSize) => {
    if (language === 'ta') {
      return '0.7rem'; // Smaller size for Tamil
    } else if (language === 'si') {
      return '0.8rem'; // Slightly larger for Sinhala
    }
    return defaultSize; // Default for English
  };

  const colors = useMemo(() => {
    const c = theme?.colors || {};
    return {
      text: c.text || '#0f172a',
      card: c.card || '#ffffff',
      border: c.border || 'rgba(0,0,0,0.1)',
      primary: c.primary || '#2563eb',
    };
  }, [theme]);
  const isDark = (theme?.name || '').toLowerCase() === 'dark';

  // -------- UI State --------
  const [tab, setTab] = useState('convos'); // 'convos' | 'agents'
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [messageInput, setMessageInput] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [sending, setSending] = useState(false);

  const [search, setSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [uiError, setUiError] = useState('');
  
  // New scroll state
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // user profile cache: { [id]: { id, username, email, country } }
  const [userMap, setUserMap] = useState({});

  const tokenHeader = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const scrollToBottom = useCallback(
    () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
    []
  );
  
  useEffect(scrollToBottom, [messages, scrollToBottom]);
  
  // Detect scroll position for showing scroll-to-top button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;
    
    const handleScroll = () => {
      if (messagesContainer.scrollTop < -100) { // Scrolled up enough to show button
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    
    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Scroll to top function for the new button
  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // -------- helpers: fetch one user & cache it --------
  const fetchUserProfile = useCallback(async (id) => {
    const idNum = toInt(id);
    if (!idNum) return null;
    if (userMap[idNum]) return userMap[idNum];

    try {
      const res = await fetch(`${API_URL}/api/v1/users/${idNum}`, { headers: { ...tokenHeader() } });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      const u = json?.data || json?.user || null;
      if (!u) return null;

      const normalized = {
        id: toInt(u.id),
        username: u.username || u.name || `User #${idNum}`,
        email: u.email || '',
        // try dedicated 'country'; if absent, try last token of address; else empty
        country: u.country || (typeof u.address === 'string' ? u.address.split(',').pop()?.trim() : ''),
      };
      setUserMap((prev) => ({ ...prev, [idNum]: normalized }));
      return normalized;
    } catch {
      return null;
    }
  }, [API_URL, tokenHeader, userMap]);

  const hydrateConvoDisplay = useCallback(async (convos) => {
    // fetch missing profiles in parallel
    const missingIds = convos.map(c => c.id).filter((id) => !userMap[id]);
    if (missingIds.length) {
      await Promise.all(missingIds.map((id) => fetchUserProfile(id)));
    }
    // return convos with display fields
    return convos.map((c) => {
      const prof = userMap[c.id] || {};
      return {
        ...c,
        name: prof.username || c.name || `User #${c.id}`,
        email: prof.email || '',
        country: prof.country || '',
      };
    });
  }, [userMap, fetchUserProfile]);

  const displayName = useCallback((peerId) => {
    const prof = userMap[peerId];
    return prof?.username || `User #${peerId}`;
  }, [userMap]);

  // -------- API: Inbox (messages by user) --------
  const fetchInbox = useCallback(async () => {
    if (!user?.id) return;
    setUiError('');
    try {
      const res = await fetch(
        `${API_URL}/api/v1/messages/user/${toInt(user.id)}?page=1&limit=100`,
        { headers: { ...tokenHeader() } }
      );
      if (!res.ok) return;
      const json = await res.json().catch(() => null);
      const msgs = Array.isArray(json?.data) ? json.data : (json?.data?.messages ?? []);
      if (!Array.isArray(msgs)) return;

      // Group DMs by peer (DM only)
      const byPeer = new Map();
      for (const m of msgs) {
        const sid = toInt(m.sender_id);
        const rid = toInt(m.receiver_id);
        const myId = toInt(user.id);
        const peerId = sid === myId ? rid : sid;
        if (!peerId || peerId === myId) continue;

        const prev = byPeer.get(peerId) || { id: peerId, last: null, unread: 0 };
        if (!prev.last || new Date(m.created_at) > new Date(prev.last.created_at)) prev.last = m;
        if (rid === myId && !m.read_at) prev.unread += 1;
        byPeer.set(peerId, prev);
      }

      let convos = Array.from(byPeer.values())
        .map((c) => ({
          id: toInt(c.id),
          name: `User #${c.id}`,     // will hydrate below
          lastMessage: safeText(c.last?.text) || '',
          unreadCount: c.unread,
          online: false,
        }))
        .sort((a, b) => (b.unreadCount || 0) - (a.unreadCount || 0));

      // hydrate with username/country/email
      convos = await hydrateConvoDisplay(convos);
      setConversations(convos);

      onUnreadChange?.(convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
    } catch (e) {
      console.error('inbox error', e);
    }
  }, [user?.id, onUnreadChange, tokenHeader, hydrateConvoDisplay]);

  // -------- API: Agents --------
  const fetchAgents = useCallback(async () => {
    if (!user?.id) return;
    setUiError('');
    try {
      let res = await fetch(`${API_URL}/api/v1/users?userlevel=agent`, { headers: { ...tokenHeader() } });
      if (!res.ok) {
        res = await fetch(`${API_URL}/api/v1/users`, { headers: { ...tokenHeader() } });
      }
      if (!res.ok) return;

      const json = await res.json().catch(() => null);
      const list = Array.isArray(json?.data) ? json.data : json?.users || [];
      const myId = toInt(user.id);

      const onlyAgents = list
        .filter((u) => u?.userlevel === 'agent')
        .map((u) => ({ ...u, id: toInt(u?.id) }))
        .filter((u) => u.id && u.id !== myId);

      const normalized = onlyAgents.map((a) => ({
        id: a.id,
        name: a.username || a.name || a.email || `Agent #${a.id}`,
        email: a.email,
        userlevel: a.userlevel,
        online: !!a.online,
      }));

      setAgents(normalized);
    } catch (e) {
      console.error('agents error', e);
    }
  }, [user?.id, tokenHeader]);

  // -------- API: Thread (DM) --------
  const fetchThread = useCallback(
    async (peerId) => {
      const myId = toInt(user?.id);
      const otherId = toInt(peerId);
      if (!myId || !otherId) return;

      setUiError('');
      try {
        // ensure profile for header
        await fetchUserProfile(otherId);

        const res = await fetch(
          `${API_URL}/api/v1/messages/thread?userA=${myId}&userB=${otherId}&page=1&limit=50`,
          { headers: { ...tokenHeader() } }
        );
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        const list = Array.isArray(json?.data) ? json.data : [];
        setMessages(list);

        // mark read for my unread
        const unreadMine = list.filter((m) => toInt(m.receiver_id) === myId && !m.read_at);
        await Promise.allSettled(
          unreadMine.map((m) =>
            fetch(`${API_URL}/api/v1/messages/${m.id}/read`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', ...tokenHeader() },
            })
          )
        );
        void fetchInbox();
      } catch (e) {
        console.error('thread error', e);
      }
    },
    [user?.id, tokenHeader, fetchInbox, fetchUserProfile]
  );

  // -------- Initial loads --------
  useEffect(() => {
    void fetchInbox();
    void fetchAgents();
  }, [fetchInbox, fetchAgents]);

  // -------- Actions --------
  const onSelectConversation = async (c) => {
    const idNum = toInt(c?.id);
    if (!idNum) {
      setUiError(t.errors.invalidRecipient);
      return;
    }
    // ensure profile available for header
    const prof = await fetchUserProfile(idNum);
    setSelectedConversation({
      ...c,
      id: idNum,
      name: prof?.username || c.name || `User #${idNum}`,
      email: prof?.email || c.email || '',
      country: prof?.country || c.country || '',
    });
    setTab('convos');
    void fetchThread(idNum);
  };

  const startChatWithAgent = (agent) => {
    const idNum = toInt(agent?.id);
    if (!idNum) {
      setUiError(t.errors.invalidAgent);
      return;
    }
    const convo = {
      id: idNum,
      name: agent.name,
      email: agent.email,
      country: agent.country,
      lastMessage: '',
      unreadCount: 0,
      online: !!agent.online,
    };
    setConversations((prev) => (prev.some((x) => x.id === idNum) ? prev : [convo, ...prev]));
    onSelectConversation(convo);
  };

  const onPickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setUiError(t.errors.fileTooLarge);
      return;
    }
    setFileUpload(f);
  };

  const sendMessage = useCallback(async () => {
    const myId = toInt(user?.id);
    const receiverId = toInt(selectedConversation?.id);

    // ---- STRICT RECEIVER VALIDATION ----
    if (!myId) { setUiError(t.errors.notLoggedIn); return; }
    if (!receiverId) { setUiError(t.errors.selectRecipient); return; }
    if (receiverId === myId) { setUiError(t.errors.cannotSendToSelf); return; }
    if (!messageInput.trim() && !fileUpload) return;

    setUiError('');
    setSending(true);
    try {
      let files = [];
      // 1) upload first if any
      if (fileUpload) {
        const form = new FormData();
        form.append('file', fileUpload);
        const up = await fetch(`${API_URL}/api/v1/files/upload`, {
          method: 'POST',
          headers: { ...tokenHeader() }, // don't set content-type manually
          body: form,
        });
        if (!up.ok) throw new Error('Upload failed');
        const meta = (await up.json())?.file;
        if (meta?.path || meta?.filepath) {
          files.push({
            path: meta.path || meta.filepath,
            original_name: meta.original_name,
            mime_type: meta.mime_type,
            size_bytes: meta.size_bytes,
          });
        }
      }

      // 2) create message with numeric receiver_id
      const body = {
        sender_id: myId,
        receiver_id: receiverId,
        text: messageInput.trim() || undefined,
        files,
      };
      const res = await fetch(`${API_URL}/api/v1/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Send failed');
      }
      const out = await res.json().catch(() => null);

      if (out?.success && out?.data) {
        setMessages((prev) => [...prev, out.data]);
        setMessageInput('');
        setFileUpload(null);
        void fetchInbox();
      }
    } catch (e) {
      console.error('send error', e);
      setUiError(e?.message || t.errors.sendFailed);
    } finally {
      setSending(false);
    }
  }, [fileUpload, messageInput, selectedConversation?.id, user?.id, tokenHeader, fetchInbox, t]);

  // exports
  const exportTxt = () => {
    if (!selectedConversation) return;
    const txt = exportThreadAsTxt(messages, user?.id);
    const fname = `chat_${toInt(user?.id)}_${toInt(selectedConversation.id)}.txt`;
    triggerDownloadText(txt, fname);
  };
  const exportJson = () => {
    if (!selectedConversation) return;
    const fname = `chat_${toInt(user?.id)}_${toInt(selectedConversation.id)}.json`;
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = safeFilename(fname);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // -------- Filters --------
  const filteredConvos = useMemo(
    () =>
      conversations.filter(
        (c) =>
          !search ||
          (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
          (c.lastMessage || '').toLowerCase().includes(search.toLowerCase()) ||
          (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
          (c.country || '').toLowerCase().includes(search.toLowerCase())
      ),
    [conversations, search]
  );

  const filteredAgents = useMemo(
    () =>
      agents.filter(
        (a) =>
          !agentSearch ||
          a.name?.toLowerCase().includes(agentSearch.toLowerCase()) ||
          a.email?.toLowerCase().includes(agentSearch.toLowerCase())
      ),
    [agents, agentSearch]
  );

  // -------- Render --------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: tabs + lists */}
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-3">
          <button
            className={`px-3 py-1 rounded ${tab === 'convos' ? 'font-medium' : ''}`}
            onClick={() => setTab('convos')}
            style={{
              background: tab === 'convos' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontSize: getLocalizedFontSize('1rem')
            }}
          >
            {t.tabs.conversations}
          </button>
          <button
            className={`px-3 py-1 rounded ${tab === 'agents' ? 'font-medium' : ''}`}
            onClick={() => setTab('agents')}
            style={{
              background: tab === 'agents' ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              fontSize: getLocalizedFontSize('1rem')
            }}
          >
            {t.tabs.agents}
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4" />
          <input
            className="w-full bg-transparent outline-none text-sm"
            placeholder={tab === 'agents' ? t.search.searchAgents : t.search.searchConversations}
            value={tab === 'agents' ? agentSearch : search}
            onChange={(e) => (tab === 'agents' ? setAgentSearch(e.target.value) : setSearch(e.target.value))}
            style={{ 
              color: colors.text,
              fontSize: getLocalizedFontSize('0.875rem')
            }}
          />
          {(tab === 'agents' ? agentSearch : search) && (
            <button onClick={() => (tab === 'agents' ? setAgentSearch('') : setSearch(''))}>
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Lists */}
        <div className="space-y-2 max-h-[60vh] overflow-auto custom-scrollbar"
          style={{
            scrollbarWidth: 'thin', // For Firefox
            scrollbarColor: `${isDark ? 'rgba(255,255,255,0.3) rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3) rgba(255,255,255,0.1)'}`, // For Firefox
          }}>
          {tab === 'convos' &&
            (filteredConvos.length ? (
              filteredConvos.map((c) => (
                <button
                  key={`peer-${c.id}`}
                  onClick={() => onSelectConversation(c)}
                  className="w-full text-left rounded-md p-3 hover:opacity-90"
                  style={{
                    backgroundColor:
                      selectedConversation?.id === c.id
                        ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)')
                        : 'transparent',
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate" style={{ fontSize: getLocalizedFontSize('1rem') }}>
                        {c.name}
                      </div>
                      <div className="text-xs opacity-70 truncate" style={{ fontSize: getLocalizedFontSize('0.75rem') }}>
                        {(c.country ? `${c.country} • ` : '')}{c.email || '—'}
                      </div>
                      <div className="text-[11px] opacity-60 truncate" style={{ fontSize: getLocalizedFontSize('0.688rem') }}>
                        {c.lastMessage || '—'}
                      </div>
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: '#EF4444', color: 'white' }}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="text-sm opacity-70" style={{ 
                color: colors.text,
                fontSize: getLocalizedFontSize('0.875rem')
              }}>
                {t.chat.noConversations}
              </div>
            ))}

          {tab === 'agents' &&
            (filteredAgents.length ? (
              filteredAgents.map((a) => (
                <div
                  key={`agent-${a.id}`}
                  className="w-full rounded-md p-3 flex items-center justify-between"
                  style={{ border: `1px solid ${colors.border}`, color: colors.text }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="h-4 w-4" />
                    <div className="min-w-0">
                      <div className="font-medium truncate" style={{ fontSize: getLocalizedFontSize('1rem') }}>
                        {a.name}
                      </div>
                      <div className="text-xs opacity-70 truncate" style={{ fontSize: getLocalizedFontSize('0.75rem') }}>
                        {a.email}
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-sm px-2 py-1 rounded-md"
                    onClick={() => startChatWithAgent(a)}
                    style={{ 
                      backgroundColor: colors.primary,
                      color: 'white',
                      fontSize: getLocalizedFontSize('0.875rem')
                    }}
                  >
                    {t.chat.chat}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm opacity-70" style={{ 
                color: colors.text,
                fontSize: getLocalizedFontSize('0.875rem')
              }}>
                {t.chat.noAgents}
              </div>
            ))}
        </div>
      </div>

      {/* Right: thread + composer */}
      <div
        className="lg:col-span-2 rounded-lg flex flex-col"
        style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}` }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: colors.border, color: colors.text }}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ fontSize: getLocalizedFontSize('1rem') }}>
                  {selectedConversation ? (displayName(selectedConversation.id)) : (tab === 'agents' ? t.chat.pickAgent : t.chat.selectConversation)}
                </div>
                {selectedConversation && (
                  <div className="text-xs opacity-70 truncate" style={{ fontSize: getLocalizedFontSize('0.75rem') }}>
                    {(selectedConversation.country ? `${selectedConversation.country} • ` : '')}
                    {selectedConversation.email || ''}
                  </div>
                )}
              </div>
            </div>

            {/* Export buttons */}
            {selectedConversation && (
              <div className="flex items-center gap-2">
                <button
                  className="text-xs px-2 py-1 rounded-md inline-flex items-center gap-1"
                  onClick={exportTxt}
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: getLocalizedFontSize('0.75rem')
                  }}
                  title="Export thread as TXT"
                >
                  <Download className="h-3 w-3" /> {t.export.exportAsTxt}
                </button>
                <button
                  className="text-xs px-2 py-1 rounded-md inline-flex items-center gap-1"
                  onClick={exportJson}
                  style={{ 
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: getLocalizedFontSize('0.75rem')
                  }}
                  title="Export thread as JSON"
                >
                  <Download className="h-3 w-3" /> {t.export.exportAsJson}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error banner */}
        {uiError && (
          <div className="px-4 py-2 text-sm flex items-center gap-2" style={{ 
            color: '#b91c1c',
            fontSize: getLocalizedFontSize('0.875rem')
          }}>
            <AlertTriangle className="h-4 w-4" />
            <span>{uiError}</span>
          </div>
        )}

        {/* Messages */}
        <div 
          ref={messagesContainerRef} 
          className="flex-1 p-4 overflow-auto space-y-3 relative"
        >
          {selectedConversation ? (
            messages.length > 0 ? (
              messages.map((m) => {
                const mine = toInt(m.sender_id) === toInt(user?.id);
                const key = m.id ?? `${m.sender_id}-${m.receiver_id}-${m.created_at ?? Math.random()}`;
                return (
                  <div key={key} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="rounded-lg px-3 py-2 max-w-[80%]"
                      style={{
                        backgroundColor: mine
                          ? colors.primary
                          : isDark
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.05)',
                        color: mine ? 'white' : colors.text,
                      }}
                    >
                      {m.text && (
                        <div className="whitespace-pre-wrap text-sm" style={{ fontSize: getLocalizedFontSize('0.875rem') }}>
                          {m.text}
                        </div>
                      )}

                      {/* Attachments with download chip */}
                      {Array.isArray(m.files) &&
                        m.files.map((f, i) => {
                          const displayName = f.original_name || 'file';
                          const href = `${API_URL}${(f.path || f.filepath || '').startsWith('/') ? '' : '/'}${f.path || f.filepath || ''}`;
                          return (
                            <div key={`${key}-file-${i}`} className="mt-1 flex items-center gap-2 text-xs">
                              <a
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                                className="underline truncate"
                                style={{ 
                                  color: mine ? 'white' : colors.text,
                                  maxWidth: '200px',
                                  fontSize: getLocalizedFontSize('0.75rem')
                                }}
                                title={displayName}
                              >
                                {displayName}
                              </a>
                              <button
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded"
                                style={{
                                  border: `1px solid ${mine ? 'rgba(255,255,255,0.5)' : colors.border}`,
                                  color: mine ? 'white' : colors.text,
                                  fontSize: getLocalizedFontSize('0.75rem')
                                }}
                                onClick={async () => {
                                  try {
                                    await downloadFile(href, displayName);
                                  } catch (err) {
                                    setUiError(err?.message || t.errors.downloadFailed);
                                  }
                                }}
                                title="Download"
                              >
                                <Download className="h-3 w-3" />
                                Download
                              </button>
                            </div>
                          );
                        })}

                      <div 
                        className="text-[10px] opacity-60 mt-1"
                        style={{ fontSize: getLocalizedFontSize('0.625rem') }}
                      >
                        {m.read_at ? t.status.read : m.delivered_at ? t.status.delivered : t.status.sent}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div 
                className="text-sm opacity-70"
                style={{ 
                  color: colors.text,
                  fontSize: getLocalizedFontSize('0.875rem')
                }}
              >
                {t.chat.noMessages}
              </div>
            )
          ) : (
            <div 
              className="text-sm opacity-70"
              style={{ 
                color: colors.text,
                fontSize: getLocalizedFontSize('0.875rem')
              }}
            >
              {tab === 'agents' ? t.chat.pickAgent : t.chat.selectConversation}
            </div>
          )}
          <div ref={messagesEndRef} />
          
          {/* Scroll to top button */}
          {showScrollTop && (
            <button
              onClick={scrollToTop}
              className="fixed bottom-4 right-4 p-2 rounded-full shadow-md transition-opacity duration-300 z-10"
              style={{
                backgroundColor: colors.primary,
                color: 'white',
                opacity: 0.8,
              }}
              title={t.scrollToTop}
            >
              <ChevronUp className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Composer */}
        <div className="p-3 border-t" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-2">
            <label
              className="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-md"
              style={{ border: `1px solid ${colors.border}` }}
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
              <input type="file" className="hidden" onChange={onPickFile} />
            </label>

            <input
              className="flex-1 bg-transparent outline-none text-sm"
              placeholder={t.chat.typeMessage}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              style={{ 
                color: colors.text,
                fontSize: getLocalizedFontSize('0.875rem')
              }}
              disabled={!selectedConversation}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={sending || !selectedConversation}
              className="inline-flex items-center h-10 px-3 rounded-md text-white disabled:opacity-60"
              style={{ 
                backgroundColor: colors.primary,
                fontSize: getLocalizedFontSize('0.875rem')
              }}
            >
              <Send className="h-4 w-4 mr-1" />
              {sending ? t.chat.sending : t.chat.send}
            </button>
          </div>

          {fileUpload && (
            <div 
              className="mt-2 text-xs opacity-80 flex items-center gap-2"
              style={{ 
                color: isDark ? 'rgba(255,255,255,0.7)' : colors.text,
                fontSize: getLocalizedFontSize('0.75rem')
              }}
            >
              <span>{t.chat.attached} {fileUpload.name}</span>
              <button className="underline" onClick={() => setFileUpload(null)}>
                {t.chat.remove}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}