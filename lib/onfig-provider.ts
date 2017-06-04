import {OnfigResolution} from "./onfig-resolution";

export class OnfigProvider {

    private override:object;
    private removed:Map<string, boolean>;

    constructor(
        private source:OnfigResolution<object> = {}) {

        this.override = {};
        this.removed = new Map<string, boolean>();
    }

    public keys():string[] {
        const keys:string[] = [];

        keys.push(...Object.keys(this.override));

        const source:object = OnfigResolution.resolve(this.source);
        if (source !== null && typeof source !== 'undefined') {
            keys.push(...Object.keys(source));
        }

        return keys;
    }

    public set(key:string, value:any):OnfigProvider {

        this.removed.delete(key);

        this.override[key] = value;

        return this;
    }

    public has(key:string):boolean {
        if (key === null || typeof key === 'undefined' || this.removed.has(key)) {
            return false;
        }
        if(this.override.hasOwnProperty(key)) {
            return true;
        }

        const source:object = OnfigResolution.resolve(this.source);
        if(source === null
            || typeof source === 'undefined'
            || !source.hasOwnProperty(key)) {
            return false;
        }

        return source.hasOwnProperty(key);
    }

    public remove(key:string):OnfigProvider {
        delete this.override[key];

        this.removed.set(key, true);

        return this;
    }

    public get<T>(key:string, ifNull:T = null):T {
        if (key === null || typeof key === 'undefined' || this.removed.has(key)) {
            return ifNull;
        }
        if(this.override.hasOwnProperty(key)) {
            return this.override[key];
        }

        const source:object = OnfigResolution.resolve(this.source);

        if(source === null
            || typeof source === 'undefined'
            || !source.hasOwnProperty(key)) {
            return ifNull;
        }

        return source[key];
    }

}