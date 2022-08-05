#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DemoPipelineStack } from '../lib/demo-pipeline-stack';

const app = new cdk.App();
new DemoPipelineStack(app, 'demo-pipeline-uat', {
  stackName: 'demo-pipeline-uat',
  env: { account: '160810069147', region: 'eu-central-1' },
  githubBranch: 'main',
  zoneAttrs: {
    zoneName: 'my-main.cortexanalytics.com', hostedZoneId: 'Z102226221NBDSVY10FX4'
  }
});

new DemoPipelineStack(app, 'demo-pipeline-dev', {
  stackName:'demo-pipeline-dev',
  env: { account: '249111255442', region: 'eu-central-1' },
  githubBranch: 'develop',
  zoneAttrs: {
    zoneName: 'my-dev.cortexanalytics.com', hostedZoneId: 'Z06566711FBDPKEAMQUS1'
  }
});
