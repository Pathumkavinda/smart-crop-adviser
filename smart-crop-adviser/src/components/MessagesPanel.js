'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  MessageSquare, Paperclip, Send, Image, FileText, X, User, Download
} from 'lucide-react';

// =================== CONFIG ===================
const ENV_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// avoid Map shadowing (in case parent imports lucide Map)
const GMap = globalThis.Map;

// =================== TRANSLATIONS ===================
const translations = {
  en: {
    signIn: {
      title: 'Sign in to chat',
      description: 'Please sign in to start messaging.'
    },
    selectFarmer: {
      title: 'Select a Farmer',
      description: 'Choose a farmer from the list to start a conversation.'
    },
    messages: {
      unread: 'Unread:',
      noUnread: 'No unread',
      noMessages: 'No messages yet.',
      loading: 'Loading...'
    },
    composer: {
      placeholder: 'Type a message…',
      attach: 'Attach',
      send: 'Send',
      sending: 'Sending…',
      download: 'Download',
      open: 'Open',
      remove: 'Remove'
    }
  },
  si: {
    signIn: {
      title: 'චැට් කිරීමට පුරනය වන්න',
      description: 'පණිවිඩ යැවීම ආරම්භ කිරීමට කරුණාකර පුරනය වන්න.'
    },
    selectFarmer: {
      title: 'ගොවියෙකු තෝරන්න',
      description: 'සංවාදයක් ආරම්භ කිරීමට ලැයිස්තුවෙන් ගොවියෙකු තෝරන්න.'
    },
    messages: {
      unread: 'නොකියවූ:',
      noUnread: 'නොකියවූ නැත',
      noMessages: 'තවම පණිවිඩ නැත.',
      loading: 'පූරණය වෙමින්...'
    },
    composer: {
      placeholder: 'පණිවිඩයක් ටයිප් කරන්න…',
      attach: 'අමුණන්න',
      send: 'යවන්න',
      sending: 'යවමින්…',
      download: 'බාගන්න',
      open: 'විවෘත කරන්න',
      remove: 'ඉවත් කරන්න'
    }
  },
  ta: {
    signIn: {
      title: 'அரட்டை செய்ய உள்நுழையவும்',
      description: 'செய்திகளை அனுப்பத் தொடங்க தயவுசெய்து உள்நுழையவும்.'
    },
    selectFarmer: {
      title: 'விவசாயியைத் தேர்ந்தெடுக்கவும்',
      description: 'உரையாடலைத் தொடங்க பட்டியலிலிருந்து ஒரு விவசாயியைத் தேர்ந்தெடுக்கவும்.'
    },
    messages: {
      unread: 'படிக்காதவை:',
      noUnread: 'படிக்காதவை இல்லை',
      noMessages: 'இதுவரை செய்திகள் இல்லை.',
      loading: 'ஏற்றுகிறது...'
    },
    composer: {
      placeholder: 'செய்தியை உள்ளிடவும்…',
      attach: 'இணைக்க',
      send: 'அனுப்பு',
      sending: 'அனுப்புகிறது…',
      download: 'பதிவிறக்கம்',
      open: 'திறக்க',
      remove: 'நீக்கு'
    }
  }
};

// =================== HELPERS ===================
const safeJSON = async (res) => { try { return await res.json(); } catch { return null; } };
const getToken = () => (typeof window !== 'undefined') ? localStorage.getItem('token') : null;

const getFileNameFromPath = (p = '') => p.split('/').pop() || 'file';
const pickName = (obj, fallback = 'file') =>
  obj?.original_name || obj?.name || obj?.filename || fallback;

function makeHref(apiBase, fileObj) {
  const p = fileObj.path || fileObj.filepath || '';
  if (!p) return '';
  const needsSlash = !p.startsWith('/');
  return `${apiBase}${needsSlash ? '/' : ''}${p}`;
}

