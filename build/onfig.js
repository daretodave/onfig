"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const onfig_provider_1 = require("./onfig-provider");
const onfig_resolution_1 = require("./onfig-resolution");
const path = require("path");
const fs = require("fs");
class Onfig {
    static get(config) {
        const key = onfig_resolution_1.OnfigResolution.resolve(config);
        return this.configurations.get(key);
    }
    static provide(config, configuration) {
        this.configurations[config] = new onfig_provider_1.OnfigProvider(configuration);
        return this;
    }
    static setEnv(environment) {
        this.config.environment = environment;
        return this;
    }
    static configure(config) {
        if (config === null) {
            return this;
        }
        if (config.hasOwnProperty("environment")) {
            this.config.environment = config.environment;
        }
        if (config.hasOwnProperty("precedence")) {
            this.config.precedence = config.precedence;
        }
        if (config.hasOwnProperty("root")) {
            this.config.root = config.root;
        }
        return this;
    }
    static extract(location) {
        return new Promise((resolve, reject) => {
            fs.access(path, fs.F_OK, err => {
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
    static _load(key) {
        return new Promise((resolve, reject) => {
            const main = require.main.filename;
            const root = onfig_resolution_1.OnfigResolution.resolve(this.config.root) || "./config";
            const environment = onfig_resolution_1.OnfigResolution.resolve(this.config.environment) || process.env.NODE_ENV;
            const precedence = onfig_resolution_1.OnfigResolution.resolve(this.config.precedence) || ["base", "%ENV%"];
            const locations = precedence.map(suffix => {
                suffix = suffix.replace(/%ENV%/g, environment);
                const name = `${key}${suffix ? `.${suffix}` : ''}.json`;
                return path.join(main, '../', root, name);
            });
            Promise
                .all(locations.map(location => this.extract(location)))
                .then((configurations) => {
                const configuration = Object.assign({}, ...configurations);
                const provider = new onfig_provider_1.OnfigProvider(configuration);
                this.configurations.set(key, provider);
                resolve(provider);
            })
                .catch(reject);
        });
    }
    static load(...key) {
        return Promise.all(key.map(Onfig._load));
    }
}
Onfig.configurations = new Map();
Onfig.config = {
    root: './config',
    precedence: ["base", "%ENV%"],
    environment: () => process.env.NODE_ENV
};
exports.default = Onfig;
//# sourceMappingURL=onfig.js.map