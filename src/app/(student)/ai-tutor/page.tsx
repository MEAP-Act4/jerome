'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Sparkles,
  ChevronDown,
  Send,
  ShieldCheck,
  BookOpenCheck,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  Paperclip,
  X,
} from 'lucide-react';
import { usePreferences } from '@/components/preferences/PreferencesProvider';
import { MarkdownMessage } from '@/components/chat/MarkdownMessage';
import {
  MAX_ATTACHMENTS,
  prepareImageAttachment,
} from '@/lib/chat/image-attachment';
import {
  DEFAULT_TUTOR_SUBJECT,
  TUTOR_SUBJECT_GROUPS,
} from '@/lib/tutor-subjects';

type Message = {
  role: 'jerome' | 'student';
  content: string;
  images?: string[];
};

type ChatSessionSummary = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  preview: string;
};

function greetingFor(subject: string) {
  return `Hello! I'm JEROME, your AI study companion. I'm here to help you understand ${subject} at your own pace. What would you like to explore today?`;
}

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';

  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export default function AITutorPage() {
  const { preferences } = usePreferences();
  const [subjectName, setSubjectName] = useState(DEFAULT_TUTOR_SUBJECT);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'jerome', content: greetingFor(DEFAULT_TUTOR_SUBJECT) },
  ]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attaching, setAttaching] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      if (!res.ok) return;
      const payload = await res.json();
      if (Array.isArray(payload?.sessions)) {
        setSessions(payload.sessions);
      }
    } catch {
      // Keep whatever list we already have.
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loadingSession]);

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([{ role: 'jerome', content: greetingFor(subjectName) }]);
    setInput('');
    setAttachments([]);
    setAttachmentError(null);
    setError(null);
    setNeedsAuth(false);
  };

  const handleSubjectChange = (nextSubject: string) => {
    if (nextSubject === subjectName) return;
    setSubjectName(nextSubject);
    setActiveSessionId(null);
    setMessages([{ role: 'jerome', content: greetingFor(nextSubject) }]);
    setInput('');
    setAttachments([]);
    setAttachmentError(null);
    setError(null);
    setNeedsAuth(false);
  };

  const openSession = async (sessionId: string) => {
    if (sessionId === activeSessionId || loading) return;

    setLoadingSession(true);
    setError(null);
    setNeedsAuth(false);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!res.ok) {
        let message = "I couldn't open that conversation. Try again.";
        try {
          const payload = await res.json();
          if (typeof payload?.message === 'string') message = payload.message;
        } catch {
          // keep the default message
        }
        setError(message);
        if (res.status === 404) void refreshSessions();
        return;
      }

      const payload = await res.json();
      const session = payload.session as {
        id: string;
        subject: string;
        messages: Message[];
      };

      setActiveSessionId(session.id);
      setSubjectName(session.subject);
      setMessages(
        session.messages.length > 0
          ? session.messages.map((message) => ({
              role: message.role,
              content: message.content,
              images: message.images,
            }))
          : [{ role: 'jerome', content: greetingFor(session.subject) }]
      );
      setInput('');
      setAttachments([]);
      setAttachmentError(null);
    } catch {
      setError("I couldn't load that conversation just now. Try again in a moment.");
    } finally {
      setLoadingSession(false);
    }
  };

  const deleteSession = async (sessionId: string) => {
    if (deletingId || loading) return;

    setDeletingId(sessionId);
    setError(null);

    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let message = "I couldn't delete that conversation. Try again.";
        try {
          const payload = await res.json();
          if (typeof payload?.message === 'string') message = payload.message;
        } catch {
          // keep the default message
        }
        setError(message);
        return;
      }

      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      if (sessionId === activeSessionId) {
        setActiveSessionId(null);
        setMessages([{ role: 'jerome', content: greetingFor(subjectName) }]);
      }
    } catch {
      setError("I couldn't delete that conversation just now. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    const pendingImages = attachments;
    if (
      (!trimmed && pendingImages.length === 0) ||
      loading ||
      loadingSession
    ) {
      return;
    }

    setError(null);
    setNeedsAuth(false);
    setAttachmentError(null);
    setMessages((prev) => [
      ...prev,
      {
        role: 'student',
        content: trimmed,
        images: pendingImages.length > 0 ? pendingImages : undefined,
      },
      { role: 'jerome', content: '' },
    ]);
    setInput('');
    setAttachments([]);
    setLoading(true);

    const restoreDraft = () => {
      setInput(trimmed);
      setAttachments(pendingImages);
    };

    const updateLast = (text: string) =>
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'jerome', content: text };
        return next;
      });

    const removePlaceholder = () =>
      setMessages((prev) => prev.slice(0, -1));

    try {
      let sessionId = activeSessionId;

      // Sessions are created lazily so the sidebar never fills with empty chats.
      if (!sessionId) {
        const created = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: subjectName }),
        });

        if (!created.ok) {
          let message = "I couldn't start a new conversation. Try again.";
          try {
            const payload = await created.json();
            if (typeof payload?.message === 'string') message = payload.message;
          } catch {
            // keep the default message
          }
          removePlaceholder();
          restoreDraft();
          setNeedsAuth(created.status === 401);
          setError(message);
          return;
        }

        const payload = await created.json();
        sessionId = payload.session.id as string;
        setActiveSessionId(sessionId);
      }

      const history = messages
        .filter((entry) => entry.content.trim())
        .slice(-20)
        .map((entry) => ({ role: entry.role, content: entry.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          images: pendingImages,
          sessionId,
          subject: subjectName,
          history,
          preferences: preferences.agent,
        }),
      });

      if (!res.ok || !res.body) {
        let message = "I couldn't reach my notes just now. Try sending that again.";
        try {
          const payload = await res.json();
          if (typeof payload?.message === 'string') message = payload.message;
        } catch {
          // keep the default message
        }
        removePlaceholder();
        restoreDraft();
        setNeedsAuth(res.status === 401);
        setError(message);
        return;
      }

      setDemoMode(res.headers.get('X-Jerome-Mode') === 'demo');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        updateLast(acc);
      }

      if (!acc.trim()) {
        updateLast("Sorry, I didn't catch that. Mind asking again?");
      }
    } catch {
      removePlaceholder();
      restoreDraft();
      setError(
        "Hmm, I couldn't connect just now. Try sending that again in a moment."
      );
    } finally {
      setLoading(false);
      void refreshSessions();
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || loading || loadingSession) return;

    setAttachmentError(null);
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      setAttachmentError(
        `You can attach up to ${MAX_ATTACHMENTS} images per message.`
      );
      return;
    }

    const chosen = Array.from(files).slice(0, remaining);
    if (files.length > remaining) {
      setAttachmentError(
        `Only the first ${remaining} image${remaining === 1 ? '' : 's'} were added. You can attach up to ${MAX_ATTACHMENTS}.`
      );
    }

    setAttaching(true);
    try {
      const prepared: string[] = [];
      for (const file of chosen) {
        try {
          prepared.push(await prepareImageAttachment(file));
        } catch (error) {
          setAttachmentError(
            error instanceof Error
              ? error.message
              : "I couldn't process that image. Try another one."
          );
        }
      }

      if (prepared.length > 0) {
        setAttachments((previous) =>
          [...previous, ...prepared].slice(0, MAX_ATTACHMENTS)
        );
      }
    } finally {
      setAttaching(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((previous) =>
      previous.filter((_, position) => position !== index)
    );
    setAttachmentError(null);
  };

  const suggestedPrompts = [
    'Explain with a real-life example',
    'Quiz me on domain and range',
    'Draw the unit circle',
    'Help me review for a test',
  ];

  return (
    <div className="flex h-screen bg-[#F7F5F0]">
      <div className="w-[380px] shrink-0 bg-[#143D30] text-white flex flex-col">
        <div className="px-8 pt-8 pb-5">
          <p className="text-xs font-mono tracking-[0.25em] text-[#8FD6BC] uppercase mb-3">
            AI Learning Space
          </p>
          <h1 className="font-['Newsreader',serif] text-4xl leading-tight mb-4">
            Study with JEROME
          </h1>
          <p className="text-sm leading-relaxed text-[#B8CFC4]">
            Your patient AI tutor that walks through each step with you — never rushing, always
            making sure you understand before moving forward.
          </p>
        </div>

        <div className="px-8">
          <label
            htmlFor="tutor-subject"
            className="text-xs font-mono tracking-widest text-[#8FD6BC] uppercase mb-2 block"
          >
            Current Subject
          </label>
          <div className="relative">
            <select
              id="tutor-subject"
              value={subjectName}
              onChange={(event) => handleSubjectChange(event.target.value)}
              disabled={loading}
              className="w-full appearance-none cursor-pointer rounded-xl border border-[#2D6B58] bg-[#1E5243] px-5 py-3.5 pr-11 text-sm font-medium text-white transition-colors hover:border-[#8FD6BC] focus:border-[#8FD6BC] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {TUTOR_SUBJECT_GROUPS.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#8FD6BC]"
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#B8CFC4]">
            JEROME stays within the subject you pick. Switching subjects starts a new chat.
          </p>
        </div>

        <div className="px-8 mt-5">
          <button
            type="button"
            onClick={startNewChat}
            disabled={loading || loadingSession}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#8FD6BC] px-4 py-3 text-sm font-semibold text-[#143D30] transition-colors hover:bg-[#A6E3CB] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={16} />
            New chat
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col px-8 mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono tracking-widest text-[#8FD6BC] uppercase">
              History
            </p>
            {sessions.length > 0 && (
              <span className="text-[11px] text-[#8FB3A4]">{sessions.length}</span>
            )}
          </div>

          <div className="-mx-2 flex-1 min-h-0 overflow-y-auto px-2 pb-2 space-y-1">
            {sessions.length === 0 ? (
              <p className="px-1 pt-1 text-xs leading-relaxed text-[#8FB3A4]">
                Your saved conversations will appear here. Ask JEROME something to start one.
              </p>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => void openSession(session.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        void openSession(session.id);
                      }
                    }}
                    className={`group flex w-full cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-[#8FD6BC]/60 bg-[#1E5243]'
                        : 'border-transparent hover:bg-[#1E5243]/70'
                    }`}
                  >
                    <MessageSquare
                      size={13}
                      className="mt-0.5 shrink-0 text-[#8FD6BC]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {session.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#8FB3A4]">
                        {session.subject} · {relativeTime(session.updatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void deleteSession(session.id);
                      }}
                      disabled={deletingId === session.id}
                      title="Delete conversation"
                      aria-label={`Delete ${session.title}`}
                      className="shrink-0 rounded-md p-1 text-[#8FB3A4] opacity-0 transition-all hover:bg-white/10 hover:text-white focus:opacity-100 group-hover:opacity-100 disabled:cursor-wait"
                    >
                      {deletingId === session.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="px-8 py-5 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 text-xs text-[#B8CFC4]">
            <ShieldCheck size={14} className="text-[#8FD6BC] shrink-0" />
            Stays inside your chosen subject
          </div>
          <div className="flex items-center gap-3 text-xs text-[#B8CFC4]">
            <BookOpenCheck size={14} className="text-[#8FD6BC] shrink-0" />
            Aligned with DepEd STEM
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-[#E2DED6] bg-white flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#8FD6BC] flex items-center justify-center">
              <Sparkles size={16} className="text-[#143D30]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">JEROME</p>
              <p className="text-xs text-[#6B6B6B]">Ready to help — {subjectName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {demoMode && (
              <span
                title="No GEMINI_API_KEY is configured, so replies come from the built-in demo tutor."
                className="text-[11px] font-mono tracking-widest uppercase border border-[#C08A2E]/40 bg-[#F3E3C3] text-[#8A5A12] px-3 py-1.5 rounded-md"
              >
                Demo replies
              </span>
            )}
            <span className="text-[11px] font-mono tracking-widest uppercase bg-[#143D30] text-[#8FD6BC] px-3 py-1.5 rounded-md">
              {preferences.agent.tone} mode
            </span>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {loadingSession && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-[#6B6B6B]">
              <Loader2 size={14} className="animate-spin" />
              Loading conversation…
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-3 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'jerome' && (
                <div className="w-7 h-7 rounded-full bg-[#8FD6BC] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles size={12} className="text-[#143D30]" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                  msg.role === 'student'
                    ? 'bg-[#143D30] text-white rounded-tr-sm'
                    : 'bg-white text-[#1A1A1A] border border-[#E2DED6] rounded-tl-sm'
                }`}
              >
                {msg.role === 'jerome' && !msg.content ? (
                  <span className="italic text-[#6B6B6B]">JEROME is thinking…</span>
                ) : msg.role === 'jerome' ? (
                  <MarkdownMessage content={msg.content} />
                ) : (
                  <div className="space-y-2">
                    {msg.images && msg.images.length > 0 && (
                      <div
                        className={`grid gap-2 ${
                          msg.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                        }`}
                      >
                        {msg.images.map((src, imageIndex) => (
                          <a
                            key={imageIndex}
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block overflow-hidden rounded-lg border border-white/20"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={src}
                              alt={`Attached work ${imageIndex + 1}`}
                              className="max-h-56 w-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {msg.content && (
                      <span className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 pb-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-[#C05050]/30 bg-[#C05050]/10 px-4 py-3 text-sm text-[#9B3B3B]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div>
                <p>{error}</p>
                {needsAuth && (
                  <Link
                    href="/login"
                    className="mt-1 inline-flex font-medium underline underline-offset-2"
                  >
                    Go to sign in
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="text-xs bg-[#EDEAE2] text-[#3D3D3D] px-3.5 py-2 rounded-lg hover:bg-[#8FD6BC]/30 hover:text-[#143D30] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {attachmentError && (
              <p className="text-xs text-[#9B3B3B]">{attachmentError}</p>
            )}

            <div className="rounded-xl border border-[#D8D4CA] bg-white transition-colors focus-within:border-[#8FD6BC]">
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 border-b border-[#EDEAE2] px-3 pb-2 pt-3">
                  {attachments.map((src, index) => (
                    <div key={index} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Attachment ${index + 1}`}
                        className="h-16 w-16 rounded-lg border border-[#E2DED6] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        title="Remove attachment"
                        aria-label={`Remove attachment ${index + 1}`}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#143D30] text-white shadow transition-colors hover:bg-[#0E2B22]"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  {attaching && (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[#D8D4CA] text-[#6B6B6B]">
                      <Loader2 size={16} className="animate-spin" />
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2 p-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => void handleFiles(event.target.files)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    loading ||
                    loadingSession ||
                    attaching ||
                    attachments.length >= MAX_ATTACHMENTS
                  }
                  title="Attach a photo of your work"
                  aria-label="Attach a photo of your work"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-[#6B6B6B] transition-colors hover:bg-[#8FD6BC]/20 hover:text-[#143D30] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {attaching ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Paperclip size={18} />
                  )}
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Ask anything about ${subjectName}, or attach a photo of your work...`}
                  rows={1}
                  className="min-h-[44px] max-h-[120px] flex-1 resize-none bg-transparent px-1 py-2.5 text-sm placeholder:text-[#9B9B9B] focus:outline-none"
                />

                <button
                  onClick={handleSend}
                  disabled={
                    loading ||
                    loadingSession ||
                    attaching ||
                    (!input.trim() && attachments.length === 0)
                  }
                  title="Send message"
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#143D30] text-white transition-colors hover:bg-[#0E2B22] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#9B9B6B]">
              You can attach up to {MAX_ATTACHMENTS} photos per message. JPG, PNG,
              or WebP work best.
            </p>
          </div>

          <p className="text-[11px] text-[#9B9B6B] text-center leading-relaxed">
            JEROME provides AI-generated guidance. Always verify answers with your teacher or
            textbook.
          </p>
        </div>
      </div>
    </div>
  );
}
