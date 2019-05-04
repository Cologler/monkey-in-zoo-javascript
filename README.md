# monkey-in-zoo

[![](https://data.jsdelivr.com/v1/package/gh/Cologler/monkey-in-zoo-javascript/badge)](https://www.jsdelivr.com/package/gh/Cologler/monkey-in-zoo-javascript)

*Just keep monkey in zoo!*

**monkey-in-zoo** is a library which provide nice api for greasemonkey script.

* Test on tampermonkey.

## HOW-TO-USE

1. find which module you need
1. open jsDelivr CDN and copy url
1. require them in your user script

## Documents

### greasemonkey-storage.js

GreasemonkeyStorage implements Storage interface, base on GM sync API:

* `GM_getValue`
* `GM_setValue`
* `GM_deleteValue`
* `GM_listValues`

``` js
// greasemonkeyStorage is singleton instance like sessionStorage or localStorage
greasemonkeyStorage.setItem(..., ...);
```

### object-storage.js

ObjectStorage implements Storage interface, base on JSON.

``` js
const storage = new ObjectStorage(storage: greasemonkeyStorage | sessionStorage | localStorage);
storage.setItem(..., ...);
```

When you create a `ObjectStorage`, you need to choice a base storage for it.

### expirable-storage.js

ExpirableStorage implements Storage interface,
which allow you to get or set value with expired times.

**NOTE: ObjectStorage is required.**

``` js
const storage = new ExpirableStorage(storage: ObjectStorage);
// you can set item with expired time:
storage.setItem(key, value, expiresAt)
// or
storage.setItemExpiresAfter(k, v, expiresAfter)
```

Argument expires will compare with `new Date().getTime()` and decide if it should be remove or not.

### menu-command.js

MenuCommand provide a OOP way to use GM_MenuCommand API.

``` js
const menu = new MenuCommand();
menu.caption = 'abc';
menu.callback = () => ...;
menu.accessKey = ...;
menu.enable();
menu.disable();
```
