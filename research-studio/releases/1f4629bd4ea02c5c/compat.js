(function () {
  'use strict';
  const define = (target, name, value) => {
    if (typeof target[name] !== 'function') Object.defineProperty(target, name, { configurable: true, writable: true, value });
  };

  define(Array.prototype, 'at', function at(index) {
    const length = this.length >>> 0, position = Math.trunc(Number(index)) || 0;
    return this[position < 0 ? length + position : position];
  });
  define(String.prototype, 'at', function at(index) {
    const value = String(this), position = Math.trunc(Number(index)) || 0;
    return value.charAt(position < 0 ? value.length + position : position) || undefined;
  });
  define(Array.prototype, 'findLast', function findLast(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return this[i];
    return undefined;
  });
  define(Array.prototype, 'findLastIndex', function findLastIndex(predicate, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) if (predicate.call(thisArg, this[i], i, this)) return i;
    return -1;
  });
  define(Array.prototype, 'flat', function flat(depth) {
    const limit = depth === undefined ? 1 : Math.max(0, Math.trunc(Number(depth)) || 0), result = [];
    const walk = (items, level) => { for (const item of items) { if (Array.isArray(item) && level < limit) walk(item, level + 1); else result.push(item); } };
    walk(this, 0); return result;
  });
  define(Array.prototype, 'flatMap', function flatMap(callback, thisArg) {
    return this.map(callback, thisArg).flat();
  });
  define(Object, 'hasOwn', function hasOwn(object, key) {
    return Object.prototype.hasOwnProperty.call(Object(object), key);
  });
  define(String.prototype, 'replaceAll', function replaceAll(search, replacement) {
    const value = String(this), pattern = search instanceof RegExp ? search : String(search);
    if (search instanceof RegExp) return value.replace(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'), replacement);
    return value.split(pattern).join(replacement);
  });
  if (typeof globalThis.structuredClone !== 'function') {
    globalThis.structuredClone = value => JSON.parse(JSON.stringify(value));
  }
  if (typeof CSS !== 'undefined' && typeof CSS.escape !== 'function') {
    CSS.escape = value => String(value).replace(/[^a-zA-Z0-9_-]/g, character => '\\' + character);
  }

  const dialogPrototype = typeof HTMLDialogElement === 'function' ? HTMLDialogElement.prototype : null;
  if (!dialogPrototype || typeof dialogPrototype.showModal !== 'function') {
    const prototype = dialogPrototype || HTMLElement.prototype;
    const setOpen = (element, open) => { if (open) element.setAttribute('open', ''); else element.removeAttribute('open'); };
    define(prototype, 'showModal', function showModal() {
      if (this.hasAttribute('open')) return;
      setOpen(this, true);
      this.setAttribute('data-modal', '');
      document.documentElement.classList.add('compat-modal-open');
    });
    define(prototype, 'show', function show() { setOpen(this, true); });
    define(prototype, 'close', function close(returnValue) {
      if (!this.hasAttribute('open')) return;
      setOpen(this, false);
      this.removeAttribute('data-modal');
      this.returnValue = returnValue === undefined ? '' : String(returnValue);
      if (!document.querySelector('dialog[open]')) document.documentElement.classList.remove('compat-modal-open');
      this.dispatchEvent(new Event('close'));
    });
    if (!('open' in document.createElement('dialog'))) {
      Object.defineProperty(HTMLElement.prototype, 'open', {
        configurable: true,
        get() { return this.hasAttribute('open'); },
        set(value) { setOpen(this, !!value); }
      });
    }
  }
})();
