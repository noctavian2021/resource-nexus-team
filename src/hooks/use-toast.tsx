
import React from 'react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export type ToastProps = React.ComponentProps<typeof Toast>

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: string
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: string
    }

interface State {
  toasts: ToasterToast[]
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

const initialState: State = {
  toasts: [],
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId || action.toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export type Toast = Omit<ToasterToast, "id">

// Create a single instance of the toast context
const ToastContext = React.createContext<ReturnType<typeof useToastReducer> | null>(null)

function useToastReducer() {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (!toast.open && toastTimeouts.has(toast.id)) return

      // When toast closes, dismiss it after the delay
      if (!toast.open) {
        const timeout = setTimeout(() => {
          dispatch({ 
            type: actionTypes.REMOVE_TOAST, 
            toastId: toast.id 
          })
          toastTimeouts.delete(toast.id)
        }, TOAST_REMOVE_DELAY)

        toastTimeouts.set(toast.id, timeout)
      }
    })
  }, [state.toasts])

  const toast = (props: Toast) => {
    const id = genId()

    const update = (props: Partial<ToasterToast>) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      })
    const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss()
        },
      },
    })

    return {
      id,
      update,
      dismiss,
    }
  }

  const dismissToast = (toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId })
  }

  const updateToast = (id: string, props: Partial<ToasterToast>) => {
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })
  }

  return {
    ...state,
    toast,
    dismissToast,
    updateToast,
  }
}

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toast = useToastReducer()
  
  return <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
}

// Hook for components to use the toast context
export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Standalone function for use outside of React components
export const toast = (props: Toast) => {
  // This is a fallback for non-React contexts or outside components
  console.warn("Toast used outside of component context - this may not work as expected")
  const toastId = genId()
  // Implementation for standalone usage if needed
  return {
    id: toastId,
    dismiss: () => {
      // Implement if needed
    },
    update: () => {
      // Implement if needed
    },
  }
}
