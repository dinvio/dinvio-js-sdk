var DeferredResult = require('../lib/DeferredResult');

describe('DeferredResult', function() {
    var response = {
        meta: {
            id: 'some request id',
            total: 5,
            successful: 2,
            failed: 1,
            ready: false
        },
        result: {
            foo: 'bar',
            baz: 2342
        }
    };

    var result;
    beforeEach(function() {
        result = DeferredResult.fromResponse(response);
    });

    it('.fromResponse create new DeferredResult object', function() {
        expect(result instanceof DeferredResult).toBeTruthy();
    });

    it('should enumerate only result properties', function() {
        var key, keys = [];
        for (key in response.result) {
            if (response.result.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        for (key in result) {
            if (result.hasOwnProperty(key)) {
                expect(response.result[key]).toBe(result[key]);
                keys.splice(keys.indexOf(key), 1);
            }
        }
        expect(keys.length).toBe(0);
    });

    it('should provide `requestId` property', function() {
        expect(result.requestId).toBe(response.meta.id);
    });

    it('should provide `isReady` property', function() {
        expect(result.isReady).toBe(!!response.meta.ready);
    });

    it('should provide `progress` property', function() {
        expect(result.progress).toEqual([ response.meta.total, response.meta.successful, response.meta.failed ]);
    });
});