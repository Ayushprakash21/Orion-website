import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  loadUserProfile,
  updateUserProfile,
  changeUserPassword,
  sendUserPasswordReset,
  sendUserEmailVerification,
  requestUserEmailChange,
  type UserProfileData,
} from '../../services/userProfileService';
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Mail,
  Phone,
  Briefcase,
  Building,
  FileText,
  KeyRound,
  Lock,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  Camera,
  AtSign,
  Send,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserProfileViewProps {
  onNavigate: (path: string) => void;
}

const PRESET_AVATARS = [
  { id: 'cyan', label: 'Cyan Telemetry', color: 'from-cyan-500 to-blue-600' },
  { id: 'emerald', label: 'Emerald Logistics', color: 'from-emerald-500 to-teal-700' },
  { id: 'violet', label: 'Violet Kernel', color: 'from-purple-500 to-indigo-700' },
  { id: 'amber', label: 'Amber Operations', color: 'from-amber-500 to-orange-600' },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate }) => {
  const { user, isAdmin, logout, launchOrion, destinationUrl } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email change state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailAuthPassword, setEmailAuthPassword] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Verification sending state
  const [sendingVerification, setSendingVerification] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // Avatar image error fallback state
  const [avatarImgError, setAvatarImgError] = useState(false);

  // Load profile from service
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await loadUserProfile(user, isAdmin);
      setProfile(data);
      setDisplayName(data.displayName);
      setUsername(data.username);
      setPhoneNumber(data.phoneNumber || '');
      setPhotoURL(data.photoURL || '');
      setBio(data.bio || '');
      setJobTitle(data.jobTitle || '');
      setDepartment(data.department || '');
      setAvatarImgError(false);
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to load user profile: ' + (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!profile) return false;
    return (
      displayName !== profile.displayName ||
      username !== profile.username ||
      phoneNumber !== (profile.phoneNumber || '') ||
      photoURL !== (profile.photoURL || '') ||
      bio !== (profile.bio || '') ||
      jobTitle !== (profile.jobTitle || '') ||
      department !== (profile.department || '')
    );
  }, [profile, displayName, username, phoneNumber, photoURL, bio, jobTitle, department]);

  // Cancel edits
  const handleCancelEdits = () => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setUsername(profile.username);
    setPhoneNumber(profile.phoneNumber || '');
    setPhotoURL(profile.photoURL || '');
    setBio(profile.bio || '');
    setJobTitle(profile.jobTitle || '');
    setDepartment(profile.department || '');
    setIsEditing(false);
    setStatusMessage(null);
    setAvatarImgError(false);
  };

  // Save profile updates
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !profile || isSaving) return;

    setIsSaving(true);
    setStatusMessage(null);

    const res = await updateUserProfile(
      user,
      {
        displayName,
        username,
        phoneNumber,
        photoURL,
        bio,
        jobTitle,
        department,
      },
      profile
    );

    setIsSaving(false);

    if (res.success && res.updatedProfile) {
      setProfile(res.updatedProfile);
      setIsEditing(false);
      setStatusMessage({
        type: 'success',
        text: 'Personal profile updated successfully.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Failed to update profile.',
      });
    }
  };

  // Copy UID helper
  const handleCopyUid = () => {
    if (!profile?.uid) return;
    navigator.clipboard.writeText(profile.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Change password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError(null);

    const res = await changeUserPassword(user, currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({
        type: 'success',
        text: 'Account password changed successfully.',
      });
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  // Send password reset email
  const handleSendResetEmail = async () => {
    if (!user || sendingReset) return;
    setSendingReset(true);
    const res = await sendUserPasswordReset(user);
    setSendingReset(false);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Password reset link has been dispatched to ${user.email}.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Could not send password reset email.',
      });
    }
  };

  // Resend email verification
  const handleSendVerification = async () => {
    if (!user || sendingVerification) return;
    setSendingVerification(true);
    const res = await sendUserEmailVerification(user);
    setSendingVerification(false);
    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Verification email dispatched to ${user.email}. Please check your inbox.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: res.error || 'Could not send verification email.',
      });
    }
  };

  // Request email change
  const handleEmailChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setEmailLoading(true);
    setEmailError(null);

    const res = await requestUserEmailChange(user, newEmail, emailAuthPassword);
    setEmailLoading(false);

    if (res.success) {
      setShowEmailModal(false);
      setNewEmail('');
      setEmailAuthPassword('');
      setStatusMessage({
        type: 'success',
        text: res.message || 'Verification email dispatched to your new address.',
      });
    } else {
      setEmailError(res.error || 'Could not initiate email change.');
    }
  };

  // User initials for fallback avatar
  const initials = useMemo(() => {
    const name = displayName || profile?.displayName || user?.email || 'User';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [displayName, profile?.displayName, user?.email]);

  const isGoogleProvider = profile?.providerId === 'google.com' || user?.providerData?.[0]?.providerId === 'google.com';

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-7 h-7 text-sky-400 dark:text-[#F5D76E] animate-spin" />
        <p className="text-xs font-mono text-[var(--orion-text-muted)]">Loading Personal Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-lg font-bold text-[var(--orion-text-primary)]">Profile Unavailable</h2>
        <p className="text-xs text-[var(--orion-text-muted)] max-w-md mx-auto">
          We could not load your profile details at this time. Please check your network connection and try again.
        </p>
        <button
          type="button"
          onClick={fetchProfile}
          className="macos-btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unsaved Changes Banner */}
      {isDirty && !isSaving && (
        <div className="p-3.5 rounded-2xl bg-sky-500/10 dark:bg-[#D4AF37]/15 border border-sky-500/30 dark:border-[#38301D] text-sky-600 dark:text-[#F5D76E] flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>You have unsaved changes in your profile.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCancelEdits}
              className="px-3 py-1 rounded-xl text-xs font-medium hover:bg-white/10 transition cursor-pointer"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => handleSaveProfile()}
              className="macos-btn-primary px-3 py-1 rounded-xl text-xs font-semibold text-white cursor-pointer"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {/* 1. HERO IDENTITY CARD */}
      <section className="relative overflow-hidden rounded-3xl macos-window border border-[var(--glass-border)] shadow-2xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Avatar with fallback badge */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden p-0.5 bg-gradient-to-br from-sky-400 via-indigo-500 to-cyan-400 dark:from-[#D4AF37] dark:via-[#F5D76E] dark:to-[#9E7C25] shadow-xl flex items-center justify-center">
                {photoURL && !avatarImgError ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    onError={() => setAvatarImgError(true)}
                    className="w-full h-full object-cover rounded-[22px]"
                  />
                ) : (
                  <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-mono font-bold text-xl sm:text-2xl tracking-wider select-none">
                    {initials}
                  </div>
                )}
              </div>
              {isEditing && (
                <div
                  title="Configure profile photo URL below"
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-sky-500 dark:bg-[#D4AF37] text-white dark:text-[#080808] shadow-lg cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            {/* User Core Identity */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${
                    isAdmin
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : 'bg-sky-500/10 dark:bg-[#D4AF37]/15 text-sky-600 dark:text-[#F5D76E] border-sky-500/20 dark:border-[#38301D]'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{isAdmin ? 'System Administrator' : (profile.role === 'operator' ? 'Enterprise SCM Operator' : 'Enterprise User')}</span>
                </span>

                {profile.emailVerified ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-2.5 h-2.5" />
                    <span>Verified Email</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    <span>Unverified Email</span>
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[var(--orion-text-primary)] tracking-tight">
                {displayName || 'Orion-9 User'}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--orion-text-muted)] font-mono">
                <span className="flex items-center gap-1 text-[var(--orion-accent)]">
                  <AtSign className="w-3 h-3" />
                  <span>{username || 'user'}</span>
                </span>
                <span className="truncate max-w-[220px]" title={profile.email}>
                  {profile.email}
                </span>
                {jobTitle && (
                  <span className="hidden sm:inline-block text-[var(--orion-text-secondary)]">
                    &bull; {jobTitle}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="macos-btn-primary px-4 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdits}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving || !isDirty}
                  className="macos-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => launchOrion(destinationUrl)}
              className="px-3.5 py-2 rounded-xl liquid-glass-button text-xs font-medium text-[var(--orion-text-primary)] inline-flex items-center gap-1.5 cursor-pointer"
              title="Launch Orion-9 Operating System"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400 dark:text-[#F5D76E]" />
              <span>Launch OS</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN GRID: PERSONAL INFO & ACCOUNT INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: EDITABLE PERSONAL INFORMATION */}
        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSaveProfile}
            className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-4">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-[var(--orion-text-primary)] flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Personal Information</span>
                </h2>
                <p className="text-xs text-[var(--orion-text-muted)]">
                  Your identity details across Orion-9 WebOS, learning records, and enterprise logs.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-semibold text-sky-400 hover:underline cursor-pointer"
                >
                  Edit details
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5">
                  Full Name / Display Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-[var(--orion-text-muted)] font-mono">@</span>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="username"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-mono font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-[var(--orion-text-muted)] mt-1 font-mono">
                  3–24 characters: letters, numbers, underscores, hyphens.
                </p>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5 flex items-center justify-between">
                  <span>Phone Number</span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[var(--orion-text-muted)]" />
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5 flex items-center justify-between">
                  <span>Job Title / Role Specialization</span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[var(--orion-text-muted)]" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Supply Chain Architect"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5 flex items-center justify-between">
                  <span>Department / Organization Unit</span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] font-normal">Optional</span>
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 absolute left-3.5 top-3 text-[var(--orion-text-muted)]" />
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Global Inbound Logistics & ATP Allocation"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Profile Photo URL */}
              <div className="sm:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1 flex items-center justify-between">
                  <span>Profile Photo URL</span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] font-normal">HTTPS image link</span>
                </label>
                <input
                  type="url"
                  disabled={!isEditing}
                  value={photoURL}
                  onChange={(e) => {
                    setPhotoURL(e.target.value);
                    setAvatarImgError(false);
                  }}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-mono text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed"
                />

                {isEditing && (
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--glass-border-subtle)] space-y-2 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--orion-text-muted)] font-medium">Quick Avatar Presets:</span>
                      {photoURL && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoURL('');
                            setAvatarImgError(false);
                          }}
                          className="text-rose-400 hover:underline cursor-pointer"
                        >
                          Clear custom photo
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {PRESET_AVATARS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setPhotoURL(`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=${preset.id === 'cyan' ? '0284c7' : preset.id === 'emerald' ? '059669' : preset.id === 'violet' ? '7c3aed' : 'd97706'}&color=fff&size=256&bold=true`);
                            setAvatarImgError(false);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-white/60 dark:bg-slate-800 border border-[var(--glass-border-subtle)] hover:border-sky-400 text-[10px] font-medium transition cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-[var(--orion-text-muted)] leading-relaxed">
                      <Info className="w-3 h-3 inline mr-1 text-sky-400" />
                      Direct file upload to Cloudflare R2 binary release storage is reserved for system administrators. For personal avatars, link any HTTPS image or use your initials.
                    </p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1.5 flex items-center justify-between">
                  <span>Professional Bio / Responsibilities</span>
                  <span className="text-[10px] text-[var(--orion-text-muted)] font-mono">{bio.length}/500</span>
                </label>
                <textarea
                  rows={3}
                  disabled={!isEditing}
                  value={bio}
                  onChange={(e) => setBio(e.target.value.slice(0, 500))}
                  placeholder="Share your focus area, SCM domain responsibilities, or operating region..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-75 disabled:cursor-not-allowed resize-none"
                />
              </div>
            </div>

            {/* Bottom Edit Actions */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--glass-border-subtle)]">
                <button
                  type="button"
                  onClick={handleCancelEdits}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className="macos-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* ACCOUNT SECURITY CARD */}
          <section className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-4">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-[var(--orion-text-primary)] flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-sky-400" />
                  <span>Account Security & Authentication</span>
                </h2>
                <p className="text-xs text-[var(--orion-text-muted)]">
                  Cryptographic password protection, reset workflows, and session management.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Password Section */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-[var(--glass-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--orion-text-primary)] flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span>Account Password</span>
                  </div>
                  <p className="text-[11px] text-[var(--orion-text-muted)]">
                    {isGoogleProvider
                      ? 'Managed through your Google OAuth Identity Provider.'
                      : 'Protected with strong cryptographic salt and hash via Firebase Authentication.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!isGoogleProvider && (
                    <button
                      type="button"
                      onClick={() => {
                        setPasswordError(null);
                        setShowPasswordModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                    >
                      Change Password
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={sendingReset}
                    className="px-3.5 py-1.5 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-muted)] hover:text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer disabled:opacity-50"
                  >
                    {sendingReset ? 'Sending Link...' : 'Send Reset Link'}
                  </button>
                </div>
              </div>

              {/* Email Address Security Section */}
              <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-[var(--glass-border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[var(--orion-text-primary)] flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Authorized Login Email</span>
                  </div>
                  <p className="text-[11px] text-[var(--orion-text-muted)] font-mono">
                    {profile.email} {profile.emailVerified ? '· Verified' : '· Verification pending'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!profile.emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition cursor-pointer"
                    >
                      {sendingVerification ? 'Sending...' : 'Resend Verification'}
                    </button>
                  )}

                  {!isGoogleProvider && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmailError(null);
                        setNewEmail('');
                        setEmailAuthPassword('');
                        setShowEmailModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                    >
                      Update Email
                    </button>
                  )}
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-2">
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Session Termination</span>
                  </div>
                  <p className="text-[11px] text-[var(--orion-text-muted)]">
                    Sign out of this browser session. You will be redirected to the public login screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  Sign Out of Orion-9
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: READ-ONLY ACCOUNT INFORMATION */}
        <div className="space-y-6">
          <section className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[var(--glass-border-subtle)] pb-4">
              <h2 className="text-base font-bold text-[var(--orion-text-primary)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>Account & Security Claims</span>
              </h2>
              <p className="text-xs text-[var(--orion-text-muted)] mt-0.5">
                Authoritative cryptographic metadata verified by Firebase & Cloudflare R2.
              </p>
            </div>

            <div className="space-y-4">
              {/* Firebase UID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[var(--orion-text-muted)]">
                  <span>Firebase Auth UID</span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline cursor-pointer"
                  >
                    {copiedUid ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy UID</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--orion-text-primary)] break-all select-all">
                  {profile.uid}
                </div>
              </div>

              {/* Account Role */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[var(--orion-text-muted)] block">
                  System Role & Privileges
                </span>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-xs font-bold text-[var(--orion-text-primary)] capitalize">
                      {profile.isAdmin ? 'System Administrator (Full RBAC)' : (profile.role === 'operator' ? 'Certified SCM Operator' : profile.role)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--orion-text-muted)] uppercase">Immutable</span>
                </div>
                <p className="text-[10px] text-[var(--orion-text-muted)] leading-relaxed">
                  Role assignments and administrator privileges are cryptographically sealed in Firebase custom claims and protected Firestore collections.
                </p>
              </div>

              {/* Email Verification */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[var(--orion-text-muted)] block">
                  Email Verification Status
                </span>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {profile.emailVerified ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Verified by Email Provider</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-400">Verification Pending</span>
                      </>
                    )}
                  </div>
                  {!profile.emailVerified && (
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                      className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                    >
                      Send email
                    </button>
                  )}
                </div>
              </div>

              {/* Account Creation Time */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[var(--orion-text-muted)] block">
                  Account Registration Date
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--orion-text-primary)] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {profile.creationTime
                      ? new Date(profile.creationTime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Initial Provisioning'}
                  </span>
                </div>
              </div>

              {/* Last Sign-In */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[var(--orion-text-muted)] block">
                  Last Active Session
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--orion-text-primary)] flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>
                    {profile.lastSignInTime
                      ? new Date(profile.lastSignInTime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : 'Active Session'}
                  </span>
                </div>
              </div>

              {/* Identity Provider */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[var(--orion-text-muted)] block">
                  Authentication Authority
                </span>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-[var(--glass-border-subtle)] text-xs font-mono text-[var(--orion-text-secondary)]">
                  {profile.providerId === 'google.com'
                    ? 'Google OAuth 2.0 (Federated Identity)'
                    : profile.providerId === 'local_dev'
                      ? 'Local Development Sandbox'
                      : 'Firebase Identity Platform (Password)'}
                </div>
              </div>
            </div>
          </section>

          {/* QUICK LINKS / OS ACCESS */}
          <section className="liquid-glass-elevated rounded-3xl border border-[var(--glass-border)] p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-[var(--orion-text-muted)] uppercase tracking-wider font-mono">
              Quick Navigation
            </h3>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigate('/dashboard')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 transition cursor-pointer text-left font-medium text-[var(--orion-text-primary)]"
              >
                <span>Dashboard Overview</span>
                <ChevronRight className="w-4 h-4 text-[var(--orion-text-muted)]" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/progress')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 transition cursor-pointer text-left font-medium text-[var(--orion-text-primary)]"
              >
                <span>Curriculum Progress & Badges</span>
                <ChevronRight className="w-4 h-4 text-[var(--orion-text-muted)]" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/manual')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 hover:bg-white/60 dark:hover:bg-slate-900/60 transition cursor-pointer text-left font-medium text-[var(--orion-text-primary)]"
              >
                <span>OS User Manual</span>
                <ChevronRight className="w-4 h-4 text-[var(--orion-text-muted)]" />
              </button>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate('/admin')}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 transition cursor-pointer text-left font-semibold"
                >
                  <span>Admin Console</span>
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="macos-window w-full max-w-md rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-[var(--orion-text-primary)]">Change Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] pr-9 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 chars with letters & numbers"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/80 border border-[#CBD5E1] dark:border-slate-700 text-xs font-medium text-[var(--orion-text-primary)] pr-9 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#101010] border border-[#CBD5E1] dark:border-[#292929] text-xs font-medium text-[var(--orion-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[#D4AF37] dark:focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--glass-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={passwordLoading}
                  className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="macos-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE EMAIL MODAL */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="macos-window w-full max-w-md rounded-3xl border border-[var(--glass-border)] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--glass-border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 dark:text-[#F5D76E]" />
                <h3 className="text-sm font-bold text-[var(--orion-text-primary)]">Update Account Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[var(--orion-text-muted)] leading-relaxed">
              Firebase will dispatch a confirmation email to the new address. You must click the confirmation link to finalize your new email.
            </p>

            {emailError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {emailError}
              </div>
            )}

            <form onSubmit={handleEmailChangeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1">
                  New Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new.email@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#101010] border border-[#CBD5E1] dark:border-[#292929] text-xs font-medium text-[var(--orion-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[#D4AF37] dark:focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--orion-text-primary)] mb-1">
                  Current Password (for Re-authentication) *
                </label>
                <input
                  type="password"
                  required
                  value={emailAuthPassword}
                  onChange={(e) => setEmailAuthPassword(e.target.value)}
                  placeholder="Enter current password to authorize"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-[#101010] border border-[#CBD5E1] dark:border-[#292929] text-xs font-medium text-[var(--orion-text-primary)] focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-[#D4AF37] dark:focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--glass-border-subtle)]">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  disabled={emailLoading}
                  className="px-4 py-2 rounded-xl border border-[var(--glass-border)] text-xs font-semibold text-[var(--orion-text-primary)] hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="macos-btn-primary px-5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {emailLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Verification...</span>
                    </>
                  ) : (
                    <span>Request Email Change</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
