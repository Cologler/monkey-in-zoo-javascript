// ==UserScript==
// @name               value
// @namespace          https://github.com/Cologler/
// @version            0.2.1.1
// @description        wrap GM_getValue/... apis.
// @author             Cologler (skyoflw@gmail.com)
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_deleteValue
// @grant              GM_listValues
// @grant              GM_addValueChangeListener
// @grant              GM_removeValueChangeListener
// @license            MIT
// ==/UserScript==

// hosting on Github:       https://github.com/Cologler/monkey-in-zoo-javascript/raw/master/src/value.js
// hosting on GreasyFork:   https://greasyfork.org/scripts/370079/code/value.js

// let type script auto-completion work.
(function() { function require(){}; require("greasemonkey"); })();

const value = (() => {
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
            grant(typeof GM_listValues, 'GM_listValues'),
            grant(typeof GM_getValue, 'GM_getValue'),
            grant(typeof GM_setValue, 'GM_setValue'),
            grant(typeof GM_deleteValue, 'GM_deleteValue'),
            grant(typeof GM_addValueChangeListener, 'GM_addValueChangeListener'),
            grant(typeof GM_removeValueChangeListener, 'GM_removeValueChangeListener'),
        ]);
    })();

    class ValueOfGM {
        /**
         * @param {string} key
         * @param {any} defval
         * @memberof Of
         */
        constructor(key, defval) {
            this._key = key;
            this._defval = defval;
        }

        then(key, defval) {
            return new PropOfObject(this, key, defval);
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

    class PropOfObject {
        constructor(src, key, defval) {
            if (!(src instanceof ValueOfGM || src instanceof PropOfObject)) {
                throw new Error('src must be ValueOfGM or PropOfObject');
            }

            this._src = src;
            this._key = key;
            if (defval instanceof ValueOfGM || defval instanceof PropOfObject) {
                this._defvalFactory = defval;
            } else {
                this._defval = defval;
            }
        }

        then(key, defval) {
            return new PropOfObject(this, key, defval);
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
