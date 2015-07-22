'use strict';

var Calculator = require('./Calculator');
var initialized = false;
var calculator;

var Dinvio = Object.create({
    init: function(settings) {
        this.settings = settings;
        calculator = new Calculator(settings);
        initialized = true;
    },
    calculate: function(destination, packages) {
        if (!initialized) {
            throw new Error('Dinvio is not initialized, please use Dinvio.init(setting) method');
        }
        this.calculator.calc(destination, packages);
    }
}, {
    calculator: {
        get: function() {
            return calculator;
        }
    },
    isInitialized: {
        get: function() {
            return initialized;
        }
    }
});

module.exports = Dinvio;