// replace w lib for word closest matches
const distance = (target, key) => Math.random()

export function autocorrect(target, can_revoke = false) {
        if (typeof target !== 'object' || target instanceof Array) 
            throw new TypeError('Invalid argument: target must be an obect.')
        
        return new AutocorrectObject(target, can_revoke)
}

export function revoke(target) {
    return target[revoking_key]()
}

function find(target = {}, prop = "", value = null, should_set = false) {
    if(!lookup.has_prop(target, prop))
        prop = lookup.pick_closest_match(prop, lookup.get_properties(target))

    if(should_set) return target[prop] = value
    else return target[prop]
}

const lookup = {
    ignorable_properties: Object.getOwnPropertyNames(Object.prototype),
    has_prop: (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop),
    pick_closest_match(word, options = [""]) {
        let highest = 0, best
        for (const key of options) {
            const dist = distance(word, key)
            if (dist > highest) {
                best = key
                highest = dist
            }
        }
        return best
    },
    get_properties(obj) {
        if(obj === null) return []
        const matches = []
        const keys = Object.getOwnPropertyNames(obj)
        const proto = Reflect.getPrototypeOf(obj)

        for(const prop of keys) 
            if(this.has_prop(obj, prop) && this.ignorable_properties.indexOf(prop) === -1) 
                matches.push(prop)

        return matches.concat(this.get_properties(proto))
    }
}

const handler = {
    apply(target, thisArg, args) {
        const result = target(...args)
        return (typeof result === 'object') ? new Proxy(result, handler) : result
    },
    get(target, prop) {
        let isRevocableProxy = false

        if(prop === revoking_key) {
            if(typeof target.revoke === 'function') {
                const insideTarget = target.proxy[revoking_key]()
                target.revoke()
                return () => insideTarget
            }
            return () => target
        }

        if (typeof target.revoke === 'function' && typeof target.proxy === 'object') {
            target = target.proxy[revoking_key]()
            isRevocableProxy = true
        }

        const found = find(target, prop)

        switch(typeof found) {
            case "object": 
                if(isRevocableProxy) 
                    return new Proxy(Proxy.revocable(found, handler), handler)
                else 
                    return new Proxy(found, handler)
            case "function": 
                if (isRevocableProxy) 
                    return new Proxy(Proxy.revocable(found.bind(target), handler), handler)
                else 
                    return new Proxy(found.bind(target), handler)
            default: return found
        }
    },
    set(target, prop, value) {
        let isRevocableProxy = (typeof target.revoke === 'function' && typeof target.proxy === 'object')

        if(isRevocableProxy)
            target = target.proxy.getTarget()

        const found = find(target, prop, value, true)
        
        if (typeof found === "object") return found
        
        if (isRevocableProxy) 
            return new Proxy(Proxy.revocable(found, handler), handler)
        else
            return new Proxy(found, handler)
    }
}

const revoking_key = Symbol()

class AutocorrectObject {
    constructor(target, revocable = false) {
        return revocable ?
            new Proxy(Proxy.revocable(target, handler), handler) :
            new Proxy(target, handler)
    }
    
    /**
     * Get the object it is autocorrecting. If this is a revocable AutocorrectObeject, it will also revoke the autocorrecting.
     * @returns {*} The object it autocorrected.
     */
    [revoking_key]() {
        if (typeof this.revoke === 'function') 
            this.revoke()
        
        return this[revoking_key]()
    }
}
