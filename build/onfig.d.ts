import { OnfigConfig } from "./onfig-config";
import { OnfigProvider } from "./onfig-provider";
import { OnfigResolution } from "./onfig-resolution";
import { OnfigResolver } from "./onfig-resolver";
export default class Onfig {
    private static configurations;
    static config: OnfigConfig;
    static get(config: OnfigResolution<string>): OnfigProvider;
    static provide(config: string, configuration: OnfigResolution<any>): typeof Onfig;
    static env(environment: OnfigResolution<string>): typeof Onfig;
    static configure(config: OnfigConfig): typeof Onfig;
    private static extract(location);
    private static resolve(key, location);
    private static _load(key);
    static load(...key: string[]): Promise<OnfigProvider[] | OnfigProvider>;
}
export { Onfig, OnfigProvider, OnfigResolution, OnfigResolver, OnfigConfig };
