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
