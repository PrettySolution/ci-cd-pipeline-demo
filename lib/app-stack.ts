import {CfnOutput, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {HostedZone, HostedZoneAttributes} from "aws-cdk-lib/aws-route53";
import {
  Credentials,
  DatabaseInstance,
  DatabaseInstanceEngine,
  DatabaseSecret,
  PostgresEngineVersion
} from "aws-cdk-lib/aws-rds";
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc
} from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import {
  Cluster,
  ContainerImage,
  CpuArchitecture,
  FargateService,
  FargateTaskDefinition, LogDriver,
  OperatingSystemFamily, Protocol
} from "aws-cdk-lib/aws-ecs";
import {DnsValidatedCertificate} from "aws-cdk-lib/aws-certificatemanager";
import {LogGroup, RetentionDays} from "aws-cdk-lib/aws-logs";
import {ApplicationLoadBalancer} from "aws-cdk-lib/aws-elasticloadbalancingv2";

export interface IAppStackProps extends StackProps {
  zoneAttrs: HostedZoneAttributes
}

export class AppStack extends Stack {

  // public readonly vpc: Vpc
  // public readonly dbInstance: DatabaseInstance

  constructor(scope: Construct, id: string, props: IAppStackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', props.zoneAttrs)

    const vpc = new Vpc(this, 'Vpc', {
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

    const pgSecret = new DatabaseSecret(this, 'DatabaseSecret', {
      username: 'postgres',
      secretName: 'pgSecretCortex',  // do not rename secretName
    });

    const dbInstance = new DatabaseInstance(this, 'DatabaseInstance', {
      instanceIdentifier: 'cortex-pg',
      vpc,
      engine: DatabaseInstanceEngine.postgres({version: PostgresEngineVersion.VER_14_2}),
      instanceType: InstanceType.of(InstanceClass.BURSTABLE3, InstanceSize.MICRO),
      credentials: Credentials.fromSecret(pgSecret),
      vpcSubnets: {subnetType: SubnetType.PUBLIC},
      allocatedStorage: 20,
      maxAllocatedStorage: 40,
      multiAz: false,
    })
    dbInstance.connections.allowFromAnyIpv4(Port.tcp(dbInstance.instanceEndpoint.port))

    const cert = new DnsValidatedCertificate(this, 'my-cert', {
      hostedZone,
      domainName: hostedZone.zoneName,
      subjectAlternativeNames: [`*.${hostedZone.zoneName}`]
    })

    // ################## Allow ALL GS ######################
    const allowAllSG = new SecurityGroup(this, 'sg', {
      vpc,
      allowAllOutbound: true
    })
    allowAllSG.addIngressRule(Peer.anyIpv4(), Port.allTraffic(), 'allow all')

    // ################## Cluster 1 ######################
    const cluster = new Cluster(this, 'cluster', {
      clusterName: 'cortex',
      vpc
    })


    // ################## Angular FE ######################
    const angularTaskDefinition = new FargateTaskDefinition(this, 'angular-task-definition', {
      family: 'angular',
      cpu: 256,
      memoryLimitMiB: 512,
      runtimePlatform: {
        cpuArchitecture: CpuArchitecture.ARM64,
        operatingSystemFamily: OperatingSystemFamily.LINUX
      }
    })

    angularTaskDefinition.addContainer('angular-container', {
      image: ContainerImage.fromAsset(path.join(__dirname,'..', '..', 'ci-cd-fe-demo')),
      portMappings: [
        {containerPort: 80, hostPort: 80, protocol: Protocol.TCP}
      ],
      logging: LogDriver.awsLogs({
        streamPrefix: 'angular',
        logGroup: new LogGroup(this, 'angular-log-group', {
          logGroupName: '/ecs-fargate/angular',
          retention: RetentionDays.ONE_MONTH,
          removalPolicy: RemovalPolicy.DESTROY
        })
      })
    })

    const angularService = new FargateService(this, 'angular-service', {
      // serviceName: 'angular',
      cluster,
      taskDefinition: angularTaskDefinition,
      desiredCount: 1,
      securityGroups: [allowAllSG],
      // deploymentController: {type: DeploymentControllerType.CODE_DEPLOY}
    })

    const angularScaling = angularService.autoScaleTaskCount({maxCapacity: 3, minCapacity: 1})
    angularScaling.scaleOnCpuUtilization('angularCpuScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    })
    angularScaling.scaleOnMemoryUtilization('angularMemoryScaling', {
      targetUtilizationPercent: 50,
      scaleInCooldown: Duration.seconds(60),
      scaleOutCooldown: Duration.seconds(60)
    })


    // ################## ALB ######################
    const lb = new ApplicationLoadBalancer(this, 'lb', {
      loadBalancerName: "cortex",
      vpc,
      internetFacing: true
    })
    lb.addRedirect()  // redirect http to https

    const httpsListener = lb.addListener('https-listener', {
      port: 443,
      certificates: [cert]
    })
    httpsListener.addTargets('angular', {
      // priority: default,
      // targetGroupName: 'angular',
      port: 80,
      targets: [angularService],
      healthCheck: {
        path: '/',
        interval: Duration.seconds(30), // default 30
        timeout: Duration.seconds(5), // default 5
        unhealthyThresholdCount: 2, // default 2
        healthyThresholdCount: 5,  // default 5
        healthyHttpCodes: '200'  // default '200'
      },
    })

    new CfnOutput(this, 'pgSecretName', {value: pgSecret.secretName})

  }
}