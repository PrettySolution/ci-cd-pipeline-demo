#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DemoPipelineStack } from '../lib/demo-pipeline-stack';

const app = new cdk.App();
new DemoPipelineStack(app, 'DemoPipelineStack', {

  // UAT
  env: { account: '160810069147', region: 'eu-central-1' },

});