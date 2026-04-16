"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ARCHETYPES, findArchetype, type ArchetypeKey } from "@/lib/archetypes";

type Stage = "idle" | "composing" | "drafting" | "checking" | "rendering" | "ready" | "error";

type GenerateResponse = {
  ok: boolean;
  error?: string;
  source?: "llm" | "fallback";
  latencyMs?: number;
  attempts?: unknown[];
  previewId?: string;
  siteId?: string;
  slug?: string;
  shareUrl?: string;
  archetype?: string;
  violations?: { severity: "error" | "warning"; message: string }[];
};

type RenameResponse = {
  ok: boolean;
  slug?: string;
  shareUrl?: string;
  error?: string;
  code?: string;
};

const STAGE_COPY: Record<Exclude<Stage, "idle" | "ready" | "error">, string> = {
  composing: "Composing brief",
  drafting: "Drafting spec",
  checking: "Checking taste",
  rendering: "Rendering",
};

const STAGE_ORDER: (keyof typeof STAGE_COPY)[] = ["composing", "drafting", "checking", "rendering"];

export function Studio() {
  const [archetype, setArchetype] = useState<ArchetypeKey>("minimalist-ui");
  const [prompt, setPrompt] = useState(findArchetype("minimalist-ui").starter);
  const [stage, setStage] = useState<Stage>("idle");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [slugDraft, setSlugDraft] = useState("");
  const [slugEditing, setSlugEditing] = useState(false);
  const [slugBusy, setSlugBusy] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [meta, setMeta] = useState<{ source?: string; latencyMs?: number; error?: string; violations?: GenerateResponse["violations"] }>({});
  const [isMac, setIsMac] = useState(false);
  const stageTimersRef = useRef<number[]>([]);
  const lastRequestIdRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMac(typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform));
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const flashToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const shareUrl = slug ? `${origin}/s/${slug}` : "";

  const copyShareLink = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      flashToast("Link copied");
    } catch {
      flashToast("Copy failed — long-press to copy");
    }
  }, [shareUrl, flashToast]);

  const beginSlugEdit = useCallback(() => {
    if (!slug) return;
    setSlugDraft(slug);
    setSlugError(null);
    setSlugEditing(true);
  }, [slug]);

  const cancelSlugEdit = useCallback(() => {
    setSlugEditing(false);
    setSlugError(null);
  }, []);

  const saveSlug = useCallback(async () => {
    if (!siteId) return;
    const next = slugDraft.trim().toLowerCase();
    if (!next || next === slug) {
      setSlugEditing(false);
      return;
    }
    setSlugBusy(true);
    setSlugError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/slug`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: next }),
      });
      const data = (await res.json()) as RenameResponse;
      if (!data.ok || !data.slug) {
        setSlugError(data.error ?? "Could not rename.");
        return;
      }
      setSlug(data.slug);
      setSlugEditing(false);
      flashToast("Slug updated");
    } catch {
      setSlugError("Network error");
    } finally {
      setSlugBusy(false);
    }
  }, [siteId, slug, slugDraft, flashToast]);

  const clearStageTimers = () => {
    stageTimersRef.current.forEach((t) => window.clearTimeout(t));
    stageTimersRef.current = [];
  };

  useEffect(() => () => clearStageTimers(), []);

  const pickArchetype = (key: ArchetypeKey) => {
    setArchetype(key);
    const a = findArchetype(key);
    // Only swap the prompt text if it's still a starter from one of the archetypes
    // (don't clobber the user's own typing).
    const starters = new Set(ARCHETYPES.map((x) => x.starter));
    setPrompt((cur) => (starters.has(cur) ? a.starter : cur));
  };

  const run = useCallback(async () => {
    const requestId = ++lastRequestIdRef.current;
    setMeta({});
    setPreviewId(null);
    setSiteId(null);
    setSlug(null);
    setSlugEditing(false);
    setSlugError(null);
    setStage("composing");
    clearStageTimers();
    // Optimistic stage ladder — caps at 'rendering' until server responds.
    const timings = [380, 1400, 3200];
    const advances: Stage[] = ["drafting", "checking", "rendering"];
    timings.forEach((t, i) => {
      stageTimersRef.current.push(
        window.setTimeout(() => {
          if (lastRequestIdRef.current === requestId) {
            setStage((cur) => (cur === "ready" || cur === "error" ? cur : advances[i]));
          }
        }, t)
      );
    });

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, archetype }),
      });
      if (lastRequestIdRef.current !== requestId) return;
      const data = (await res.json()) as GenerateResponse;
      clearStageTimers();
      if (!data.ok || !data.previewId) {
        setStage("error");
        setMeta({ error: data.error ?? "Generation failed." });
        return;
      }
      setPreviewId(data.previewId);
      setSiteId(data.siteId ?? data.previewId);
      setSlug(data.slug ?? null);
      setMeta({ source: data.source, latencyMs: data.latencyMs, violations: data.violations });
      setStage("ready");
    } catch (err) {
      if (lastRequestIdRef.current !== requestId) return;
      clearStageTimers();
      setStage("error");
      setMeta({ error: err instanceof Error ? err.message : "Network error" });
    }
  }, [archetype, prompt]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const modifier = e.metaKey || e.ctrlKey;
      if (modifier && (e.key === "Enter" || e.key === "r" || e.key === "R")) {
        e.preventDefault();
        void run();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const busy = stage !== "idle" && stage !== "ready" && stage !== "error";
  const blockingViolations = (meta.violations ?? []).filter((v) => v.severity === "error");

  const currentStageIndex = useMemo(() => {
    const order = STAGE_ORDER as string[];
    return order.indexOf(stage as string);
  }, [stage]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-ink-50 text-ink-900">
      <header className="border-b border-black/5">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-4">
          <span className="font-display text-[22px] leading-none tracking-tight">Silk</span>
          <span className="rounded-full border border-ink-900/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-ink-600">
            studio · v0
          </span>
          <div className="flex-1" />
          {meta.source && (
            <span className="text-xs text-ink-600">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[#7C8B72] align-middle" />
              {meta.source} · {meta.latencyMs}ms
            </span>
          )}
          <a
            href="/demo"
            className="ml-3 text-xs uppercase tracking-[0.2em] text-ink-600 underline-offset-4 hover:underline"
          >
            Demo
          </a>
        </div>
      </header>

      <section className="border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 pt-10 pb-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-600">Brief</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                spellCheck
                className="w-full resize-none rounded-2xl border border-black/10 bg-white px-5 py-4 font-display text-[20px] leading-[1.35] text-ink-900 placeholder:text-ink-600 focus:outline-none focus:ring-2 focus:ring-ink-900/10"
                placeholder="Describe the site. One paragraph is plenty."
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={run}
                  disabled={busy || prompt.trim().length < 8}
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-ink-900 px-5 text-sm tracking-wide text-white transition hover:bg-black disabled:opacity-50"
                >
                  <span>{previewId ? "Regenerate" : "Generate"}</span>
                  <span className="hidden text-[10px] uppercase tracking-[0.22em] opacity-60 sm:inline">
                    {isMac ? "\u2318\u21B5" : "Ctrl \u21B5"}
                  </span>
                </button>
                {previewId && (
                  <button
                    onClick={run}
                    disabled={busy}
                    className="inline-flex h-11 items-center rounded-md border border-ink-900/15 px-4 text-sm text-ink-900 transition hover:border-ink-900/30 disabled:opacity-50"
                  >
                    Re-roll
                  </button>
                )}
                <span className="text-xs text-ink-600">
                  {prompt.trim().length} chars
                </span>
              </div>
            </div>
            <div>
              <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-ink-600">Archetype</p>
              <div className="flex flex-col gap-2">
                {ARCHETYPES.map((a) => {
                  const active = archetype === a.key;
                  return (
                    <button
                      key={a.key}
                      onClick={() => pickArchetype(a.key)}
                      className={`group rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-ink-900 bg-white shadow-soft"
                          : "border-black/10 bg-white/60 hover:border-ink-900/40"
                      }`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-display text-[17px] tracking-tight">{a.label}</span>
                        {active && (
                          <span className="text-[10px] uppercase tracking-[0.22em] text-ink-600">selected</span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-ink-600">{a.hint}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-6">
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-600">Preview</p>
          <div className="flex-1" />
          {busy && <StageLadder currentIndex={Math.max(0, currentStageIndex)} />}
          {stage === "ready" && meta.violations && meta.violations.length > 0 && (
            <span className="text-xs text-[#A34560]">
              {blockingViolations.length > 0
                ? `${blockingViolations.length} taste error${blockingViolations.length === 1 ? "" : "s"}`
                : `${meta.violations.length} warning${meta.violations.length === 1 ? "" : "s"}`}
            </span>
          )}
        </div>
        {stage === "ready" && slug && (
          <ShareBar
            origin={origin}
            slug={slug}
            slugDraft={slugDraft}
            slugEditing={slugEditing}
            slugBusy={slugBusy}
            slugError={slugError}
            onDraftChange={setSlugDraft}
            onBeginEdit={beginSlugEdit}
            onCancel={cancelSlugEdit}
            onSave={saveSlug}
            onCopy={copyShareLink}
          />
        )}
        <div className="flex-1 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-soft">
          {stage === "idle" && <EmptyState />}
          {busy && <PendingState stage={stage} />}
          {stage === "error" && <ErrorState message={meta.error ?? "Unknown error"} />}
          {stage === "ready" && previewId && (
            <iframe
              key={previewId}
              src={`/preview/${previewId}`}
              title="Rendered site preview"
              className="h-[72vh] min-h-[520px] w-full border-0"
              sandbox="allow-same-origin allow-forms allow-popups allow-scripts"
            />
          )}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}

function ShareBar(props: {
  origin: string;
  slug: string;
  slugDraft: string;
  slugEditing: boolean;
  slugBusy: boolean;
  slugError: string | null;
  onDraftChange: (v: string) => void;
  onBeginEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onCopy: () => void;
}) {
  const { origin, slug, slugDraft, slugEditing, slugBusy, slugError, onDraftChange, onBeginEdit, onCancel, onSave, onCopy } = props;
  const host = origin ? origin.replace(/^https?:\/\//, "") : "silk.local";
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-soft/50">
      <span className="text-[10px] uppercase tracking-[0.22em] text-ink-600">Share</span>
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-ink-600">{host}/s/</span>
        {slugEditing ? (
          <>
            <input
              value={slugDraft}
              onChange={(e) => onDraftChange(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              disabled={slugBusy}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="min-w-0 flex-1 rounded-md border border-ink-900/20 bg-white px-2 py-1 font-mono text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/10"
              aria-label="Slug"
            />
            <button
              onClick={onSave}
              disabled={slugBusy}
              className="rounded-md bg-ink-900 px-3 py-1 text-xs text-white disabled:opacity-50"
            >
              {slugBusy ? "Saving" : "Save"}
            </button>
            <button
              onClick={onCancel}
              disabled={slugBusy}
              className="rounded-md border border-ink-900/15 px-3 py-1 text-xs text-ink-900"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onBeginEdit}
              className="truncate rounded-md border border-transparent px-1 font-mono text-sm text-ink-900 underline-offset-4 hover:border-ink-900/10 hover:underline"
              title="Edit slug"
            >
              {slug}
            </button>
            <div className="flex-1" />
            <button
              onClick={onCopy}
              className="inline-flex items-center gap-2 rounded-md border border-ink-900/15 px-3 py-1 text-xs text-ink-900 transition hover:border-ink-900/30"
              aria-label="Copy share link"
            >
              <CopyIcon />
              <span>Copy link</span>
            </button>
            <a
              href={`/s/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-ink-900 px-3 py-1 text-xs text-white"
            >
              Open
              <ArrowIcon />
            </a>
          </>
        )}
      </div>
      {slugError && <span className="w-full text-xs text-[#A34560]">{slugError}</span>}
    </div>
  );
}

