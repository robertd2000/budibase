"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigType = exports.isAIConfig = exports.isSCIMConfig = exports.isOIDCConfig = exports.isGoogleConfig = exports.isSMTPConfig = exports.isSettingsConfig = void 0;
const isSettingsConfig = (config) => config.type === ConfigType.SETTINGS;
exports.isSettingsConfig = isSettingsConfig;
const isSMTPConfig = (config) => config.type === ConfigType.SMTP;
exports.isSMTPConfig = isSMTPConfig;
const isGoogleConfig = (config) => config.type === ConfigType.GOOGLE;
exports.isGoogleConfig = isGoogleConfig;
const isOIDCConfig = (config) => config.type === ConfigType.OIDC;
exports.isOIDCConfig = isOIDCConfig;
const isSCIMConfig = (config) => config.type === ConfigType.SCIM;
exports.isSCIMConfig = isSCIMConfig;
const isAIConfig = (config) => config.type === ConfigType.AI;
exports.isAIConfig = isAIConfig;
var ConfigType;
(function (ConfigType) {
    ConfigType["SETTINGS"] = "settings";
    ConfigType["ACCOUNT"] = "account";
    ConfigType["SMTP"] = "smtp";
    ConfigType["GOOGLE"] = "google";
    ConfigType["OIDC"] = "oidc";
    ConfigType["OIDC_LOGOS"] = "logos_oidc";
    ConfigType["SCIM"] = "scim";
    ConfigType["AI"] = "ai";
})(ConfigType || (exports.ConfigType = ConfigType = {}));
