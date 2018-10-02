import tl = require('vsts-task-lib/task');
//npm install vsts-task-lib

import rm = require('typed-rest-client');
import jsonfile = require('jsonfile');
import path = require('path');

async function run() {
    
    try
    {
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        //--------------------------------------------------------------
        // Input handling
        //--------------------------------------------------------------
        let apiKey: string = tl.getInput('ApiKey', true);
        let searchServiceName: string = tl.getInput('SearchServiceName', true);
        let searchServiceApiVersion: string = tl.getInput('SearchServiceApiVersion', true);
        let searchServiceObject: string = tl.getInput('SearchServiceObject', true);
        let JsonPath: string = tl.getPathInput('JsonPath', true, true);
        let overwriteExistingObject: boolean = tl.getBoolInput('OverwriteExistingObject', true);

        //--------------------------------------------------------------
        // Get File Contents to find datasource name 📛
        //--------------------------------------------------------------
        let jsonData = jsonfile.readFileSync(JsonPath);
        let objectName = jsonData.name;

        //-------------------------------------------------------------
        // Setup our client and headers
        //-------------------------------------------------------------
        let requestOptions: rm.IRequestOptions = <rm.IRequestOptions>{};
        requestOptions.additionalHeaders = {
            "api-key": apiKey
        }
        let rest: rm.RestClient = new rm.RestClient('azdo-azure-search', `https://${searchServiceName}.search.windows.net/`);
        let apiBaseAction : string = "";
        if (searchServiceObject === "Datasource")
        {
            apiBaseAction = "datasources";
        }
        else if (searchServiceObject === "Index")
        {
            apiBaseAction = "indexes";
        }
        else if (searchServiceObject === "Indexer")
        {
            apiBaseAction = "indexers";
        }


        //-------------------------------------------------------------
        // Does object exist?? Handle different cases 💣
        //-------------------------------------------------------------
        let getres: rm.IRestResponse<string> = await rest.get<string>(`/${apiBaseAction}/${objectName}?api-version=${searchServiceApiVersion}`, requestOptions);

        // If object found or it exists
        if (getres.statusCode !== 404)
        {
            // #TODO - make this compare more forgiving
            // If the object is the same do nothing
            if (getres.result === jsonData) {
                tl.debug("Object currently in Azure Search same as input. Not modifying.");
                tl.setResult(tl.TaskResult.Succeeded, tl.loc('Create'));
                return;
            }

            // If the object is there and chilling (⛸) and we want to overwrite it, delete!
            if (getres.statusCode === 200 && overwriteExistingObject)
            {
                // Delete object if it exists
                let delres: rm.IRestResponse<object> = await rest.del<object>(`/${apiBaseAction}/${objectName}?api-version=${searchServiceApiVersion}`, requestOptions);
                
                // If we can't delete, we have a problem 😢
                if (delres.statusCode !== 204)
                {
                    throw new Error(`Cannot delete ${objectName}. HTTP code: ${delres.statusCode}. HTTP response: ${delres.result}.`);
                }
            }
            // Else you don't want us to overwrite but it there?? ❌
            else if (getres.statusCode === 200)
            {
                throw new Error(`Error connecting to ${searchServiceName} Azure Search service. HTTP code: ${getres.statusCode}. HTTP response: ${getres.result}.`);
            }
            // IDK wtf happened... 😢
            else 
            {
                throw new Error(`Cannot create ${objectName} because it already exists.`);
            }
        }

        //-------------------------------------------------------------
        // Create object! 😃
        //-------------------------------------------------------------
        let createget: rm.IRestResponse<object> = await rest.create<object>(`/${apiBaseAction}?api-version=${searchServiceApiVersion}`, jsonData, requestOptions);
        if (createget.statusCode !== 201)
        {
            throw new Error(`Cannot create ${objectName}. HTTP code: ${createget.statusCode}. HTTP response: ${createget.result}.`);
        }

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('Create'));
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
    finally {
        // #TODO - Publish telemetry
    }


}

run();
