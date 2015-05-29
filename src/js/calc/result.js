'use strict';

var Events = require('../utils/events');


/**
 * @param destination
 * @param packages
 * @constructor
 */
function CalcResult(destination, packages) {
    this.destination = destination;
    this.packages = packages;
    this.id = null;
    this.ready = false;
    this.total = 0;
    this.successful = 0;
    this.failed = 0;
}

CalcResult.prototype.updateMeta = function(meta) {
    this.id = meta.id;
    if (this.total === 0 && this.id) {
        this.total = meta.total;
        this.emit('created', this.id);
    }
    this.successful = meta.successful;
    this.failed = meta.failed;
    this.ready = meta.ready;
};

Events.install(CalcResult.prototype);


module.exports = CalcResult;