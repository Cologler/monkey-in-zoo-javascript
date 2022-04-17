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
