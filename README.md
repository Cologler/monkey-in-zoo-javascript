# monkey-in-zoo

Just keep monkey in zoo!

**monkey-in-zoo** is a library wrap greasemonkey api or more.

* Test on tampermonkey.

## HOW-TO-USE

### event-emitter.js

``` js
const ee = new EventEmitter();
ee.on(function(a, b, info) => {
    assert this === 0;
    assert a === 1;
    assert b === 2;

    // `info` is the call infos which append by `EventEmitter`.
    // @prop {number} call - the call times. the first time is 1 (not 0).
    // @prop {function} off - remove the listener from EventEmitter.
    // @prop {function} stop - stop the listeners call chain in current emit.
    assert info.call === 1;
});
ee.emit(0, 1, 2);
```

### dom.js

``` js
Dom.query(selector, options);
Dom.on(selector, callback, options);
Dom.once(selector, callback, options);
```
