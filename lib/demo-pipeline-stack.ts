import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodePipeline, CodePipelineSource, ShellStep} from "aws-cdk-lib/pipelines";
import {AppStage} from "./app-stage";

export class DemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'pipeline', {
      pipelineName: 'demo-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('PrettySolution/ci-cd-pipeline-demo', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth', 'll'],
        additionalInputs: {
          '../angular': CodePipelineSource.gitHub('PrettySolution/ci-cd-fe-demo', 'main')
        }
      })
    })

    pipeline.addStage(new AppStage(this, 'test'))
  }
}
