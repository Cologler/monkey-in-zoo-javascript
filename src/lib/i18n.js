const i18n = (() => {
    // default language resolve order
    const LANGUAGE_CODES = []
    LANGUAGE_CODES.push(navigator.language.toLowerCase());  // en-us
    LANGUAGE_CODES.push(LANGUAGE_CODES[0].replace('-', '_')); // en_us
    LANGUAGE_CODES.push(LANGUAGE_CODES[0].split('-')[0]);     // en
    LANGUAGE_CODES.push('');                                // default

    function getText(obj) {
        for (const language of LANGUAGE_CODES) {
            if (obj.hasOwnProperty(language)) {
                return obj[language];
            }
        }
        return obj[''] || '';
    }

    /**
     * get the description of the GM script
     * @returns {string}
     */
    function getDescription() {
        const obj = Object.assign({
            '': GM_info.script.description
        }, GM_info.script.description_i18n);
        return getText(obj);
    }

    /**
     * get the name of the GM script
     * @returns {string}
     */
    function getName() {
        const obj = Object.assign({
            '': GM_info.script.name
        }, GM_info.script.name_i18n);
        return getText(obj);
    }

    return {
        getDescription,
        getName,
        getText,
    };
})();
