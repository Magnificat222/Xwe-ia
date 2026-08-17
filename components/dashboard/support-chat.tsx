"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Sparkles, ShieldCheck, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderRole: "USER" | "ADMIN" | "AI";
  authorId: string | null;
  authorName: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;
const MAX_DIMENSION = 900;

// Resizes/compresses the picked image client-side before it's ever sent —
// keeps the payload light since it ends up stored as a data URL.
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function SupportChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    const res = await fetch("/api/support/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const resized = await resizeImage(file);
    setPendingImage(resized);
  };

  const handleSend = async () => {
    if ((!input.trim() && !pendingImage) || sending) return;
    setSending(true);

    const res = await fetch("/api/support/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input, imageUrl: pendingImage }),
    });

    if (res.ok) {
      setInput("");
      setPendingImage(null);
      fetchMessages();
    } else {
      const { error } = await res.json();
      alert(error ?? "Impossible d'envoyer le message.");
    }
    setSending(false);
  };

  return (
    <div className="flex h-[65vh] flex-col rounded-card border border-ivoire/10 bg-noir-elevated">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-ivoire-dim">
            Le salon Premium est calme pour l'instant — posez une question,
            l'assistant IA répond immédiatement et l'équipe Xwé IA peut
            intervenir à tout moment.
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.authorId === session?.user?.id;
          return (
            <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  m.senderRole === "AI" && "bg-feuillage-soft/50 text-ivoire",
                  m.senderRole === "ADMIN" && "bg-or text-noir",
                  m.senderRole === "USER" && (isMine ? "bg-or text-noir" : "bg-ivoire/8 text-ivoire")
                )}
              >
                <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium opacity-80">
                  {m.senderRole === "AI" && <Sparkles size={11} />}
                  {m.senderRole === "ADMIN" && <ShieldCheck size={11} />}
                  {m.senderRole === "ADMIN" ? "Xwé IA (équipe)" : m.authorName}
                </p>
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt="Image partagée"
                    className="mb-1.5 max-h-64 rounded-md object-cover"
                  />
                )}
                {m.content}
                <p className="mt-1 text-[10px] opacity-60">
                  {new Date(m.createdAt).toLocaleString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {pendingImage && (
        <div className="flex items-center gap-2 border-t border-ivoire/10 px-3 pt-3">
          <div className="relative">
            <img src={pendingImage} alt="Aperçu" className="h-16 w-16 rounded-md object-cover" />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-noir text-ivoire"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-ivoire/10 p-3">
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePickImage} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ivoire/15 text-ivoire-dim hover:text-or"
          title="Joindre une image"
        >
          <ImageIcon size={16} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Écrivez votre message au salon Premium..."
          className="flex-1 rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
        <Button size="sm" onClick={handleSend} disabled={sending}>
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}
