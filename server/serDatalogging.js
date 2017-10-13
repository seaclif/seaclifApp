Fiber = Npm.require('fibers');
Future = Npm.require( 'fibers/future' );

Meteor.methods({

    appendThisDataToFile : function(data, fileName, folderPath, id) {
        this.unblock();

        if(typeof Kadira !== 'undefined') {
            defaultFolder = '/mnt/hgfs/Urinos/';
        }
        else{
            defaultFolder = '/Users/austenschulz/Desktop/';
        }

        if(folderPath.indexOf(defaultFolder) > -1){
            
            var fut = new Future();
            var dataWithCommas = "";

            for (var e = 0; e < data.length; e++) {
                if (typeof data[e].timestamp !== 'undefined' && typeof data[e].data !== 'undefined') {
                    try {
                        dataWithCommas += data[e].timestamp + "," + data[e].data.split(" ").join("").split(":{").join(",").split("{").join("").split("}").join(",").split(":").join(",") + '\r\n';
                    }
                    catch (err) {
                        console.log('this is an error from appendThisDataToFile', err)
                    }

                }
            }

            fs.mkdir(folderPath, function () {
                fs.appendFile(folderPath + '/' + fileName, dataWithCommas, function (err) {
                    if (err) {
                        console.log('this is an error from appendThisDataToFile mkdir', err, new Date());
                        fut['return']({appended: false});
                    }
                    else {
                        //console.log("The file: " + fileName + " was appended!");
                        fut['return']({appended: true, _id: id});
                    }
                });
            });

            return fut.wait();
        }

        console.log('Did not write file', fileName, folderPath, id, defaultFolder)
        return {appended: false};
    },

    uploadData : function(data, fileName, folderPath, id){
        var fut = new Future();
        serialportData.upsert({_id:id}, {$set:{data:data}});
        fut['return']({appended: true, _id: id});

        return fut.wait();
    }
});