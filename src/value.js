// ==UserScript==
// @name                value
// @namespace           https://github.com/Cologler/
// @version             0.2.1.1
// @description         wrap GM_getValue/... apis.
// @author              Cologler (skyoflw@gmail.com)
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               GM_deleteValue
// @grant               GM_listValues
// @grant               GM_addValueChangeListener
// @grant               GM_removeValueChangeListener
// @license             MIT
// ==/UserScript==

// let type script auto-completion work.
(function() { function require(){}; require("greasemonkey"); })();

const value = (() => {
    'use strict';

    (() => {
        function grant(type, name) {
            if (type === 'undefined') {
                return new Error(`require GM api <${name}>, please add '// @grant ${name}' into user.js header.`);
            }
        }

        (function(errors) {
            errors.filter(z => z).forEach(z => { throw z; });
        })([
            grant(typeof GM_listValues, 'GM_listValues'),
            grant(typeof GM_getValue, 'GM_getValue'),
            grant(typeof GM_setValue, 'GM_setValue'),
            grant(typeof GM_deleteValue, 'GM_deleteValue'),
            grant(typeof GM_addValueChangeListener, 'GM_addValueChangeListener'),
            grant(typeof GM_removeValueChangeListener, 'GM_removeValueChangeListener'),
        ]);
    })();

    class Value {
        /**
         * @memberof Value
         * @abstract
         * @return {any}
         */
        get() {
            throw new Error();
        }

        /**
         *
         *
         * @param {*} value
         * @memberof Value
         * @abstract
         */
        set(value) {
            throw new Error();
        }

        /**
         *
         *
         * @memberof Value
         * @abstract
         */
        del() {
            throw new Error();
        }

        /**
         * @param {PropertyKey} key
         * @param {*} defval
         * @returns
         * @memberof BaseValue
         */
        then(key, defval) {
            return new PropOfObject(this, key, defval);
        }

        cache() {
            return new CachedValue(this);
        }

        /**
         * @memberof Value
         * @return {PropertyDescriptor}
         */
        asPropertyDescriptor() {
            return {
                get: () => this.get(),
                set: val => this.set(val)
            };
        }
    }

    class ValueOfGM extends Value {
        /**
         * @param {string} key
         * @param {any} defval
         * @memberof Of
         */
        constructor(key, defval) {
            super();
            this._key = key;
            this._defval = defval;
        }

        get() {
            return GM_getValue(this._key, this._defval);
        }

        set(val) {
            GM_setValue(this._key, val);
        }

        del() {
            GM_deleteValue(this._key);
        }

        /**
         * @typedef {(number|string|boolean)} value
         *
         * @param {(name: string, old_value: value, new_value: value, remote: boolean) => {}} callback
         * @returns
         * @memberof Of
         * @desc remote is boolean that shows whether this value was modified from the instance of another tab
         */
        onChanged(callback) {
            const handler = GM_addValueChangeListener(this.key, callback);
            return {
                dispose: () => {
                    GM_removeValueChangeListener(handler);
                }
            };
        }
    }

    class PropOfObject extends Value {
        /**
         * Creates an instance of PropOfObject.
         * @param {Value} src
         * @param {*} key
         * @param {*} defval
         * @memberof PropOfObject
         */
        constructor(src, key, defval) {
            super();

            this._src = src;
            this._key = key;
            if (defval instanceof Value) {
                this._defvalFactory = defval;
            } else {
                this._defval = defval;
            }
        }

        get() {
            const obj = this._src.get();
            if (obj.hasOwnProperty(this._key)) {
                return obj[this._key];
            } else if (this._defvalFactory) {
                return this._defvalFactory.get();
            } else {
                return this._defval;
            }
        }

        set(val) {
            const obj = this._src.get();
            obj[this._key] = val;
            this._src.set(obj);
        }

        del() {
            const obj = this._src.get();
            delete obj[this._key];
            this._src.set(obj);
        }
    }

    /**
     * @class ValueWrapper
     * @extends {Value}
     * @abstract
     */
    class ValueWrapper extends Value {
        /**
         * Creates an instance of CachedValue.
         * @param {Value} baseValue
         * @memberof CachedValue
         */
        constructor(baseValue) {
            super();
            this._baseValue = baseValue;
        }

        get() {
            return this._baseValue.get();
        }

        set(value) {
            return this._baseValue.set(value);
        }

        del() {
            return this._baseValue.del();
        }
    }

    class CachedValue extends ValueWrapper {
        /**
         * Creates an instance of CachedValue.
         * @param {Value} baseValue
         * @memberof CachedValue
         */
        constructor(baseValue) {
            super(baseValue);
            this._isCached = false;
            this._value = null;
        }

        get() {
            if (!this._isCached) {
                this._isCached = true;
                this._value = super.get();
            }
            return this._value;
        }

        set(value) {
            this._isCached = true;
            this._value = value;
            super.set(value);
        }

        refresh() {
            this._isCached = false;
        }
    }

    /**
     * @param {string} key
     * @param {any} defval
     */
    function of(key, defval) {
        return new ValueOfGM(key, defval);
    }

    return {
        of
    };
})();
