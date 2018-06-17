// ==UserScript==
// @name               dom
// @namespace          https://github.com/cologler/
// @version            0.3.0.0
// @description        provide some function to handle element by selector.
// @author             cologler
// @grant              none
// @license            MIT
// @supportURL         https://github.com/Cologler/userjs-tk-javascript
// ==/UserScript==

// CDN
// greasyfork: https://greasyfork.org/scripts/369578/code/dom.js

const Dom = (() => {
    'use strict';

    // require

    function RequireError(moduleName) {
        return new Error(`require base module: <${moduleName}>.`);
    }

    if (typeof EventEmitter === 'undefined') throw RequireError('event-emitter');

    // begin

    /**
     * @typedef Options
     * @prop {HTMLElement} element
     * @prop {MutationObserverInit} observerOptions
     */

    class QueryEventEmitter extends EventEmitter {
        constructor (selector, options = null) {
            super();

            if (typeof selector !== 'string') throw new Error('selector must be string.');
            if (typeof options !== 'object') throw new Error('options must be object.');

            this._selector = selector;
            options = options || {};
            this._element = options.element || document;
            const observerOptions = options.observerOptions || {
                childList: true,
                subtree: true
            };

            this._observer = new MutationObserver(mrs => {
                mrs.forEach(mr => {
                    mr.addedNodes.forEach(el => {
                        if (typeof el.matches === 'function' && el.matches(selector) === true) {
                            this.emit(this, el);
                        }
                        if (typeof el.querySelectorAll === 'function') {
                            for (const z of el.querySelectorAll(selector)) {
                                this.emit(this, z);
                            }
                        }
                    });
                });
            });
            this._observer.observe(this._element, observerOptions);
        }

        on(func) {
            for (const el of this._element.querySelectorAll(this._selector)) {
                func.call(this, el);
            }

            return super.on(func);
        }

        once(func) {
            for (const el of this._element.querySelectorAll(this._selector)) {
                func.call(this, el);
                return this; // call once to remove.
            }

            return super.once(func);
        }

        dispose() {
            this._observer.disconnect();
        }
    }

    /**
     *
     * @param {*} selector
     * @param {Options} [options=null]
     * @returns
     */
    function query(selector, options = null) {
        return new QueryEventEmitter(selector, options);
    }

    /**
     *
     * @param {*} selector
     * @param {function} callback
     * @param {Options} [options=null]
     * @returns
     */
    function on(selector, callback, options = null) {
        const qee = new QueryEventEmitter(selector, options);
        qee.on(callback);
        return qee;
    }

    /**
     *
     * @param {*} selector
     * @param {function} callback
     * @param {Options} [options=null]
     * @returns
     */
    function once(selector, callback, options = null) {
        const qee = new QueryEventEmitter(selector, options);
        qee.once(el => {
            try {
                callback(el);
            } finally {
                qee.dispose();
            }
        });
        return qee;
    }

    return {
        query,
        on, once
    };
})();
