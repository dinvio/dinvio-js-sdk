
var Dinvio = require('../index');
var Calculator = require('../Calculator');

describe('Dinvio', function() {
    var destination = 'some destination',
        packages = [
            {
                weight: 2.3,
                width: 1,
                height: 2,
                length: 3
            }
        ];

    it('should not be initialized at start', function() {
        expect(Dinvio.isInitialized).toBeFalsy();
    });

    it('`calculate` method should thrown an error when Dinvio is not initialized', function() {
        expect(function() {
            Dinvio.calculate(destination, packages);
        }).toThrowError();
    });

    it('`init` method should initialize API with settings', function() {
        Dinvio.init({
            publicKey: 'some public key'
        });
        expect(Dinvio.isInitialized).toBeTruthy();
        expect(Dinvio.calculator instanceof Calculator).toBeTruthy();
    });

    it('`calculate` should be an alias to Dinvio.calculator.calc() method', function() {
        Dinvio.init({
            publicKey: 'some public key'
        });
        spyOn(Dinvio.calculator, 'calc');
        Dinvio.calculate(destination, packages);
        expect(Dinvio.calculator.calc).toHaveBeenCalledWith(destination, packages);
    });
});