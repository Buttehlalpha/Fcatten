// Browser stub for node:async_hooks — the SPA bundle never runs server storage contexts.
export class AsyncLocalStorage<T = unknown> {
  private value: T | undefined;
  getStore(): T | undefined {
    return this.value;
  }
  run<R>(store: T, fn: (...args: unknown[]) => R, ...args: unknown[]): R {
    const prev = this.value;
    this.value = store;
    try {
      return fn(...args);
    } finally {
      this.value = prev;
    }
  }
  enterWith(store: T) {
    this.value = store;
  }
  exit<R>(fn: (...args: unknown[]) => R, ...args: unknown[]): R {
    return fn(...args);
  }
  disable() {}
}
export default { AsyncLocalStorage };
