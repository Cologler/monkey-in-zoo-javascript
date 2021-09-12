/* Copyright (c) 2019~2999 - Cologler <skyoflw@gmail.com> */

/**
 * GreasemonkeyStorage implements Storage interface,
 * which allow you get or set value by:
 *   - GM_getValue
 *   - GM_setValue
 *   - GM_deleteValue
 *   - GM_listValues
 * You may need to grant above GM permissions for GreasemonkeyStorage.
 *
 */

// eslint-disable-next-line no-unused-vars
const greasemonkeyStorage = (() => {
    'use strict';

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
