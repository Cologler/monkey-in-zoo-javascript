const assert = require('assert');

describe('event-emitter', function() {

    const { EventEmitter } = require('../src/event-emitter');

    describe('#emit()', function() {
        it('should no effect if no callbacks', function() {
            const ee = new EventEmitter();
            ee.emit();
        });

        it('should call each callback', function() {
            let val1 = 0;
            let val2 = 0;
            const ee = new EventEmitter();
            ee.on(() => val1 ++);
            ee.on(() => val2 ++);
            assert.equal(val1, 0);
            assert.equal(val2, 0);
            ee.emit();
            assert.equal(val1, 1);
            assert.equal(val1, 1);
        });

        it('should call each callbacks one by one (FIFO)', function() {
            let val = 0;
            const ee = new EventEmitter();
            ee.on(() => val = 1);
            ee.on(() => val = 2);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 2);
        });

        it('should has arguments', function() {
            const ee = new EventEmitter();
            function cb() {
                assert.equal(this, 1);

                assert.equal(arguments.length, 4);
                assert.equal(arguments[0], 2);
                assert.equal(arguments[1], 3);
                assert.equal(arguments[2], 4);

                // last argument was injected.
                const info = arguments[3];
                assert.equal(typeof info.stop, 'function');
                assert.equal(typeof info.off, 'function');
                assert.equal(typeof info.call, 'number');
            }
            ee.on(cb);
            ee.on(cb);
            ee.emit(1, 2, 3, 4);
            ee.emit(1, 2, 3, 4);
        });

        it('should has return value: default is undefined', function() {
            const ee = new EventEmitter();
            ee.on(() => { });
            assert.equal(ee.emit(), undefined);
        });

        it('should has return value: lastest callback return value', function() {
            const ee = new EventEmitter();
            ee.on(() => {
                return 3;
            });
            ee.on(() => {
                return 4;
            });
            assert.equal(ee.emit(), 4);
        });

        it('should has return value: pipe value one by one', function() {
            const ee = new EventEmitter();
            ee.on(() => {
                return 3;
            });
            ee.on(info => {
                return info.ret + 8; // 3 + 8 -> 11
            });
            assert.equal(ee.emit(), 11);
        });
    });

    describe('#on()', function() {
        it('should call after each emit', function() {
            let val = 0;
            const ee = new EventEmitter();
            ee.on(() => val ++);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 1);
            ee.emit();
            assert.equal(val, 2);
        });
    });

    describe('#once()', function() {
        it('should call only after first emit', function() {
            let val = 0;
            const ee = new EventEmitter();
            ee.once(() => val ++);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 1);
            ee.emit();
            assert.equal(val, 1);
        });
    });

    describe('#off()', function() {
        it('should off after call off()', function() {
            let val = 0;
            const ee = new EventEmitter();
            const func = () => val ++;
            ee.on(func);
            ee.off(func);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 0);
        });
    });

    describe('#on() -> #off()', function() {
        it('should off after call off()', function() {
            let val = 0;
            const ee = new EventEmitter();
            ee.on(info => {
                val ++;
                info.off();
            });
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 1);
            ee.emit();
            assert.equal(val, 1);
        });
    });

    describe('#on() -> #stop()', function() {
        it('should off after call stop()', function() {
            const ee = new EventEmitter();
            ee.on(info => {
                info.stop();
            });
            ee.on(() => {
                assert.fail('should stop in first callback.');
            });
        });
    });

    describe('#disable()', function() {
        it('should temp disbale callback without remove it', function() {
            let val = 0;
            const ee = new EventEmitter();
            const func = () => val ++;
            ee.on(func);
            ee.disable(func);
            assert.equal(ee.count, 1);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 0);
        });
    });

    describe('#enable()', function() {
        it('should enable the disabled callback', function() {
            let val = 0;
            const ee = new EventEmitter();
            const func = () => val ++;
            ee.on(func);
            ee.disable(func);
            ee.enable(func);
            assert.equal(val, 0);
            ee.emit();
            assert.equal(val, 1);
        });
    });
});
