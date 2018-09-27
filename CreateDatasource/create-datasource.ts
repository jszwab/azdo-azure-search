import path = require('path');
import tl = require('vsts-task-lib/task');
import * as semver from 'semver';
import * as rm from 'typed-rest-client';
import { ToolRunner } from 'vsts-task-lib/toolrunner';
import jsonfile = require('jsonfile');
import { readFile } from 'fs';

// Function Taken from https://github.com/Microsoft/vsts-tasks/blob/master/Tasks/XcodeV5/xcodeutils.ts
// Same signature and behavior as utility-common/telemetry's emitTelemetry, minus the common vars.
export function emitTelemetry(area: string, feature: string, taskSpecificTelemetry: { [key: string]: any; }): void {
    try {
        let agentVersion = tl.getVariable('Agent.Version');
        if (semver.gte(agentVersion, '2.120.0')) {
            console.log("##vso[telemetry.publish area=%s;feature=%s]%s",
                area,
                feature,
                JSON.stringify(taskSpecificTelemetry));
        } else {
            tl.debug(`Agent version is ${agentVersion}. Version 2.120.0 or higher is needed for telemetry.`);
        }
    } catch (err) {
        tl.debug(`Unable to log telemetry. Err:( ${err} )`);
    }
}

async function run() {
    const telemetryData: { [key: string]: any; } = {};

    try
    {

        tl.setResourcePath(path.join(__dirname, 'task.json'));

        //--------------------------------------------------------------
        // Input handling
        //--------------------------------------------------------------
        let apiKey: string = tl.getInput('ApiKey', true);
        //tl.setVariable('ApiKey', apiKey, true);

        let searchServiceName: string = tl.getInput('SearchServiceName', true);
        telemetryData.searchServiceName = searchServiceName;
        //tl.setVariable('SearchServiceName', searchServiceName);

        let searchServiceApiVersion: string = tl.getInput('SearchServiceApiVersion', true);
        telemetryData.searchServiceApiVersion = searchServiceApiVersion;
        //tl.setVariable('SearchServiceApiVersion', searchServiceApiVersion);

        let datasourceJsonPath: string = tl.getPathInput('DatasourceJsonPath', true, true);
        telemetryData.datasourceJsonPath = datasourceJsonPath;
        //tl.setVariable('DatasourceJsonPath', datasourceJsonPath);

        let overwriteExistingDatasource: boolean = tl.getBoolInput('OverwriteExistingDatasource', true);
        telemetryData.overwriteExistingDatasource = overwriteExistingDatasource;
        //tl.setVariable('OverwriteExistingDatasource', overwriteExistingDatasource);

        //--------------------------------------------------------------
        // Get File Contents to find datasource name 📛
        //--------------------------------------------------------------
        let datasourceFileJson = jsonfile.readFileSync(datasourceJsonPath)
        let datasourceName = datasourceFileJson.name;

        //-------------------------------------------------------------
        // Does datasource exist?? Handle different cases 💣
        //-------------------------------------------------------------
        let rest: rm.RestClient = new rm.RestClient('azdo-azure-search', `https://${searchServiceName}.search.windows.net/`)
        let getres: rm.IRestResponse<object> = await rest.get<object>(`/datasources/${datasourceName}?api-version=${searchServiceApiVersion}`);

        // If datasource found or it exists and we don't want to overwrite it
        if (getres.statusCode !== 404)
        {
            if (getres.statusCode === 200 && overwriteExistingDatasource)
            {
                // Delete datasource if it exists
                let delres: rm.IRestResponse<object> = await rest.del<object>(`/datasources/${datasourceName}?api-version=${searchServiceApiVersion}`);
                if (delres.statusCode !== 204)
                {
                    throw new Error(`Cannot delete ${datasourceName}. HTTP code: ${delres.statusCode}. HTTP response: ${delres.result}.`);
                }
            }
            else if (getres.statusCode === 200)
            {
                throw new Error(`Error connecting to ${searchServiceName} Azure Search service. HTTP code: ${getres.statusCode}. HTTP response: ${getres.result}.`);
            }
            else 
            {
                throw new Error(`Cannot create ${datasourceName} because it already exists.`);
            }
        }

        //-------------------------------------------------------------
        // Create datasource! 😃
        //-------------------------------------------------------------
        let createget: rm.IRestResponse<object> = await rest.create<object>(`/datasources?api-version=${searchServiceApiVersion}`, datasourceFileJson);
        if (createget.statusCode !== 204)
        {
            throw new Error(`Cannot create ${datasourceName}. HTTP code: ${createget.statusCode}. HTTP response: ${createget.result}.`);
        }

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('CreateDatasourceSuccess'));
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
    finally {
        // Publish telemetry
        emitTelemetry('TaskHub', 'create-datasource', telemetryData);
    }


}

run();
