'use strict';

function hasListeners(obj, name) {
    return (obj.__eventListeners && obj.__eventListeners[name] && obj.__eventListeners[name].length);
}

function on(obj, name, callback) {
    if (!obj.__eventListeners) {
        obj.__eventListeners = {};
    }
    if (!obj.__eventListeners[name]) {
        obj.__eventListeners[name] = [];
    }
    obj.__eventListeners[name].push(callback);
}

function off(obj, name, callback) {
    if (hasListeners(obj, name)) {
        if (typeof callback === 'function') {
            obj.__eventListeners[name] = obj.__eventListeners[name].filter(function(el) {
                return el !== callback;
            });
        } else {
            delete obj.__eventListeners[name];
        }
    }
}

function emit(obj, name, args) {
    if (hasListeners(obj, name)) {
        obj.__eventListeners[name].forEach(function(listener) {
            listener.apply(obj, args);
        });
    }
}


var Events = {
    mixin: {
        on: function(name, callback) {
            on(this, name, callback);
        },
        off: function(name, callback) {
            off(this, name, callback);
        },
        emit: function(name) {
            var args = Array.prototype.slice.call(arguments, 1);
            emit(this, name, args);
        }
    },
    install: function(obj) {
        for (var key in Events.mixin) {
            if (Events.mixin.hasOwnProperty(key)) {
                obj[key] = Events.mixin[key];
            }
        }
    }
};


module.exports = Events;