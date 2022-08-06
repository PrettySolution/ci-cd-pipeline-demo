import {Stack, StackProps, StageProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {ARecord, HostedZone, HostedZoneAttributes, RecordTarget} from "aws-cdk-lib/aws-route53";

export interface IAppStackProps extends StackProps {
  zoneAttrs: HostedZoneAttributes
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: IAppStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', props.zoneAttrs)
    new ARecord(this, 'ARecord', {
      zone,
      target: RecordTarget.fromIpAddresses('4.4.4.4'),


    })
  }
}