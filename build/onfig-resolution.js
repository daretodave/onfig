"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OnfigResolution;
(function (OnfigResolution) {
    function resolve(resolution) {
        if (typeof resolution === 'function') {
            return resolution();
        }
        return resolution;
    }
    OnfigResolution.resolve = resolve;
})(OnfigResolution = exports.OnfigResolution || (exports.OnfigResolution = {}));
//# sourceMappingURL=onfig-resolution.js.map