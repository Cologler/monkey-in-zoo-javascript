'use strict';

var MiZ_MissingGrantAction;

/**
 *
 * @param {string} apiName
 * @returns
 */
function _MiZ_isGmApiAccessable(apiName) {
    if (typeof apiName !== 'string') {
        throw new Error('apiName must be a string');
    }

    if (!apiName.startsWith('GM')) {
        throw new Error('apiName must start with "GM"');
    }

    var parts = apiName.split('.');
    var obj = window;
    for (const part of parts) {
        obj = obj[part];
        if (obj === undefined) {
            return false;
        }
    }
    return true;
}

/**
 * This is for internal use only and may change without notice.
 * @param {*} apiName
 */
function _MiZ_checkGrant(apiName) {
    if (_MiZ_isGmApiAccessable(apiName)) {
        return;
    }

    const action = typeof MiZ_MissingGrantAction === 'undefined' ? null : MiZ_MissingGrantAction;
    const scriptName = GM.info.script.name;
    const message =
        `${scriptName}: GM api (${apiName}) is required, please add '// @grant ${apiName}' to the userscript header.`;

    switch (action) {
        case 'ignore':
            console.error(message);
            break;

        case 'error':
        default:
            throw new Error(message);

        case 'alert':
            alert(message);
            throw new Error(message);
            break;
    }
}

const MenuCommand = (() => {
    _MiZ_checkGrant('GM_registerMenuCommand');
    _MiZ_checkGrant('GM_unregisterMenuCommand');

    class MenuCommand {
        constructor() {
            this._caption = '';
            this._callback = null;
            this._accessKey = null;
            this._handler = null;
        }

        get caption() {
            return this._caption;
        }

        set caption(value) {
            this._caption = value;
            this._update();
        }

        get accessKey() {
            return this._accessKey;
        }

        set accessKey(value) {
            this._accessKey = value;
            this._update();
        }

        get callback() {
            return this._callback;
        }

        set callback(value) {
            this._callback = value;
        }

        enable() {
            this._update(true);
        }

        disable() {
            if (this._handler !== null) {
                // eslint-disable-next-line no-undef
                GM_unregisterMenuCommand(this._handler);
                this._handler = null;
            }
        }

        _update(enable=false) {
            if (this._handler === null) {
                if (!enable) {
                    return;
                }
            }

            this.disable();
            this._handler = GM_registerMenuCommand(this._caption, () => this._callback(), this._accessKey);
        }
    }

    return MenuCommand;
})();
