import { useState, useCallback } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((type, title, text, duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, text }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  return {
    toasts,
    remove,
    showError:   (title, text) => show('error',   title, text),
    showInfo:    (title, text) => show('info',    title, text),
    showSuccess: (title, text) => show('success', title, text, 1800),
    showWarning: (title, text) => show('warning', title, text, 5000),
  };
}