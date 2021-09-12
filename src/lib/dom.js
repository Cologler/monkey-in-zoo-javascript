// ==UserScript==
// @name               dom
// @namespace          https://github.com/cologler/
// @version            0.3.5
// @description        provide some function to handle element by selector.
// @author             cologler
// @grant              none
// @license            MIT
// @supportURL         https://github.com/Cologler/monkey-in-zoo-javascript
// ==/UserScript==

// hosting on GitHub:       https://github.com/Cologler/monkey-in-zoo-javascript/raw/master/src/dom.js
// hosting on jsDelivr:     https://cdn.jsdelivr.net/gh/Cologler/monkey-in-zoo-javascript/src/dom.js

const Dom = (() => {
    'use strict';

    (() => {
        function require(type, name) {
            if (type === 'undefined') {
                return new Error(`require base module: <${name}>.`);
            }
        }

        function grant(type, name) {
            if (type === 'undefined') {
                return new Error(`require GM api <${name}>, please add '// @grant ${name}' into user.js header.`);
            }
        }

        (function(errors) {
            errors.filter(z => z).forEach(z => { throw z; });
        })([
            require(typeof EventEmitter, 'event-emitter'),
        ]);
    })();

    class AnimationFrameEventEmitter extends EventEmitter {
        constructor() {
            super();
            this._queue = null;
            this._handler = null;
        }

        emit(self, node) {
            if (this._queue === null) {
                this._queue = [];
                this._handler = requestAnimationFrame(() => {
                    // cache queue (so avoid user node change in user callback)
                    const queue = this._queue;
                    this._queue = null;
                    // cancel.
                    cancelAnimationFrame(this._handler);
                    this._handler = null;
                    // foreach
                    queue.forEach(z => {
                        super.emit(self, z);
                    });
                });
            }
            this._queue.push(node);
        }
    }

    /**
     * @typedef Options
     * @prop {HTMLElement} element
     * @prop {MutationObserverInit} observerOptions
     * @prop {Boolean} includeTextNode
     * @prop {null|'AnimationFrame'} invokeAt options canbe: 'AnimationFrame'
     * @prop {Boolean} debug
     */
    class QueryEventEmitter {
        constructor (selector, options = null) {
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

            switch (this._options.invokeAt) {
                case 'AnimationFrame':
                    this._baseEventEmitter = new AnimationFrameEventEmitter();
                    break;

                default:
                    this._baseEventEmitter = new EventEmitter();
                    break;
            }

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
                                    this._emit(n);
                                }
                            }
                            break;

                        case Node.ELEMENT_NODE:
                            if (n.matches && n.matches(this._selector)) {
                                this._emit(n);
                            }
                            if (n.querySelectorAll) {
                                n.querySelectorAll(this._selector).forEach(z => this._emit(z));
                            }
                            break;
                    }
                }
            } else {
                if (mr.target.nodeType === Node.ELEMENT_NODE) {
                    if (mr.target.matches && mr.target.matches(this._selector)) {
                        this._emit(mr.target);
                    }
                }
            }
        }

        _emit(node) {
            this._baseEventEmitter.emit(this, node);
        }

        _add(func, once) {
            let call = 0;
            for (const el of this._options.element.querySelectorAll(this._selector)) {
                call++;
                const called = {};
                func.call(this, el, {
                    call,
                    off: () => called.off = true,
                    stop: () => called.stop = true,
                    ret: undefined,
                    emitter: this,
                });
                if (once || called.off) {
                    return this;
                }
                if (called.stop) {
                    break;
                }
            }

            return this._baseEventEmitter._add(func, once, call);
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
