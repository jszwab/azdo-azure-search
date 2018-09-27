import ma = require('vsts-task-lib/mock-answer');
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '..', 'create-datasource.js');
let testFilePath = path.join(__dirname, 'create-datasource-testfile.json');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

// set out task input
tr.setInput('ApiKey', '<NotARealApiKey>');
tr.setInput('SearchServiceName', 'testSearchService');
tr.setInput('SearchServiceApiVersion', '2017-11-11-Preview');
tr.setInput('DatasourceJsonPath', testFilePath);
tr.setInput('OverwriteExistingDatasource', 'true');

//#TODO - tests
// provide answers for task mock
let a: ma.TaskLibAnswers = <ma.TaskLibAnswers>{
};

tr.setAnswers(a);
tr.run();