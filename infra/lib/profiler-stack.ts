import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface ProfilerStackProps extends cdk.StackProps {
  /** S3 bucket for storing profile results */
  profileResultsBucket: s3.IBucket;
}

/**
 * ProfilerStack: Creates the compute infrastructure for the Data Profiler.
 *
 * Resources:
 * - VPC with public subnets (Fargate tasks need internet access for Supabase/AWS APIs)
 * - ECS Fargate cluster
 * - Task definition placeholder (container added in Plan 01-02 when Docker image exists)
 * - Step Functions state machine for profiler orchestration
 * - IAM roles with appropriate permissions
 * - Security group for outbound HTTPS
 */
export class ProfilerStack extends cdk.Stack {
  /** ECS cluster for running profiler tasks */
  public readonly cluster: ecs.Cluster;
  /** Task execution role for ECS */
  public readonly taskExecutionRole: iam.Role;
  /** Task role for profiler permissions */
  public readonly taskRole: iam.Role;
  /** Security group for Fargate tasks */
  public readonly securityGroup: ec2.SecurityGroup;
  /** Step Functions state machine for orchestration */
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: ProfilerStackProps) {
    super(scope, id, props);

    // VPC with 2 public subnets for Fargate tasks
    // Public subnets because tasks need to reach Supabase (external) and AWS APIs
    const vpc = new ec2.Vpc(this, 'ProfilerVpc', {
      vpcName: 'profiler-vpc',
      maxAzs: 2,
      natGateways: 0, // No NAT for cost savings - using public subnets
      subnetConfiguration: [
        {
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // Security group allowing outbound HTTPS only
    this.securityGroup = new ec2.SecurityGroup(this, 'ProfilerSecurityGroup', {
      vpc,
      securityGroupName: 'profiler-sg',
      description: 'Security group for Data Profiler Fargate tasks',
      allowAllOutbound: false, // Explicit outbound rules
    });

    // Allow outbound HTTPS (443) for AWS APIs and Supabase
    this.securityGroup.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      'Allow outbound HTTPS'
    );

    // ECS Fargate cluster
    this.cluster = new ecs.Cluster(this, 'ProfilerCluster', {
      clusterName: 'profiler-cluster',
      vpc,
      containerInsights: true, // Enable CloudWatch Container Insights
    });

    // Task execution role - ECR pull, CloudWatch logs
    this.taskExecutionRole = new iam.Role(this, 'TaskExecutionRole', {
      roleName: 'profiler-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy'),
      ],
    });

    // Task role - S3, Secrets Manager, data sources access
    this.taskRole = new iam.Role(this, 'TaskRole', {
      roleName: 'profiler-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Grant task role access to profile results bucket
    props.profileResultsBucket.grantReadWrite(this.taskRole);

    // Grant Secrets Manager access for connection credentials
    this.taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'secretsmanager:GetSecretValue',
        'secretsmanager:DescribeSecret',
      ],
      resources: [`arn:aws:secretsmanager:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:secret:profiler/*`],
    }));

    // Grant access to data sources (Athena, Redshift, Glue)
    this.taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        // Athena
        'athena:StartQueryExecution',
        'athena:GetQueryExecution',
        'athena:GetQueryResults',
        'athena:StopQueryExecution',
        // Glue (for Iceberg catalog)
        'glue:GetTable',
        'glue:GetTables',
        'glue:GetDatabase',
        'glue:GetDatabases',
        'glue:GetPartitions',
        // Redshift Data API
        'redshift-data:ExecuteStatement',
        'redshift-data:DescribeStatement',
        'redshift-data:GetStatementResult',
        'redshift-data:ListStatements',
        // Redshift Serverless
        'redshift-serverless:GetCredentials',
      ],
      resources: ['*'], // Data source access is broad - refine based on specific resources
    }));

    // Grant S3 read access for data sources and Athena results
    this.taskRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:GetObject',
        's3:ListBucket',
        's3:GetBucketLocation',
      ],
      resources: ['*'], // Needs access to customer data buckets - refine in production
    }));

    // Task definition placeholder (2 vCPU, 8GB RAM)
    // Container will be added in Plan 01-02 when Docker image is built
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'ProfilerTaskDef', {
      family: 'profiler-task',
      cpu: 2048, // 2 vCPU
      memoryLimitMiB: 8192, // 8GB RAM
      executionRole: this.taskExecutionRole,
      taskRole: this.taskRole,
    });

    // CloudWatch log group for profiler tasks
    const logGroup = new logs.LogGroup(this, 'ProfilerLogGroup', {
      logGroupName: '/ecs/profiler',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Step Functions state machine for profiler orchestration
    // States: ValidateInput -> RunProfiler -> StoreResults -> Success (or HandleError -> Fail)

    // Define states
    const validateInput = new sfn.Choice(this, 'ValidateInput')
      .when(
        sfn.Condition.isPresent('$.sourceType'),
        new sfn.Pass(this, 'InputValid', { resultPath: sfn.JsonPath.DISCARD })
      )
      .otherwise(
        new sfn.Fail(this, 'FailInvalidInput', {
          error: 'InvalidInput',
          cause: 'sourceType is required in the input',
        })
      );

    // Placeholder for RunProfiler - actual ECS task integration added in 01-02
    const runProfiler = new sfn.Pass(this, 'RunProfiler', {
      comment: 'Placeholder for ECS RunTask - container added in Plan 01-02',
      resultPath: '$.profileResult',
      result: sfn.Result.fromObject({ status: 'PENDING_CONTAINER' }),
    });

    // Placeholder for StoreResults - actual Lambda integration added in later plan
    const storeResults = new sfn.Pass(this, 'StoreResults', {
      comment: 'Placeholder for storing results to Supabase - implemented in later plan',
    });

    const success = new sfn.Succeed(this, 'Success');

    // Error handling
    const handleError = new sfn.Pass(this, 'HandleError', {
      comment: 'Error handling - SNS notification added in later plan',
      resultPath: '$.errorHandled',
    });

    const fail = new sfn.Fail(this, 'FailState', {
      error: 'ProfilerFailed',
      cause: 'Profiler execution failed after retries',
    });

    // Chain InputValid -> RunProfiler -> StoreResults -> Success
    const inputValidState = validateInput.afterwards().next(runProfiler);
    runProfiler.next(storeResults);
    storeResults.next(success);
    handleError.next(fail);

    // Note: Catch/retry for RunProfiler will be added in 01-02 when ECS task is configured

    this.stateMachine = new sfn.StateMachine(this, 'ProfilerStateMachine', {
      stateMachineName: 'profiler-workflow',
      definitionBody: sfn.DefinitionBody.fromChainable(validateInput),
      timeout: cdk.Duration.minutes(30),
      tracingEnabled: true,
      logs: {
        destination: new logs.LogGroup(this, 'StateMachineLogGroup', {
          logGroupName: '/aws/stepfunctions/profiler-workflow',
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        level: sfn.LogLevel.ALL,
      },
    });

    // Outputs
    new cdk.CfnOutput(this, 'ClusterArn', {
      value: this.cluster.clusterArn,
      exportName: 'ProfilerClusterArn',
      description: 'ARN of the ECS cluster',
    });

    new cdk.CfnOutput(this, 'TaskDefinitionArn', {
      value: taskDefinition.taskDefinitionArn,
      exportName: 'ProfilerTaskDefinitionArn',
      description: 'ARN of the Fargate task definition',
    });

    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: this.stateMachine.stateMachineArn,
      exportName: 'ProfilerStateMachineArn',
      description: 'ARN of the Step Functions state machine',
    });

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      exportName: 'ProfilerVpcId',
      description: 'VPC ID for the profiler infrastructure',
    });
  }
}
