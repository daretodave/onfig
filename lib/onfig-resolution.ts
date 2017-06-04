import {OnfigResolver} from "./onfig-resolver";

export type OnfigResolution<T> = OnfigResolver<T> | T;

export namespace OnfigResolution {

    export function resolve<T>(resolution:OnfigResolution<T>) {
        if (typeof resolution === 'function') {
            return resolution();
        }
        return resolution;
    }

}