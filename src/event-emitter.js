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
     * @prop {Function} func
     * @prop {Boolean} once
     * @prop {Boolean} called
     */

    class EventEmitter {
        constructor() {
            /** @type {Callback[]} */
            this._callbacks = [];
        }

        on(func) {
            this._callbacks.push({
                func
            });
        }

        once(func) {
            this._callbacks.push({
                func,
                once: true
            });
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

        emit(thisArg, argArray) {
            try {
                for (const entity of this._callbacks) {
                    entity.func.apply(thisArg, argArray);
                    entity.called = true;
                }
            } finally {
                if (this._callbacks.some(z => z.once && z.called)) {
                    this._callbacks = this._callbacks.filter(z => !(z.once && z.called));
                }
            }
        }

        empty() {
            return this._callbacks.length === 0;
        }
    }

    return EventEmitter;
})();
