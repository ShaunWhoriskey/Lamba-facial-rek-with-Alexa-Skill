exports.handler = (event, context) => {
   
    //
    //  Triggered by upload of new images to S3 bucket wilson-upload2/uploads
    //  Terminates after AWS Step fucntion is called and S3 object is passed to function
    //
   
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3({apiVersion: '2006-03-01', region: process.env.AWS_REGION});
   
    // Derive the bucket and filename from the event
    var bucket = event.Records[0].s3.bucket.name;
    var key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    var params = {
        Bucket: bucket,
        Key: key,
    };
 
    // Get the image (validate that an object is there)
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            var message = 'Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.';
            console.log(message);
        } else {
            console.log('New file uploaded:', {bucket: bucket, key : key});
            
            //Parameters for triggering step function
            var params = {
                stateMachineArn: "arn:aws:states:eu-west-1:186086203177:stateMachine:wilson-step-function", 
                input: '{"bucket":"'+bucket+'", "key":"'+key+'"}'
            };
            
            //Create the step function
            var stepfunctions = new AWS.StepFunctions();
     
            //Parameters for triggering step function
            stepfunctions.startExecution(params, function(err, data) {
                if (err) console.log(err, err.stack); // an error occurred
                else     console.log(data);           // successful response
            });
        }
    });
};