/* Copyright (c) 2019~2999 - Cologler <skyoflw@gmail.com> */

/**
 * ObjectStorage implements Storage interface,
 * which allow you store object in json string.
 *
 */

// eslint-disable-next-line no-unused-vars
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
                    try {
                        return JSON.parse(val);
                    } catch (_) {
                        return val;
                    }
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
