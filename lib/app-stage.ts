import {Stage, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AppStack} from "./app-stack";

export class AppStage extends Stage {
  constructor(scope: Construct, stageName: string, props?: StageProps) {
    super(scope, stageName, props);

    const appStack = new AppStack(this, 'AppStack', stageName)

  }
}