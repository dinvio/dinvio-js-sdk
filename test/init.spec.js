describe("Dinvio.is_initialized", function() {
    'use strict';

    it('should return false on start', function() {
        expect(Dinvio.is_initialized()).toBeFalsy();
    });

});
describe("Dinvio.init", function() {
    'use strict';

    var publicKey = 'test_key';

    it('should be function', function() {
        expect(typeof Dinvio.init).toBe('function');
    });

    it('should throw exception when no publicKey provided', function() {
        expect(function() { Dinvio.init(); }).toThrow();
    });

    it('should set default settings', function() {
        Dinvio.init({
            publicKey: publicKey
        });
        expect(Dinvio.settings.get('apiUrl')).toBe('https://dinvio.ru/api/');
        expect(Dinvio.settings.get('version')).toBe(1);
    });

    it('can define apiUrl in settings', function() {
        var url = 'http://some.url';
        Dinvio.init({
            publicKey: publicKey,
            apiUrl: url
        });
        expect(Dinvio.settings.get('apiUrl')).toBe('http://some.url');
    });

    it('can define api version in settings', function() {
        var version = 2;
        Dinvio.init({
            publicKey: publicKey,
            version: version
        });
        expect(Dinvio.settings.get('version')).toBe(2);
    });

    it('should show console warning on unknown settings key', function() {
        var warnSpy = spyOn(console, 'warn');
        Dinvio.init({
            publicKey: publicKey,
            UNKNOWN_KEY: 'some value'
        });
        expect(warnSpy).toHaveBeenCalled();
    });

    it('should make request to config method', function() {

    });
});
