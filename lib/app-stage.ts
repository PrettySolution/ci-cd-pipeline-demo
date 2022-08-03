import {Stage, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";

export class AppStage extends Stage {
  constructor(scope: Construct, stageName: string, props?: StageProps) {
    super(scope, stageName, props);

    const s3 = new Bucket(this, 'Bucket', {
    })

  }
}