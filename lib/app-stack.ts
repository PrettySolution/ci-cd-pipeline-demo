import {Stack, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, stageName: string, props?: StageProps) {
    super(scope, id, props);

    const s3 = new Bucket(this, 'Bucket', {
    })
  }
}