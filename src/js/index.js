'use strict';

var $ = require('jquery');
var Dinvio = require('./dinvio_ns');

function Widget() {
    console.log('Yarrr!');
}

Dinvio.Widget = Widget;
module.exports = Widget;
