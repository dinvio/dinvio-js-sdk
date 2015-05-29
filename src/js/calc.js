'use strict';

var CalcResult = require('./calc/result');

var packageProperties = ['weight', 'length', 'width', 'height'];
var endpoint = 'price';


/**
 * Send calculation request
 * @param {Requests} requests
 * @param {String} destination
 * @param {Array} packages
 */
function calculate(requests, destination, packages) {
    destination = cleanDestination(destination);
    packages = cleanPackages(packages);

    /**
     * @type {CalcResult|Events.mixin}
     */
    var result = new CalcResult(destination, packages);

    function responseHandler(data) {
        var meta = data['meta'];
        if (meta) {
            result.updateMeta(meta);
        }
    }

    requests.post(endpoint, {
        destination: destination,
        packages: packages
    }).done(responseHandler);
    return result;
}

function cleanDestination(destination) {
    if (typeof destination !== 'string' && !(destination instanceof String)) {
        throw new Error('destination should be a string');
    }
    return destination;
}

function cleanPackages(packages) {
    var cleaned = [];
    if (!Array.isArray(packages)) {
        throw Error('packages should be an array');
    }
    if (!packages.length) {
        throw Error('packages should not be an empty array');
    }
    packages.forEach(function(pack) {
        var cleanedPack = {};
        packageProperties.forEach(function(prop) {
            if (!pack.hasOwnProperty(prop) || !(pack[prop] > 0)) {
                throw Error('package property `' + prop + '` should be greater than 0, given: ' + pack[prop]);
            }
            cleanedPack[prop] = (prop === 'weight') ? parseFloat(pack[prop]) : parseInt(pack[prop]);
        });
        cleaned.push(cleanedPack);
    });
    return cleaned;
}


var Calc = {
    factory: function(requests) {
        return function(destination, packages) {
            return calculate(requests, destination, packages);
        }
    }
};


module.exports = Calc;