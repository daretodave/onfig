import {OnfigConfig} from "./onfig-config";
import {OnfigProvider} from "./onfig-provider";
import {OnfigResolution} from "./onfig-resolution";
import {OnfigResolver} from "./onfig-resolver";

const path = require("path");
const fs = require("fs");

declare let process: any;

export default class Onfig {

    private static configurations: Map<string, OnfigProvider> = new Map<string, OnfigProvider>();

    public static config: OnfigConfig = {
        root: './config',
        precedence: ["base", "%ENV%"],
        environment: () => process.env.NODE_ENV
    };

    public static get(config: OnfigResolution<string>): OnfigProvider {
        const key = OnfigResolution.resolve(config);

        return Onfig.configurations.get(key);
    }

    public static provide(config: string, configuration: OnfigResolution<any>) {
        Onfig.configurations[config] = new OnfigProvider(configuration);

        return this;
    }

    public static env(environment: OnfigResolution<string>) {
        Onfig.config.environment = environment;

        return this;
    }

    public static configure(config: OnfigConfig) {
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

    private static extract(location: string): Promise<object> {
        return new Promise(
            (resolve: (config: object) => any, reject: (reason: any) => any) => {
                fs.access(location, fs.F_OK, err => {
                    if (err) {
                        resolve({});
                        return;
                    }

                    fs.readFile(location, (err, contents: Buffer) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const JSONDocument = contents.toString();

                        try {
                            resolve(JSON.parse(JSONDocument));
                        } catch (err) {
                            reject(err);
                        }
                    });
                });
            }
        );
    }

    private static resolve(key: string, location: string): Promise<OnfigProvider> {
        return new Promise(
            (resolve: (provider: OnfigProvider) => any, reject: (reason: any) => any) => {
                Promise.all([
                    Onfig.extract(location),
                    Onfig.extract(path.join(location, '../', key, path.basename(location)))
                ]).then((approaches: object[]) => resolve(Object.assign({}, ...approaches)))
                    .catch(error => reject(error));
            }
        );
    }

    private static _load(key: string): Promise<OnfigProvider> {
        return new Promise(
            (resolve: (provider: OnfigProvider) => any, reject: (reason: any) => any) => {

                const main: string = require.main.filename;
                const root: string = OnfigResolution.resolve(Onfig.config.root) || "./config";
                const environment: string = OnfigResolution.resolve(Onfig.config.environment) || process.env.NODE_ENV || "development";
                const precedence: string[] = OnfigResolution.resolve(Onfig.config.precedence) || ["base", "%ENV%"];

                const locations = precedence.map(suffix => {
                    suffix = suffix.replace(/%ENV%/g, environment);

                    const name = `${key}${suffix ? `.${suffix}` : ''}.json`;

                    return path.join(main, '../', root, name);
                });

                Promise
                    .all(locations.map(location => Onfig.resolve(key, location)))
                    .then((configurations: object[]) => {
                        const configuration = Object.assign({}, ...configurations);
                        const provider = new OnfigProvider(configuration);

                        Onfig.configurations.set(key, provider);

                        resolve(provider);
                    })
                    .catch(reject);

            }
        );
    }

    public static load(...key: string[]): Promise<OnfigProvider[]|OnfigProvider> {
        if (key.length === 0) {
           return Promise.reject("No key provided");
        }

        return key.length === 1 ? Onfig._load(key[0]) : Promise.all<OnfigProvider>(key.map(Onfig._load));
    }


}

export {Onfig, OnfigProvider, OnfigResolution, OnfigResolver, OnfigConfig};
