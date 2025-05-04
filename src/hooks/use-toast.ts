
import { useState, useEffect } from "react";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "credit" | "debit";
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToastState = {
  toasts: ToasterToast[];
};

export const toaster = {
  toasts: [] as ToasterToast[],
  listeners: [] as Array<(state: ToasterToastState) => void>,
  
  _getUniqueId: () => {
    return Date.now().toString() + Math.random().toString(36).slice(2);
  },
  
  _emitChange: function() {
    this.listeners.forEach((listener) => {
      listener({
        toasts: this.toasts,
      });
    });
  },
  
  addToast: function(toast: Omit<ToasterToast, "id">) {
    const id = this._getUniqueId();
    
    const newToast = {
      ...toast,
      id,
      title: toast.title,
      description: toast.description,
      action: toast.action,
      variant: toast.variant,
    };

    this.toasts = [newToast, ...this.toasts].slice(0, TOAST_LIMIT);
    this._emitChange();

    return id;
  },
  
  removeToast: function(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this._emitChange();
  },
  
  subscribe: function(listener: (state: ToasterToastState) => void) {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
};

// Define the toast function interface properly
export interface ToastFunctions {
  toast: (props: Omit<ToasterToast, "id">) => string;
  dismiss: (toastId: string) => void;
  error: (props: Omit<ToasterToast, "id">) => string;
  success: (props: Omit<ToasterToast, "id">) => string;
  warning: (props: Omit<ToasterToast, "id">) => string;
  credit: (props: Omit<ToasterToast, "id">) => string;
  debit: (props: Omit<ToasterToast, "id">) => string;
}

export function useToast(): { toasts: ToasterToast[] } & ToastFunctions {
  const [state, setState] = useState<ToasterToastState>({ toasts: [] });

  useEffect(() => {
    const unsubscribe = toaster.subscribe((state) => {
      setState(state);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    toasts: state.toasts,
    toast: (props) => toaster.addToast(props),
    dismiss: (toastId) => toaster.removeToast(toastId),
    error: (props) => toaster.addToast({ ...props, variant: "destructive" }),
    success: (props) => toaster.addToast({ ...props, variant: "success" }),
    warning: (props) => toaster.addToast({ ...props, variant: "warning" }),
    credit: (props) => toaster.addToast({ ...props, variant: "credit" }),
    debit: (props) => toaster.addToast({ ...props, variant: "debit" }),
  };
}

// Export a singleton instance of toast functions for direct import
export const toast: ToastFunctions = {
  toast: (props) => toaster.addToast(props),
  dismiss: (toastId) => toaster.removeToast(toastId),
  error: (props) => toaster.addToast({ ...props, variant: "destructive" }),
  success: (props) => toaster.addToast({ ...props, variant: "success" }),
  warning: (props) => toaster.addToast({ ...props, variant: "warning" }),
  credit: (props) => toaster.addToast({ ...props, variant: "credit" }),
  debit: (props) => toaster.addToast({ ...props, variant: "debit" }),
};
