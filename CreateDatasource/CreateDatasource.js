"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("vsts-task-lib/task");
//npm install vsts-task-lib
const rm = require("typed-rest-client");
const jsonfile = require("jsonfile");
//import * as semver from 'semver';
const path = require("path");
// Function Taken from https://github.com/Microsoft/vsts-tasks/blob/master/Tasks/XcodeV5/xcodeutils.ts
// Same signature and behavior as utility-common/telemetry's emitTelemetry, minus the common vars.
// export function emitTelemetry(area: string, feature: string, taskSpecificTelemetry: { [key: string]: any; }): void {
//     try {
//         let agentVersion = tl.getVariable('Agent.Version');
//         if (semver.gte(agentVersion, '2.120.0')) {
//             console.log("##vso[telemetry.publish area=%s;feature=%s]%s",
//                 area,
//                 feature,
//                 JSON.stringify(taskSpecificTelemetry));
//         } else {
//             tl.debug(`Agent version is ${agentVersion}. Version 2.120.0 or higher is needed for telemetry.`);
//         }
//     } catch (err) {
//         tl.debug(`Unable to log telemetry. Err:( ${err} )`);
//     }
// }
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const telemetryData = {};
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            //--------------------------------------------------------------
            // Input handling
            //--------------------------------------------------------------
            let apiKey = tl.getInput('ApiKey', true);
            //tl.setVariable('ApiKey', apiKey, true);
            let searchServiceName = tl.getInput('SearchServiceName', true);
            telemetryData.searchServiceName = searchServiceName;
            //tl.setVariable('SearchServiceName', searchServiceName);
            let searchServiceApiVersion = tl.getInput('SearchServiceApiVersion', true);
            telemetryData.searchServiceApiVersion = searchServiceApiVersion;
            //tl.setVariable('SearchServiceApiVersion', searchServiceApiVersion);
            let datasourceJsonPath = tl.getPathInput('DatasourceJsonPath', true, true);
            telemetryData.datasourceJsonPath = datasourceJsonPath;
            //tl.setVariable('DatasourceJsonPath', datasourceJsonPath);
            let overwriteExistingDatasource = tl.getBoolInput('OverwriteExistingDatasource', true);
            telemetryData.overwriteExistingDatasource = overwriteExistingDatasource;
            //tl.setVariable('OverwriteExistingDatasource', overwriteExistingDatasource);
            //--------------------------------------------------------------
            // Get File Contents to find datasource name 📛
            //--------------------------------------------------------------
            let datasourceFileJson = jsonfile.readFileSync(datasourceJsonPath);
            let datasourceName = datasourceFileJson.name;
            //-------------------------------------------------------------
            // Does datasource exist?? Handle different cases 💣
            //-------------------------------------------------------------
            let rest = new rm.RestClient('azdo-azure-search', `https://${searchServiceName}.search.windows.net/`);
            rest.client.requestOptions.headers["api-key"] = apiKey;
            rest.client.requestOptions.headers["Content-Type"] = "application/json";
            let getres = yield rest.get(`/datasources/${datasourceName}?api-version=${searchServiceApiVersion}`);
            // If datasource found or it exists and we don't want to overwrite it
            if (getres.statusCode !== 404) {
                if (getres.statusCode === 200 && overwriteExistingDatasource) {
                    // Delete datasource if it exists
                    let delres = yield rest.del(`/datasources/${datasourceName}?api-version=${searchServiceApiVersion}`);
                    if (delres.statusCode !== 204) {
                        throw new Error(`Cannot delete ${datasourceName}. HTTP code: ${delres.statusCode}. HTTP response: ${delres.result}.`);
                    }
                }
                else if (getres.statusCode === 200) {
                    throw new Error(`Error connecting to ${searchServiceName} Azure Search service. HTTP code: ${getres.statusCode}. HTTP response: ${getres.result}.`);
                }
                else {
                    throw new Error(`Cannot create ${datasourceName} because it already exists.`);
                }
            }
            //-------------------------------------------------------------
            // Create datasource! 😃
            //-------------------------------------------------------------
            let createget = yield rest.create(`/datasources?api-version=${searchServiceApiVersion}`, datasourceFileJson);
            if (createget.statusCode !== 204) {
                throw new Error(`Cannot create ${datasourceName}. HTTP code: ${createget.statusCode}. HTTP response: ${createget.result}.`);
            }
            tl.setResult(tl.TaskResult.Succeeded, tl.loc('CreateDatasourceSuccess'));
        }
        catch (err) {
            tl.setResult(tl.TaskResult.Failed, err);
        }
        finally {
            // Publish telemetry
            //emitTelemetry('TaskHub', 'create-datasource', telemetryData);
        }
    });
}
run();
