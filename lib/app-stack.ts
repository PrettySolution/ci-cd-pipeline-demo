import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {HostedZone, HostedZoneAttributes} from "aws-cdk-lib/aws-route53";
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from "aws-cdk-lib/aws-rds";
import {InstanceClass, InstanceSize, InstanceType, Port, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";

export interface IAppStackProps extends StackProps {
  zoneAttrs: HostedZoneAttributes
}

export class AppStack extends Stack {

  public vpcName: 'my-cortex'

  constructor(scope: Construct, id: string, props: IAppStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', props.zoneAttrs)

    const vpc = new Vpc(this, 'Vpc', {
      vpcName: this.vpcName,
      cidr: "10.0.0.0/16",
      natGateways: 1,
      subnetConfiguration: [
        {
          name: "public",
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24
        },
        {
          name: "private",
          subnetType: SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24
        }
      ],
    })

    const dbInstance = new DatabaseInstance(this, 'DatabaseInstance', {
      instanceIdentifier: 'cortex-pg',
      vpc,
      engine: DatabaseInstanceEngine.postgres({version: PostgresEngineVersion.VER_14_2}),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      credentials: Credentials.fromUsername('postgres', {secretName: `pg-secret-for-${props.stackName}`}),
      vpcSubnets: {subnetType: SubnetType.PUBLIC},
      allocatedStorage: 20,
      maxAllocatedStorage: 40,
      multiAz: false,
    })
    dbInstance.connections.allowFromAnyIpv4(Port.tcp(dbInstance.instanceEndpoint.port))


  }
}