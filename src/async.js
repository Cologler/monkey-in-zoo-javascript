// ==UserScript==
// @name               async
// @namespace          https://github.com/cologler/
// @version            0.1
// @description        try to take over the world!
// @author             cologler (skyoflw@gmail.com)
// @grant              none
// @license            MIT
// ==/UserScript==

// this lib was hosting on ??.
// you can just require:

const Async = (() => {
    'use strict';

    // require

    function GrantError(apiName) {
        return new Error(`require api <${apiName}>, please add '// @grant ${apiName}' into userscript header.`);
    }

    // begin

    /**
     * @typedef HttpResult
     * @prop {string} finalUrl the final URL after all redirects from where the data was loaded
     * @prop {number} readyState the ready state
     * @prop {number} status the request status
     * @prop {string} statusText the request status text
     * @prop {string} responseHeaders the request response headers
     * @prop {string} response the response data as object if details.responseType was set
     * @prop {object} responseXML the response data as XML document
     * @prop {string} responseText the response data as plain string
     *
     * @param {*} details
     * @return {Promise<HttpResult>}
     */
    function http(details) {
        if (typeof GM_xmlhttpRequest === 'undefined') throw GrantError('GM_xmlhttpRequest');

        let resolve, reject;
        const task = new Promise((resolve_1, reject_1) => {
            resolve = resolve_1;
            reject = reject_1;
        });

        const options = Object.assign({}, details);
        const onload = options.onload;
        options.onload = args => {
            if (onload) {
                onload(args);
            }
            resolve(args);
        };
        const requestResult = GM_xmlhttpRequest(options);

        task.abort = () => {
            requestResult.abort();
        };

        return task;
    }

    Object.assign(http, {
        get: function(url) {
            return http({
                method: 'GET',
                url,
            });
        }
    });

    return {
        http
    };
})();

