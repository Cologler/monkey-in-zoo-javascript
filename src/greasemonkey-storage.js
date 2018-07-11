// ==UserScript==
// @name               greasemonkey-storage
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
        ]);
    })();

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