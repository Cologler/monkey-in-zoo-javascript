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
        let emittedElements = new Set();

        function shouldSkip(element) {
            return disposed || emittedElements.has(element);
        }

        function callbackWrapper(el) {
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

        // call on ready
        for (const el of rootElement.querySelectorAll(selector)) {
            callbackWrapper(el);
        }

        let observer = new MutationObserver(mrs => {
            mrs.forEach(mr => {
                if (mr.target.nodeType === Node.ELEMENT_NODE) {
                    switch (mr.type) {
                        case 'childList':
                            if (mr.target.querySelectorAll) {
                                mr.target.querySelectorAll(selector).forEach(z => callbackWrapper(z));
                            }
                            break;

                        case 'attributes':
                        case 'characterData':
                            if (!shouldSkip(mr.target) && mr.target.matches && mr.target.matches(this._selector)) {
                                callbackWrapper(mr.target);
                            }
                            break;
                    }
                }
            });
        });

        observer.observe(rootElement, observerOptions);

        return {
            dispose: () => {
                if (!disposed) {
                    disposed = true;
                    if (observer) {
                        observer.disconnect();
                        observer = null;
                    }
                    if (emittedElements) {
                        emittedElements.clear();
                        emittedElements = null;
                    }
                }
            }
        };
    }

    /**
     *
     * @param {*} selector
     * @param {function} callback
     * @param {Options} [options=null]
     * @returns
     */
    function once(selector, callback, options = null) {
        let called = false;
        function callbackWrapper(el) {
            if (called) {
                return;
            }
            called = true;
            rv.dispose();
            callback(el);
        }
        let rv = on(selector, callbackWrapper, options);
        return rv;
    }

    return {
        on,
        once
    };
})();

// for compatibility
var Dom = dom;
