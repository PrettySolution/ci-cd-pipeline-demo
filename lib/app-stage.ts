import {Stage, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AppStack, IAppStageProps} from "./app-stack";

export class AppStage extends Stage {
  constructor(scope: Construct, stageName: string, props: IAppStageProps) {
    super(scope, stageName, props);

    const appStack = new AppStack(this, 'AppStack', stageName, props)

  }
}