/** Download a file with optional Bearer token (works for any type) */
async function downloadWithAuth(url, filename, token) {
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();

  const a = document.createElement('a');
  const objUrl = URL.createObjectURL(blob);
  a.href = objUrl;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objUrl);
}

/** View a file in a new tab (auth-aware). Falls back to direct URL on CORS issues. */
async function viewWithAuth(url, token, mimeHint) {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`View failed (${res.status})`);
    const blob = await res.blob();

    const objUrl = URL.createObjectURL(
      mimeHint ? new Blob([blob], { type: mimeHint }) : blob
    );
    window.open(objUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(objUrl), 30_000);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

// Merge & sort by timestamp/created_at
const mergeMessages = (oldArr, newArr) => {
  const byKey = new GMap();
  const makeKey = (m) =>
    (m.id ?? `${m.sender_id}-${m.receiver_id}-${m.created_at ?? m.timestamp ?? m.sent_at}-${m.text ?? ''}`);
  for (const m of oldArr) byKey.set(makeKey(m), m);
  for (const m of newArr) byKey.set(makeKey(m), m);
  const merged = Array.from(byKey.values());
  merged.sort((a, b) =>
    new Date(a.created_at ?? a.timestamp ?? a.sent_at ?? 0) -
    new Date(b.created_at ?? b.timestamp ?? b.sent_at ?? 0)
  );
  return merged;
};

// API file → UI attachment
const toUiAttachment = (f, apiUrl) => {
  const url = makeHref(apiUrl, f);
  const type =
    f.mime_type?.startsWith('image/') ? 'image' :
    f.mime_type === 'application/pdf' ? 'pdf' : 'file';
  return { type, name: pickName(f, 'attachment'), url, filename: getFileNameFromPath(f.path || f.filepath) };
};

const getDownloadName = (att) =>
  att?.name || att?.filename || att?.url?.split('/')?.pop() || 'attachment';

