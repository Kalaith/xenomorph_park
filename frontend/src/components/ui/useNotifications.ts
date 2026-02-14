import { useCallback } from 'react';
import { StatusMessage } from '../../types';

export function useNotifications() {
  const windowWithNotification = window as Window & {
    addNotification?: (message: string, type: StatusMessage['type'], duration?: number) => void;
  };

  const addNotification = useCallback(
    (message: string, type: StatusMessage['type'], duration?: number) => {
      if (windowWithNotification.addNotification) {
        windowWithNotification.addNotification(message, type, duration);
      } else {
        console.log(`${type.toUpperCase()}: ${message}`);
      }
    },
    [windowWithNotification]
  );

  return { addNotification };
}
