exports.handler = (event, context, callback) => {
    
    var AWS = require('aws-sdk');

    var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});
    
    var bucket = event.bucket; 
    var filename = event.key;
    //var match = false; 
    var test;
    console.log(event.key,"filename");
    console.log(event.bucket,"bucket");
    //var name = "test";
    var name;

    var params = {
        Image: {
            S3Object: {Bucket: bucket, Name: filename }},
    };


    var request = rekognition.detectFaces(params, function(err, data) {
        //let found = false;
        console.log(data);
        console.log(typeof data, "<<<Data test");
        console.log(data.FaceDetails.length);
        if(err){
            var errorMessage =  'Error in [rekognition-image-assessment].\r' + 
                                '   Function input ['+JSON.stringify(event, null, 2)+'].\r' +  
                                '   Error ['+err+'].';
            // Log error
            console.log(errorMessage, err.stack); 
            callback(errorMessage, null);
        }
        else if (data.FaceDetails.length == 0){
            console.log("It made it this far");
            //callback(null, Object.assign({"Alert": "false"}, event));
            callback(null, Object.assign({"Alert": "null", "oldKey": [filename]}, event));
        }
        else{
            var s3 = new AWS.S3({apiVersion: '2006-03-01'});

            var s3params = {
                Bucket: "wilson-person",
                Delimiter: '/',
                Prefix: 'images/verified/'
            };

            s3.listObjects(s3params,  function(err, data){
                if(err) {
                    console.log("Error");
                    callback(err, null);
                }
                else{
                    try {
                     data.Contents.forEach( function(obj,index){
                        console.log(obj.Key,"<<<file path");
                        //let kname = obj.key;
                        console.log(obj, "Find bucket");
                        //name = this.obj.key;
                        //console.log(name,"<<<<name test");
                        
                        this.obj;
                        
                        //callback(null, Object.assign(data));
                        Object.assign(data);

                        var faceParams = {
                            SimilarityThreshold: 90, 
                            SourceImage: {
                                S3Object: {
                                    Bucket: bucket, 
                                    Name: filename
                                }
                            }, 
                            TargetImage: {
                                S3Object: {
                                    Bucket: "wilson-person", 
                                    Name: obj.Key
                                }
                            }
                        };
                         rekognition.compareFaces(faceParams, function(err, result) {
                             if(result === null){
                                 console.log(result,"<<<null result");
                             }
                             
                            else if (err) {
                                console.log(err, err.stack);
                                console.log(result, "<<<result");
                                return callback('could not compare faces');
                            }
                           else {
                               
                               
                               
                                
                                console.log(JSON.stringify(result));
                                console.log(result.FaceMatches.length,"<<<< Face Matches Length");
                                
                                
                                if (result !== null && result.FaceMatches !== null && result.FaceMatches.length > 0) { 
                                    var item = result.FaceMatches[0];
                                    console.log(JSON.stringify(item));
                                    if (item !== null && item.Face !== null && item.Face.Confidence > 90) {
                                        callback(null, Object.assign({"Alert": "true", "Obj": [obj]}, event));
                                        //console.log(match, "<<<This is match");
                                        //return match = true;
                                    } 
                                    else{
                                        
                                        //callback(null, Object.assign({"Alert": "false", "Name" : this.name}, event));
                                        callback(null, Object.assign({"Alert": "false", "Obj": [obj]}, event));
                                    }
                                }
                                else{
                                    console.log("No face matches here");
                                    callback(null, Object.assign({"Alert": "false", "Obj": [obj]}, event));
                                }
                            }
                            
                        });
                        
                        
                    });
                } catch (e) {
                                    return console.error(e);
                                }
                    
                }
    });
        }

    });
    console.log(test,"<<<This is a test");
};