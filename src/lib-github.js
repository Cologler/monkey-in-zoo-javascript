// ==UserScript==
// @name                lib-github
// @namespace           https://github.com/Cologler/
// @version             0.1.2
// @description         a lib for easily add feature to GitHub.
// @author              Cologler (skyoflw@gmail.com)
// @grant               none
// @license             MIT
// @require
// ==/UserScript==

// require: event-emitter, dom, dom-builder

// hosting on GitHub:
// hosting on jsDelivr:     https://cdn.jsdelivr.net/gh/Cologler/monkey-in-zoo-javascript/src/lib-github.js
// hosting on GreasyFork:

// let type script auto-completion work.
(function() { function require(){}; require("greasemonkey"); })();

const github = (() => {
    'use strict';

    if (typeof DomBuilder === 'undefined') {
        throw new Error('require dom-builder module');
    }

    const LANGUAGE_ALIAS = {
        'js': 'javascript',
        'ts': 'typescript',
    };

    class FileMatcher {
        constructor(condition) {
            this._languages = null;
            if (typeof condition.type === 'string') {
                this._languages = [condition.type];
            } else if (Array.isArray(condition.type)) {
                this._languages = condition.type;
            }
            if (this._languages) {
                this._languages = this._languages
                    .map(z => LANGUAGE_ALIAS[z] || z)
                    .map(z => 'type-' + z);
            }
        }

        test(node) {
            if (this._languages) {
                const data = node.querySelector('.data');
                if (this._languages.every(l => !data.classList.contains(l))) {
                    return false;
                }
            }
            return true;
        }
    }

    const TAG = Symbol.for(GM_info.script.namespace + 'lib-github');

    class FileRule {
        constructor(condition) {
            this._matcher = condition && new FileMatcher(condition);
            this._actions = [];
        }

        _match(node) {
            return !this._matcher || this._matcher.test(node);
        }

        exec(node) {
            if (!this._match(node)) {
                return;
            }

            const info = node[TAG] || (node[TAG] = {});

            const db = DomBuilder;
            const bg = node.querySelector('.file-header .file-actions .BtnGroup');

            for (const action of this._actions) {
                if (info[action.text]) {
                    continue;
                }
                info[action.text] = true;

                let a = null;
                switch (action.type) {
                    case 'anchor':
                        let url = action.url;
                        if (typeof url === 'function') {
                            url = url(node);
                        }
                        a = db.el('a', {
                            class: ['btn', 'btn-sm', 'BtnGroup-item'],
                            attrs: { href: url }
                        }, action.text).get();
                        break;

                    case 'button':
                        a = db.el('a', {
                            class: ['btn', 'btn-sm', 'BtnGroup-item'],
                            on: { 'click': action.callback }
                        }, action.text).get();
                        break;
                }

                bg.insertBefore(a, bg.children[0]);
            }
        }

        /**
         * @param {string} text
         * @param {string|(() => string)} url
         */
        addAnchor(text, url) {
            this._actions.push({ type: 'anchor', text, url });
            return this;
        }

        addButton(text, callback) {
            this._actions.push({ type: 'button', text, callback });
            return this;
        }

        apply() {
            Dom.on('.file', z => {
                this.exec(z);
            });
        }
    }

    function file(condition = null) {
        const rule = new FileRule(condition);
        return rule;
    }

    return {
        file
    };
})();

/*
Example:

github.file({ type: ['css', 'javascript'] }).addAnchor('open', () => 'URL').apply();
github.file({ type: 'css' }).addButton('copy', () => { }).apply();
*/
