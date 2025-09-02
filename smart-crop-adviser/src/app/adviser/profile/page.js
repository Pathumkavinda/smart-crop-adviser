"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Shield,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Save,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";

// ----------------------------------------------------------------------------
// Config
// ----------------------------------------------------------------------------
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Small utility to merge classNames
function cn(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export default function AgentProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme?.name === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [profile, setProfile] = useState({
    id: null,
    username: "",
    email: "",
    address: "",
    phone: "",
    userlevel: "agent",
    avatar_url: "",
    // Optional agent-only meta (stored if your backend supports these fields)
    expertise: "",
    service_area: "",
    bio: "",
    availability: "Weekdays 9:00–17:00",
  });

  const [stats, setStats] = useState({
    farmersHelped: 0,
    appointmentsApproved: 0,
    pendingRequests: 0,
  });

  const agentId = useMemo(() => user?.id ?? null, [user]);

  // ----------------------------------------------------------------------------
  // Fetch profile + lightweight stats
  // ----------------------------------------------------------------------------
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!agentId) return;
      setLoading(true);
      setErr("");
      try {
        // Primary profile (adjust endpoint if you expose /users/me)
        const r = await fetch(`${API_URL}/api/v1/users/${agentId}`);
        if (!r.ok) throw new Error(`Failed to load profile (${r.status})`);
        const j = await r.json();
        const data = j?.data || j; // your controller sometimes returns { success, data }

        // Merge safely with defaults
        setProfile((p) => ({
          ...p,
          ...data,
          phone: data?.phone || "",
          avatar_url: data?.avatar_url || "",
          expertise: data?.expertise || p.expertise,
          service_area: data?.service_area || p.service_area,
          bio: data?.bio || p.bio,
          availability: data?.availability || p.availability,
        }));

        // Lightweight stats — all best-effort (ignore failures)
        // 1) Farmers the agent helped → distinct user_id from prediction history that reference this agent (if your schema supports it)
        try {
          const ph = await fetch(`${API_URL}/api/v1/prediction-history?agent_id=${agentId}&limit=1`);
          if (ph.ok) {
            // If you expose an aggregate endpoint, replace this block accordingly.
            // For now, we simply mark it unknown (0) to avoid heavy joins.
          }
        } catch (_) {}

        // 2) Appointments approved
        try {
          const a = await fetch(`${API_URL}/api/v1/appointments?advisor_id=${agentId}&status=approved`);
          if (a.ok) {
            const aj = await a.json();
            const list = aj?.data || aj || [];
            setStats((s) => ({ ...s, appointmentsApproved: Array.isArray(list) ? list.length : 0 }));
          }
        } catch (_) {}

        // 3) Pending requests/messages (best-effort)
        try {
          const m = await fetch(`${API_URL}/api/v1/requests?receiver_id=${agentId}&status=pending`);
          if (m.ok) {
            const mj = await m.json();
            const list = mj?.data || mj || [];
            setStats((s) => ({ ...s, pendingRequests: Array.isArray(list) ? list.length : 0 }));
          }
        } catch (_) {}

        if (alive) setLoading(false);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load profile");
        setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [agentId]);

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------
  const onField = useCallback((e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  }, []);

  const saveProfile = useCallback(async () => {
    if (!agentId) return;
    setSaving(true);
    setErr("");
    setOk("");
    try {
      const payload = {
        username: profile.username,
        email: profile.email,
        address: profile.address,
        phone: profile.phone,
        userlevel: profile.userlevel,
        expertise: profile.expertise,
        service_area: profile.service_area,
        bio: profile.bio,
        availability: profile.availability,
      };

      const r = await fetch(`${API_URL}/api/v1/users/${agentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`Save failed (${r.status})`);
      setOk("Profile updated successfully.");
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }, [agentId, profile]);

  const changePassword = useCallback(async (current, next) => {
    if (!agentId) return;
    setPwdSaving(true);
    setErr("");
    setOk("");
    try {
      // Adjust endpoint to your backend route if different (e.g., /users/:id/password)
      const r = await fetch(`${API_URL}/api/v1/users/${agentId}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      if (!r.ok) throw new Error(`Password update failed (${r.status})`);
      setOk("Password updated.");
    } catch (e) {
      setErr(e.message || "Password update failed");
    } finally {
      setPwdSaving(false);
    }
  }, [agentId]);

  const uploadAvatar = useCallback(async (file) => {
    if (!agentId || !file) return;
    setAvatarSaving(true);
    setErr("");
    setOk("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const r = await fetch(`${API_URL}/api/v1/users/${agentId}/avatar`, {
        method: "POST",
        body: fd,
      });
      if (!r.ok) throw new Error(`Avatar upload failed (${r.status})`);
      const j = await r.json();
      const url = j?.data?.avatar_url || j?.avatar_url || "";
      setProfile((p) => ({ ...p, avatar_url: url }));
      setOk("Avatar updated.");
    } catch (e) {
      setErr(e.message || "Avatar upload failed");
    } finally {
      setAvatarSaving(false);
    }
  }, [agentId]);

  // ----------------------------------------------------------------------------
  // UI Subcomponents
  // ----------------------------------------------------------------------------
  function Stat({ label, value }) {
    return (
      <div className="flex flex-col p-4 rounded-2xl border bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-2xl font-semibold mt-1" style={{ color: theme?.colors?.text }}>{value}</div>
      </div>
    );
  }

  function Section({ title, children, actions }) {
    return (
      <section className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold opacity-80">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
        <div className="p-5">{children}</div>
      </section>
    );
  }

  // ----------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------
  return (
    <div className="min-h-screen">
      {/* Top header */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Agent Profile</h1>
              <div className="flex items-center text-sm opacity-90 mt-1">
                <Shield className="h-4 w-4 mr-1" />
                <span>Logged in as: {profile.username || user?.name} ({profile.userlevel || user?.userlevel})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => location.reload()}
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl bg-white text-emerald-700 px-3 py-2 font-medium",
                  saving && "opacity-70 cursor-not-allowed"
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        {err && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <div className="text-sm">{err}</div>
          </div>
        )}
        {ok && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <div className="text-sm">{ok}</div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Loading profile...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Avatar + contact */}
              <section className="rounded-2xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-start gap-4">
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-slate-500">
                        <UserIcon className="h-10 w-10" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold" style={{ color: theme?.colors?.text }}>{profile.username}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{profile.bio || "Add a short bio so farmers know your expertise."}</div>

                    <div className="mt-3 flex flex-col gap-1 text-sm">
                      <div className="flex items-center gap-2 opacity-80"><Mail className="h-4 w-4" /> {profile.email}</div>
                      {profile.phone && (
                        <div className="flex items-center gap-2 opacity-80"><Phone className="h-4 w-4" /> {profile.phone}</div>
                      )}
                      {profile.address && (
                        <div className="flex items-center gap-2 opacity-80"><MapPin className="h-4 w-4" /> {profile.address}</div>
                      )}
                      {profile.availability && (
                        <div className="flex items-center gap-2 opacity-80"><CalendarDays className="h-4 w-4" /> {profile.availability}</div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">{avatarSaving ? "Uploading..." : "Upload Avatar"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => uploadAvatar(e.target.files?.[0])}
                          disabled={avatarSaving}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {profile.expertise && (
                  <div className="mt-4 text-sm"><span className="font-medium">Expertise:</span> {profile.expertise}</div>
                )}
                {profile.service_area && (
                  <div className="mt-1 text-sm"><span className="font-medium">Service Area:</span> {profile.service_area}</div>
                )}
              </section>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-3">
                <Stat label="Farmers Helped" value={stats.farmersHelped} />
                <Stat label="Approved Appts" value={stats.appointmentsApproved} />
                <Stat label="Pending Requests" value={stats.pendingRequests} />
              </div>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic info */}
              <Section title="Basic Information" actions={
                <button onClick={saveProfile} disabled={saving} className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50", saving && "opacity-70 cursor-not-allowed")}>{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} Save</button>
              }>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username">
                    <input name="username" value={profile.username} onChange={onField} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                  <Field label="Email">
                    <input type="email" name="email" value={profile.email} onChange={onField} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                  <Field label="Phone">
                    <input name="phone" value={profile.phone} onChange={onField} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                  <Field label="Address">
                    <input name="address" value={profile.address} onChange={onField} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                </div>
              </Section>

              {/* Professional info */}
              <Section title="Professional Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Expertise (e.g., Onions, Maize, Beans)">
                    <input name="expertise" value={profile.expertise} onChange={onField} placeholder="Vegetables • Soil health • Irrigation" className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                  <Field label="Service Area">
                    <input name="service_area" value={profile.service_area} onChange={onField} placeholder="Kurunegala, Kegalle, Gampaha" className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                  <Field label="Availability">
                    <input name="availability" value={profile.availability} onChange={onField} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                  </Field>
                </div>
                <Field label="Bio" className="mt-4">
                  <textarea name="bio" value={profile.bio} onChange={onField} rows={4} placeholder="Briefly introduce yourself and your specialties." className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
                </Field>
              </Section>

              {/* Security */}
              <Section title="Security">
                <PasswordChanger onSubmit={changePassword} saving={pwdSaving} />
              </Section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, className }) {
  return (
    <label className={cn("block", className)}>
      <div className="text-xs font-semibold mb-1 opacity-70">{label}</div>
      {children}
    </label>
  );
}

function PasswordChanger({ onSubmit, saving }) {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!next || next.length < 6) return setErr("New password must be at least 6 characters.");
    if (next !== confirm) return setErr("Passwords do not match.");
    await onSubmit(current, next);
    setCurrent("");
    setNext("");
    setConfirm("");
    setShow(false);
  };

  return (
    <div className="space-y-3">
      {!show ? (
        <button onClick={() => setShow(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
          <Lock className="h-4 w-4" /> Change Password
        </button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
          <input type="password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} className="w-full rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
          <div className="flex gap-2">
            <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="flex-1 rounded-xl border px-3 py-2 bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700" />
            <button onClick={submit} disabled={saving} className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50", saving && "opacity-70 cursor-not-allowed")}>{saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>} Save</button>
          </div>
          {err && <div className="sm:col-span-3 text-sm text-red-600">{err}</div>}
        </div>
      )}
    </div>
  );
}
