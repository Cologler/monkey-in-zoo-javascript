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
