import {OnfigConfig} from "./onfig-config";
import {OnfigProvider} from "./onfig-provider";
import {OnfigResolution} from "./onfig-resolution";

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

        return this.configurations.get(key);
    }

    public static provide(config: string, configuration: OnfigResolution<any>) {
        this.configurations[config] = new OnfigProvider(configuration);

        return this;
    }

    public static setEnv(environment: OnfigResolution<string>) {
        this.config.environment = environment;

        return this;
    }

    public static configure(config: OnfigConfig) {
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

    private static extract(location: string): Promise<object> {
        return new Promise(
            (resolve: (config: object) => any, reject: (reason: any) => any) => {
                fs.access(path, fs.F_OK, err => {
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

    private static _load(key: string): Promise<OnfigProvider> {
        return new Promise(
            (resolve: (provider: OnfigProvider) => any, reject: (reason: any) => any) => {

                const main: string = require.main.filename;
                const root: string = OnfigResolution.resolve(this.config.root) || "./config";
                const environment: string = OnfigResolution.resolve(this.config.environment) || process.env.NODE_ENV;
                const precedence: string[] = OnfigResolution.resolve(this.config.precedence) || ["base", "%ENV%"];

                const locations = precedence.map(suffix => {
                    suffix = suffix.replace(/%ENV%/g, environment);

                    const name = `${key}${suffix ? `.${suffix}` : ''}.json`;

                    return path.join(main, '../', root, name);
                });

                Promise
                    .all(locations.map(location => this.extract(location)))
                    .then((configurations: object[]) => {
                        const configuration = Object.assign({}, ...configurations);
                        const provider = new OnfigProvider(configuration);

                        this.configurations.set(key, provider);

                        resolve(provider);
                    })
                    .catch(reject);

            }
        );
    }

    public static load(...key: string[]): Promise<OnfigProvider[]> {
        return Promise.all<OnfigProvider>(key.map(Onfig._load));
    }

}