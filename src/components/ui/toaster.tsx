
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
  const { toasts, toast } = useToast();

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
