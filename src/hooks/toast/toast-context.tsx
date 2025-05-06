
import * as React from 'react';
import { State, Toast, ToasterToast } from './types';
import { reducer, initialState, toastTimeouts, genId, TOAST_REMOVE_DELAY } from './reducer';
import { actionTypes } from './types';
import { Toaster } from "@/components/ui/toaster";

// Context type definition
type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: Toast) => {
    id: string;
    update: (props: Partial<ToasterToast>) => void;
    dismiss: () => void;
  };
  dismissToast: (toastId?: string) => void;
  updateToast: (id: string, props: Partial<ToasterToast>) => void;
};

// Create the context
export const ToastContext = React.createContext<ToastContextType | null>(null);

// Custom hook for managing toast state
function useToastReducer() {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open && toastTimeouts.has(toast.id)) return;

      // When toast closes, dismiss it after the delay
      if (!toast.open) {
        const timeout = setTimeout(() => {
          dispatch({ 
            type: actionTypes.REMOVE_TOAST, 
            toastId: toast.id 
          });
          toastTimeouts.delete(toast.id);
        }, TOAST_REMOVE_DELAY);

        toastTimeouts.set(toast.id, timeout);
      }
    });
  }, [state.toasts]);

  const toast = (props: Toast) => {
    const id = genId();

    const update = (props: Partial<ToasterToast>) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      });
    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss();
        },
      },
    });

    return {
      id,
      update,
      dismiss,
    };
  };

  const dismissToast = (toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  };

  const updateToast = (id: string, props: Partial<ToasterToast>) => {
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    });
  };

  return {
    ...state,
    toast,
    dismissToast,
    updateToast,
  };
}

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastContext = useToastReducer();
  
  // Set up global access to toast handler when the component mounts
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Save a reference to the toast handler globally
      (window as any).toastHandler = toastContext;
    }

    return () => {
      // Clean up global reference when component unmounts
      if (typeof window !== "undefined") {
        (window as any).toastHandler = null;
      }
    };
  }, [toastContext]);
  
  return (
    <ToastContext.Provider value={toastContext}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}
