'use strict';

var MiZ_MissingGrantAction;

/**
 *
 * @param {string} apiName
 * @returns
 */
function _MiZ_isGmApiAccessable(apiName) {
    if (typeof apiName !== 'string') {
        throw new Error('apiName must be a string');
    }

    if (!apiName.startsWith('GM')) {
        throw new Error('apiName must start with "GM"');
    }

    var parts = apiName.split('.');
    var obj = window;
    for (const part of parts) {
        obj = obj[part];
        if (obj === undefined) {
            return false;
        }
    }
    return true;
}

/**
 * This is for internal use only and may change without notice.
 * @param {*} apiName
 */
function _MiZ_checkGrant(apiName) {
    if (_MiZ_isGmApiAccessable(apiName)) {
        return;
    }

    const action = typeof MiZ_MissingGrantAction === 'undefined' ? null : MiZ_MissingGrantAction;
    const scriptName = GM.info.script.name;
    const message =
        `${scriptName}: GM api (${apiName}) is required, please add '// @grant ${apiName}' to the userscript header.`;

    switch (action) {
        case 'ignore':
            console.error(message);
            break;

        case 'error':
        default:
            throw new Error(message);

        case 'alert':
            alert(message);
            throw new Error(message);
            break;
    }
}

var dom = (() => {

    /**
     * wrap the function to ensure call once only
     * @param {(...args) => any} func
     * @returns
     */
    function callOnce(func) {
        let called = false;
        let funcRef = func;

        return function () {
            if (!called) {
                called = true;
                const val = funcRef.apply(this, arguments);
                funcRef = null; // release fn
                return val;
            }
        };
    }

    /**
     * Watch on any nodes removed from document.
     *
     * This won't emit the moved nodes.
     *
     * @param {(node: Node) => void} callback
     * @param {Element?} fromElement
     * @returns
     */
    function onNodeRemoved(callback, fromElement = null) {
        if (!fromElement) {
            fromElement = document;
        }

        const observer = new MutationObserver(mrs => {
            let removed = null;

            for (const mr of mrs) {
                if (mr.type === 'childList') {
                    if (removed === null) {
                        removed = [];
                    }
                    if (mr.removedNodes.length > 0) {
                        removed.push(...mr.removedNodes);
                    }
                    if (mr.addedNodes.length > 0) {
                        for (const node of mr.addedNodes) {
                            const index = removed.indexOf(node);
                            if (index > -1) {
                                removed.splice(index, 1);
                            }
                        }
                    }
                }
            }

            if (removed !== null) {
                for (const node of removed) {
                    callback(node);
                }
            }
        });

        observer.observe(fromElement, {
            childList: true,
            subtree: true
        });

        return {
            dispose: () => observer.disconnect()
        }
    }

    /**
     *
     * @param {string} selector
     * @param {function} callback
     * @param {Options} [options=null]
     * @returns
     */
    function on(selector, callback, options = null) {
        if (typeof selector !== 'string') throw new Error('selector must be string.');
        if (typeof options !== 'object') throw new Error('options must be object.');

        let disposed = false;
        const emittedElements = new WeakSet();

        function shouldSkip(element) {
            return disposed || emittedElements.has(element);
        }

        function emit(el) {
            if (disposed) {
                return;
            }
            if (emittedElements.has(el)) {
                return;
            }
            emittedElements.add(el);
            callback(el);
        }

        const rootElement = options?.element || document;
        const observerOptions = Object.assign({
            subtree: true,
            childList: true,
            attributes: false,
            characterData: false,
        }, options?.observerOptions || {});

        let observer = new MutationObserver(mrs => {
            mrs.forEach(mr => {
                if (mr.target.nodeType === Node.ELEMENT_NODE) {
                    switch (mr.type) {
                        case 'childList':
                            mr.target?.querySelectorAll && mr.target.querySelectorAll(selector).forEach(emit);
                            break;

                        case 'attributes':
                        case 'characterData':
                            if (!shouldSkip(mr.target) && mr.target.matches && mr.target.matches(this._selector)) {
                                emit(mr.target);
                            }
                            break;
                    }
                }
            });
        });

        // use timeout so the `once` function can get the handler
        setTimeout(() => {
            if (!disposed) {
                rootElement.querySelectorAll && rootElement.querySelectorAll(selector).forEach(emit);
                observer.observe(rootElement, observerOptions);
            } else {
                observer = null; // we don't have to call `disconnect`
            }
        });

        return {
            dispose: () => {
                if (!disposed) {
                    disposed = true;
                    if (observer) {
                        observer.disconnect();
                        observer = null;
                    }
                }
            }
        };
    }

    /**
     *
     * @param {*} selector
     * @param {Function} callback
     * @param {Options} [options=null]
     * @returns
     */
    function once(selector, callback, options = null) {
        const cb = callOnce((...x) => {
            console.assert(rv !== null);
            rv.dispose();
            rv = null;
            return callback(...x);
        });

        let rv = on(selector, cb, options);
        return rv;
    }

    return {
        on,
        once,
        onNodeRemoved,
    };
})();

// for compatibility
var Dom = dom;
