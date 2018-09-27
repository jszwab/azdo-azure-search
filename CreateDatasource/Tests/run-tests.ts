// npm install mocha --save-dev
// npm install typings --global
// typings install dt~mocha --save --global

import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'vsts-task-lib/mock-test';

describe('Azure Search Create Datasource Tests', function () {
    before(() => {

    });

    after(() => {

    });

    it ('json file correctly reads AZ Search datasource', function() {
        let tp = path.join(__dirname, 'test-reading-json-datasource.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
    })
});