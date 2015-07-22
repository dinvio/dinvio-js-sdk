'use strict';

var assign = require('lodash.assign');

function DeferredResult() {
}

DeferredResult.fromResponse = function(response) {
    var meta = response.meta;
    if (meta) {
        var result = Object.create(DeferredResult.prototype, {
            isReady: {
                value: !!meta.ready
            },
            requestId: {
                value: meta.id
            },
            progress: {
                value: [ meta.total, meta.successful, meta.failed ]
            }
        });
        assign(result, response.result);
        return result;
    }
    return undefined;
};

module.exports = DeferredResult;
