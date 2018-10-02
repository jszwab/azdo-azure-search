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
const path = require("path");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tl.setResourcePath(path.join(__dirname, 'task.json'));
            //--------------------------------------------------------------
            // Input handling
            //--------------------------------------------------------------
            let apiKey = tl.getInput('ApiKey', true);
            let searchServiceName = tl.getInput('SearchServiceName', true);
            let searchServiceApiVersion = tl.getInput('SearchServiceApiVersion', true);
            let searchServiceObject = tl.getInput('SearchServiceObject', true);
            let JsonPath = tl.getPathInput('JsonPath', true, true);
            let overwriteExistingObject = tl.getBoolInput('OverwriteExistingObject', true);
            //--------------------------------------------------------------
            // Get File Contents to find datasource name 📛
            //--------------------------------------------------------------
            let jsonData = jsonfile.readFileSync(JsonPath);
            let objectName = jsonData.name;
            //-------------------------------------------------------------
            // Setup our client and headers
            //-------------------------------------------------------------
            let requestOptions = {};
            requestOptions.additionalHeaders = {
                "api-key": apiKey
            };
            let rest = new rm.RestClient('azdo-azure-search', `https://${searchServiceName}.search.windows.net/`);
            let apiBaseAction = "";
            if (searchServiceObject === "Datasource") {
                apiBaseAction = "datasources";
            }
            else if (searchServiceObject === "Index") {
                apiBaseAction = "indexes";
            }
            else if (searchServiceObject === "Indexer") {
                apiBaseAction = "indexers";
            }
            //-------------------------------------------------------------
            // Does object exist?? Handle different cases 💣
            //-------------------------------------------------------------
            let getres = yield rest.get(`/${apiBaseAction}/${objectName}?api-version=${searchServiceApiVersion}`, requestOptions);
            // If object found or it exists
            if (getres.statusCode !== 404) {
                // #TODO - make this compare more forgiving
                // If the object is the same do nothing
                if (getres.result === jsonData) {
                    tl.debug("Object currently in Azure Search same as input. Not modifying.");
                    tl.setResult(tl.TaskResult.Succeeded, tl.loc('Create'));
                    return;
                }
                // If the object is there and chilling (⛸) and we want to overwrite it, delete!
                if (getres.statusCode === 200 && overwriteExistingObject) {
                    // Delete object if it exists
                    let delres = yield rest.del(`/${apiBaseAction}/${objectName}?api-version=${searchServiceApiVersion}`, requestOptions);
                    // If we can't delete, we have a problem 😢
                    if (delres.statusCode !== 204) {
                        throw new Error(`Cannot delete ${objectName}. HTTP code: ${delres.statusCode}. HTTP response: ${delres.result}.`);
                    }
                }
                else if (getres.statusCode === 200) {
                    throw new Error(`Error connecting to ${searchServiceName} Azure Search service. HTTP code: ${getres.statusCode}. HTTP response: ${getres.result}.`);
                }
                else {
                    throw new Error(`Cannot create ${objectName} because it already exists.`);
                }
            }
            //-------------------------------------------------------------
            // Create object! 😃
            //-------------------------------------------------------------
            let createget = yield rest.create(`/${apiBaseAction}?api-version=${searchServiceApiVersion}`, jsonData, requestOptions);
            if (createget.statusCode !== 201) {
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
    });
}
run();
