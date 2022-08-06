import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep} from "aws-cdk-lib/pipelines";
import {AppStage} from "./app-stage";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {HostedZoneAttributes} from "aws-cdk-lib/aws-route53";
import {LinuxArmBuildImage, LinuxBuildImage} from "aws-cdk-lib/aws-codebuild";

interface DemoPipelineProps extends StackProps {
  zoneAttrs: HostedZoneAttributes,
  githubBranch: string,
  isProduction?: boolean
}

export class DemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: DemoPipelineProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'pipeline', {
      pipelineName: 'demo-pipeline',
      codeBuildDefaults: {buildEnvironment: {buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_2_0}},
      // crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('PrettySolution/ci-cd-pipeline-demo', props.githubBranch),
        commands: ['uname -a', 'pwd', 'ls -la', 'ls ../ -la', 'npm ci', 'npm run build', `npx cdk synth ${this.stackName}`],
        additionalInputs: {
          '../ci-cd-fe-demo': CodePipelineSource.gitHub('PrettySolution/ci-cd-fe-demo', props.githubBranch, {
            trigger: GitHubTrigger.WEBHOOK
          })
        }
      })
    })

    pipeline.addStage(new AppStage(this, 'DeployApp', {  // Do not rename stageName
      zoneAttrs: props.zoneAttrs
    }))

  }
}