// format: 2025-08-30 14:05
const pad2 = (n) => String(n).padStart(2, '0');
const formatDateTime = (ts) => {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = pad2(d.getMonth() + 1);
  const dd = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mi = pad2(d.getMinutes());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

// =================== COMPONENT ===================
/**
 * Props:
 * - apiUrl (string)         : backend base URL (defaults to ENV)
 * - selectedFarmer (object) : chat partner; must include .id
 * - language (string)       : language code (en, si, ta)
 * - onUnreadChange (func)   : callback for unread count changes
 */
export default function ChatPanel({ 
  apiUrl = ENV_API, 
  selectedFarmer, 
  language,
  onUnreadChange = () => {}
}) {
  const { theme } = useTheme();
  const { user } = useAuth();                 // current logged-in user
  const { language: contextLanguage } = useLanguage(); // Get language from context if available
  const currentUserId = user?.id ?? null;     // sender_id must be this
  const isDark = theme.name === 'dark';
  
  // Use provided language or get from context or default to English
  const currentLanguage = language || contextLanguage || 'en';
  // Get translations for the current language
  const trans = translations[currentLanguage] || translations.en;
  
  // Get text style based on language
  const getTextStyle = (s = {}) => ({ 
    ...s, 
    lineHeight: currentLanguage === 'si' ? 1.7 : currentLanguage === 'ta' ? 1.8 : 1.5 
  });

  const [messagesFetched, setMessagesFetched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState([]); // local (File objects)
  const [messageLoading, setMessageLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);  // <<— NEW
  const [autoScroll, setAutoScroll] = useState(true); // Auto-scroll control

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null); // Reference to the messages container
  const fileInputRef = useRef(null);

  const token = getToken();

  // Function to check if we should auto-scroll
  const shouldAutoScroll = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    // Check if user is already at the bottom (within 100px)
    const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    return atBottom;
  }, []);

  // Function to scroll to bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ 
        behavior, 
        block: 'end'
      });
    }
  }, [autoScroll]);

  // Update unread count for parent component
  useEffect(() => {
    onUnreadChange(unreadCount);
  }, [unreadCount, onUnreadChange]);

  // Listen for scroll events to determine auto-scroll behavior
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      // If user manually scrolls up, disable auto-scroll
      if (container.scrollHeight - container.scrollTop - container.clientHeight > 200) {
        setAutoScroll(false);
      } else if (container.scrollHeight - container.scrollTop - container.clientHeight < 50) {
        // If user scrolls to bottom, re-enable auto-scroll
        setAutoScroll(true);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ---------------- API calls ----------------
  const fetchThread = useCallback(async (page = 1, limit = 30) => {
    if (!currentUserId || !selectedFarmer?.id) return [];
    const url = `${apiUrl}/api/v1/messages/thread?userA=${currentUserId}&userB=${selectedFarmer.id}&page=${page}&limit=${limit}`;
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) return [];
    const data = await safeJSON(res);
    const list = data?.data ?? data ?? [];
    return list.map(m => ({
      ...m,
      attachments: Array.isArray(m.files) ? m.files.map(f => toUiAttachment(f, apiUrl)) : [],
      content: m.text ?? '',
    }));
  }, [currentUserId, selectedFarmer?.id, apiUrl, token]);

  const markDelivered = useCallback(async (messageId) => {
    if (!messageId) return false;
    try {
      const res = await fetch(`${apiUrl}/api/v1/messages/${messageId}/delivered`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return res.ok;
    } catch { return false; }
  }, [apiUrl, token]);

  const markRead = useCallback(async (messageId) => {
    if (!messageId) return false;
    try {
      const res = await fetch(`${apiUrl}/api/v1/messages/${messageId}/read`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return res.ok;
    } catch { return false; }
  }, [apiUrl, token]);

  // Upload one file -> returns { file:{ path, original_name, mime_type, ... } }
  const uploadFile = useCallback(async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${apiUrl}/api/v1/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd
    });
    if (!res.ok) return null;
    const data = await safeJSON(res);
    return data?.file ?? null;
  }, [apiUrl, token]);

  // Create message
  const sendMessage = useCallback(async (receiverId, text, localAttachments = []) => {
    try {
      const uploadedFiles = [];
      for (const att of localAttachments) {
        const f = await uploadFile(att.file);
        if (f) uploadedFiles.push(f);
      }

      if (!text && uploadedFiles.length === 0) {
        return { success: false, error: 'Empty message' };
      }

      const res = await fetch(`${apiUrl}/api/v1/messages`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender_id: currentUserId,
          receiver_id: receiverId,
          text,
          files: uploadedFiles
        })
      });
      if (!res.ok) throw new Error('send HTTP ' + res.status);
      const data = await safeJSON(res);
      const serverMsg = data?.data;

      const uiMsg = serverMsg ? {
        ...serverMsg,
        content: serverMsg.text ?? '',
        attachments: Array.isArray(serverMsg.files) ? serverMsg.files.map(f => toUiAttachment(f, apiUrl)) : [],
      } : null;

      return { success: true, message: uiMsg };
    } catch (e) {
      console.error('sendMessage:', e);
      return { success: false };
    }
  }, [apiUrl, token, currentUserId, uploadFile]);

  // -------- Attachment download / view (auth-aware) --------
  const downloadAttachment = useCallback(async (att) => {
    if (!att?.url) return;
    const name = getDownloadName(att);
    try {
      await downloadWithAuth(att.url, name, token);
    } catch {
      window.open(att.url, '_blank', 'noopener,noreferrer');
    }
  }, [token]);

  const viewAttachment = useCallback(async (att) => {
    if (!att?.url) return;
    const mime =
      att.type === 'pdf' ? 'application/pdf'
      : att.type === 'image' ? 'image/*'
      : undefined;
    await viewWithAuth(att.url, token, mime);
  }, [token]);

  // ---------------- Effects ----------------
  useEffect(() => {
    (async () => {
      setMessages([]);
      setMessagesFetched(false);
      setUnreadCount(0);
      if (!currentUserId || !selectedFarmer?.id) return;

      const data = await fetchThread(1, 30);

      // compute unread BEFORE marking as read
      const unreadBefore = data.filter(
        (m) => Number(m.receiver_id ?? m.to_id ?? m.receiverId) === Number(currentUserId) && !m.read_at
      ).length;
      setUnreadCount(unreadBefore);

      setMessages(data);

      // mark inbound to current user
      for (const m of data) {
        if (!m?.id) continue;
        const inbound = Number(m.receiver_id ?? m.to_id ?? m.receiverId) === Number(currentUserId);
        if (inbound) {
          await markDelivered(m.id);
          await markRead(m.id);
        }
      }

      setMessagesFetched(true);
      
      // Scroll to bottom with 'auto' for initial load
      setTimeout(() => scrollToBottom('auto'), 100);
    })();
  }, [currentUserId, selectedFarmer?.id, fetchThread, markDelivered, markRead, scrollToBottom]);

  // Polling (replace with websockets if needed)
  useEffect(() => {
    if (!currentUserId || !selectedFarmer?.id) return;
    let cancelled = false;
    let ticking = false;

    const tick = async () => {
      if (ticking) return;
      ticking = true;
      try {
        const latest = await fetchThread(1, 50);
        if (!cancelled && Array.isArray(latest)) {
          // compute unread BEFORE we mark
          const unreadBefore = latest.filter(
            (m) => Number(m.receiver_id ?? m.to_id ?? m.receiverId) === Number(currentUserId) && !m.read_at
          ).length;
          setUnreadCount(unreadBefore);
          
          // Check if we should auto-scroll before updating messages
          const shouldScroll = shouldAutoScroll();

          setMessages(prev => {
            const newMessages = mergeMessages(prev, latest);
            // Schedule scroll if we have new messages and should auto-scroll
            if (newMessages.length > prev.length && shouldScroll) {
              setTimeout(() => scrollToBottom(), 100);
            }
            return newMessages;
          });

          for (const m of latest) {
            if (!m?.id) continue;
            const inbound = Number(m.receiver_id ?? m.to_id ?? m.receiverId) === Number(currentUserId);
            if (inbound) {
              await markDelivered(m.id);
              await markRead(m.id);
            }
          }
        }
      } finally {
        ticking = false;
      }
    };

    tick();
    const id = setInterval(tick, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [currentUserId, selectedFarmer?.id, fetchThread, markDelivered, markRead, shouldAutoScroll, scrollToBottom]);

  // ---------------- UI handlers ----------------
  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const mapped = files.map(file => {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type === 'application/pdf'
          ? 'pdf'
          : 'file';
      return {
        file,
        name: file.name,
        type,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : null
      };
    });
    setAttachments(prev => [...prev, ...mapped]);
    e.target.value = '';
  };

  const removeAttachment = (i) => {
    setAttachments(prev => {
      const copy = [...prev];
      const item = copy[i];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      copy.splice(i, 1);
      return copy;
    });
  };

  const handleSendMessage = async () => {
    if (!currentUserId || !selectedFarmer?.id || (!messageInput.trim() && attachments.length === 0)) return;
    setMessageLoading(true);
    
    // Enable auto-scroll when sending a message
    setAutoScroll(true);
    
    const res = await sendMessage(selectedFarmer.id, messageInput.trim(), attachments);
    if (res.success && res.message) {
      setMessages(prev => mergeMessages(prev, [res.message]));
      setMessageInput('');
      attachments.forEach(a => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
      setAttachments([]);
      // When we send, unread for us doesn't change; keep current unreadCount
      
      // Scroll to bottom after sending a message
      setTimeout(() => scrollToBottom(), 100);
    }
    setMessageLoading(false);
  };

  // Scroll button handler
  const handleScrollToBottom = () => {
    setAutoScroll(true);
    scrollToBottom();
  };

  const groupedMessages = useMemo(() => {
    const groups = {};
    for (const m of messages) {
      const d = new Date(m.created_at ?? m.timestamp ?? m.sent_at ?? Date.now());
      const key = d.toDateString();
      (groups[key] = groups[key] || []).push(m);
    }
    return groups;
  }, [messages]);

  // ---------------- Render ----------------
  if (!user) {
    return (
      <div className="overflow-hidden shadow rounded-lg p-6 text-center"
           style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
        <MessageSquare className="h-16 w-16 mb-3" style={{ opacity: 0.15 }} />
        <h3 className="text-xl font-medium" style={getTextStyle()}>{trans.signIn.title}</h3>
        <p className="opacity-70" style={getTextStyle()}>{trans.signIn.description}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow rounded-lg"
         style={{ backgroundColor: theme.colors.card, color: theme.colors.text }}>
      {!selectedFarmer ? (
        <div className="h-[calc(100vh-250px)] flex flex-col items-center justify-center">
          <MessageSquare className="h-16 w-16 mb-3" style={{ opacity: 0.15 }} />
          <h3 className="text-xl font-medium" style={getTextStyle()}>{trans.selectFarmer.title}</h3>
          <p className="opacity-70" style={getTextStyle()}>{trans.selectFarmer.description}</p>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-250px)]">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full mr-3 flex items-center justify-center"
                   style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                <User className="h-6 w-6" style={{ opacity: 0.6 }} />
              </div>
              <div>
                <div className="font-medium" style={getTextStyle()}>{selectedFarmer.name ?? selectedFarmer.username}</div>
                <div className="text-xs opacity-70" style={getTextStyle()}>{selectedFarmer.district ?? '—'}</div>
              </div>
            </div>

            {/* Unread badge */}
            <div className="text-xs">
              {unreadCount > 0 ? (
                <span className="px-2 py-1 rounded-full"
                      style={{ backgroundColor: '#EF4444', color: 'white' }}>
                  <span style={getTextStyle()}>{trans.messages.unread} {unreadCount}</span>
                </span>
              ) : (
                <span className="opacity-60" style={getTextStyle()}>{trans.messages.noUnread}</span>
              )}
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 p-4 overflow-y-auto" 
            style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }}
          >
            {!messagesFetched ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-b-2 rounded-full" style={{ borderColor: theme.colors.primary }} />
              </div>
            ) : Object.keys(groupedMessages).length ? (
              <>
                {Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date} className="mb-6">
                    <div className="flex justify-center mb-3">
                      <div className="px-2 py-1 rounded-full text-xs"
                           style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        {date}
                      </div>
                    </div>
                    {msgs.map((m) => {
                      const mine = Number(m.sender_id ?? m.from_id ?? m.senderId) === Number(currentUserId);
                      const ts = m.created_at ?? m.timestamp ?? m.sent_at ?? new Date().toISOString();
                      const atts = m.attachments ?? [];
                      return (
                        <div key={m.id ?? Math.random()} className={`mb-3 flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div className="rounded-lg px-4 py-2 max-w-[80%]"
                               style={{
                                 backgroundColor: mine
                                   ? (isDark ? 'rgba(74,222,128,0.2)' : 'rgba(76,175,80,0.12)')
                                   : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                               }}>
                            {m.content && <p className="whitespace-pre-wrap break-words" style={getTextStyle()}>{m.content}</p>}

                            {!!atts.length && (
                              <div className="mt-2 grid grid-cols-2 gap-2">
                                {atts.map((a, i) => (
                                  <div
                                    key={i}
                                    className="p-2 rounded-md flex items-center justify-between gap-3"
                                    style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)' }}
                                  >
                                    <div className="flex items-center min-w-0">
                                      {a.type === 'image'
                                        ? <Image className="h-5 w-5 mr-2" />
                                        : a.type === 'pdf'
                                          ? <FileText className="h-5 w-5 mr-2" />
                                          : <Paperclip className="h-5 w-5 mr-2" />}
                                      <button
                                        onClick={() => viewAttachment(a)}
                                        className="text-sm truncate underline"
                                        title={trans.composer.open}
                                        style={getTextStyle()}
                                      >
                                        {a.name ?? a.filename ?? 'attachment'}
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => viewAttachment(a)}
                                        className="px-2 py-1 text-xs rounded-md"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                                        title={trans.composer.open}
                                      >
                                        <span style={getTextStyle()}>{trans.composer.open}</span>
                                      </button>
                                      <button
                                        onClick={() => downloadAttachment(a)}
                                        className="px-2 py-1 text-xs rounded-md flex items-center gap-1"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
                                        title={trans.composer.download}
                                      >
                                        <Download className="h-4 w-4" />
                                        <span style={getTextStyle()}>{trans.composer.download}</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* date + time for each message */}
                            <div className="text-right mt-1 text-xs opacity-60">
                              {formatDateTime(ts)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                
                {/* Scroll to bottom button - shown when autoScroll is disabled */}
                {!autoScroll && messages.length > 10 && (
                  <button
                    onClick={handleScrollToBottom}
                    className="fixed bottom-32 right-8 bg-primary text-white p-2 rounded-full shadow-lg hover:opacity-90 z-10"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <MessageSquare className="h-12 w-12 mb-3" style={{ opacity: 0.2 }} />
                <p className="opacity-70" style={getTextStyle()}>{trans.messages.noMessages}</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={trans.composer.placeholder}
                rows={3}
                className="flex-1 resize-none rounded-md px-3 py-2 mr-2"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  ...getTextStyle()
                }}
              />
              <div className="flex flex-col gap-2 w-40">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-md"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.text }}
                >
                  <Paperclip className="h-5 w-5 inline mr-2" /> 
                  <span style={getTextStyle()}>{trans.composer.attach}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={onFiles}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={messageLoading || (!messageInput.trim() && attachments.length === 0)}
                  className="p-2 rounded-md text-white"
                  style={{ backgroundColor: theme.colors.primary, opacity: messageLoading ? 0.7 : 1 }}
                >
                  {messageLoading ? (
                    <span style={getTextStyle()}>{trans.composer.sending}</span>
                  ) : (
                    <>
                      <Send className="h-5 w-5 inline mr-2" /> 
                      <span style={getTextStyle()}>{trans.composer.send}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Attachments Preview (before sending) */}
            {!!attachments.length && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="relative p-2 rounded-md flex items-center"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
                  >
                    {att.type === 'image'
                      ? (
                        <div className="h-10 w-10 rounded-md mr-2 overflow-hidden">
                          {att.previewUrl && <img src={att.previewUrl} alt={att.name} className="h-full w-full object-cover" />}
                        </div>
                      )
                      : att.type === 'pdf'
                        ? <FileText className="h-10 w-10 mr-2" />
                        : <Paperclip className="h-10 w-10 mr-2" />
                    }
                    <span className="text-sm mr-2 max-w-[140px] truncate" style={getTextStyle()}>{att.name}</span>

                    {/* Local download before sending */}
                    {att.file && (
                      <button
                        onClick={() => {
                          const blobUrl = URL.createObjectURL(att.file);
                          const a = document.createElement('a');
                          a.href = blobUrl;
                          a.download = att.name || 'attachment';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                          URL.revokeObjectURL(blobUrl);
                        }}
                        className="ml-2 px-2 py-1 text-xs rounded-md flex items-center gap-1"
                        style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.1)' }}
                        title={trans.composer.download}
                      >
                        <Download className="h-3 w-3" />
                        <span style={getTextStyle()}>{trans.composer.download}</span>
                      </button>
                    )}

                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute top-1 right-1 p-1 rounded-full"
                      style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)' }}
                      title={trans.composer.remove}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}