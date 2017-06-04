"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onfig_provider_1 = require("./onfig-provider");
exports.OnfigProvider = onfig_provider_1.OnfigProvider;
const onfig_resolution_1 = require("./onfig-resolution");
exports.OnfigResolution = onfig_resolution_1.OnfigResolution;
const path = require("path");
const fs = require("fs");
class Onfig {
    static get(config) {
        const key = onfig_resolution_1.OnfigResolution.resolve(config);
        return Onfig.configurations.get(key);
    }
    static provide(config, configuration) {
        Onfig.configurations[config] = new onfig_provider_1.OnfigProvider(configuration);
        return this;
    }
    static env(environment) {
        Onfig.config.environment = environment;
        return this;
    }
    static configure(config) {
        if (config === null) {
            return Onfig;
        }
        if (config.hasOwnProperty("environment")) {
            Onfig.config.environment = config.environment;
        }
        if (config.hasOwnProperty("precedence")) {
            Onfig.config.precedence = config.precedence;
        }
        if (config.hasOwnProperty("root")) {
            Onfig.config.root = config.root;
        }
        return Onfig;
    }
    static extract(location) {
        return new Promise((resolve, reject) => {
            fs.access(location, fs.F_OK, err => {
                if (err) {
                    resolve({});
                    return;
                }
                fs.readFile(location, (err, contents) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    const JSONDocument = contents.toString();
                    try {
                        resolve(JSON.parse(JSONDocument));
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
        });
    }
    static resolve(key, location) {
        return new Promise((resolve, reject) => {
            Promise.all([
                Onfig.extract(location),
                Onfig.extract(path.join(location, '../', key, path.basename(location)))
            ]).then((approaches) => resolve(Object.assign({}, ...approaches)))
                .catch(error => reject(error));
        });
    }
    static _load(key) {
        return new Promise((resolve, reject) => {
            const main = require.main.filename;
            const root = onfig_resolution_1.OnfigResolution.resolve(Onfig.config.root) || "./config";
            const environment = onfig_resolution_1.OnfigResolution.resolve(Onfig.config.environment) || process.env.NODE_ENV || "development";
            const precedence = onfig_resolution_1.OnfigResolution.resolve(Onfig.config.precedence) || ["base", "%ENV%"];
            const locations = precedence.map(suffix => {
                suffix = suffix.replace(/%ENV%/g, environment);
                const name = `${key}${suffix ? `.${suffix}` : ''}.json`;
                return path.join(main, '../', root, name);
            });
            Promise
                .all(locations.map(location => Onfig.resolve(key, location)))
                .then((configurations) => {
                const configuration = Object.assign({}, ...configurations);
                const provider = new onfig_provider_1.OnfigProvider(configuration);
                Onfig.configurations.set(key, provider);
                resolve(provider);
            })
                .catch(reject);
        });
    }
    static load(...key) {
        if (key.length === 0) {
            return Promise.reject("No key provided");
        }
        return key.length === 1 ? Onfig._load(key[0]) : Promise.all(key.map(Onfig._load));
    }
}
Onfig.configurations = new Map();
Onfig.config = {
    root: './config',
    precedence: ["base", "%ENV%"],
    environment: () => process.env.NODE_ENV
};
exports.default = Onfig;
exports.Onfig = Onfig;
//# sourceMappingURL=onfig.js.map