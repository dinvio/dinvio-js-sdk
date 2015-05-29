describe('Dinvio.calc', function() {
    var server;
    var publicKey = 'key';
    var apiUrl = 'http://testurl/';
    var version = 1;

    function _url(endpoint) {
        return apiUrl + 'v' + version + '/' + endpoint +'/';
    }

    beforeEach(function() {
        server = sinon.fakeServer.create();
        server.respondWith('GET', _url('js') + '?public=' + publicKey,
            [200, { 'Content-Type': 'application/json'}, '{"a": "zzzz"}']
        );
        Dinvio.init({
            apiUrl: apiUrl,
            publicKey: publicKey,
            version: version
        });
        server.respond();
    });
    afterEach(function() {
        Dinvio.reset();
        server.restore();
    });

    var packages = [
        {
            weight: 2.7,
            length: 20,
            width: 30,
            height: 10
        }
    ];

    function _up(packages, prop, value) {
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

    it('should be a function', function() {
        expect(typeof Dinvio.calc).toBe('function');
    });

    it('should validate destination as a string', function() {
        var badDestinations = [ null, 123, [], {} ];
        badDestinations.forEach(function(dest) {
            expect(function() { Dinvio.calc(dest, packages); }).toThrowError();
        });
    });

    it('should validate packages as array', function() {
        var badPackages = [ null, 123, {}, 'some' ];
        badPackages.forEach(function(pack) {
            expect(function() { Dinvio.calc(dest, pack) }).toThrowError();
        });
    });

    it('should not validate empty array packages', function() {
        expect(function() { Dinvio.calc(dest, []) }).toThrowError();
    });

    it('should not validate package with bad values', function() {
        var subs = [
            ['weight', 0], ['weight', 'a'], ['weight', null], ['weight', {}], ['weight', []],
            ['length', 0], ['length', 'a'], ['length', null], ['length', {}], ['length', []],
            ['width', 0], ['width', 'a'], ['width', null], ['width', {}], ['width', []],
            ['height', 0], ['height', 'a'], ['height', null], ['height', {}], ['height', []]
        ];
        subs.forEach(function(sub) {
            expect(function() { Dinvio.calc(dest, _up(packages, sub[0], sub[1])); }).toThrowError();
        });
    });

    it('should make POST request to print endpoint', function() {
        Dinvio.calc(dest, packages);
        expect(server.requests.length).toBe(2);
        expect(server.requests[1].method).toBe('POST');
        expect(server.requests[1].url).toBe(_url('price'));
    });

    it('should make POST request with right JSON body', function() {
        var body;
        Dinvio.calc(dest, packages);
        expect(function() { body = JSON.parse(server.requests[1].requestBody); }).not.toThrowError();
        expect(body.destination).toBe(dest);
        expect(body.packages).toEqual(packages);
    });

    it('should return object with destination and packages properties', function() {
        var res = Dinvio.calc(dest, packages);
        expect(res.destination).toBe(dest);
        expect(res.packages).toEqual(packages);
    });

    describe('result', function() {
        var initialData = {
            meta: {
                id: 'id',
                ready: false,
                total: 5,
                successful: 0,
                failed: 0
            }
        };
        it('should be updated when POST request done', function() {
            server.respondWith('POST', _url('price'),
                [201, {'Content-Type': 'application/json'}, JSON.stringify(initialData)]
            );
            var res = Dinvio.calc(dest, packages);
            server.respond();
            expect(res.id).toBe(initialData.meta.id);
            expect(res.ready).toBe(initialData.meta.ready);
            expect(res.total).toBe(initialData.meta.total);
            expect(res.successful).toBe(initialData.meta.successful);
            expect(res.failed).toBe(initialData.meta.failed);
        });

        it('can be subscribed for `created` event, and should emit it with result.id argument when POST request done', function() {
            var createdSpy = jasmine.createSpy('created');
            server.respondWith('POST', _url('price'),
                [201, {'Content-Type': 'application/json'}, JSON.stringify(initialData)]
            );
            var res = Dinvio.calc(dest, packages);
            res.on('created', createdSpy);
            server.respond();
            expect(createdSpy).toHaveBeenCalledWith(initialData.meta.id);
        });

        xit('can be subscribed for `ready` event and emit it when meta.ready is true', function() {
            server.respondWith('POST', _url('price'),
                [201, {'Content-Type': 'application/json'}, '{"meta":{"ready":true}}']
            );
            var readySpy = jasmine.createSpy('ready');
            var res = Dinvio.calc(dest, packages);
            res.on('ready', readySpy);
            res.on('ready', function() {
                console.log(1);
            });
            server.respond();
            expect(readySpy.calls.count()).toBe(1);
        });
    });
});