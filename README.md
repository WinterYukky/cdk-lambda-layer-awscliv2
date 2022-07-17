# AWS Lambda Layer with AWS CLI v2

This module exports a single class called `AwsCliV2Layer` which is a `lambda.Layer` that bundles the AWS CLI v2.

Any Lambda Function that uses this layer doesn't need a Python 3.x runtime.
This Construct use Docker build so you must be installed Docker on your build machine.

Usage:

```ts
// AwsCliLayer bundles the AWS CLI v2 in a lambda layer
import { AwsCliV2Layer } from 'cdk-lambda-layer-awscliv2';

const bootstrap = new lambda.LayerVersion(this, 'Bootstrap', {
  code: Code.fromAsset(join(__dirname, 'runtime')),
});
new lambda.Function(this, 'ExampleFunc', {
  runtime: Runtime.PROVIDED_AL2,
  timeout: Duration.seconds(30),
  handler: 'index.handler',
  code: Code.fromAsset(join(__dirname, 'handler')),
  layers: [bootstrap, new AwsCliV2Layer(this, 'AwsCliV2')],
});
```

```sh
# handler/index.sh
function handler () {
  VERSION=`/opt/awscli/aws --version`
  echo "{\"Version\": \"$VERSION\"}"
}
```

```sh
# runtime/bootstrap
#!/bin/sh

set -euo pipefail

# Initialization - load function handler
source $LAMBDA_TASK_ROOT/"$(echo $_HANDLER | cut -d. -f1).sh"

# Processing
while true
do
  HEADERS="$(mktemp)"
  # Get an event. The HTTP request will block until one is received
  EVENT_DATA=$(curl -sS -LD "$HEADERS" -X GET "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/next")

  # Extract request ID by scraping response headers received above
  REQUEST_ID=$(grep -Fi Lambda-Runtime-Aws-Request-Id "$HEADERS" | tr -d '[:space:]' | cut -d: -f2)

  # Run the handler function from the script
  RESPONSE=$($(echo "$_HANDLER" | cut -d. -f2) "$EVENT_DATA")

  # Send the response
  curl -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2018-06-01/runtime/invocation/$REQUEST_ID/response"  -d "$RESPONSE"
done
```

The CLI will be installed under `/opt/awscli/aws`.
