var hooker = (() => {

    /**
     * a helper function to debug hook.
     *
     * @template T
     * @param {T} target
     * @returns {ProxyHandler<T>}
     */
    function mock(target) {
        return new Proxy(target, {
            get: function(target, property, receiver) {
                console.debug(`get ${property}`);
                return mock(target);
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
            return wrapper.call(self, args, () => wrapped.apply(self, args));
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

    return {
        mock,
        hookFunc,
        hookBefore,
    }
})();
