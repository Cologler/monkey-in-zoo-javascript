const ObjectStorage = (() => {
    'use strict';

    class ObjectStorageWrapper {
        constructor(baseStorage) {
            this._baseStorage = baseStorage;
        }

        get length() {
            return this._baseStorage.length;
        }

        get supportObject() {
            return true;
        }

        key(index) {
            return this._baseStorage.key(index);
        }

        getItem(key) {
            let value = this._baseStorage.getItem(key);
            if (value !== null) {
                return JSON.parse(value);
            }
            return value;
        }

        setItem(key, value) {
            if (value !== null) {
                value = JSON.stringify(value);
            }
            return this._baseStorage.setItem(key, value);
        }

        removeItem(key) {
            return this._baseStorage.removeItem(key);
        }

        clear() {
            return this._baseStorage.clear();
        }
    }

    function openAsObjectStorage(baseStorage) {
        if (baseStorage.supportObject) {
            return baseStorage;
        }
        return new ObjectStorageWrapper(baseStorage);
    }

    return {
        open: openAsObjectStorage
    }
})();
