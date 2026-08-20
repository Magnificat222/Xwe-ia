"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Sparkles, ShieldCheck, Image as ImageIcon, X, Reply, Pencil, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderRole: "USER" | "ADMIN" | "AI";
  authorId: string | null;
  authorName: string;
  content: string;
  imageUrl: string | null;
  editedAt: string | null;
  replyTo: { id: string; authorName: string; content: string } | null;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;
const MAX_DIMENSION = 900;

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
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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
      body: JSON.stringify({ content: input, imageUrl: pendingImage, replyToId: replyTo?.id ?? null }),
    });

    if (res.ok) {
      setInput("");
      setPendingImage(null);
      setReplyTo(null);
      fetchMessages();
    } else {
      const { error } = await res.json();
      alert(error ?? "Impossible d'envoyer le message.");
    }
    setSending(false);
  };

  const startEdit = (m: ChatMessage) => {
    setEditingId(m.id);
    setEditValue(m.content);
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return;
    const res = await fetch(`/api/support/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editValue }),
    });
    if (res.ok) {
      setEditingId(null);
      fetchMessages();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const res = await fetch(`/api/support/messages/${id}`, { method: "DELETE" });
    if (res.ok) fetchMessages();
  };

  const isAdmin = session?.user?.role === "ADMIN";

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
          const canModify = isMine && m.senderRole !== "AI";
          const canDelete = isMine || isAdmin;
          const isEditing = editingId === m.id;

          return (
            <div key={m.id} className={cn("group flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn("flex max-w-[80%] items-end gap-1.5", isMine && "flex-row-reverse")}>
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
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

                  {m.replyTo && (
                    <div className="mb-1.5 rounded border-l-2 border-current/30 bg-black/10 px-2 py-1 text-xs opacity-75">
                      <p className="font-medium">{m.replyTo.authorName}</p>
                      <p className="line-clamp-1">{m.replyTo.content}</p>
                    </div>
                  )}

                  {m.imageUrl && (
                    <img
                      src={m.imageUrl}
                      alt="Image partagée"
                      className="mb-1.5 max-h-64 rounded-md object-cover"
                    />
                  )}

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(m.id)}
                        autoFocus
                        className="rounded border border-current/30 bg-black/10 px-2 py-1 text-sm outline-none"
                      />
                      <button onClick={() => saveEdit(m.id)} title="Enregistrer">
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    m.content
                  )}

                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.createdAt).toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {m.editedAt && " · modifié"}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => setReplyTo(m)} title="Répondre" className="text-ivoire-dim hover:text-or">
                    <Reply size={13} />
                  </button>
                  {canModify && (
                    <button onClick={() => startEdit(m)} title="Modifier" className="text-ivoire-dim hover:text-or">
                      <Pencil size={13} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(m.id)} title="Supprimer" className="text-ivoire-dim hover:text-red-400">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="flex items-center justify-between border-t border-ivoire/10 px-3 pt-3 text-xs text-ivoire-dim">
          <p className="line-clamp-1">
            Réponse à <span className="text-ivoire">{replyTo.authorName}</span> — {replyTo.content}
          </p>
          <button onClick={() => setReplyTo(null)}>
            <X size={14} />
          </button>
        </div>
      )}

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
