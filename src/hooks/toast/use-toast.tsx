
import * as React from 'react';
import { ToastContext } from './toast-context';
import { Toast, ToasterToast } from './types';
import { genId } from './reducer';

// Hook for components to use the toast context
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Export a standalone function for use outside of React components
export const toast = (props: Toast) => {
  if (typeof window !== "undefined") {
    // If we're in browser context, dispatch a custom event
    const eventName = "lovable-toast-event";
    const event = new CustomEvent(eventName, { detail: props });
    window.dispatchEvent(event);
    
    // Provide a return value for API consistency
    const id = genId();
    return {
      id,
      dismiss: () => {},
      update: () => {},
    };
  }
  
  // Fallback for server-side or when context not available
  console.warn("Toast used outside of component context - this may not work as expected");
  return {
    id: genId(),
    dismiss: () => {},
    update: () => {},
  };
};

// Listen for toast events globally
if (typeof window !== "undefined") {
  window.addEventListener("lovable-toast-event", ((e: CustomEvent) => {
    const toastProps = e.detail;
    const handler = (window as any).toastHandler;
    if (handler && typeof handler.toast === 'function') {
      handler.toast(toastProps);
    }
  }) as EventListener);
}

// Re-export the ToastProvider
export { ToastProvider } from './toast-context';
