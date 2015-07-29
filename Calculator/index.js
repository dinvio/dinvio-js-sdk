'use strict';

var assign = require('lodash.assign');
var defaults = require('../lib/defaults');
var Requests = require('../lib/Requests');


var packageProperties = ['weight', 'length', 'width', 'height'];
var endpoint = 'price';
var minDestinationLength = 3;

/**
 * Calculator class
 * @param {Object} settings
 * @constructor
 */
function Calculator(settings) {
    this.settings = assign({}, defaults, settings);
    this.requests = new Requests(this.settings['apiUrl'], this.settings['version'], this.settings['publicKey']);
}

function DestinationError() {
    Error.apply(this, arguments);
}
DestinationError.prototype = Object.create(Error.prototype);

Calculator.DestinationError = DestinationError;

function PackagesError() {
    Error.apply(this, arguments);
}
PackagesError.prototype = Object.create(Error.prototype);

Calculator.PackagesError = PackagesError;


function cleanDestination(destination) {
    if (typeof destination !== 'string' && !(destination instanceof String)) {
        throw new DestinationError('destination should be a string');
    }
    destination = destination.trim();
    if (destination.length < minDestinationLength) {
        throw new DestinationError('destination length should be greater than ' + minDestinationLength);
    }
    return destination;
}

function cleanPackages(packages) {
    var cleaned = [];
    if (!Array.isArray(packages)) {
        throw new PackagesError('packages should be an array');
    }
    if (!packages.length) {
        throw new PackagesError('packages should not be an empty array');
    }
    packages.forEach(function(pack) {
        var cleanedPack = {};
        packageProperties.forEach(function(prop) {
            if (!pack.hasOwnProperty(prop) || !(pack[prop] > 0)) {
                throw new PackagesError('package property `' + prop + '` should be greater than 0, given: ' + pack[prop]);
            }
            cleanedPack[prop] = (prop === 'weight') ? parseFloat(pack[prop]) : parseInt(pack[prop]);
        });
        cleaned.push(cleanedPack);
    });
    return cleaned;
}

/**
 * Calculate packages delivery cost for destination
 * @param {String} destination
 * @param {Array} packages
 * @param {Number} [totalCost]
 * @returns {Object|Promise} Promise object
 */
Calculator.prototype.calc = function(destination, packages, totalCost) {
    destination = cleanDestination(destination);
    packages = cleanPackages(packages);
    totalCost = parseFloat(totalCost);
    if (!(totalCost > 0)) {
        totalCost = 0
    }
    return this.requests.deferred(endpoint, {
        destination: destination,
        packages: packages,
        total_cost: totalCost
    });

};

module.exports = Calculator;
