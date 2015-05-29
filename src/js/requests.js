'use strict';

var $ = require('jquery');

var SLASH_START_RE = /^\//,
    SLASH_STOP_RE = /\/$/;

function stripSlashes(str) {
    return str.replace(SLASH_START_RE, '').replace(SLASH_STOP_RE, '');
}

function Requests(baseUrl, version, publicKey) {
    this.baseUrl = stripSlashes(baseUrl);
    this.version = version;
    this.publicKey = publicKey;
}

Requests.prototype._constructUrl = function(endpoint) {
    return this.baseUrl + '/v' + this.version + '/' + stripSlashes(endpoint) + '/'
};

Requests.prototype._invoke = function(httpMethod, endpoint, payload) {
    httpMethod = httpMethod.toUpperCase();
    if (httpMethod !== 'GET' && httpMethod !== 'POST') {
        throw new Error('Only GET or POST method allowed');
    }
    payload = $.extend({}, payload, { 'public': this.publicKey });
    return $.ajax(this._constructUrl(endpoint), {
        contentType: 'application/json; charset=UTF-8',
        crossDomain: true,
        data: (httpMethod === 'GET') ? payload : JSON.stringify(payload),
        dataType: 'json',
        method: httpMethod
    }).fail(function(jqXHR) {
        var r = jqXHR.responseJSON;
        if (r) {
            console.error('Dinvio API [' + endpoint +'] error #' + r['code'] + ': ' + r['message']);
        } else {
            console.error('Dinvio API [' + endpoint +'] unknown error: ' + jqXHR.status + ', ' + jqXHR.responseText);
        }
    });
};

Requests.prototype.post = function(endpoint, payload) {
    return this._invoke('post', endpoint, payload);
};

Requests.prototype.get = function(endpoint, payload) {
    return this._invoke('get', endpoint, payload);
};

module.exports = Requests;