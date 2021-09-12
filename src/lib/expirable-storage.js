/* Copyright (c) 2019~2999 - Cologler <skyoflw@gmail.com> */

/**
 * ExpirableStorage implements Storage interface,
 * allow you to get or set value with expired times.
 *
 * to use this ExpirableStorage, you need to requires:
 * - object-storage
 *
 */

// eslint-disable-next-line no-unused-vars
const ExpirableStorage = (() => {
    'use strict';

    const ID_LAST_CLEAR = '__expirable_storage_last_clear__';

    class ExpirableStorage {
        constructor(baseStorage, autoClearMS = 86400 * 1000) {
            if (typeof autoClearMS !== 'number') {
                throw Error('autoClearMS should be a number');
            }

            if (!baseStorage.supportObject) {
                // eslint-disable-next-line no-undef
                baseStorage = new ObjectStorage(baseStorage);
            }
            this._baseStorage = baseStorage;
            this._autoClearMS = autoClearMS;

            if (!this.getItem(ID_LAST_CLEAR)) {
                this.clearExpired();
            }
        }

        get length() { return this._baseStorage.length; }

        get supportObject() { return true; }

        key(index) {
            return this._baseStorage.key(index);
        }

        getItem(k) {
            let entry = this._getEntry(k);
            if (entry && !entry.isExpired) {
                return entry.content;
            }
            return null;
        }

        _getEntry(k, removeExpired = true) {
            const entry = this._baseStorage.getItem(k);
            if (!entry) {
                return entry;
            }

            const filledEntry = {
                isExpired: !(entry.expiresAt === undefined || new Date().getTime() < entry.expiresAt),
                content: entry.content
            };
            if (filledEntry.isExpired && removeExpired) {
                this._baseStorage.removeItem(k);
            }
            return filledEntry;
        }

        setItem(k, v, expiresAtTime=undefined) {
            if (expiresAtTime !== undefined) {
                if (!Number.isSafeInteger(expiresAtTime)) {
                    throw new Error('expiresAtTime must be a number');
                }
            }

            const entry = {
                content: v,
                expiresAt: expiresAtTime
            };
            return this._baseStorage.setItem(k, entry);
        }

        setItemExpiresAfter(k, v, expiresAfterMS) {
            if (!Number.isSafeInteger(expiresAfterMS)) {
                throw new Error('expiresAfterMS must be a number');
            }

            return this.setItem(k, v, (new Date().getTime() + expiresAfterMS));
        }

        removeItem(k) { return this._baseStorage.removeItem(k); }

        clear() { return this._baseStorage.clear(); }

        clearExpired() {
            let keys;
            if (this._baseStorage.keys) {
                keys = Array.from(this._baseStorage.keys());
            } else {
                keys = [];
                const len = this._baseStorage.length;
                for (var i = 0; i < len; i++) {
                    keys.push(this._baseStorage.key(i));
                }
            }
            for (const k of keys) {
                try {
                    this._getEntry(k);
                } catch (error) { /* ignore json parse error */ }
            }

            this.setItemExpiresAfter(ID_LAST_CLEAR, true, this._autoClearMS);
        }
    }

    return ExpirableStorage;
})();