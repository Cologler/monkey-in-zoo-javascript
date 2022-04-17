var hooker = (() => {

    /**
     * a helper function to debug hook.
     *
     * @template T
     * @param {T} target
     * @returns {ProxyHandler<T>}
     */
    function mock(target = {}) {
        return new Proxy(target, {
            get: function(target, property, receiver) {
                console.debug(`get ${property}`);
                return mock(target[property]);
            }
        });
    }

    /**
     * @template TRet
     * @param {(...args: any[]) => TRet} wrapped
     * @param {(args: any[], next: () => TRet) => TRet} wrapper
     * @returns {(...args: any[]) => TRet}
     */
    function hookFunc(wrapped, wrapper) {
        return function() {
            const self = this;
            const args = arguments;
            const next = () => wrapped.apply(self, args);
            Object.defineProperty(next, 'origin', {
                value: wrapped,
                enumerable: false,
                configurable: false,
                writable: false
            });
            return wrapper.call(self, args, next);
        };
    }

    /**
     * @template TRet
     * @param {(...args: any[]) => TRet} wrapped
     * @param {(...args: any[]) => TRet | undefined} wrapper
     * @returns
     */
    function hookBefore(wrapped, wrapper) {
        return hookFunc(wrapped, function(args, next) {
            const val = wrapper.call(this, ...args);
            return val !== undefined ? val : next();
        });
    }

    /**
     * A helper function for hook function on globalThis.
     * @param {PropertyKey} functionName
     * @param {(...args: any[]) => any} wrapper
     */
    function hookGlobal(functionName, wrapper) {
        globalThis[functionName] = hooker.hookBefore(globalThis[functionName], wrapper);
    }

    return {
        mock,
        hookFunc,
        hookBefore,
        hookGlobal,
    }
})();
