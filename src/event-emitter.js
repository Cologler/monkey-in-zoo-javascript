// ==UserScript==
// @name               event-emitter
// @namespace          https://github.com/cologler/
// @version            0.1
// @description        try to take over the world!
// @author             cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// ==/UserScript==

const EventEmitter = (() => {
    'use strict';

    /**
     * @typedef Callback
     * @prop {function} func
     * @prop {boolean} once
     * @prop {number} call the func call times
     * @prop {boolean} remove whether the item should be remove.
     */

    class EventEmitter {
        constructor() {
            /** @type {Callback[]} */
            this._callbacks = [];
        }

        _add(func, once) {
            if (typeof func !== 'function') {
                throw new Error('func must be function');
            }

            this._callbacks.push({
                func,
                once,
                call: 0,
            });

            return this;
        }

        on(func) {
            return this._add(func, false);
        }

        once(func) {
            return this._add(func, true);
        }

        off(func) {
            for (let index = this._callbacks.length - 1; index >= 0; index--) {
                const entity = this._callbacks[index];
                if (entity.func === func) {
                    this._callbacks.splice(index, 1);
                    return;
                }
            }
        }

        offall() {
            this._callbacks = [];
        }

        emit(thisArg, ...argArray) {
            try {
                for (const entity of this._callbacks) {

                    entity.call ++;
                    const called = {};
                    argArray.push({
                        call: entity.call,
                        off: () => called.off = true,
                        stop: () => called.stop = true
                    });

                    try {
                        entity.func.apply(thisArg, argArray);
                    } finally {
                        if (called.off || entity.once) {
                            entity.remove = true;
                        }
                    }

                    if (called.stop) {
                        break;
                    }
                }
            } finally {
                if (this._callbacks.some(z => z.remove)) {
                    this._callbacks = this._callbacks.filter(z => !z.remove);
                }
            }
        }

        empty() {
            return this._callbacks.length === 0;
        }

        await() {
            const promise = new Promise(resolve => {
                this.once(function() {
                    const args = Array.from(arguments).slice(0, -1); // ignore info because `call` always be 1.
                    resolve({ ctx: this, args });
                });
            });
            return promise;
        }
    }

    return EventEmitter;
})();
