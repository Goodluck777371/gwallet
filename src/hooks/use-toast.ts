
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
      variant: toast.variant || "default",
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

// Define the toast function interface with all variants
export interface ToastFunctions {
  (props: Omit<ToasterToast, "id">): string;
  success: (props: Omit<ToasterToast, "id" | "variant">) => string;
  error: (props: Omit<ToasterToast, "id" | "variant">) => string;
  warning: (props: Omit<ToasterToast, "id" | "variant">) => string;
  toast: (props: Omit<ToasterToast, "id">) => string;
  credit: (props: Omit<ToasterToast, "id" | "variant">) => string;
  debit: (props: Omit<ToasterToast, "id" | "variant">) => string;
  dismiss: (toastId: string) => void;
}

export function useToast(): { toasts: ToasterToast[] } & ToastFunctions {
  const [state, setState] = useState<ToasterToastState>({ toasts: [] });

  useEffect(() => {
    const unsubscribe = toaster.subscribe((state) => {
      setState(state);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Create the main toast function
  const toast = ((props: Omit<ToasterToast, "id">) => toaster.addToast(props)) as ToastFunctions;
  
  // Add variant methods
  toast.toast = (props) => toaster.addToast(props);
  toast.success = (props) => toaster.addToast({ ...props, variant: "success" });
  toast.error = (props) => toaster.addToast({ ...props, variant: "destructive" });
  toast.warning = (props) => toaster.addToast({ ...props, variant: "warning" });
  toast.credit = (props) => toaster.addToast({ ...props, variant: "credit" });
  toast.debit = (props) => toaster.addToast({ ...props, variant: "debit" });
  toast.dismiss = (toastId) => toaster.removeToast(toastId);
  
  return {
    toasts: state.toasts,
    ...toast,
  } as { toasts: ToasterToast[] } & ToastFunctions;
}

// Create a singleton instance with proper type definitions
const toast = ((props: Omit<ToasterToast, "id">) => toaster.addToast(props)) as ToastFunctions;

// Add variant methods to the singleton
toast.toast = (props) => toaster.addToast(props);
toast.success = (props) => toaster.addToast({ ...props, variant: "success" });
toast.error = (props) => toaster.addToast({ ...props, variant: "destructive" });
toast.warning = (props) => toaster.addToast({ ...props, variant: "warning" });
toast.credit = (props) => toaster.addToast({ ...props, variant: "credit" });
toast.debit = (props) => toaster.addToast({ ...props, variant: "debit" });
toast.dismiss = (toastId) => toaster.removeToast(toastId);

export { toast };
