import { useEffect, useRef } from "react";

export function useDialogFocus(open: boolean) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => {
      const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(
        '[data-dialog-autofocus], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      firstFocusable?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [open]);

  return dialogRef;
}
