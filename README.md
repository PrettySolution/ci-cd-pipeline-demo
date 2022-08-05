# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

### The Scenario
I’m using AWS CDK to develop and deploy infrastructure and apps into pre-prod and production environments. Specifically, there is:

A Dev account (Account number: 111111111111), where development code is deployed. Developers have (almost) full access to the account and can deploy apps.
A UAT (Staging) account (222222222222) — a production-like environment used for business acceptance testing. The infra team manages the environment, developers have limited access for troubleshooting and testing.
A Prod account (333333333333), for production deployment, obviously. Developers can view logs, and not much else.
A Tools (Shared Services) account (444444444444), where CodePipeline will be used to build and deploy into Dev, UAT and Prod. Developers have limited access for troubleshooting and testing, and can view but not manage pipelines.

#### Tools account itself:
cdk bootstrap 444444444444/ap-southeast-1 --no-bootstrap-customer-key --cloudformation-execution-policies 'arn:aws:iam::aws:policy/AdministratorAccess'

#### And all the other accounts and regions (account 111111111111 as an example):
cdk bootstrap 111111111111/ap-southeast-1 --no-bootstrap-customer-key --cloudformation-execution-policies 'arn:aws:iam::aws:policy/AdministratorAccess' --trust 444444444444 --trust-for-lookup 444444444444
Obviously replace the account numbers and region with your own.
Caution: once you have done this, anyone who has permission to deploy CDK in your Tools account can use the same credentials to deploy to any of the trusted accounts. This is handy in dev and personal accounts, but maybe not what you want in production.