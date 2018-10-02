# Azure DevOps Azure Search Release Tools #

## Overview ##

This extension contains tasks to deploy JSON representations of Azure Search datasources, indexes, and indexers.
The goal is to be able to check in your Azure Search objects as JSON into source control and automatically deploy them if modified.
The deployment pipeline should detect if any changes to Azure Search objects occur at deployment and reset them.

Look at [overview.md](overview/md) for more information

Check out this extension at the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=mikaelsnavy.azdo-azure-search).

## How to Contribute ##

Please create an issue for any bug/feedback. If you would like to contribute to this extension, you could fork off this repo and submit a pull request.

Some documents that can help you, in this regard:

1. [How to write a task for VS Team Services Build/Release task](https://github.com/Microsoft/vso-agent-tasks#writing-tasks)
2. [How to create and publish an extension](https://www.visualstudio.com/en-us/integrate/extensions/publish/overview)
3. [Learn about installing npm](https://www.npmjs.com/package/npm)
4. [How to install tfx-cli tool](https://github.com/Microsoft/tfs-cli), required to create and publish extensions