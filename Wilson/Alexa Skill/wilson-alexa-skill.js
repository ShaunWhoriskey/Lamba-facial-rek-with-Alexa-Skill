exports.handler = (event, context, callback) => {
    
    const aws = require('aws-sdk');
    const s3 = new aws.S3({ apiVersion: '2006-03-01' });
    const d = new Date();
    const today = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDay();
    
    var ct = Date.parse(d);
 
    var list = [];
    var count = 0;
    
    
    try {
        if (event.request.type === 'LaunchRequest') {
            callback(null, buildResponse('Hello... How can Wilson help you today'));
        } else if (event.request.type === 'IntentRequest') {
            const intentName = event.request.intent.name;

            if (intentName === 'whosthere') {
                
            
              s3.listObjects({
                Bucket: "wilson-person",
                Marker: "images/verified/",
                MaxKeys: 1000,
              }, function(err, data) {
                  if(err){
                    console.log(err);
                  }
                  else if (data.Contents) {
                    for (var i = 0; i < data.Contents.length; i++) {
                     var key = data.Contents[i].Key;    //See above code for the structure of data.Contents
                     var key_date = new Date(data.Contents[i].LastModified);
                     var kd = Date.parse(key_date);
                     
                     //console.log("kd is "+kd+"-"+typeof kd);
                     var key_today = key_date.getFullYear() + "-" + key_date.getMonth() + "-" + key_date.getDay();
                     
                     if(key_today == today){
                         if((ct-kd) < 50000){
                             //var new_date = key_date.getDate();
                            //console.log(new_date);
                            count++;
                         
                            if (key != null) {
                            list.push(key);
                            var pos = key.indexOf("-");
                            var name = key.substring(16,pos);
                            console.log("new name is "+ name);
                            callback(null, buildResponse(name+" is at the front door"));
                            
                            } else {
                            break;   // break the loop if end arrived
                            }
                             
                         }
                    }
                    else {
                        
                    }
                    }
                    if(count == 0){
                        console.log("Nobody is there");
                        callback(null, buildResponse("Sorry, i don't think there is anyone there"));
                    } 
         
                    console.log(list +"-"+typeof list);
                    console.log('Total - ', list.length);
                 }
               });
               
                
                
                
            } else {
                callback(null, buildResponse("Sorry, i don't understand"));
            }
        } else if (event.request.type === 'SessionEndedRequest') {
            callback(null, buildResponse('Session Ended'));
        }
    } catch (e) {
        context.fail(`Exception: ${e}`);
    }
};

function buildResponse(response) {
    return {
        version: '1.0',
        response: {
            outputSpeech: {
                type: 'PlainText',
                text: response,
            },
            shouldEndSession: true,
        },
        sessionAttributes: {},
    };
}
        

