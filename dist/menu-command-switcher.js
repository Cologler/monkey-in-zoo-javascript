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

const MenuCommandSwitcher = (() => {
    if (typeof MenuCommand === 'undefined') {
        throw new Error(`require base module: <menu-command>.`);
    }

    /**
     *
     * @typedef LocalizationString
     * @prop {string} def the default value
     *
     * @typedef Option
     * @prop {string|LocalizationString} name
     * @prop {function} callback
     * @prop {string} accessKey
     */

    class SwitcherOption {
        /**
         * Creates an instance of SwitcherOption.
         * @param {Option} option
         * @memberof SwitcherOption
         */
        constructor(option) {
            this._Option = option;
        }

        get Name() {
            let name = this._Option.name;
            if (typeof name === 'string') {
                return name;
            }

            // this._Option.name should be LocalizationString.
            /** @type {LocalizationString} */
            const localizationString = name;
            name = localizationString[navigator.language];
            if (typeof name === 'string') {
                return name;
            }
            return localizationString.def;
        }

        get Callback() {
            return this._Option.callback;
        }

        get AccessKey() {
            return this._Option.accessKey;
        }
    }

    /**
     * @class MenuCommandSwitcher
     */
    class MenuCommandSwitcher {
        constructor() {
            /** @type {SwitcherOption[]} */
            this._Options = [];
            /** @type {SwitcherOption?} */
            this._ActiveOption = null;
            this._MenuCommand = null;
        }

        /**
         *
         * @param {Option} option
         * @memberof MenuCommandSwitcher
         */
        addOption(option) {
            const switcherOption = new SwitcherOption(option);
            this._Options.push(switcherOption);
            if (this._MenuCommand === null) {
                this._ActiveOption = switcherOption;
                this._MenuCommand = MenuCommand.register(
                    switcherOption.Name,
                    switcherOption.Callback,
                    switcherOption.AccessKey
                );
            }
        }

        getOption(key) {
            if (typeof key === 'string') {
                const option = this._Options.find(item => item.name === name);
                if (!option) {
                    throw new Error(`no such option named <${key}>.`);
                }
                return option;
            }

            if (typeof key === 'number') {
                const option = this._Options[key];
                if (!option) {
                    throw new Error(`no such option index: <${key}>.`);
                }
                return option;
            }

            throw new Error(`no such option.`);
        }

        /**
         *
         *
         * @param {string|number} key
         * @memberof MenuCommandSwitcher
         */
        switch(key) {
            let option = this.getOption(key);
            if (option !== this._ActiveOption) {
                this._ActiveOption = option;
                this._MenuCommand.update(
                    option.Name,
                    option.Callback,
                    option.AccessKey
                );
            }
        }
    }

    return MenuCommandSwitcher;
})();
