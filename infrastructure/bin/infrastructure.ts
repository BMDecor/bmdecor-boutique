#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'BmDecorBoutiqueStack', {
  env: {
    account: '450284264313',
    region: 'eu-west-1',
  },
  description: 'BM Decoracion - Premium paint boutique infrastructure',
});