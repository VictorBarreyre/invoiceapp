"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@heroku-cli/command");
const core_1 = require("@oclif/core");
const tsheredoc_1 = require("tsheredoc");
const setter_1 = require("../../../lib/pg/setter");
class ExplainDataConnectorDetails extends setter_1.PGSettingsCommand {
    constructor() {
        super(...arguments);
        this.settingKey = 'explain_data_connector_details';
    }
    convertValue(val) {
        return (0, setter_1.booleanConverter)(val);
    }
    explain(setting) {
        if (setting === null || setting === void 0 ? void 0 : setting.value) {
            return 'Data replication slot details will be logged.';
        }
        return 'Data replication slot details will no longer be logged.';
    }
}
exports.default = ExplainDataConnectorDetails;
ExplainDataConnectorDetails.description = (0, tsheredoc_1.default)(`
  displays stats on replication slots on your database, the default value is "off"
  `);
ExplainDataConnectorDetails.flags = {
    app: command_1.flags.app({ required: true }),
    remote: command_1.flags.remote(),
};
ExplainDataConnectorDetails.args = {
    database: core_1.Args.string(),
    value: core_1.Args.string(),
};
