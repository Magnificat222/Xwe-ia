"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  senderRole: "USER" | "ADMIN" | "AI";
  authorId: string | null;
  authorName: string;
  content: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export function SupportChat() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    const res = await fetch("/api/support/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input }),
    });

    if (res.ok) {
      setInput("");
      fetchMessages();
    } else {
      const { error } = await res.json();
      alert(error ?? "Impossible d'envoyer le message.");
    }
    setSending(false);
  };

  return (
    <div className="flex h-[65vh] flex-col rounded-card border border-ivoire/10 bg-noir-soft">
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
                  m.senderRole === "AI" && "bg-violet-soft/50 text-ivoire",
                  m.senderRole === "ADMIN" && "bg-or text-noir",
                  m.senderRole === "USER" && (isMine ? "bg-or text-noir" : "bg-ivoire/8 text-ivoire")
                )}
              >
                <p className="mb-0.5 flex items-center gap-1.5 text-[11px] font-medium opacity-80">
                  {m.senderRole === "AI" && <Sparkles size={11} />}
                  {m.senderRole === "ADMIN" && <ShieldCheck size={11} />}
                  {m.senderRole === "ADMIN" ? "Xwé IA (équipe)" : m.authorName}
                </p>
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

      <div className="flex items-center gap-2 border-t border-ivoire/10 p-3">
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
