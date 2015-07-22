'use strict';

var Q = require('q');
var Calculator = require('../Calculator');
var defaults = require('../lib/defaults');

describe('Calculator', function() {

    var calculator;

    beforeEach(function() {
        calculator = new Calculator({
            publicKey: 'some key'
        });
    });

    it('should have DestinationError', function() {
        expect(Calculator.DestinationError).toBeDefined();
        expect(new Calculator.DestinationError() instanceof Error).toBeTruthy();
    });

    it('should have PackagesError', function() {
        expect(Calculator.PackagesError).toBeDefined();
        expect(new Calculator.PackagesError() instanceof Error).toBeTruthy();
    });

    it('should use default settings', function() {
        expect(calculator.settings.apiUrl).toBe(defaults.apiUrl);
        expect(calculator.settings.version).toBe(defaults.version);
    });

    it('settings may be redefined', function() {
        var calc2 = new Calculator({
            apiUrl: 'http://some.url/',
            version: 2
        });
        expect(calc2.settings.apiUrl).toBe('http://some.url/');
        expect(calc2.settings.version).toBe(2);
    });

    describe('`calc` method', function() {
        var packages = [
            {
                weight: 2.7,
                length: 20,
                width: 30,
                height: 10
            }
        ];

        function updatePackages(packages, prop, value) {
            var packs = [];
            packages.forEach(function(p) {
                var np = {};
                for (var pr in p) {
                    if (p.hasOwnProperty(pr)) {
                        np[pr] = (pr === prop) ? value : p[pr];
                    }
                }
                packs.push(np);
            });
            return packs;
        }

        var dest = 'some destination';

        it('should validate destination', function() {
            var badDestinations = [ null, 123, [], {}, 'ab', 'a', '' ];
            badDestinations.forEach(function(dest) {
                expect(function() {
                    calculator.calc(dest, packages);
                }).toThrowError(Calculator.DestinationError);
            });
        });

        it('should validate packages as array', function() {
            var badPackages = [ null, 123, {}, 'some' ];
            badPackages.forEach(function(pack) {
                expect(function() {
                    calculator.calc(dest, pack)
                }).toThrowError(Calculator.PackagesError);
            });
        });

        it('should not validate empty array packages', function() {
            expect(function() {
                calculator.calc(dest, [])
            }).toThrowError(Calculator.PackagesError);
        });

        it('should not validate package with bad values', function() {
            var subs = [
                ['weight', 0], ['weight', 'a'], ['weight', null], ['weight', {}], ['weight', []],
                ['length', 0], ['length', 'a'], ['length', null], ['length', {}], ['length', []],
                ['width', 0], ['width', 'a'], ['width', null], ['width', {}], ['width', []],
                ['height', 0], ['height', 'a'], ['height', null], ['height', {}], ['height', []]
            ];
            subs.forEach(function(sub) {
                expect(function() {
                    calculator.calc(dest, updatePackages(packages, sub[0], sub[1]));
                }).toThrowError(Calculator.PackagesError);
            });
        });

        it('should make deferred request to `price` endpoint and returns promise', function() {
            spyOn(calculator.requests, 'deferred').and.callThrough();
            var promise = calculator.calc(dest, packages);
            expect(calculator.requests.deferred).toHaveBeenCalledWith('price', {
                destination: dest,
                packages: packages
            });
            expect(Q.isPromise(promise)).toBeTruthy();
        })
    });
});
