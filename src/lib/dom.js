var dom = (() => {

    /**
     * wrap the function to ensure call once only
     * @param {(...args) => any} func
     * @returns
     */
    function callOnce(func) {
        let called = false;

        return function () {
            if (!called) {
                called = true;
                const funcRef = func;
                // Clear the captured reference before invoking a callback that may throw.
                func = null;
                return funcRef.apply(this, arguments);
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
     * @typedef {object} Options
     * @property {Node | null} [element=null] The root node to observe; defaults to document.
     * @property {MutationObserverInit | null} [observerOptions=null] Overrides the default mutation observer options.
     * @property {boolean} [allowsMultiTimes=false] Allows an element to trigger the callback again after an observed removal.
     */

    /**
     *
     * @param {string} selector
     * @param {function} callback
     * @param {Options | null} [options=null]
     * @returns
     */
    function on(selector, callback, options = null) {
        if (typeof selector !== 'string') throw new Error('selector must be string.');
        if (typeof options !== 'object') throw new Error('options must be object.');

        /** @type {Node & Partial<ParentNode>} */
        const rootElement = options?.element || document;
        const observerOptions = Object.assign({
            subtree: true,
            childList: true,
            attributes: true,
            characterData: false,
        }, options?.observerOptions || {});
        const allowsMultiTimes = options?.allowsMultiTimes || false;

        let disposed = false;
        // Keep emission markers isolated between subscriptions on the same element.
        const emittedSymbol = Symbol('emitted');

        /**
         * @param {Node} el
         */
        function allowsEmit(el) {
            return !el[emittedSymbol];
        }

        /**
         * @param {Node} el
         */
        function shouldSkip(el) {
            return disposed || !allowsEmit(el);
        }

        /**
         * @param {Node} node
         */
        function clearEmitted(node) {
            delete node[emittedSymbol];

            // Removed subtrees may contain marked elements that no longer match the selector.
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
            while (walker.nextNode()) {
                delete walker.currentNode[emittedSymbol];
            }
        }

        /**
         * @param {Element} el
         */
        function emit(el) {
            if (disposed || !allowsEmit(el)) {
                return;
            }
            // Pending records can reference detached nodes; leave their markers cleared.
            if (allowsMultiTimes && !rootElement.contains(el)) {
                return;
            }
            el[emittedSymbol] = true;
            callback(el);
        }

        /**
         * @param {Node & Partial<ParentNode>} node
         */
        function emitMatches(node) {
            if (disposed) {
                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = /** @type {Element} */ (node);
                if (!shouldSkip(element) && element.matches(selector)) {
                    emit(element);
                }
            }

            // A previously emitted container can still contain unprocessed descendants.
            if (!disposed) {
                node.querySelectorAll?.(selector).forEach(emit);
            }
        }

        let observer = new MutationObserver(mrs => {
            if (allowsMultiTimes) {
                // Clear first so removals and insertions in the same batch can emit again.
                for (const mr of mrs) {
                    if (mr.type === 'childList') {
                        mr.removedNodes.forEach(clearEmitted);
                    }
                }
            }

            // Attribute and text changes can affect selector matches outside the changed subtree.
            if (mrs.some(mr => mr.type === 'attributes' || mr.type === 'characterData')) {
                // Keep root rescans scoped to descendants, matching the initial scan.
                if (!disposed) {
                    rootElement.querySelectorAll?.(selector).forEach(emit);
                }
                return;
            }

            for (const mr of mrs) {
                if (mr.type === 'childList') {
                    mr.addedNodes.forEach(emitMatches);
                }
            }
        });

        // use timeout so the `once` function can get the handler
        setTimeout(() => {
            if (!disposed) {
                rootElement.querySelectorAll && rootElement.querySelectorAll(selector).forEach(emit);
                observer?.observe(rootElement, observerOptions);
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
     * @param {Options | null} [options=null]
     * @returns {{dispose: () => void, wait: (timeout: number) => Promise<void>}}
     */
    function once(selector, callback, options = null) {
        const { promise: callbackWaiter, resolve: callbackResolve } = Promise.withResolvers();

        const cb = callOnce((...x) => {
            console.assert(rv !== null);
            rv.dispose();
            rv = null;
            callbackResolve();
            return callback(...x);
        });

        let rv = on(selector, cb, options);

        /**
         * @param {number} timeout Timeout in milliseconds.
         * @returns {Promise<void>}
         */
        const wait = async (timeout) => {
            const { promise: timeoutWaiter, reject: timeoutReject } = Promise.withResolvers();
            const timer = setTimeout(() => {
                rv.dispose();
                timeoutReject();
            }, timeout);

            try {
                await Promise.race([callbackWaiter, timeoutWaiter]);
            } finally {
                clearTimeout(timer);
            }
        };

        return { ...rv, wait };
    }

    const logInfo = console.info

    /**
     * Log changed by selector
     * @param {string} selector
     * @returns void
     */
    function track(selector) {
        /**
         *
         * @param {MutationRecord} record
         * @param {Element} target
         */
        function logMutationRecord(record, target) {
            logInfo(`Tracked ${selector} from MutationObserver`, {
                target,
                record,
            })

            switch (record.type) {
                case 'childList':
                    break;
                case 'attributes':
                    logInfo(`Attributes(${record.attributeName}) updated:`,
                        record.oldValue,
                        target.getAttribute(record.attributeName))
                    break;
                case 'characterData':
                    logInfo(`CharacterData(${record.oldValue}) updated:`,
                        record.oldValue,
                        target.textContent)
                    break;
            }
        }

        document.querySelectorAll(selector).forEach(target => {
            logInfo(`Tracked ${selector} from document`, {
                target,
            })
        });

        /**
         * 
         * @param {Node} node
         * @param {MutationRecord} record
         */
        function handler(node, record) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = /** @type {Element} */ (node);
                if (element.matches(selector)) {
                    logMutationRecord(record, element);
                }
            }
        }

        let observerTrigger = new MutationObserver(mrs => {
            mrs.forEach(mr => {
                switch (mr.type) {
                    case 'childList':
                        mr.addedNodes.forEach(node => {
                            handler(node, mr);
                        })
                        break;

                    case 'attributes':
                    case 'characterData':
                        handler(mr.target, mr);
                        break;
                }
            });
        });

        observerTrigger.observe(document, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true,
        })

        return {
            dispose: () => {
                if (observerTrigger) {
                    observerTrigger.disconnect();
                    observerTrigger = null;
                }
            }
        };
    }

    return {
        on,
        once,
        onNodeRemoved,
        track,
    };
})();

// for compatibility
var Dom = dom;
