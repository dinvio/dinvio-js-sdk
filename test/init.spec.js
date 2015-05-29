describe("Dinvio.is_initialized", function() {
    'use strict';

    it('should return false on start', function() {
        expect(Dinvio.is_initialized()).toBeFalsy();
    });

});
describe("Dinvio.init", function() {
    'use strict';

    var publicKey = 'test_key';
    var server;

    beforeEach(function() {
        server = sinon.fakeServer.create();
    });

    afterEach(function() {
        server.restore();
        Dinvio.reset();
    });

    it('should be a function', function() {
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

    describe('configuration request', function() {

        it('should make GET request to config method', function() {
            Dinvio.init({
                publicKey: publicKey
            });
            expect(server.requests.length).toBe(1);
            expect(server.requests[0].method).toBe('GET');
            expect(server.requests[0].url).toBe('https://dinvio.ru/api/v1/js/?public=test_key');
        });

        describe('with good response', function() {
            var callbackSpy;
            beforeEach(function() {
                callbackSpy = jasmine.createSpy('callback');
                server.respondWith('GET', 'https://dinvio.ru/api/v1/js/?public=test_key',
                    [200, { 'Content-Type': 'application/json'}, '{}']
                );
            });

            it('should set initialized flag', function() {
                expect(Dinvio.is_initialized()).toBeFalsy();
                Dinvio.init({
                    publicKey: publicKey
                });
                server.respond();
                expect(Dinvio.is_initialized()).toBeTruthy();
            });
            it('should invoke callback method', function() {
                Dinvio.init({
                    publicKey: publicKey
                }, callbackSpy);
                server.respond();
                expect(callbackSpy.calls.count()).toBe(1);
            });
            it('should emit initialize event', function() {
                Dinvio.on('initialize', callbackSpy);
                Dinvio.init({
                    publicKey: publicKey
                });
                server.respond();
                expect(callbackSpy.calls.count()).toBe(1);
            });
        });
        describe('with bad response', function() {
            var callbackSpy;
            beforeEach(function () {
                callbackSpy = jasmine.createSpy('callback');
                server.respondWith('GET', 'https://dinvio.ru/api/v1/js/?public=test_key',
                    [500, {'Content-Type': 'application/json'}, '{}']
                );
            });

            it('should not set initialized flag', function () {
                expect(Dinvio.is_initialized()).toBeFalsy();
                Dinvio.init({
                    publicKey: publicKey
                });
                server.respond();
                expect(Dinvio.is_initialized()).toBeFalsy();
            });
        });
    })
});
