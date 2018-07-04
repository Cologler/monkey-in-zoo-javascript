// ==UserScript==
// @name               event-emitter
// @namespace          https://github.com/cologler/
// @version            0.3.4
// @description        a simplest event emitter.
// @author             cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// @supportURL         https://github.com/Cologler/monkey-in-zoo-javascript
// ==/UserScript==

// hosting on github: https://github.com/Cologler/monkey-in-zoo-javascript/raw/master/src/event-emitter.js
// hosting on greasyfork: https://greasyfork.org/scripts/369577/code/event-emitter.js

const EventEmitter = (() => {
    'use strict';

    /**
     * @typedef Callback
     * @prop {function} func
     * @prop {boolean} once
     * @prop {number} call the func call times
     * @prop {boolean} remove whether the item should be remove.
     * @prop {boolean} disabled
     */

    class EventEmitter {
        constructor() {
            /** @type {Callback[]} */
            this._callbacks = [];
        }

        _add(func, once, call = 0) {
            if (typeof func !== 'function') {
                throw new Error('func must be function');
            }

            this._callbacks.push({
                func,
                once,
                call
            });

            return this;
        }

        _findLastIndex(func) {
            for (let index = this._callbacks.length - 1; index >= 0; index--) {
                const entity = this._callbacks[index];
                if (entity.func === func) {
                    return index;
                }
            }
            return -1;
        }

        on(func) {
            return this._add(func, false);
        }

        once(func) {
            return this._add(func, true);
        }

        off(func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._callbacks.splice(index, 1);
            }
            return this;
        }

        offall() {
            this._callbacks = [];
            return this;
        }

        disable(func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._callbacks[index].disabled = true;
            }
            return this;
        }

        enable(func) {
            const index = this._findLastIndex(func);
            if (index >= 0) {
                this._callbacks[index].disabled = false;
            }
            return this;
        }

        emit(thisArg, ...argArray) {
            let ret = undefined;

            if (this._callbacks.length > 0) {
                try {
                    for (const entity of this._callbacks.filter(z => !z.disabled)) {

                        const called = {};
                        const args = argArray.concat({
                            call: entity.call ++, // first time should be 0.
                            off: () => called.off = true,
                            stop: () => called.stop = true,
                            ret,
                            emitter: this,
                        });

                        try {
                            ret = entity.func.apply(thisArg, args);
                        } finally {
                            entity.remove = called.off || entity.once;
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

            return ret;
        }

        empty() {
            return this._callbacks.length === 0;
        }

        get count() {
            return this._callbacks.length;
        }
    }

    return EventEmitter;
})();

const NEventEmitter = (() => {
    class NEventEmitter {
        constructor() {
            this._table = {};
        }

        getEventEmitter(eventName, add) {
            let ee = this._table[eventName] || null;
            if (!ee && add) {
                this._table[eventName] = ee = new EventEmitter();
            }
            return ee;
        }

        on(eventName, func) {
            this.getEventEmitter(eventName, true).on(func);
            return this;
        }

        once(eventName, func) {
            this.getEventEmitter(eventName, true).once(func);
            return this;
        }

        off(eventName, func) {
            const ee = this.getEventEmitter(eventName, false);
            if (ee) {
                ee.off(func);
                if (ee.empty()) {
                    this._table[eventName] = null;
                }
            }
            return this;
        }

        offall(eventName) {
            const ee = this.getEventEmitter(eventName, false);
            if (ee) {
                ee.offall();
            }
            return this;
        }

        disable(eventName, func) {
            const ee = this.getEventEmitter(eventName, false);
            if (ee) {
                ee.disable(func);
            }
            return this;
        }

        enable(eventName, func) {
            const ee = this.getEventEmitter(eventName, false);
            if (ee) {
                ee.enable(func);
            }
            return this;
        }

        emit(eventName, thisArg, ...argArray) {
            const ee = this.getEventEmitter(eventName, false);
            if (ee) {
                const ret = ee.emit(thisArg, ...argArray);
                if (ee.empty()) {
                    this._table[eventName] = null;
                }
                return ret;
            }
            return undefined;
        }

        eventNames() {
            return Object.keys(this._table);
        }
    }

    return NEventEmitter;
})();

(function() {
    for (const e of arguments) {
        if (typeof module === 'object' && module.exports) { // node
            switch (typeof e) {
                case 'function':
                    module.exports[e.name] = e;
                    break;

                case 'object':
                    Object.assign(module.exports, e);
                    break;
            }
        }
    }
})(EventEmitter, NEventEmitter);
