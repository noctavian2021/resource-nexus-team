
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts, toast } = useToast()

  // Setup global access to toast
  useEffect(() => {
    // Make the toast function globally accessible
    if (typeof window !== "undefined") {
      (window as any).toastHandler = { toast };
    }
  }, [toast]);

  // Setup toast event listener
  useEffect(() => {
    const handleToastEvent = (e: any) => {
      if (e.detail) {
        toast(e.detail);
        console.log("Toast event received:", e.detail);
      }
    };

    window.addEventListener("lovable-toast-event", handleToastEvent);
    return () => {
      window.removeEventListener("lovable-toast-event", handleToastEvent);
    };
  }, [toast]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
