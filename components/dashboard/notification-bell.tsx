"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const POLL_INTERVAL_MS = 15000;

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleOpenItem = async (item: NotificationItem) => {
    if (!item.read) {
      await fetch(`/api/notifications/${item.id}/read`, { method: "POST" });
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ivoire/15 text-ivoire-dim hover:text-or"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-braise px-1 text-[10px] font-medium text-ivoire">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-lg border border-ivoire/10 bg-noir-elevated shadow-xl">
          <div className="flex items-center justify-between border-b border-ivoire/10 px-4 py-2.5">
            <p className="text-sm font-medium text-ivoire">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-or hover:underline">
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ivoire-dim">Rien pour l'instant.</p>
            )}
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.link}
                onClick={() => handleOpenItem(item)}
                className={`block border-b border-ivoire/5 px-4 py-3 text-sm last:border-0 hover:bg-ivoire/5 ${
                  item.read ? "text-ivoire-dim" : "text-ivoire"
                }`}
              >
                <p className="flex items-start gap-2">
                  {!item.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-braise" />}
                  {item.message}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
