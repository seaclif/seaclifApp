

fs = Npm.require('fs');
exec = Npm.require('child_process').exec;

runCommand = function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);

    if (error !== null) {
        console.log('exec error: ' + error);
    }
}
var imgName;

Meteor.startup(function () {
    process.env.MAIL_URL = 'smtp://austen.schultz%40gmail.com:futbol2me@smtp.gmail.com:465';
    //console.log(Object.keys(Meteor.server.method_handlers).sort());
    var col = spectroCompDB.find().fetch();
    for (var c in col){
        spectroCompDB.update({_id: col[c]._id}, {$set: {connectionStatus: 'disconnected'}});
    }

    Meteor.methods({
        'hello': function () {
            console.log("hello");
            return "hello";
        }
    });
});

Meteor.methods({
    isLoggedIn: function (userID) {
        console.log("here i am", userID, userDB.findOne({_id: userID}));
        return userDB.findOne({_id: userID})
    },

    writeBarcodeToFile: function (dataString, fileName, folderPath) {
        var fut = new Future();
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            result = {};

        if (matches.length !== 3)
            return new Error('Invalid input string');

        result.type = matches[1];
        result.data = new Buffer(matches[2], 'base64');

        fs.mkdir(folderPath, function () {
            fs.writeFile(folderPath + '/' + fileName, result.data, function (err) {
                if (err) {
                    return console.log(err);
                }
                else {
                    console.log("The barcode: " + fileName + " was saved!");
                    fut['return']("The barcode: " + fileName + " was saved!");

                }
            });
        });

        return fut.wait();
    }
})

writeToFile = function writeToFile(data, fileName, folderPath, callback) {
    fs.mkdir(folderPath, function () {
        fs.writeFile(folderPath + '/' + fileName, data, function (err) {
            if (err) {
                return console.log(err);
            }
            else {
                console.log("The file: " + fileName + " was saved!");
                if (typeof callback !== 'undefined') {
                    callback();
                };
            }
        });
    });
};

appendToFile = function(data, fileName, folderPath, callback) {
    fs.mkdir(folderPath, function () {
        fs.appendFile(folderPath + '/' + fileName, data, function (err) {
            if (err) {
                return console.log(err);
            }
            else {
                console.log("The file: " + fileName + " was appended!");
                if (typeof callback !== 'undefined') {
                    callback();
                };
            }
        });
    });
};

getFolders = function getFolders(folders, drive) {
    //console.log(folders.length);

    var dirs = [];

    if(folders.length <1){
        return dirs;
    }
    for (index = 0, index <= folders.length; ++index;) {
        if (index == folders.length) {
            return dirs;
        }
        else {
            folderPath = drive + '/' + folders[index];
            if (fs.statSync(folderPath).isDirectory()) {
                //console.log('Folder:', folders[index]);
                dirs.push({name: folders[index], number: index});
            }
        }
    }

};


Meteor.methods({

    'folders': function (drive) {
        var dirs = [];
        //return fs.readdirSync(drive);
        return getFolders(fs.readdirSync(drive), drive);
    },


    sendEmail: function (userEmail, text) {

        //process.env.MAIL_URL = 'smtp://aschulz:Novatek4i@newvistas.com:587/';

        //check([userDB.findOne({_id: userID}).email, 'novatekfoamet@gmail.com', subject, text], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        //this.unblock();
        //console.log(userID, userDB.findOne({_id: userID}).email);

        Email.send({
            to: userEmail,
            from: 'austen.schultz@gmail.com',
            subject: text,
            text: 'Test'
        });
    },
    
    getEmailAddresses: function (numberOfBarcodes) {
        var qUserDB = userDB.find({}, {fields:{userNumber:1, email:1}, sort:{email:1}}).fetch();
        var usedAccount = new Array();
        
        for(var q = 0; q<qUserDB.length; q++){
            if(barcodes.find({user: qUserDB[q].userNumber}).count() >= numberOfBarcodes){
                usedAccount.push({email: qUserDB[q].email, user:qUserDB[q].userNumber, _id: qUserDB[q]._id})
            }
        }

        return _.uniq(usedAccount.map(
            function (x) {
                return x;
            }),
            true);
    },

    getEmailAddressesDos: function (date) {
        var dateHere = moment(date);

        var barcodesList = barcodes.find({dateTime:{$gte: dateHere._d}}, {fields:{user:1}, sort:{user:1}}).fetch();
        var usedAccount = new Array();

        return _.uniq(barcodesList.map(
            function (x) {
                return x;
            }),
            true);
/*
        for(var q = 0; q<barcodesList.length; q++){
            if(barcodes.find({user: qUserDB[q].userNumber}).count() >= numberOfBarcodes){
                usedAccount.push({email: qUserDB[q].email, user:qUserDB[q].userNumber, _id: qUserDB[q]._id})
            }
        }*/


    }

});
