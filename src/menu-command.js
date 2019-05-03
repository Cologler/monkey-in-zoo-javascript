/* Copyright (c) 2019~2999 - Cologler <skyoflw@gmail.com> */

/**
 * MenuCommand provide a OOP way to use GM_MenuCommand API.
 *
 * You may need to grant following GM permissions for MenuCommand:
 * - GM_registerMenuCommand
 * - GM_unregisterMenuCommand
 *
 */

// eslint-disable-next-line no-unused-vars
const MenuCommand = (() => {
    'use strict';

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
