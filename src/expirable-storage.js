// ==UserScript==
// @name               expirable-storage
// @namespace          https://github.com/cologler/
// @version            0.2.0
// @description        allow web storage api save data with expires.
// @author             cologler
// @grant              none
// ==/UserScript==

// CDN
// greasyfork:

const ExpirableStorage = (() => {
    'use strict';

    // require

    function RequireError(moduleName) {
        return new Error(`require base module: <${moduleName}>.`);
    }

    if (typeof ObjectStorage === 'undefined') throw RequireError('ObjectStorage');

    // begin

    class ExpirableStorage {
        constructor(baseStorage) {
            if (!baseStorage.supportObject) {
                baseStorage = new ObjectStorage(baseStorage);
            }
            this._baseStorage = baseStorage;
        }

        get length() { return this._baseStorage.length; }

        get supportObject() { return true; }

        key(index) {
            return this._baseStorage.key(index);
        }

        getItem(k) {
            let val = this.getEntity(k);
            if (val && !val.isExpired) {
                return val.content;
            }
            return null;
        }

        getEntity(k, removeExpired = true) {
            const data = this._baseStorage.getItem(k);
            if (data) {
                const ret = {
                    isExpired: !(data.expiresAt === undefined || new Date().getTime() < data.expiresAt),
                    content: data.content
                };
                if (ret.isExpired && removeExpired) {
                    this._baseStorage.removeItem(k);
                }
                return ret;
            }
            return null;
        }

        setItem(k, v, expiresAtTime=undefined) {
            if (expiresAtTime !== undefined) {
                if (!Number.isSafeInteger(expiresAtTime)) {
                    throw new Error('expiresAtTime must be number.');
                }
            }

            const data = {
                content: v,
                expiresAt: expiresAtTime
            };
            return this._baseStorage.setItem(k, data);
        }

        setItemExpiresAfter(k, v, expiresAfterMS) {
            if (!Number.isSafeInteger(expiresAfterMS)) {
                throw new Error('expiresAfterMS must be number.');
            }

            return this.setItem(k, v, (new Date().getTime() + expiresAfterMS));
        }

        removeItem(k) { return this._baseStorage.removeItem(k); }

        clear() { return this._baseStorage.clear(); }

        clearExpired() {
            let keys = null;
            if (this._baseStorage.keys) {
                keys = this._baseStorage.keys();
            } else {
                keys = [];
                const len = this._baseStorage.length;
                for (var i = 0; i < len; i++) {
                    keys.push(this._baseStorage.key(i));
                }
            }
            keys.forEach(k => {
                try {
                    this.getEntity(k);
                } catch (error) { /* ignore json parse error */ }
            });
        }
    }

    return ExpirableStorage;
})();