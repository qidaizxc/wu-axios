"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mixinRequest(methods) {
    return function (target) {
        console.log(methods);
        console.log(target.prototype, '@#@#@');
    };
}
exports.mixinRequest = mixinRequest;
