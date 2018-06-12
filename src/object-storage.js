// ==UserScript==
// @name               object-storage
// @namespace          https://github.com/cologler/
// @version            0.2.0
// @description        allow web storage api save objects.
// @author             cologler
// @grant              none
// ==/UserScript==

// CDN
// greasyfork:

const ObjectStorage = (() => {
    'use strict';

    class ObjectStorage {
        constructor(baseStorage) {
            this._baseStorage = baseStorage;
        }

        get length() { return this._baseStorage.length; }

        get supportObject() { return true; }

        key(index) { return this._baseStorage.key(index); }

        getItem(k) {
            let val = this._baseStorage.getItem(k);
            if (val !== null) {
                if (!this._baseStorage.supportObject) {
                    val = JSON.parse(val);
                }
            }
            return val;
        }

        setItem(k, v) {
            if (!this._baseStorage.supportObject) {
                v = JSON.stringify(v);
            }
            return this._baseStorage.setItem(k, v);
        }

        removeItem(k) { return this._baseStorage.removeItem(k); }

        clear() { return this._baseStorage.clear(); }
    }

    return ObjectStorage;
})();
