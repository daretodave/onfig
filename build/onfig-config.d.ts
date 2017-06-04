import { OnfigResolution } from "./onfig-resolution";
export interface OnfigConfig {
    root?: OnfigResolution<string>;
    precedence?: OnfigResolution<string[]>;
    environment?: OnfigResolution<string>;
}
