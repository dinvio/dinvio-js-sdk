'use strict';

var defaults = require('../lib/defaults');

describe('defaults', function() {

    it('.apiUrl should be http://dinvio.com/api/', function() {
        expect(defaults.apiUrl).toEqual('https://dinvio.com/api/')
    });

    it('.version should be "1"', function() {
        expect(defaults.version).toBe(1);
    });
});