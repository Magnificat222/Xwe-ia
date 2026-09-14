"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Upload, X } from "lucide-react";

const MAX_DIMENSION = 400;

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
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarForm({ currentImage }: { currentImage: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [status, setStatus] = useState<"idle" | "saving">("idle");

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const resized = await resizeImage(file);
    setPreview(resized);
    await save(resized);
  };

  const save = async (imageUrl: string | null) => {
    setStatus("saving");
    await fetch("/api/account/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });
    setStatus("idle");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ivoire/15 bg-noir">
        {preview ? (
          <img src={preview} alt="Photo de profil" className="h-full w-full object-cover" />
        ) : (
          <User size={24} className="text-ivoire-dim" />
        )}
      </div>
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePick} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "saving"}
          className="inline-flex items-center gap-1.5 rounded-full border border-ivoire/15 px-3.5 py-2 text-xs text-ivoire-dim hover:border-or/40 hover:text-or"
        >
          <Upload size={13} /> {preview ? "Changer" : "Ajouter une photo"}
        </button>
        {preview && (
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              save(null);
            }}
            disabled={status === "saving"}
            className="inline-flex items-center gap-1.5 rounded-full border border-ivoire/15 px-3.5 py-2 text-xs text-ivoire-dim hover:border-red-400/40 hover:text-red-400"
          >
            <X size={13} /> Retirer
          </button>
        )}
      </div>
    </div>
  );
}
