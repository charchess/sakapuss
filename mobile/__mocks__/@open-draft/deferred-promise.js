'use strict';

// CJS shim for @open-draft/deferred-promise (ESM-only)
function createDeferredExecutor() {
  const executor = (resolve, reject) => {
    executor.state = 'pending';
    executor.resolve = (data) => {
      if (executor.state !== 'pending') return;
      executor.state = 'resolved';
      executor.result = data;
      resolve(data);
    };
    executor.reject = (reason) => {
      if (executor.state !== 'pending') return;
      executor.state = 'rejected';
      executor.result = reason;
      reject(reason);
    };
  };
  executor.state = 'pending';
  return executor;
}

class DeferredPromise extends Promise {
  constructor(executor) {
    const deferredExecutor = createDeferredExecutor();
    super(deferredExecutor);
    this.resolve = deferredExecutor.resolve;
    this.reject = deferredExecutor.reject;
    Object.defineProperty(this, 'state', { get: () => deferredExecutor.state });
    Object.defineProperty(this, 'result', { get: () => deferredExecutor.result });
    if (typeof executor === 'function') {
      executor(deferredExecutor.resolve, deferredExecutor.reject);
    }
  }
}

module.exports = { DeferredPromise, createDeferredExecutor };
