"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const setter_1 = require("../../../../lib/pg/setter");
const tsheredoc_1 = require("tsheredoc");
class LogFormat extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'auto_explain.log_format';
    }
    explain(setting) {
        return `Auto explain log output will log in ${setting.value} format.`;
    }
    convertValue(val) {
        return val;
    }
}
exports.default = LogFormat;
LogFormat.description = (0, tsheredoc_1.default)(`
    selects the EXPLAIN output format to be used
    The allowed values are text, xml, json, and yaml. The default is text.
  `);
LogFormat.args = {
    database: core_1.Args.string(),
    value: core_1.Args.string({ options: ['text', 'json', 'yaml', 'xml'] }),
};
