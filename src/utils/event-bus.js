export class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    const handlers = this.events.get(event);
    handlers.add(handler);

    return () => {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    };
  }

  emit(event, payload) {
    const handlers = this.events.get(event);
    if (!handlers) return;

    [...handlers].forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Error in handler for "${event}":`, err);
      }
    });
  }

  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}
