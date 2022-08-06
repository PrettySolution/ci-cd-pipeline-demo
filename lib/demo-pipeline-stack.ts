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

    const BEInput = CodePipelineSource.gitHub('PrettySolution/ci-cd-be-demo', props.githubBranch, {
      trigger: GitHubTrigger.WEBHOOK
    })

    const pipeline = new CodePipeline(this, 'pipeline', {
      pipelineName: 'demo-pipeline',
      // crossAccountKeys: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('PrettySolution/ci-cd-pipeline-demo', props.githubBranch),
        commands: ['uname -a', 'pwd', 'ls -la', 'ls ../ -la', 'npm ci', 'npm run build', `npx cdk synth ${this.stackName}`],
        additionalInputs: {
          '../ci-cd-fe-demo': CodePipelineSource.gitHub('PrettySolution/ci-cd-fe-demo', props.githubBranch, {
            trigger: GitHubTrigger.WEBHOOK
          }),
          '../ci-cd-be-demo': BEInput
        }
      })
    })

    const deploy = pipeline.addStage(new AppStage(this, 'DeployApp', {  // Do not rename stageName
      zoneAttrs: props.zoneAttrs
    }))
    deploy.addPre(new ShellStep('RunMigration', {
      input: BEInput,
      commands: ['uname -a', 'pwd', 'ls -la', 'ls ../ -la']
    }))

  }
}
