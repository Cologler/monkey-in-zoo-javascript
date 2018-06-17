// ==UserScript==
// @name               menu-command
// @namespace          https://github.com/cologler/
// @version            0.1
// @description        try to take over the world!
// @author             cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// ==/UserScript==

// this lib was hosting on ??.
// you can just require:

// just let type script work.
(function() { function require(){}; require("greasemonkey"); })();

const MenuCommand = (() => {
    'use strict';

    // require

    function GrantError(apiName) {
        return new Error(`require api <${apiName}>, please add '// @grant ${apiName}' into userscript header.`);
    }

    if (typeof GM_registerMenuCommand === 'undefined') throw GrantError('GM_registerMenuCommand');
    if (typeof GM_unregisterMenuCommand === 'undefined') throw GrantError('GM_unregisterMenuCommand');

    // begin

    class MenuCommand {
        constructor() {
            this._caption = null;
            this._callback = null;
            this._accessKey = null;
            this._handler = null;
        }

        update(caption, callback, accessKey) {
            this._caption = caption;
            this._callback = callback;
            this._accessKey = accessKey;
            this.dispose();
            this._handler = GM_registerMenuCommand(this._caption, this._callback, this._accessKey);
            return this;
        }

        get caption() {
            return this._caption;
        }

        set caption(val) {
            this.update(val, this._callback, this._accessKey);
        }

        dispose() {
            if (this._handler !== null) {
                GM_unregisterMenuCommand(this._handler);
                this._handler = null;
            }
        }
    }

    function register(caption, callback, accessKey) {
        return new MenuCommand().update(caption, callback, accessKey);
    }

    return {
        register
    };
})();
