/** Requires GM_registerMenuCommand and GM_unregisterMenuCommand grants. */
declare class MenuCommand {
    constructor();

    /** Updating an enabled command re-registers its menu entry. */
    caption: string;
    accessKey: string | null;
    /** Set this before enabling the command. The callback receives no event argument. */
    callback: ((this: MenuCommand) => void) | null;

    enable(): void;
    disable(): void;
}
