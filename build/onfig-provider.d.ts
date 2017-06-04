import { OnfigResolution } from "./onfig-resolution";
export declare class OnfigProvider {
    private source;
    private override;
    private removed;
    constructor(source?: OnfigResolution<object>);
    keys(): string[];
    set(key: string, value: any): OnfigProvider;
    has(key: string): boolean;
    remove(key: string): OnfigProvider;
    get<T>(key: string, ifNull?: T): T;
}
