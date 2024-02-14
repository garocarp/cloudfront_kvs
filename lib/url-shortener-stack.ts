import { Stack, App, StackProps, CfnOutput } from "aws-cdk-lib";
import {
  Distribution,
  FunctionEventType,
  ViewerProtocolPolicy,
  OriginAccessIdentity,
  CachePolicy,
  AllowedMethods,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { join } from "path";
import { FunctionWithStore } from "./function-with-store";

const RESOURCES_PATH_PREFIX = join(__dirname, "../resources/");

export class UrlShortenerStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    //OAI
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      `origin-access-identity`,
      {}
    );

    //Origin S3 Bucket
    const s3Bucket = new Bucket(this, "bucket", {
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    s3Bucket.grantRead(originAccessIdentity);

    const viewerRequest = new FunctionWithStore(this, "viewer-request", {
      entryPath: RESOURCES_PATH_PREFIX + "/index.js",
      keyValueStoreImportSourcePath: RESOURCES_PATH_PREFIX + "/redirects.json",
    });

    const defaultBehavior = {
      origin: new S3Origin(s3Bucket),
      functionAssociations: [
        {
          function: viewerRequest,
          eventType: FunctionEventType.VIEWER_REQUEST,
        },
      ],
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: CachePolicy.CACHING_DISABLED,
      allowedMethods: AllowedMethods.ALLOW_ALL,
    };

    const distribution = new Distribution(this, "distribution", {
      defaultBehavior,
      comment: "KVS Test",
    });

    new CfnOutput(this, "distribution-domain-name", {
      description: "CloudFront Distribution URL",
      value: "https://" + distribution.domainName,
    });
    new CfnOutput(this, "keyValueStoreArn", {
      description: "keyValueStoreArn",
      value: viewerRequest.getKeyValueStoreArn(),
    });
  }
}
