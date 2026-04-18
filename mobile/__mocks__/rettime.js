'use strict';

// CJS shim for the ESM-only rettime package
class LensList {
  constructor() {
    this._map = new Map();
    this.size = 0;
  }
  append(type, listener) {
    if (!this._map.has(type)) this._map.set(type, []);
    this._map.get(type).push(listener);
    this.size++;
  }
  prepend(type, listener) {
    if (!this._map.has(type)) this._map.set(type, []);
    this._map.get(type).unshift(listener);
    this.size++;
  }
  delete(type, listener) {
    const arr = this._map.get(type);
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx !== -1) { arr.splice(idx, 1); this.size--; }
  }
  deleteAll(type) {
    const arr = this._map.get(type);
    if (arr) { this.size -= arr.length; this._map.delete(type); }
  }
  clear() { this._map.clear(); this.size = 0; }
  get(type) { return this._map.get(type) || []; }
  getAll() {
    const result = [];
    for (const arr of this._map.values()) result.push(...arr);
    return result;
  }
  *[Symbol.iterator]() {
    for (const [type, arr] of this._map) for (const fn of arr) yield [type, fn];
  }
}

const kDefaultPrevented = Symbol('kDefaultPrevented');
const kPropagationStopped = Symbol('kPropagationStopped');
const kImmediatePropagationStopped = Symbol('kImmediatePropagationStopped');

class TypedEvent extends MessageEvent {
  constructor(...args) {
    super(args[0], args[1]);
    this[kDefaultPrevented] = false;
  }
  get defaultPrevented() { return this[kDefaultPrevented]; }
  preventDefault() { super.preventDefault(); this[kDefaultPrevented] = true; }
}

class Emitter {
  constructor() {
    this._listeners = new LensList();
    this._listenerOptions = new WeakMap();
    this._typelessListeners = new WeakSet();
    this._hookListeners = new LensList();
    this._hookListenerOptions = new WeakMap();
    const self = this;
    this.hooks = {
      on(hook, callback, options) {
        self._hookListeners.append(hook, callback);
        if (options) self._hookListenerOptions.set(callback, options);
      },
      removeListener(hook, callback) {
        self._hookListeners.delete(hook, callback);
      },
    };
  }
  on(type, listener, options) { this._addListener(type, listener, options); return this; }
  once(type, listener, options) { return this.on(type, listener, { ...(options || {}), once: true }); }
  earlyOn(type, listener, options) { this._addListener(type, listener, options, 'prepend'); return this; }
  earlyOnce(type, listener, options) { return this.earlyOn(type, listener, { ...(options || {}), once: true }); }
  emit(event) {
    if (this._listeners.size === 0) return false;
    const hasListeners = this.listenerCount(event.type) > 0;
    for (const listener of this._matchListeners(event.type)) {
      if (event[kImmediatePropagationStopped]) break;
      this._callListener(event, listener);
    }
    return hasListeners;
  }
  async emitAsPromise(event) {
    if (this._listeners.size === 0) return [];
    const pending = [];
    for (const listener of this._matchListeners(event.type)) {
      if (event[kImmediatePropagationStopped]) break;
      const rv = await Promise.resolve(this._callListener(event, listener));
      if (!this._typelessListeners.has(listener)) pending.push(rv);
    }
    return Promise.allSettled(pending).then(results => results.map(r => r.status === 'fulfilled' ? r.value : r.reason));
  }
  *emitAsGenerator(event) {
    if (this._listeners.size === 0) return;
    for (const listener of this._matchListeners(event.type)) {
      if (event[kImmediatePropagationStopped]) break;
      const rv = this._callListener(event, listener);
      if (!this._typelessListeners.has(listener)) yield rv;
    }
  }
  removeListener(type, listener) { this._listeners.delete(type, listener); }
  removeAllListeners(type) {
    if (type == null) { this._listeners.clear(); return; }
    this._listeners.deleteAll(type);
  }
  listeners(type) { if (type == null) return this._listeners.getAll(); return this._listeners.get(type); }
  listenerCount(type) { if (type == null) return this._listeners.size; return this.listeners(type).length; }
  _addListener(type, listener, options, insertMode = 'append') {
    if (type === '*') this._typelessListeners.add(listener);
    if (insertMode === 'prepend') this._listeners.prepend(type, listener);
    else this._listeners.append(type, listener);
    if (options) {
      this._listenerOptions.set(listener, options);
      if (options.signal) options.signal.addEventListener('abort', () => this.removeListener(type, listener), { once: true });
    }
  }
  _callListener(event, listener) {
    const rv = listener.call(this, event);
    const options = this._listenerOptions.get(listener);
    if (options?.once) this._listeners.delete(event.type, listener);
    return rv;
  }
  *_matchListeners(type) {
    for (const [key, listener] of this._listeners) if (key === '*' || key === type) yield listener;
  }
}

module.exports = { Emitter, TypedEvent, LensList };
