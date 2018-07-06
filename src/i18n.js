// ==UserScript==
// @name               i18n
// @namespace          https://github.com/Cologler/
// @version            0.1
// @description        i18n for greasemonkey info.
// @author             Cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// ==/UserScript==

// this lib was hosting on ??.
// you can just require:

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
