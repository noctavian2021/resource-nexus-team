
import { State, Action, actionTypes, ToasterToast } from './types';

// Constants
export const TOAST_LIMIT = 5;
export const TOAST_REMOVE_DELAY = 1000000;

// Map to store toast timeout IDs
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

export const initialState: State = {
  toasts: [],
};

// Toast ID generator
let count = 0;

export function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

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
      };
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};
