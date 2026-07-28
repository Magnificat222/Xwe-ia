"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SupportMessage {
  id: string;
  senderRole: "USER" | "ADMIN" | "AI";
  content: string;
  createdAt: string;
}

const POLL_INTERVAL_MS = 5000;

export function SupportChat({
  targetUserId,
  asAdmin = false,
}: {
  /** When asAdmin is true, targetUserId is the Premium user's id whose thread is being viewed. */
  targetUserId?: string;
  asAdmin?: boolean;
}) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const url = asAdmin && targetUserId
      ? `/api/support/messages?userId=${targetUserId}`
      : "/api/support/messages";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const body = asAdmin && targetUserId
      ? { content: input, userId: targetUserId }
      : { content: input };

    const res = await fetch("/api/support/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
            {asAdmin
              ? "Aucun message dans ce fil pour l'instant."
              : "Posez votre question, l'équipe Xwé IA vous répond ici."}
          </p>
        )}
        {messages.map((m) => {
          const isMine = asAdmin ? m.senderRole === "ADMIN" : m.senderRole === "USER";
          return (
            <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-lg px-3 py-2 text-sm",
                  isMine ? "bg-or text-noir" : "bg-ivoire/8 text-ivoire"
                )}
              >
                {m.content}
                <p className={cn("mt-1 text-[10px]", isMine ? "text-noir/60" : "text-ivoire-dim")}>
                  {new Date(m.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
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
          placeholder="Écrivez votre message..."
          className="flex-1 rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
        />
        <Button size="sm" onClick={handleSend} disabled={sending}>
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}
