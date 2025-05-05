import * as React from "react"
// Import React hooks directly
import { useState, useEffect } from "react"

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
      toast: Toast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<Toast>
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

type Toast = Omit<ToasterToast, "id">

function useToast() {
  const [state, dispatch] = useState<State>({
    toasts: [],
  })

  useEffect(() => {
    return () => {
      state.toasts.forEach((toast) => {
        toastTimeouts.get(toast.id)?.(toast.id)
      })
    }
  }, [state.toasts])

  function toast({ ...props }: Toast) {
    const id = genId()

    const update = (props: Partial<ToasterToast>) =>
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      })
    const dismiss = () => dismissToast(id)

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
      id: id,
      update,
      dismiss,
    }
  }

  function updateToast(id: string, props: Partial<ToasterToast>) {
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...props, id },
    })
  }

  function dismissToast(toastId?: string) {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toastId })
    toastTimeouts.set(
      toastId || "",
      setTimeout(() => {
        dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toastId })
      }, TOAST_REMOVE_DELAY)
    )
  }

  return {
    ...state,
    toast,
    updateToast,
    dismissToast,
  }
}

export { useToast, type Toast }
