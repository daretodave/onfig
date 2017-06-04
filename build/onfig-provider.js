"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onfig_resolution_1 = require("./onfig-resolution");
class OnfigProvider {
    constructor(source = {}) {
        this.source = source;
        this.override = {};
        this.removed = new Map();
    }
    keys() {
        const keys = [];
        keys.push(...Object.keys(this.override));
        const source = onfig_resolution_1.OnfigResolution.resolve(this.source);
        if (source !== null && typeof source !== 'undefined') {
            keys.push(...Object.keys(source));
        }
        return keys;
    }
    set(key, value) {
        this.removed.delete(key);
        this.override[key] = value;
        return this;
    }
    has(key) {
        if (key === null || typeof key === 'undefined' || this.removed.has(key)) {
            return false;
        }
        if (this.override.hasOwnProperty(key)) {
            return true;
        }
        const source = onfig_resolution_1.OnfigResolution.resolve(this.source);
        if (source === null
            || typeof source === 'undefined'
            || !source.hasOwnProperty(key)) {
            return false;
        }
        return source.hasOwnProperty(key);
    }
    remove(key) {
        delete this.override[key];
        this.removed.set(key, true);
        return this;
    }
    get(key, ifNull = null) {
        if (key === null || typeof key === 'undefined' || this.removed.has(key)) {
            return ifNull;
        }
        if (this.override.hasOwnProperty(key)) {
            return this.override[key];
        }
        const source = onfig_resolution_1.OnfigResolution.resolve(this.source);
        if (source === null
            || typeof source === 'undefined'
            || !source.hasOwnProperty(key)) {
            return ifNull;
        }
        return source[key];
    }
}
exports.OnfigProvider = OnfigProvider;
//# sourceMappingURL=onfig-provider.js.map