import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {AppStage} from "./app-stage";
import {GitHubTrigger} from "aws-cdk-lib/aws-codepipeline-actions";

export class DemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'pipeline', {
      pipelineName: 'demo-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('PrettySolution/ci-cd-pipeline-demo', 'main'),
        commands: ['ls -la', 'npm ci', 'npm run build', 'npx cdk synth'],
        additionalInputs: {
          './angular': CodePipelineSource.gitHub('PrettySolution/ci-cd-fe-demo', 'main', {
            trigger: GitHubTrigger.WEBHOOK
          })
        }
      })
    })

    pipeline.addStage(new AppStage(this, 'test', {}))
  }
}
