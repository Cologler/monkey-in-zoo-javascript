/// <reference path="./menu-command.d.ts" />

declare namespace MenuCommandSwitcher {
    interface LocalizationString {
        def: string;
        [language: string]: string | undefined;
    }

    interface Option {
        name: string | LocalizationString;
        callback: (this: MenuCommand) => void;
        accessKey?: string;
    }

    /** The read-only view returned by getOption, rather than the original option. */
    interface SwitcherOption {
        readonly Name: string;
        readonly Callback: (this: MenuCommand) => void;
        readonly AccessKey: string | undefined;
    }
}

/**
 * Requires menu-command.js to be loaded first.
 * The current runtime calls MenuCommand.register/update, which are not implemented.
 */
declare class MenuCommandSwitcher {
    constructor();

    addOption(option: MenuCommandSwitcher.Option): void;
    /** Throws if the option cannot be found. String lookup is broken in the current runtime. */
    getOption(key: string | number): MenuCommandSwitcher.SwitcherOption;
    switch(key: string | number): void;
}
