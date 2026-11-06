import { useEffect, useRef, useState } from "react";

export function useClipboard(text: string) {
  const [result, setResult] = useState<{ text: string; copied: boolean } | null>(null);
  const attempt = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => {
    attempt.current += 1;
    window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    if (!text) return;
    const id = ++attempt.current;
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      if (attempt.current !== id) return;
      setResult({ text, copied: true });
      timer.current = window.setTimeout(() => setResult(null), 1500);
    } catch {
      if (attempt.current === id) setResult({ text, copied: false });
    }
  };

  return {
    copy,
    copied: result?.text === text && result.copied,
    copyFailed: result?.text === text && !result.copied,
  };
}
