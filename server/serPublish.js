//---------Collections------
dbs = new Mongo.Collection("dbs");
spectraDB = new Mongo.Collection("spectraDB");
spectroCompDB = new Mongo.Collection("spectroCompDB");
files = new Mongo.Collection("filesDB");
folders = new Mongo.Collection("folders");
locations = new Mongo.Collection("locations");
barcodes = new Mongo.Collection("barcodes");
Points = new Mongo.Collection("Points");
spectrometer = new Mongo.Collection('spectrometer');
flowvolume = new Mongo.Collection('flowvolume');
mox = new Mongo.Collection('mox');
barcode = new Mongo.Collection("barcode");
userDB = new Mongo.Collection("userDB");
interfaces = new Mongo.Collection("interfaces");
connectionList = new Mongo.Collection("connectionList");
bugsfeatures = new Mongo.Collection("bugsfeatures");
queryTemplates = new Mongo.Collection("queryTemplates");
emailTemplates = new Mongo.Collection("emailTemplates");
serialportData = new Mongo.Collection("serialportData");
urinalysis = new Mongo.Collection("urinalysis");
dbSettings = new Mongo.Collection("dbSettings");
moduleControl = new Mongo.Collection('moduleControl');
searchSchema = new Mongo.Collection("searchSchema");
searchBy = new Mongo.Collection("searchBy");
garageServer = new Mongo.Collection("garageServer");
//connections = new Mongo.Collection("connections");

Meteor.publish("interfaces", function (iid) {
    if (iid) {
        console.log('this iid', iid, this.connection.clientAddress);
        var clientAddr = this.connection.clientAddress;
        this.connection.onClose(function () {
            var temp = connectionList.findOne({_id: iid});
            for(var p in temp){
                if(p.indexOf('_id') === -1){
                    var mod = {};
                    mod[p + '.status'] = 'disconnected';
                    console.log('mod', mod);
                    connectionList.update({_id: iid}, {$set:mod})
                }

            }
            console.log(iid, ' *********disconnected now', clientAddr);
            //spectroCompDB.update({_id: "CcWTJxB5GQ5nJjvth"}, {$unset: {'client.7v7ri36ZqcXNkGkRZ' : {}}})

        });


        interfaces.upsert({interfaceID: iid}, {
            $set: {
                clientAddress: this.connection.clientAddress,
                serverConnection: true,
                dateTime: new Date(),
                httpHeaders: this.connection.httpHeaders
            }
        });

        console.log(interfaces.find({interfaceID: iid}).fetch()[0]._id);
        return interfaces.find({interfaceID: iid});
    }
    else{
        console.log('no iid', iid)
    }
});

/*interfaces.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        return true; //(userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        return true; //doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return true; //doc.owner === userId;
    },
    //fetch: ['owner']
});*/

Meteor.methods({
    'systemOS': function(){
        console.log('initializing system');
        var systemType = new Future();
        runCommand = function (error, stdout, stderr) {
            var sys = 'mac';
            if (stdout) {
                console.log(stdout);
                if(stdout.toString().indexOf('Darwin') > -1){
                    systemType['return']('mac');
                }
                else {
                    systemType['return']('linux');
                }
            }
        };

        exec('uname -a', Meteor.bindEnvironment(runCommand));

        return systemType.wait();
    }
});

Meteor.publish("connectionList", function (iid) {
    //console.log('connectionList publish', this.userId, Meteor.users.findOne({_id: this.userId}));
    if (iid) {
        if(connectionList.find({_id: iid}).count() === 0){
            connectionList.insert({_id: iid});
        }

        return connectionList.find({_id: iid});
    }
});

/*connectionList.allow({
    insert: function (userId, doc) {
        // the user must be logged in, and the document must be owned by the user
        console.log('connectionList insert', Meteor.userId(), userId);
        return true; //(userId && doc.owner === userId);
    },
    update: function (userId, doc, fields, modifier) {
        // can only change your own documents
        console.log('connectionList update', Meteor.userId(), userId);
        return true; // doc.owner === userId;
    },
    remove: function (userId, doc) {
        // can only remove your own documents
        return true; //doc.owner === userId;
    },
    //fetch: ['owner']
});*/

Meteor.publish("queryTemplates", function(){
    return queryTemplates.find();
});

Meteor.publish("emailTemplates", function(){
    return emailTemplates.find();
});

Meteor.publish("moduleControl", function(){
   return moduleControl.find();
});

Meteor.publish("dbs", function(){
    return dbs.find();
});

Meteor.publish("availableOptions", function(){
    return availableOptions.find();
});

Meteor.publish('connections', function(spectroCompDB){
    Mongo.Collection._publishCursor( connectionList.find({}), this, 'connections');
    this.ready();
});

//required for connections
Meteor.methods({
    '/connections/update' :function(doc, mSet){
        //console.log('connections update', this.userId)
        //console.log('connections.update', doc, mSet);
        return connectionList.update(doc, mSet)
    },
});

Meteor.publish("locations", function () {
    return locations.find();
});

Meteor.publish("flowvolume", function (id) {
    if(flowvolume.find({_id:id}).count() === 0){
        flowvolume.upsert({_id: id}, {$set:{saveSessionFolderPath:''}});
        console.log('subscribing to flowvolume with id of', id);
    }
    console.log('subscribing to flowvolume with id of', id);
    return flowvolume.find();
});

