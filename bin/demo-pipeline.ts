#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {DemoPipelineStack} from '../lib/demo-pipeline-stack';
import {AppStack} from "../lib/app-stack";

const app = new cdk.App();
new DemoPipelineStack(app, 'demo-pipeline-uat', {
  stackName: 'demo-pipeline-uat',
  env: {account: '160810069147', region: 'eu-central-1'},
  githubBranch: 'main',
  zoneAttrs: {
    zoneName: 'my-main.cortexanalytics.com', hostedZoneId: 'Z102226221NBDSVY10FX4'
  }
});

new DemoPipelineStack(app, 'demo-pipeline-dev', {
  stackName: 'demo-pipeline-dev',
  env: {account: '249111255442', region: 'eu-central-1'},
  githubBranch: 'develop',
  zoneAttrs: {
    zoneName: 'my-dev.cortexanalytics.com', hostedZoneId: 'Z06566711FBDPKEAMQUS1'
  }
});

new AppStack(app, 'app-stack-test', {
  stackName: 'app-stack-test',
  env: {account: '327109020978', region: 'eu-central-1'},
  zoneAttrs: {
    zoneName: 'my-test.cortexanalytics.com', hostedZoneId: 'Z05445673F0L6T9BAVQM5'
  }
})
