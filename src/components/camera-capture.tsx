"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Camera, Loader2, RefreshCw } from "lucide-react";
import { useMealLogger } from "./use-meal-logger";

export function CameraCapture({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { logPhoto, pending } = useMealLogger();
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [note, setNote] = useState("");

  const start = useCallback(async () => {
    setError(null);
    try {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError(
        "Couldn't access the camera. Check permissions, or use Manual to upload a photo.",
      );
    }
  }, [facing]);

  useEffect(() => {
    start();
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [start]);

  async function shoot() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.9),
    );
    if (!blob) return;
    try {
      await logPhoto(blob, note.trim() || undefined);
      onClose();
    } catch {
      /* toast already shown */
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />

      {/* top bar */}
      <div
        className="relative flex items-center justify-between p-4"
        style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
      >
        <button
          onClick={onClose}
          className="grid size-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label="Close camera"
        >
          <X className="size-6" />
        </button>
        <button
          onClick={() => setFacing((f) => (f === "environment" ? "user" : "environment"))}
          className="grid size-11 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
          aria-label="Switch camera"
        >
          <RefreshCw className="size-5" />
        </button>
      </div>

      {error && (
        <div className="relative mx-6 mt-4 rounded-xl bg-black/60 p-4 text-center text-sm text-white backdrop-blur">
          {error}
        </div>
      )}

      {/* shutter */}
      <div
        className="relative mt-auto flex flex-col items-center gap-3 pb-8"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
      >
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note…"
          disabled={pending}
          enterKeyHint="done"
          className="mb-1 w-[min(100%,20rem)] rounded-2xl border-0 bg-black/40 px-4 py-2.5 text-center text-sm text-white outline-none placeholder:text-white/50 backdrop-blur disabled:opacity-60"
        />
        <p className="text-sm text-white/80">Point at your meal and tap to log</p>
        <button
          onClick={shoot}
          disabled={pending || !!error}
          className="grid size-20 place-items-center rounded-full bg-white text-black ring-4 ring-white/30 transition active:scale-95 disabled:opacity-60"
          aria-label="Capture photo"
        >
          {pending ? (
            <Loader2 className="size-8 animate-spin" />
          ) : (
            <Camera className="size-8" />
          )}
        </button>
      </div>
    </div>
  );
}
