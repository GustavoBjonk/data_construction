"use client";

import { useState } from "react";
import { LinkIcon } from "./Icons";

interface ShareLinksProps {
  url: string;
  title: string;
}

const COPIED_FEEDBACK_MS = 2000;

/** Compartilhamento sem scripts de terceiros: links de intenção + copiar link. */
export function ShareLinks({ url, title }: ShareLinksProps) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "X", href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Sem permissão de área de transferência: o usuário ainda pode copiar da barra de endereço.
    }
  }

  const itemClass =
    "inline-flex min-h-[36px] items-center gap-2 rounded-full border border-line px-3.5 text-xs text-muted transition-colors hover:border-line-strong hover:text-fg";

  return (
    <div>
      <p className="eyebrow">Compartilhar</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {targets.map((target) => (
          <li key={target.label}>
            <a href={target.href} target="_blank" rel="noopener noreferrer" className={itemClass}>
              {target.label}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </li>
        ))}
        <li>
          <button type="button" onClick={copyLink} className={itemClass}>
            <LinkIcon size={14} />
            {copied ? "Link copiado" : "Copiar link"}
          </button>
        </li>
      </ul>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copiado para a área de transferência." : ""}
      </p>
    </div>
  );
}
