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
