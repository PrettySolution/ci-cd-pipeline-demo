import {Stage, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {AppStack, IAppStackProps} from "./app-stack";
import {HostedZoneAttributes} from "aws-cdk-lib/aws-route53";

interface IAppStageProps extends StageProps {
  zoneAttrs: HostedZoneAttributes
}

export class AppStage extends Stage {
  constructor(scope: Construct, stageName: string, props: IAppStageProps) {
    super(scope, stageName, props);

    const appStack = new AppStack(this, 'AppStack', props)

  }
}