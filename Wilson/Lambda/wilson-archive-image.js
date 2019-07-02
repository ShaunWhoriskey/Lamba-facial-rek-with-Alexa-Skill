exports.handler = (event, context, callback) => {

    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    
    var srcBucket = "wilson-upload2";
    var filename = event.key;
    var alert = event.Alert;
    var name = event.Obj;
    console.log("Alert is "+alert);
    console.log(event.key,"filename");
    console.log(event.bucket,"bucket");
    //console.log(typeof name, "<<<filename");
    //console.log(filename, "<<<test filename");
    //console.log(name, "<<< The keymaster");
    //console.log("String Test: "+result.includes(".jpg"));
    //console.log("String Test2:"+result.indexOf("d"));
    //console.log("String Test3:"+result.indexOf("."));
    var uploadDate = new Date();
    var timestamp = uploadDate.getMinutes()+"-"+uploadDate.getSeconds();
    console.log(timestamp, "<<<<timestamp");

    
        
    var destBucket;

    var newFilename = '';
    
    // Determine subdirectory to move image
    if (alert == 'true'){
        var result = JSON.stringify(name);
        console.log(result, "<<<<result");
        let pos1 = result.indexOf("d");
        pos1++;
        pos1++
        let pos2 = result.indexOf(".");
        var keyname = result.substring(pos1,pos2);
        console.log("Keyname test:"+keyname);
        keyname = keyname+"-"+timestamp;
        console.log(keyname,"<<<<keyname and timestamp");
        destBucket = "wilson-person/images/verified";
        newFilename = keyname+".jpg";
        //newFilename = event.key.replace('upload/', 'images/verified/'+keyname);          // All Alerts
    }
    else if (alert == 'false'){
        destBucket = "wilson-person/images/unverified";
        let pos1 = filename.indexOf("/");
        pos1++;
        let pos2 = filename.indexOf(".");
        var keyname = filename.substring(pos1,pos2);
        console.log(keyname,"<<<<<keyname");
        newFilename = keyname+".jpg";
        console.log(newFilename,"<<<<new Filename");
        //newFilename = filename.replace('upload/', 'images/unverified/'+keyname+".jpg");  // False positives
        
        let UNVparams = {
        Bucket: "wilson-person/images/verified",
        CopySource: "wilson-person/images/verified/Nobody I recognise.jpg",
        Key: "Nobody I recognise-"+timestamp+".jpg"
       };
       
       s3.copyObject(UNVparams, function(err, data) {
         if (err){ console.log(err, err.stack); // an error occurred
         var errorMessage =  'Error in in [s3-archive-image].\r' + 
                                '   Error copying [' + filename + '] to [' + newFilename + '] in bucket ['+srcBucket+'].\r' +  
                                '   Function input ['+JSON.stringify(event, null, 2)+'].\r' +  
                                '   Error ['+err+'].';
              
            console.log(errorMessage, err);
            callback(errorMessage, null);
            }
       });
        
        
    }
    else {
        destBucket = "wilson-person/images/false-positives";
        let pos1 = filename.indexOf("/");
        pos1++;
        let pos2 = filename.indexOf(".");
        var keyname = filename.substring(pos1,pos2);
        console.log(keyname,"<<<<<keyname");
        newFilename = keyname+".jpg";
        console.log(newFilename,"<<<<new Filename");
        //newFilename = filename.replace('upload/', 'images/unverified/'+keyname+".jpg");  // False positives
    }
    
    console.log("test1");
    
    var newParams = {
        Bucket: destBucket,
        CopySource: srcBucket+'/'+ filename,
        Key: newFilename
    };
    
    var params = {
        Bucket: srcBucket, 
        Key: filename
       };
       console.log("test2");

       s3.copyObject(newParams, function(err, data) {
         if (err){ console.log(err, err.stack); // an error occurred
         var errorMessage =  'Error in in [s3-archive-image].\r' + 
                                '   Error copying [' + filename + '] to [' + newFilename + '] in bucket ['+srcBucket+'].\r' +  
                                '   Function input ['+JSON.stringify(event, null, 2)+'].\r' +  
                                '   Error ['+err+'].';
              
            console.log(errorMessage, err);
            callback(errorMessage, null);
            }


        if (data) {
          
        // ...followed by a delete   
        s3.deleteObject(params, function(err, data){
          if (err) {
            var errorMessage =  'Error in in [s3-archive-image].\r' + 
                                '   Error deleting [' + filename +'] from bucket ['+srcBucket+'].\r' + 
                                '   Function input ['+JSON.stringify(event, null, 2)+'].\r' +  
                                '   Error ['+err+'].';
              
            console.log(errorMessage, err);
            callback(errorMessage, null);
          } else {
            console.log('Successful archiving [' + newFilename + ']');
            callback(null, 'Successful archiving [' + newFilename + ']');
          }
        });
        
      }
       });
    
};