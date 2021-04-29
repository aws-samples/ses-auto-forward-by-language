## Forwarding Emails Based on Content Language with Amazon Simple Email Service

Forwarding Emails Based on Content Language with Amazon Simple Email Service. Please refer to the accompanying AWS Blog post for architecture details.

## License Summary
This library is licensed under the MIT-0 License. See the LICENSE file.

## Setup process
This package requires AWS Serverless Application Model (AWS SAM) Command Line Interface (CLI) to deploy to your account. Instructions for installing and setting up SAM CLI can be found here: https://aws.amazon.com/serverless/sam/

## Prerequisites
To use Amazon SES for receiving email messages, you need to verify a domain that you own. Refer to the documentation to verify your domain with Amazon SES console. If you do not have a domain name, you can register one from Amazon Route 53.

Please refer to the accompanying AWS Blog post for details.

## Installing dependencies
Use npm install in the blog-email-forwarder directories to install any required packages prior to packaging and deploying this SAM application.

## Packaging and deployment
Firstly, we need a S3 bucket where we can upload our Lambda functions packaged as ZIP before we deploy anything - If you don't have a S3 bucket to store code artifacts then this is a good time to create one:
~~~
aws s3 mb s3://BUCKET_NAME
~~~
Next, run the following command to package our Lambda function to S3:
~~~
sam package \
    --template-file template.yaml \
    --output-template-file output_template.yaml \
    --s3-bucket REPLACE_THIS_WITH_YOUR_S3_BUCKET_NAME
~~~
Next, the following command will create a Cloudformation Stack and deploy your SAM resources.
~~~
sam deploy \
    --template-file output_template.yaml \
    --stack-name blogstack \
    --capabilities CAPABILITY_IAM
~~~    
See Serverless Application Model (SAM) HOWTO Guide for more details in how to get started.

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

