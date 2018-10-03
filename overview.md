# Create Azure Search Objects #

Use Azure Search Release Tasks to to help deploy Azure Search objects in your release pipelines. This enables definition and deployment of search objects in code.
Azure Search datasources, indexes, and indexers cannot be deployed via ARM templates so this will work in the meantime. 😄

## Quick steps to get started ##

1. Create a new Azure DevOps or TFS Release pipeline.
2. Setup an artifact which contains the JSON definition files you want to deploy.
3. Add a "Create Azure Search Object" task to your release pipeline.
4. Add in your Azure Search service name and API key so Azure DevOps can connect to your Azure Search service.
5. Choose your API Version or leave the default (newest version).
6. Choose your object type to deploy.
7. Lastly, choose your JSON file from your artifact to deploy.

## Known issue(s) ##

- Error reporting for things like invalid API key haven't been refined.

## Learn More ##

The [source](https://github.com/mikaelsnavy/azdo-azure-search) to this extension is available. Feel free to take, fork, and extend.

[View Notices](https://github.com/mikaelsnavy/azdo-azure-search/blob/master/ThirdPartyNotices.txt) for third party software included in this extension.

## Minimum supported environments ##

- Azure DevOps
- TFS 2017 & 2018

## Feedback ##

- Add a review below.
- Send me an [email](mailto://mikaelsnavy@gmail.com)!