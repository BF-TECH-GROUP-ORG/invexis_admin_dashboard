class NotificationBus {
  constructor() {
    this.listeners = [];
  }

  /**
   * Subscribe to notifications
   * @param {Function} listener - Callback function receiving the notification object
   * @returns {Function} - Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Emit a notification
   * @param {Object} notification
   * @param {string} notification.message - The message to display
   * @param {'info'|'success'|'warning'|'error'} [notification.severity='info'] - Severity level
   * @param {number} [notification.duration=4000] - Duration in ms
   */
  emit(notification) {
    this.listeners.forEach((listener) => listener(notification));
  }
}

export const notificationBus = new NotificationBus();
