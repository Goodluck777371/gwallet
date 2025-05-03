
import { useState } from "react";
import { ToastActionElement, ToastProps } from "@/components/ui/toast";

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "debit" | "credit";
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

export function useToast() {
  const [state, setState] = useState<ToasterToastState>({ toasts: [] });

  useState(() => {
    return toaster.subscribe((state) => {
      setState(state);
    });
  });
  
  return {
    toasts: state.toasts,
    toast: (props: Omit<ToasterToast, "id">) => {
      return toaster.addToast(props);
    },
    dismiss: (toastId: string) => toaster.removeToast(toastId),
  };
}

export const toast = {
  toast: (props: Omit<ToasterToast, "id">) => {
    return toaster.addToast(props);
  },
  dismiss: (toastId: string) => toaster.removeToast(toastId),
};
