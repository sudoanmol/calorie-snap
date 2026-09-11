"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Send, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMealLogger } from "./use-meal-logger";

export function ManualEntry({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { logText, logPhoto, pending } = useMealLogger();
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const preview = photo ? URL.createObjectURL(photo) : null;

  async function send() {
    if (pending) return;
    try {
      if (photo) {
        await logPhoto(photo, text.trim() || undefined);
      } else if (text.trim()) {
        await logText(text.trim());
      } else {
        return;
      }
      setText("");
      setPhoto(null);
      onOpenChange(false);
    } catch {
      /* toast already shown */
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed bottom-0 left-1/2 top-auto w-full max-w-md -translate-x-1/2 translate-y-0 rounded-b-none rounded-t-2xl p-4 data-open:slide-in-from-bottom-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between">
          <DialogTitle>Describe your meal</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        {preview && (
          <div className="relative mt-1 w-fit">
            <Image
              src={preview}
              alt="Selected meal"
              width={96}
              height={96}
              className="size-24 rounded-xl object-cover"
              unoptimized
            />
            <button
              onClick={() => setPhoto(null)}
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-black text-white ring-1 ring-white/20"
              aria-label="Remove photo"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Two scrambled eggs, a slice of whole wheat toast and a black coffee"
          rows={3}
          className="resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
        />

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setPhoto(f);
            e.target.value = "";
          }}
        />

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="gap-2"
          >
            <ImagePlus className="size-4" />
            {photo ? "Change photo" : "Add photo"}
          </Button>
          <Button
            onClick={send}
            disabled={pending || (!photo && !text.trim())}
            className="gap-2"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Log meal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
