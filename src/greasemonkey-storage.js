// ==UserScript==
// @name               GreasemonkeyStorage
// @namespace          https://github.com/cologler/
// @version            0.2.0
// @description        bring Web Storage api to Greasemonkey.
// @author             cologler
// @grant              GM_listValues
// @grant              GM_getValue
// @grant              GM_setValue
// @grant              GM_deleteValue
// ==/UserScript==

// CDN
// greasyfork:

const GreasemonkeyStorage = (() => {
    'use strict';

    // require

    function RequireError(apiName) {
        return new Error(`require api <${apiName}>, please add '// @grant ${apiName}' into userscript header.`);
    }

    if (typeof GM_listValues === 'undefined') throw RequireError('GM_listValues');
    if (typeof GM_getValue === 'undefined') throw RequireError('GM_getValue');
    if (typeof GM_setValue === 'undefined') throw RequireError('GM_setValue');
    if (typeof GM_deleteValue === 'undefined') throw RequireError('GM_deleteValue');

    // begin

    class GreasemonkeyStorage {
        get length() {
            return this.keys().length;
        }

        get supportObject() { return true; }

        keys() {
            return GM_listValues();
        }

        key(index) {
            return this.keys()[index] || null;
        }

        getItem(k) {
            return GM_getValue(k, null);
        }

        setItem(k, v) {
            GM_setValue(k, v);
        }

        removeItem(k) {
            GM_deleteValue(k);
        }

        clear() {
            this.keys().forEach(k => {
                GM_deleteValue(k);
            });
        }
    }

    return new GreasemonkeyStorage();
})();