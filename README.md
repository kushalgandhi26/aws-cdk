# Welcome to your CDK TypeScript project

This file contains setup for aws-cli as well as the deployment of the cdk.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Setup aws-cli
1. In your browser, download the macOS pkg file: https://awscli.amazonaws.com/AWSCLIV2.pkg
2. Run the following command `aws configure`
3. For access key id enter your id
4. For secret access key enter your key
5. For region enter corrosponding region
6. Then press enter for default output format.

## Deploy the cdk
1. Clone the repo
2. Run `npm install`
3. Run `npm run build`
4. Run `npm install -g aws-cdk`
5. Run `cdk bootstrap`
6. Run `cdk deploy ServerlessAppStack`

## Video tutorials
1. aws-cli setup https://www.youtube.com/watch?v=S7K5vwVobVc
