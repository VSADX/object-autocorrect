/**
 * Some code has been "borrowed" from devsnek (Gus) at
 * https://gist.github.com/devsnek/4ee62455689e241004f63f96f5bf9b46
 */

const distance = require('jaro-winkler');
const has      = (o, p) => Object.prototype.hasOwnProperty.call(o, p);

const dontEnums = [
    'toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'
];

function dist(target, list) {
    let highest = 0, best;
    for (const key of list) {
        const dist = distance(target, key);
        if (dist > highest) {
            best = key;
            highest = dist;
        }
    }
    return best;
}

function find(target, prop, value, setting) {
    prop = has(target, prop) ? prop : dist(prop, getKeys(target));
    if (setting) return target[prop] = value;
    return target[prop];
}

function getKeys(obj) {
    if (obj === null) return [];
    const keys = Object.getOwnPropertyNames(obj);
    const proto = Reflect.getPrototypeOf(obj);

    for (const prop of dontEnums) {
        if (has(obj, prop) && keys.indexOf(prop) !== -1) {
            keys.push(prop);
        }
    }

    return keys.concat(getKeys(proto));
}

const handler = {
    apply(target, thisArg, argumentsList) {
        const result = target(...argumentsList);
        return (typeof result === 'object') ? new Proxy(result, handler) : result;
    },
    get(target, prop) {
        let isRevocableProxy;

        if (prop === 'getTarget') {
            if (typeof target.revoke === 'function') {
                const insideTarget = target.proxy.getTarget();
                target.revoke();
                return () => insideTarget;
            }
            return () => target;
        }

        if (typeof target.revoke === 'function' && typeof target.proxy === 'object') {
            target = target.proxy.getTarget();
            isRevocableProxy = true;
        }

        const found = find(target, prop);

        switch(typeof found) {
            case 'object': {
                if(!isRevocableProxy) {
                    return new Proxy(found, handler);
                } else {
                    return new Proxy(Proxy.revocable(found, handler), handler);
                }
            }
            case 'function': {
                if (!isRevocableProxy) {
                    return new Proxy(found.bind(target), handler);
                } else {
                    return new Proxy(Proxy.revocable(found.bind(target), handler), handler);
                }
            }
            default: {
                return found;
            }
        }
    },
    set(target, prop, value) {
        let isRevocableProxy;
        if (typeof target.revoke === 'function' && typeof target.proxy === 'object') {
            target = target.proxy.getTarget();
            isRevocableProxy = true;
        }

        const found = find(target, prop, value, true);
        
        if (typeof found === 'object') {
            return found;
        }

        if (!isRevocableProxy) {        
            return new Proxy(found, handler);
        } else {
            return new Proxy(Proxy.revocable(found, handler), handler);
        }
    }
};

class PropertyAutocorrect {
    /**
     * Creates a new autocorrect property.
     * @param {*} target The target object.
     * @returns {AutocorrectObject} An AutocorrectObject that will autocorrect properties and functions. 
     */
    constructor(target) {
        if (typeof target !== 'object' || target instanceof Array) {
            throw new TypeError('Invalid argument: target must be an obect.');
        }
        return new AutocorrectObject(target);
    }

    /**
     * This will create a revocable AutocorrectObject. That means it will throw an error if you try to use it after it has been un-autocorrect'ed.
     * @param {*} target The target object.
     * @returns {RevocableAutocorrectObject} A revocable AutocorrectObject that will autocorrect properties and functions.
     */
    static revocable(target) {
        return new AutocorrectObject(target, true);
    }
}

module.exports = PropertyAutocorrect;

class AutocorrectObject {
    constructor(target, revocable = false) {
        if (!revocable) {
            return new Proxy(target, handler);
        } else {
            return new Proxy(Proxy.revocable(target, handler), handler);
        }
    }
    
    /**
     * Get the object it is autocorrecting. If this is a revocable AutocorrectObeject, it will also revoke the autocorrecting.
     * @returns {*} The object it autocorrected.
     */
    getTarget() {
        if (typeof this.revoke === 'function') {
            this.revoke();
        }
        return this.getTarget();
    }
}
