// ==UserScript==
// @name               dom
// @namespace          https://github.com/cologler/
// @version            0.3.4
// @description        provide some function to handle element by selector.
// @author             cologler
// @grant              none
// @license            MIT
// @supportURL         https://github.com/Cologler/monkey-in-zoo-javascript
// ==/UserScript==

// hosting on github: https://github.com/Cologler/monkey-in-zoo-javascript/raw/master/src/dom.js
// hosting on greasyfork: https://greasyfork.org/scripts/369578/code/dom.js

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
     * @prop {Boolean} includeTextNode
     * @prop {String} invokeAt options canbe: 'AnimationFrame'
     * @prop {Boolean} debug
     */

    class QueryEventEmitter extends EventEmitter {
        constructor (selector, options = null) {
            super();

            if (typeof selector !== 'string') throw new Error('selector must be string.');
            if (typeof options !== 'object') throw new Error('options must be object.');

            this._selector = selector;
            options = options || {};
            /** @type {Options} */
            this._options = Object.assign({
                element: document,
                observerOptions: {
                    childList: true,
                    subtree: true
                }
            }, options || {});

            this._animationFrameQueue = null;
            this._animationFrameHandler = null;

            this._observer = new MutationObserver(mrs => {
                mrs.forEach(mr => {
                    if (this._options.debug) {
                        console.debug(mr);
                    }
                    this._onVisitMR(mr);
                });
            });
            this._observer.observe(this._options.element, this._options.observerOptions);
        }

        /**
         *
         *
         * @param {MutationRecord} mr
         * @memberof QueryEventEmitter
         */
        _onVisitMR(mr) {
            if (mr.type === 'childList') {
                let targetMatch = null;
                for (const n of mr.addedNodes) {
                    switch (n.nodeType) {
                        case Node.TEXT_NODE:
                            if (this._options.includeTextNode) {
                                if (targetMatch === null) {
                                    targetMatch = mr.target.matches && mr.target.matches(this._selector);
                                }
                                if (targetMatch) {
                                    this._onEmit(n);
                                }
                            }
                            break;

                        case Node.ELEMENT_NODE:
                            if (n.matches && n.matches(this._selector)) {
                                this._onEmit(n);
                            }
                            if (n.querySelectorAll) {
                                n.querySelectorAll(this._selector).forEach(z => this._onEmit(z));
                            }
                            break;
                    }
                }
            } else {
                if (mr.target.nodeType === Node.ELEMENT_NODE) {
                    if (mr.target.matches && mr.target.matches(this._selector)) {
                        this._onEmit(mr.target);
                    }
                }
            }
        }

        _onEmit(node) {
            if (this._options.invokeAt === 'AnimationFrame') {
                this._emitAtAnimationFrame(node);
            } else {
                this._emitImmediately(node);
            }
        }

        _emitAtAnimationFrame(el) {
            if (this._animationFrameQueue === null) {
                this._animationFrameQueue = [];
                this._animationFrameHandler = requestAnimationFrame(() => {
                    // cache queue (so avoid user node change in user callback)
                    const queue = this._animationFrameQueue;
                    this._animationFrameQueue = null;
                    // cancel.
                    cancelAnimationFrame(this._animationFrameHandler);
                    this._animationFrameHandler = null;
                    // foreach
                    queue.forEach(z => {
                        this._emitImmediately(z);
                    });
                });
            }
            this._animationFrameQueue.push(el);
        }

        _emitImmediately(node) {
            this.emit(this, node);
        }

        _add(func, once) {
            let call = 0;
            for (const el of this._options.element.querySelectorAll(this._selector)) {
                call++;
                const called = {};
                func.call(this, el, {
                    call,
                    off: () => called.off = true,
                    stop: () => called.stop = true
                });
                if (once || called.off) {
                    return this;
                }
                if (called.stop) {
                    break;
                }
            }

            return super._add(func, once, call);
        }

        on(func) {
            return this._add(func, false);
        }

        once(func) {
            return this._add(func, true);
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