function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink-900 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white shadow-soft"
    >
      {message}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function StageLadder({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-ink-600">
      {STAGE_ORDER.map((s, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <span key={s} className="flex items-center gap-1.5">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full transition ${
                done ? "bg-ink-900" : active ? "animate-pulse bg-ink-900" : "bg-ink-900/20"
              }`}
            />
            <span className={active ? "text-ink-900" : ""}>{STAGE_COPY[s]}</span>
            {i < STAGE_ORDER.length - 1 && <span className="text-ink-900/20">·</span>}
          </span>
        );
      })}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[72vh] min-h-[520px] flex-col items-center justify-center px-10 text-center">
      <p className="font-display text-[28px] leading-[1.2] tracking-tight text-ink-900">
        Describe a site.
        <br />
        <span className="text-ink-600">See it come to life.</span>
      </p>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-600">
        One paragraph is enough. Choose an archetype on the right — Minimalist by default.
        Generate produces a rendered, animated site in the panel below within seconds.
      </p>
    </div>
  );
}

function PendingState({ stage }: { stage: Stage }) {
  return (
    <div className="flex h-[72vh] min-h-[520px] flex-col items-center justify-center gap-6 px-10 text-center">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 animate-ping rounded-full bg-ink-900/5" />
        <span className="absolute inset-2 rounded-full bg-ink-900/80" />
      </div>
      <p className="font-display text-[22px] tracking-tight text-ink-900">
        {stage === "composing" && "Reading your brief."}
        {stage === "drafting" && "Drafting the page."}
        {stage === "checking" && "Running taste checks."}
        {stage === "rendering" && "Almost there."}
      </p>
      <p className="text-xs uppercase tracking-[0.22em] text-ink-600">do not reload</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-[72vh] min-h-[520px] flex-col items-center justify-center px-10 text-center">
      <p className="font-display text-[22px] tracking-tight text-[#A34560]">Generation failed.</p>
      <p className="mt-3 max-w-md text-sm text-ink-600">{message}</p>
    </div>
  );
}