Meteor.publish("barcodes", function () {
    return barcodes.find({display: 'show'});
});

Meteor.publish("mox", function () {
    return mox.find();
});

Meteor.publish('urinalysisSettings', function(){

    if(dbSettings.find({db: 'urinalysis', analyte: "Glucose"}).count() === 0){
        dbSettings.insert({db: 'urinalysis', analyte: "Glucose", column: 'GLU'})
    }

    Mongo.Collection._publishCursor( dbSettings.find({db: 'urinalysis'}), this, 'urinalysisSettings');
    this.ready();
});

//required for connections
Meteor.methods({
    '/urinalysisSettings/update' :function(doc, mSet){
        //console.log('connections.update', doc, mSet);
        return dbSettings.update(doc, mSet)
    },
    '/urinalysisSettings/insert' :function(doc){
        //console.log('connections.update', doc, mSet);
        return dbSettings.insert(doc)
    },
    '/urinalysisSettings/remove' :function(doc){
        //console.log('connections.update', doc, mSet);
        return dbSettings.remove(doc)
    },
});

Meteor.publish('spectrometersSettings', function(){
    Mongo.Collection._publishCursor( dbSettings.find({db: 'spectrometers'}), this, 'spectrometersSettings');
    this.ready();
});

//required for connections
Meteor.methods({
    '/spectrometersSettings/update' :function(doc, mSet){
        //console.log('connections.update', doc, mSet);
        return dbSettings.update(doc, mSet)
    },
    '/spectrometersSettings/insert' :function(doc){
        //console.log('connections.update', doc, mSet);
        return dbSettings.insert(doc)
    },
    '/spectrometersSettings/remove' :function(doc){
        //console.log('connections.update', doc, mSet);
        return dbSettings.remove(doc)
    },
});

Meteor.publish("spectroCompDB", function (id) {
    if(id) {
        spectroCompDB.upsert({_id: id}, {$set: {connectionStatus: 'connected'}});
        this.connection.onClose(function () {

            console.log('pi', id, ' *********disconnected now');

            spectroCompDB.update({_id: id}, {$set: {connectionStatus: 'disconnected'}})

        });
        console.log('pi', id, ' *********connected now');
        return spectroCompDB.find({_id: id});
    }

    else{
        return spectroCompDB.find();
    }

});

Meteor.publish("garageServer", function (id) {
    if(id) {
        garageServer.upsert({_id: id}, {$set: {connectionStatus: 'connected'}});
        this.connection.onClose(function () {

            console.log('pi', id, ' *********disconnected now');

            garageServer.update({_id: id}, {$set: {connectionStatus: 'disconnected'}})

        });
        console.log('pi', id, ' *********connected now');
        return garageServer.find({_id: id});
    }

    else{
        return garageServer.find();
    }

});


Meteor.publish("filesDB", function () {
    return files.find();
});

/*Meteor.publish("userDB", function (userID) {
    if(typeof userID !== 'undefined'){
        return userDB.find({_id: userID});
    }
});*/

Meteor.publish("spectrometer", function () {
    return spectrometer.find();
});

Meteor.publish("spectraDB", function () {
    return spectraDB.find();
});
Meteor.publish("folders", function () {
    return folders.find();
});
Meteor.publish("Points", function () {
    return Points.find();
});

Meteor.publish("control", function () {
    return control.find();
});

Meteor.publish("barcode", function () {
    return barcode.find();
});

Meteor.publish("bugsfeatures", function () {
    return bugsfeatures.find();
});




/*
Meteor.publish("spectrAuto", function () {
    return spectrAuto.find();
});
*/

Meteor.onConnection(function (conn) {
    /*conn.onClose(function () {//pi
        if(typeof conn['user-agent'] === 'undefined'){
            console.log('pi disconnected', conn.clientAddress);
            var list = spectroCompDB.find().fetch();
            for (var p in list){
                if(typeof list[p]['ip'] !== 'undefined'){
                    if(list[p].ip.indexOf(conn.clientAddress) > -1){
                        spectroCompDB.update({_id: list[p]._id},{$set: {connectionStatus: 'disconnected'}});
                    }
                }
            }
        }
//user
        else{
            console.log('User left', conn.clientAddress);
            interfaces.update({'clientAddress': conn.clientAddress}, {$set:{'serverConnection': false}});
        }

        //interfaces.find({})
    });
//pi
    if(typeof conn['httpHeaders']['user-agent'] === 'undefined'){
        console.log('New connection from Pi', conn.clientAddress);
        var list = spectroCompDB.find().fetch();
        for (var p in list){
            if(typeof list[p]['ip'] !== 'undefined'){
                if(list[p].ip.indexOf(conn.clientAddress) > -1){
                    spectroCompDB.update({_id: list[p]._id},{$set: {connectionStatus: 'connecteds'}});
                }
            }
        }
    }
//user
    else{
        console.log('New connection from User', conn.clientAddress);
        interfaces.update({'clientAddress': conn.clientAddress}, {$set:{'serverConnection': true}});
    }*/

});