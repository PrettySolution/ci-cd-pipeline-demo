import {CfnOutput, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {HostedZone, HostedZoneAttributes} from "aws-cdk-lib/aws-route53";
import {Credentials, DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from "aws-cdk-lib/aws-rds";
import {InstanceClass, InstanceSize, InstanceType, Port, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";

export interface IAppStackProps extends StackProps {
  zoneAttrs: HostedZoneAttributes
}

export class AppStack extends Stack {

  public readonly vpc: Vpc
  public readonly dbInstance: DatabaseInstance

  constructor(scope: Construct, id: string, props: IAppStackProps) {
    super(scope, id, props);

    const zone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', props.zoneAttrs)

    this.vpc = new Vpc(this, 'Vpc', {
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

    this.dbInstance = new DatabaseInstance(this, 'DatabaseInstance', {
      instanceIdentifier: 'cortex-pg',
      vpc: this.vpc,
      engine: DatabaseInstanceEngine.postgres({version: PostgresEngineVersion.VER_14_2}),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      credentials: Credentials.fromUsername('postgres', {secretName: 'pg-secret-cortex'}),
      vpcSubnets: {subnetType: SubnetType.PUBLIC},
      allocatedStorage: 20,
      maxAllocatedStorage: 40,
      multiAz: false,
    })
    this.dbInstance.connections.allowFromAnyIpv4(Port.tcp(this.dbInstance.instanceEndpoint.port))

    new CfnOutput(this, 'pgSecretName', {value: this.dbInstance.secret?.secretName || ''})

  }
}