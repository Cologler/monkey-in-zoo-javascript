// ==UserScript==
// @name               i18n
// @namespace          https://github.com/Cologler/
// @version            0.1.0.2
// @description        i18n for greasemonkey info.
// @author             Cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// ==/UserScript==

// hosting on Github:       https://raw.githubusercontent.com/Cologler/monkey-in-zoo-javascript/master/src/i18n.js
// hosting on GreasyFork:   https://greasyfork.org/scripts/370084/code/i18n.js

// let type script auto-completion work.
(function() { function require(){}; require("greasemonkey"); })();

const i18n = (() => {
    'use strict';

    class Resolver {
        constructor() {
            this._tokens = [];

            this._tokens.push(navigator.language.toLowerCase()); // en-us
            this._tokens.push(this._tokens[0].replace('-', '_')); // en_us
            this._tokens.push(this._tokens[0].split('-')[0]); // en
            this._tokens.push(''); // def
        }

        /**
         *
         *
         * @param {{}} obj
         * @memberof Resolver
         */
        resolve(obj) {
            for (const token of this._tokens) {
                if (obj.hasOwnProperty(token)) {
                    return obj[token];
                }
            }
        }
    }

    function getDesc() {
        const obj = Object.assign({
            '': GM_info.script.description
        }, GM_info.script.description_i18n);
        return new Resolver().resolve(obj);
    }

    function getName() {
        const obj = Object.assign({
            '': GM_info.script.name
        }, GM_info.script.name_i18n);
        return new Resolver().resolve(obj);
    }

    return {
        Resolver,
        getDesc, getName
    };
})();
