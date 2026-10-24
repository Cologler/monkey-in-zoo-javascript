declare namespace i18n {
    /** Maps lowercase language codes to text; the empty key is the default text. */
    interface LocalizedText {
        [language: string]: string;
    }

    /** Resolves full language, underscore variant, base language, then the empty key. */
    function getText(text: LocalizedText): string;

    /** Gets the localized description from GM_info.script. */
    function getDescription(): string;

    /** Gets the localized name from GM_info.script. */
    function getName(): string;
}
