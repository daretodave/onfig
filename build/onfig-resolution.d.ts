import { OnfigResolver } from "./onfig-resolver";
export declare type OnfigResolution<T> = OnfigResolver<T> | T;
export declare namespace OnfigResolution {
    function resolve<T>(resolution: OnfigResolution<T>): T;
}
