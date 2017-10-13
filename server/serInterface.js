Meteor.methods({

    'interfaceSetParam': function (interfaceID, param, value) {
        console.log("set interface param " + interfaceID + " param " + param + " value " + value);

        function makeSureInterfaceExistsThen(callback) {
            if (interfaces.find({interfaceID: interfaceID}).count() == 0) {
                interfaces.insert({interfaceID: interfaceID});
            }
            callback();
        };

        makeSureInterfaceExistsThen(function () {
            var update = {};
            update[param] = value;

            var exists = {};
            exists['interfaceID'] = interfaceID;

            console.log("find one interface " + interfaces.findOne({interfaceID: interfaceID})._id);

            //insert the new parama else update if exists
            interfaces.update({_id: interfaces.findOne({interfaceID: interfaceID})._id}, {$set: update});
        });
    },

    'checkCodeGood': function (userCode) {
        console.log('checking if usercode is good');
        if (userCode == undefined || userCode.toString().length < 5) {
            console.log("code is no good 1");
            return false;
        }
        else {
            if (userDB.find({userCode: userCode.toString()}).count() < 2) {
                console.log("code is good!");
                return true;
            }
            else {
                console.log("code is no good 2");
                return false;
            }
        }
    },

    'validCreateUser': function (userID) {
        console.log('checking if usercode and email is good');
        if (userID == undefined || userID.toString().length < 5) {
            console.log("code is no good 1");
            return false;
        }
        else {
            if (userDB.find({_id: userID, email: {$exists: true}, userCode: {$exists: true}}).count() == 1) {
                console.log("code is good!");
                return true;
            }
            else {
                console.log("code is no good 2");
                return false;
            }
        }
    },

    'interfaceGetParam': function (interfaceID, param) {
        console.log("get interface param " + interfaceID + " param " + param);

        var value = interfaces.findOne(interfaces.findOne({interfaceID: interfaceID})._id);
        console.log("the interfaceGetParam value is " + value[param]);
        return value[param];
    },

    'loginWuserCode': function (interfaceID, userCode) {
        loginFut = new Future();

        if (userCode != undefined && userCode.length > 4) {
            //console.log(interfaceID, userCode);
            var userCount = userDB.find({userCode: userCode}).count();
            var currentUser = '';
            //console.log(interfaceID, userCode, 'after count');
            /*if (userDB.find({userCode: userCode}).count() == 0) {
             //userDB.insert({userCode: userCode, type: 'user', userNumber: "User " + userDB.find({}).count()});
             return '';
             }*/
            try {
                currentUser = userDB.findOne({userCode: userCode})._id;
            } catch (err) {
                console.log('loginWuserCode error', err);
            }
            //console.log(interfaceID, userCode, 'currentUser:', currentUser);
            Meteor.call('interfaceSetParam', interfaceID, 'currentUser', userDB.findOne({userCode: userCode})._id);

            loginFut['return'](currentUser);
        }
        else{
            loginFut['return']('');
        }
        return loginFut.wait();

    },

    'newUser': function (interfaceID) {
        var allEmpty = userDB.find({userCode: {$exists: false}, email: {$exists: false}}).fetch();
        for (var x in allEmpty) {
            userDB.remove({_id: allEmpty[x]._id});
        }

        var userCount = userDB.find({}).count();
        while (userDB.find({userNumber: "User " + userCount}).count() > 0) {
            userCount = userCount + 1;
        }
        console.log('userCount', userCount);
        var dateTime = new Date();
        var userID = userDB.insert({userNumber: "User " + userCount, auth: 'pending', dateCreated: dateTime});
        console.log('userID', userID)
        Meteor.call('interfaceSetParam', interfaceID, 'currentUser', userID);
    },

    'setUserDetail': function (userID, field, param) {
        console.log("setting userID- " + userID + ' field- ' + field + ' params- ' + param);

        var setModifier = {$set: {}};
        setModifier.$set[field] = param;

        userDB.update({_id: userID}, setModifier);
    },

    'removePending': function () {
        spectraDB.remove({dataComplete: "pending"});
    },

    'getUserDetail': function (userID, param) {
        console.log("getting userID " + userID + ' ' + param);
        var value = userDB.findOne(userID);
        try {
            console.log("retrieved " + value[param]);
        }
        catch (err) {
        }
        return value[param];
    },

    noOtherBarcode : function noOtherBarcode(userNumber) {
        var fut = new Future();

        var isGood = barcodes.find({}).count();
        console.log('isGood first time', isGood);

        if(isGood === 0){
            console.log(isGood, 'is isGOod');
            fut['return'](0);
        }
        else{
            var query = barcodes.find({user: userNumber, display: 'show'});
            if(query.count() > 0){
                var otherBarcodes = query.fetch();
                for (var x = 0; x<otherBarcodes.length;x++) {
                    var a = moment(otherBarcodes[x].dateTime);
                    var b = moment(new Date);

                    console.log('fromNowValue', b.diff(a));
                    if (b.diff(a) < 300000) { //300000
                        console.log('cant update bad barcode', b.diff(a));
                        x = otherBarcodes.length;
                        isGood = false;

                    }
                }
                fut['return'](isGood);
            }
            else{
                fut['return'](isGood);
            }
        }

        return fut.wait();
    },

    countInDB: function(db){
        return eval(db).find({}).count();
    }

});

/*
interfaces.find({connections:{$exists:true}}).observe({

    changed: function (item) {

        for(var i in spectroCompDB.find().fetch()){
            var spectroComp = spectroCompDB.find().fetch()[i];
            //console.log(h);
            var setVar = {};
            setVar['clients'] = [];
            for(var j in interfaces.find().fetch()){
                var interf = interfaces.find().fetch()[j];
                for (var conn in interf.connections){
                    if(conn === spectroComp._id){
                        //console.log('using', interf.connections[conn].using);
                        if(interf.connections[conn].using){
                            setVar.clients.push({ id : interf._id, clientAddress: interf.clientAddress, status: interf.connections[conn].ddpStatus})
                        }
                    }
                }
            }
            spectroCompDB.update({_id: spectroComp._id}, {$set:setVar})

        }

    },
    added: function (item) {

        for(var i in spectroCompDB.find().fetch()){
            var spectroComp = spectroCompDB.find().fetch()[i];
            //console.log(h);
            var setVar = {};
            setVar['clients'] = [];
            for(var j in interfaces.find().fetch()){
                var interf = interfaces.find().fetch()[j];
                for (var conn in interf.connections){
                    if(conn === spectroComp._id){
                        //console.log('using', interf.connections[conn].using);
                        if(interf.connections[conn].using){
                            setVar.clients.push({ id : interf._id, clientAddress: interf.clientAddress, status: interf.connections[conn].ddpStatus})
                        }
                    }
                }
            }
            spectroCompDB.update({_id: spectroComp._id}, {$set:setVar})

        }

    }
});
*/
