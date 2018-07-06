// ==UserScript==
// @name               value
// @namespace          https://github.com/Cologler/
// @version            0.1.1
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

// hosting on Github: https://github.com/Cologler/monkey-in-zoo-javascript/raw/master/src/value.js

// let type script auto-completion work.
(function() { function require(){}; require("greasemonkey"); })();

const value = (() => {
    'use strict';

    // require

    function GrantError(apiName) {
        return new Error(`require api <${apiName}>, please add '// @grant ${apiName}' into userscript header.`);
    }

    if (typeof GM_getValue === 'undefined') throw GrantError('GM_getValue');
    if (typeof GM_setValue === 'undefined') throw GrantError('GM_setValue');
    if (typeof GM_deleteValue === 'undefined') throw GrantError('GM_deleteValue');
    if (typeof GM_listValues === 'undefined') throw GrantError('GM_listValues');
    if (typeof GM_addValueChangeListener === 'undefined') throw GrantError('GM_addValueChangeListener');
    if (typeof GM_removeValueChangeListener === 'undefined') throw GrantError('GM_removeValueChangeListener');

    // begin

    class Of {
        constructor(key, defval) {
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

    return {
        of: Of
    };
})();
