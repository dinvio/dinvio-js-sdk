'use strict';

var sinon = require('sinon');
var Requests = require('../lib/Requests');
var Q = require('q');

describe('Requests', function() {
    var
        apiUrl = 'https://some.url/api/',
        version = 1,
        publicKey = 'some public key',
        requests, server;


    beforeEach(function() {
        server = sinon.fakeServer.create();
        server.respondWith([404, {}, '']);
        server.respondImmediately = true;
        requests = new Requests(apiUrl, version, publicKey);
    });

    afterEach(function() {
        server.restore();
    });

    it('it should accept apiUrl, version and publicKey in constructor', function() {
        expect(requests.apiUrl).toBe('https://some.url/api');    // strip slashes
        expect(requests.version).toBe('1');                      // stringify
        expect(requests.publicKey).toBe(publicKey);
    });

    it('`make` method should return promise', function(done) {
        var promise = requests.make('get', 'endpoint');
        expect(Q.isPromise(promise)).toBeTruthy();
        done();
    });

    it('`make` method should make an XHR to endpoint with right headers and method', function(done) {
        requests.make('get', 'endpoint');
        expect(server.requests.length).toBe(1);
        var request = server.requests[0];
        expect(request.url).toBe('https://some.url/api/v1/endpoint/');
        expect(request.method).toBe('GET');
        var headers = request.requestHeaders;
        expect(headers['Content-Type']).toBe('application/json');
        expect(headers['Accept']).toBe('application/json');
        expect(headers['X-API-Key']).toBe(publicKey);
        done();
    });

    it('`make` for GET method should add payload to query string', function(done) {
        requests.make('get', 'endpoint', { foo: 'bar', baz: 1 });
        expect(server.requests.length).toBe(1);
        var request = server.requests[0];
        expect(request.url).toBe('https://some.url/api/v1/endpoint/?foo=bar&baz=1');
        done();
    });

    it('`make` for POST method should add payload to request body', function(done) {
        var payload = { foo: 'bar', baz: 1 };
        requests.make('post', 'endpoint', payload);
        expect(server.requests.length).toBe(1);
        var request = server.requests[0];
        expect(request.method).toBe('POST');
        expect(request.url).toBe('https://some.url/api/v1/endpoint/');
        expect(request.requestBody).toBe(JSON.stringify(payload));
        done();
    });

    it('`make` promise should be resolved with json body', function(done) {
        var response = { foo: 'bar', baz: 1 };
        server.respondWith([200, {
            'Content-Type': 'application/json'
        }, JSON.stringify(response)]);
        requests.make('get', 'endpoint')
            .then(function(body) {
                expect(body).toEqual(response);
            })
            .fin(done);
    });

    it('`make` promise should be rejected when bad response code', function(done) {
        var error = {
            message: 'unknown error'
        };
        server.respondWith([404, {
            'Content-Type': 'application/json'
        }, JSON.stringify(error)]);
        requests.make('get', 'endpoint')
            .catch(function(body) {
                expect(body).toEqual(error)
            })
            .fin(done);
    });

    it('`make` promise should be rejected when bad response content type', function(done) {
        server.respondWith([404, {
            'Content-Type': 'text/plain'
        }, 'some error']);
        requests.make('get', 'endpoint')
            .catch(function(err) {
                expect(err).toBe('some error');
            })
            .fin(done);
    });

    it('`get` method should be a shortcut for `make`', function(done) {
        var payload = { foo: 'bar', baz: 1 };
        spyOn(requests, 'make').and.callThrough();
        var promise = requests.get('endpoint', payload);
        expect(requests.make).toHaveBeenCalledWith('get', 'endpoint', payload);
        expect(Q.isPromise(promise)).toBeTruthy();
        done();
    });

    it('`post` method should be a shortcut for `make`', function(done) {
        var payload = { foo: 'bar', baz: 1 };
        spyOn(requests, 'make').and.callThrough();
        var promise = requests.post('endpoint', payload);
        expect(requests.make).toHaveBeenCalledWith('post', 'endpoint', payload);
        expect(Q.isPromise(promise)).toBeTruthy();
        done();
    });

    describe('`deferred` method', function() {
        var requestId = 'some_id',
            total = 5,
            ready, failed, successful;

        function getNextMeta() {
            successful = Math.min(total, successful + 1);
            if (successful === total) {
                ready = true;
            }
            return {
                id: requestId,
                ready: ready,
                total: total,
                successful: successful,
                failed: failed
            };
        }

        beforeEach(function() {
            ready = false;
            failed = 0;
            successful = 0;
            server.respondWith(function(request) {
                request.respond(200, {
                    'Content-Type': 'application/json'
                }, JSON.stringify({
                    result: {},
                    meta: getNextMeta()
                }));
            });
        });

        it('should return a promise', function(done) {
            var promise = requests.deferred('endpoint', null, { timeout: 0 });
            expect(Q.isPromise(promise)).toBeTruthy();
            promise.fin(done);
        });

        it('should make POST request', function(done) {
            var payload = { foo: 'bar', baz: 1 };
            spyOn(requests, 'make').and.callThrough();
            requests.deferred('endpoint', payload, { timeout: 0 }).fin(done);
            expect(requests.make).toHaveBeenCalledWith('post', 'endpoint', payload);
        });

        it('should make GET request for result retrieving and notify promise', function(done) {
            var
                promise = requests.deferred('endpoint', null, { timeout: 0 }),
                first = true;
            promise.progress(function(body) {
                if (first) {
                    spyOn(requests, 'make').and.callThrough();
                    first = false;
                } else {
                    expect(requests.make).toHaveBeenCalledWith('get', 'endpoint', { 'request_id': requestId });
                }
            }).fin(done);
        });

        it('should resolve promise when result is ready', function(done) {
            requests.deferred('endpoint', null, { timeout: 0 }).then(function(body) {
                expect(body.meta.id).toBe(requestId);
                expect(body.meta.ready).toBeTruthy();
            }).fin(done);
        });

        it('should accept `timeout` setting for defer GET requests', function(done) {
            var clock = sinon.useFakeTimers();
            var promise = requests.deferred('endpoint', null, { timeout: 5000 });
            var counter = 0;
            var spy = sinon.spy(requests, 'make');
            promise.progress(function() {
                clock.tick(4999);
                expect(spy.callCount).toBe(counter);
                clock.tick(1);
                expect(spy.callCount).toBe(counter + 1);
                counter++;
            }).fin(function() {
                clock.restore();
                done();
            });
        });
    });

});