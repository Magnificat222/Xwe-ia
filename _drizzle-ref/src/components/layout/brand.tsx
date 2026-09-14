import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  size = 32,
  withText = true,
  href = "/",
  className,
}: {
  size?: number;
  withText?: boolean;
  href?: string | null;
  className?: string;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        priority
        className="rounded-full object-contain"
      />
      {withText && (
        <span className="font-display text-lg leading-none tracking-tight text-ivoire">
          Xwé <span className="text-or">IA</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} aria-label="Xwé IA — accueil" className="rounded-lg">
      {content}
    </Link>
  );
}
