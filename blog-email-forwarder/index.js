// dependencies
const AWS = require('aws-sdk');
const util = require('util');
const simpleParser = require('mailparser').simpleParser;
// get reference to S3 client
const s3 = new AWS.S3();
const ses = new AWS.SES({apiVersion: '2010-12-01'});
const comprehend = new AWS.Comprehend();
const docClient = new AWS.DynamoDB.DocumentClient();
// Set the region 
AWS.config.update({region: 'us-east-1'});

exports.lambdaHandler = async (event, context) => {
    try {
        // log the event
        const object=event.Records[0].s3.object.key;
        const bucket=event.Records[0].s3.bucket.name;
        const file = await s3
            .getObject({ Bucket: bucket, Key: object})
            .promise();
        const parsed = await simpleParser(file.Body);
        let destination_email=process.env.CATCHALL_EMAIL_ADDRESS;
        const text_to_evaluate=parsed.text;
        //find the entity from comprehend.
        var params = {
          Text: text_to_evaluate
        };
        var result=await detectDominantLanguage(params);
        const language=result.Languages[0].LanguageCode;

         //lookup language code from DynamoDB, if found, update destination_email's value
        result= await lookupLanguage(language);
        if(result){
          destination_email=result.destination;
        }
        //ready to send. construct the parts of the email message.
        // Create sendEmail params 
        params = {
          Destination: { 
            ToAddresses: [destination_email]
          },
          Message: {
            Body: {
              Html: {
               Charset: "UTF-8",
               Data: parsed.html
              },
              Text: {
               Charset: "UTF-8",
               Data: parsed.text
              }
             },
             Subject: {
              Charset: 'UTF-8',
              Data: parsed.subject
             }
            },
          Source: process.env.SENDER_EMAIL_ADDRESS, 
          ReplyToAddresses: [
             parsed.from.value[0].address
          ],
        };
        //send the email
        // Create the promise and SES service object
        var message = await sendEmail(params);
        console.log(message);

    } catch (err) {
        console.log(err);
        return err;
    }
    return;
};
async function lookupLanguage(lang){
  try {
      var params = {
        TableName : 'language-lookup',
        Key: {
          language: lang
        }
      };
        const data = await docClient.get(params).promise();
        return data.Item;
  } catch (err) {
      console.log("Failure", err.message)
      throw err;
  }
}

async function detectKeyPhrases (params) {
    return new Promise ((resolve,reject) => {
        comprehend.detectKeyPhrases(params, function(err, data) {
                      // If something goes wrong, print an error message.
                      if(err) {
                        console.log(err.message);
                        reject(err);
                      } else {
                        resolve(data);
                      }
        });
 
    });
}
async function detectDominantLanguage (params) {
    return new Promise ((resolve,reject) => {
        comprehend.detectDominantLanguage(params, function(err, data) {
                      // If something goes wrong, print an error message.
                      if(err) {
                        console.log(err.message);
                        reject(err);
                      } else {
                        resolve(data);
                      }
        });
 
    });
}
async function sendEmail (params) {
    return new Promise ((resolve,reject) => {
        ses.sendEmail(params, function(err, data) {
                      // If something goes wrong, print an error message.
                      if(err) {
                        console.log(err.message);
                        reject(err);
                      } else {
                        resolve(data); //.messageid
                      }
        });
 
    });
}