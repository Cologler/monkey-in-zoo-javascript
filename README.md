# monkey-in-zoo

[![jsdelivr](https://data.jsdelivr.com/v1/package/gh/Cologler/monkey-in-zoo-javascript/badge)](https://www.jsdelivr.com/package/gh/Cologler/monkey-in-zoo-javascript)

*Just keep monkey in zoo!*

**monkey-in-zoo** is a library with nice api for greasemonkey script.

## HOW-TO-USE

1. find modules you need
1. open jsDelivr CDN and copy url from `dist/*` directory
1. add `@require URL` in your user-script

## Type declarations

The files in `dist/*.d.ts` describe the globals provided by the corresponding
`@require` scripts: `dom` (also `Dom`), `hooker`, `i18n`, `MenuCommand`,
`MenuCommandSwitcher`, and `value`. Use declarations from the same revision as
your `@require` URLs.

Install this repository as a development dependency in your userscript project:

```sh
npm install --save-dev github:Cologler/monkey-in-zoo-javascript
```

Reference all declarations at the top of your JavaScript or TypeScript userscript:

```js
/// <reference types="monkey-in-zoo-javascript" />
// @ts-check

// Keep your userscript metadata and @require URLs here.
// Type references provide editor support; @require loads the runtime scripts.

dom.once('input', input => {
    input.value = i18n.getText({ en: 'Search', '': 'Search' });
});

const enabled = value.of('enabled', false);
enabled.set(true);

const command = new MenuCommand();
command.caption = 'Toggle enabled';
command.callback = () => enabled.set(!enabled.get());
command.enable();
```

For individual modules, reference their declaration files instead:

```js
/// <reference path="./node_modules/monkey-in-zoo-javascript/dist/dom.d.ts" />
```

Alternatively, copy the needed `dist/*.d.ts` files into your project and reference
their local paths. Include `menu-command.d.ts` when using
`menu-command-switcher.d.ts`. `index.d.ts` references all six modules.
Type references must resolve to local files or installed packages, not CDN URLs.
Only use globals for scripts that you load with `@require`; referencing all types
does not load all modules.

The current `MenuCommandSwitcher` runtime calls missing `MenuCommand.register`
and `update` methods, and its string option lookup is broken. `value.onChanged`
also passes an undefined storage key to the userscript API. The declarations
describe these existing limitations; they do not add runtime implementations.

## Documents

[Wiki](https://github.com/Cologler/monkey-in-zoo-javascript/wiki)

## External Packages

A list of external packages that you can use via `@require` without bundle:

| Name                                                         | CDN (jsDelivr)                                               | CDN (cdnjs)                                       | File To Require   |
| ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------- | ----------------- |
| [Olical/EventEmitter](https://github.com/Olical/EventEmitter/) | [jsdelivr](https://www.jsdelivr.com/package/npm/wolfy87-eventemitter) | [cdnjs](https://cdnjs.com/libraries/EventEmitter) |                   |
| [blueimp/Gallery](https://github.com/blueimp/Gallery)        | [jsdelivr](https://www.jsdelivr.com/package/gh/blueimp/Gallery) |                                                   |                   |
| [acornjs/acorn](https://github.com/acornjs/acorn)            | [jsdelivr](https://www.jsdelivr.com/package/npm/acorn)       |                                                   | dist/acorn.min.js |
| [RonenNess/ExpiredStorage](https://github.com/RonenNess/ExpiredStorage) | [jsdelivr](https://www.jsdelivr.com/package/gh/RonenNess/ExpiredStorage) | | |
