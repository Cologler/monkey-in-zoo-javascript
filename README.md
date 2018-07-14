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

### value.js

``` js
let v1 = value.of('a', {});
v1.get();   // same as GM_getValue('a', {})
v1.set(1);  // same as GM_setValue('a', 1)

// proxy for object
let v2 = v1.then('b', {}).then('c', {});
v2.get();
// same as GM_getValue('a', {})?['b']?['c'] || {}
v2.set(1);
// same as
// let d = GM_getValue('a', {});
// d['b'] = d['b'] || {};
// d['b']['c'] = 1
// GM_setValue('a', d);

// proxy for cache value
let v3 = v1.cache();

// as as property descriptor
Object.defineProperty({}, 'a', v1.asPropertyDescriptor());
```
