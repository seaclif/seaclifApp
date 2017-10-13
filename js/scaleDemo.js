if (Meteor.isClient) {

    scaleDemoPageReady = new ReactiveVar(false);
    weightMode = new ReactiveVar(false);
    dataCollection = new ReactiveVar(false);
    bodyFatMode = new ReactiveVar(false);
    scaleDemoIndex = new ReactiveVar();
    currentUserInfo = new ReactiveVar();
    loadingStatus = new ReactiveVar(true);
    hasBirthday = new ReactiveVar(false);
    dataCollectionTimer = new ReactiveVar();
    dataCollectionInterval = undefined;

    Template.scaleDemoPage.onRendered(function(){
        Tracker.autorun(function(){
            var s = FlowRouter.watchPathChange();
            scaleDemoPageReady.set(true);
        });
    });

    Template.scaleDemoPage.helpers({
        createdReady:function(){
            return scaleDemoPageReady.get() && typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined' && subs.spectroCompDB.isReady;
        }
    });

    Template.scaleDemo.onCreated(function () {
        console.log('FlowRouter id', FlowRouter.current().params.id, FlowRouter.current().queryParams.control);
        piConnections.get(FlowRouter.current().params.id).addCollection('serialports');
        subs.addCollection('spectroCompDB');
        subs.addCollection('userDB', currentSession._currentUserID);
        subs.ddp.subscribe("userDB", currentSession._currentUserID);
    });
    Template.scaleDemo.onDestroyed(function () {
        console.log('destroying template stop logging data');
        piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"}).set("recordData", 'Stop Logging Data');
    });


    Template.scaleDemo.onRendered(function () {
       Tracker.autorun(function (self) {
           if(typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined' && subs.spectroCompDB.isReady){
               if(piConnections.get(FlowRouter.current().params.id).serialports.isReady){
                   if(piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"})){
                       scaleDemoIndex.set(piConnections.get(FlowRouter.current().params.id).serialports.findIndex(function(x){return x.portName === "scale demo"}))
                       if(typeof scaleDemoIndex.get() !== 'undefined'){
                           if (piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].portStatus.indexOf('Closed') > -1) {
                               piConnections.get(FlowRouter.current().params.id).ddp.call('getUSBdata',
                                   piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()]._id, function (err, result) {});
                           }
                           dataCollection.set(false);
                           weightMode.set(false);
                           bodyFatMode.set(false);
                           self.stop();
                       }
                   }
               }
           }
       })
    });

    Template.scaleDemo.helpers({
        connectionReady: function () {
            return typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined' && subs.spectroCompDB.isReady;
        },

        thisLocation:function(){
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).location;
        },

        usbReady: function () {
            return piConnections.get(FlowRouter.current().params.id).serialports.isReady;
        },

        usbport: function () {
            return piConnections.get(FlowRouter.current().params.id);
        },
        configuredUSBport: function () {
            return piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()];
        },

        makeUploadNewLine: function(makeUploadText){
            var makeUploadTempArray = makeUploadText.split(/(\r\n|\n|\r)/gm);
            var makeUploadTempA = new Array();
            for(var m =0; m< makeUploadTempArray.length; m++){
                makeUploadTempA.push({line: makeUploadTempArray[m]})
            }

            return makeUploadTempA;
        },

        displayImage: function () {
            if (typeof this.display !== 'undefined') {
                if (this.display)
                    return "../img/x-clear.png";
                else
                    return "../img/+add.png";
            }
            else
                return "../img/x-clear.png";
        },

        displayAddCommand: function () {
            if (this.addCommand)
                return "../img/checkOK.png";
            else
                return "../img/+add.png";
        },

        displayAddCommandBox: function(){
            //console.log('displayAddCommandBox', this);

            if(typeof this.addCommand === 'undefined'){
                this.set('addCommand', false);
            }
            return this.addCommand;
        },

        commandButton: function(){
            return this.commands;
        },

        commLogic: function(){
            return this.crossComm;
        },

        displayAddComm: function () {
            if (this.addComm)
                return "../img/checkOK.png";
            else
                return "../img/+add.png";
        },

        displayConfigsSettings: function () {
            if (this.displayConfigs)
                return "../img/checkOK.png";
            else
                return "../img/+add.png";
        },
        displayConfigsBox: function(){
            //console.log('displayAddCommandBox', this);

            if(typeof this.displayConfigs === 'undefined'){
                this.set('displayConfigs', false);
            }
            return this.displayConfigs;
        },

        displayAddCommBox: function(){
            //console.log('displayAddCommandBox', this);

            if(typeof this.addComm === 'undefined'){
                this.set('addComm', false);
            }
            return this.addComm;
        },

        crossCommDisplay: function(){
            return this.addComm;
        },

        displayMe: function () {
            if (typeof this.display !== 'undefined')
                return this.display;
            else
                return true;
        },

        connectionToMasterServer: function(){
            console.log("connectionToMasterServer", subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).connectionStatus);
            if(typeof subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).connectionStatus !== 'undefined'){
                return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).connectionStatus === 'connected';
            }
            else{
                return false;
            }
        },

        uploadCodeDisplay: function(){
            if(typeof this['uploadCode'] === 'undefined'){
                this.set('uploadCode','Upload Code')
            }
            return this.uploadCode;
        },

        uploadingcode: function(help){
            if(typeof this['uploadCode'] === 'undefined') {
                return false
            }
            else if(this['uploadCode'].indexOf('Code') > -1){
                if(this['makeUploadError']){
                    return true;
                }
                else{
                    return false;
                }
            }
            else{
                return true;
            }
        },

        uploadCodeColor: function(){
            if(this['makeUploadError']){
                return '#FFA6A6';
            }
            else{
                return '#ABFFB9';
            }
        },

        arduinoProjectsList: function(currentProject){
            //if(justRenderedUSBs){
                if(typeof this['arduinoProject'] === 'undefined'){
                    this.set('arduinoProject', arduinoProjects.get()[0].name);
                }
                var tempProjects = JSON.parse(JSON.stringify(arduinoProjects.get()));
                for (i = 0; i < tempProjects.length; i++) {
                    if (currentProject === tempProjects[i].name) {
                        tempProjects[i].ifSelected = 'selected';
                    }
                    else {
                        tempProjects[i].ifSelected = '';
                    }
                }
                justRenderedUSBs = false;
                return tempProjects;
            //}
            //console.log('arduinoProjectsList', currentProject)

        },

        moreThanOne: function(){
            if(piConnections.get(FlowRouter.current().params.id).serialports.find({isConnected: true}).count() > 1){
                return true;
            }
            else{
                return false;
            }
        },

        showChooseFile: function(){
            //console.log('showChooseFile', this, this['arduinoProject']);
            if(this['arduinoProject'] === 'hexFile'){
                return 'show';
            }
            else{
                return 'none';
            }
        },

        weightMode: function () {
            return weightMode.get();
        },

        bodyFatMode: function () {
            return bodyFatMode.get();
        },

        dataCollectionMode: function () {
            return dataCollection.get();
        },

        loading: function () {
            return loadingStatus.get();
        },
        
        currentUserInfo: function () {
            return subs.userDB.isReady && subs.userDB.getOne({_id: currentSession._currentUserID});
        },

        infoFilled: function () {
            return subs.userDB.getOne({_id: currentSession._currentUserID}) && subs.userDB.getOne({_id: currentSession._currentUserID}).gender && subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches && subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet && subs.userDB.getOne({_id: currentSession._currentUserID}).weight && subs.userDB.isReady && subs.userDB.getOne({_id: currentSession._currentUserID}).birthday;
        },

        hasBirthday: function () {
            return hasBirthday.get();
        },

        timeOutDataCollection: function () {
            return dataCollectionTimer.get();
        }

    });


    Template.scaleDemo.events({
        'change [class=select]': function (event) {
            Meteor.call('setUserDetail', currentSession.getCurrentUserID(), $(event.target).attr('name'), $(event.target).val());

            if(subs.userDB.getOne({_id: currentSession._currentUserID}) && subs.userDB.getOne({_id: currentSession._currentUserID}).gender && subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches && subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet && subs.userDB.getOne({_id: currentSession._currentUserID}).weight && subs.userDB.isReady && subs.userDB.getOne({_id: currentSession._currentUserID}).birthday){
                if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).weight !== 'undefined'){
                    var tWeight = subs.userDB.getOne({_id: currentSession._currentUserID}).weight;//lbs
                }
                if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet !== 'undefined' && typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches !== 'undefined'){
                    var tHeight = subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet * 12 + parseInt(subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches); //inches
                }
                if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).gender !== 'undefined'){
                    var tGender = subs.userDB.getOne({_id: currentSession._currentUserID}).gender.toLowerCase(); //male female
                }

                console.log('birthday', subs.userDB.getOne({_id: currentSession._currentUserID}).birthday);
                piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                    piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port,
                    "userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}", function(err, result){
                        //userInfo:{weight:175.4, height: 78.1, age:38, gender:male}
                        console.log("userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}");
                    });
            }
        },

        'keyup [class=scaleDemo]': function (event) {

            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                
                if(subs.userDB.getOne({_id: currentSession._currentUserID}) && subs.userDB.getOne({_id: currentSession._currentUserID}).gender && subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches && subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet && subs.userDB.getOne({_id: currentSession._currentUserID}).weight && subs.userDB.isReady && subs.userDB.getOne({_id: currentSession._currentUserID}).birthday){
                    if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).weight !== 'undefined'){
                        var tWeight = subs.userDB.getOne({_id: currentSession._currentUserID}).weight;//lbs
                    }
                    if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet !== 'undefined' && typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches !== 'undefined'){
                        var tHeight = subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet * 12 + parseInt(subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches); //inches
                    }
                    if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).gender !== 'undefined'){
                        var tGender = subs.userDB.getOne({_id: currentSession._currentUserID}).gender.toLowerCase(); //male female
                    }

                    console.log('birthday', subs.userDB.getOne({_id: currentSession._currentUserID}).birthday);
                    piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                        piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port,
                        "userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}", function(err, result){
                            //userInfo:{weight:175.4, height: 78.1, age:38, gender:male}
                            console.log("userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}");
                        });
                }

            } else {
                Meteor.call('setUserDetail', currentSession.getCurrentUserID(), $(event.target).attr('name'), $(event.target).val());
            }
        },

        'click #bodyFat' : function () {
            
            if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).birthday === 'undefined'){
                hasBirthday.set(false);
            }
            else{
                hasBirthday.set(true);
            }

            piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port, "selectMode:{mode:demoBodyFat}", function(err, result){
                    console.log("selectMode:{mode:demoBodyFat}");
                    setTimeout(function(){
                        compu = new Tracker.autorun(function (self) {
                            if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).weight !== 'undefined'){
                                var tWeight = subs.userDB.getOne({_id: currentSession._currentUserID}).weight;//lbs
                            }
                            if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet !== 'undefined' && typeof subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches !== 'undefined'){
                                var tHeight = subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet * 12 + parseInt(subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches); //inches
                            }
                            if(typeof subs.userDB.getOne({_id: currentSession._currentUserID}).gender !== 'undefined'){
                                var tGender = subs.userDB.getOne({_id: currentSession._currentUserID}).gender.toLowerCase(); //male female
                            }
                            if(subs.userDB.getOne({_id: currentSession._currentUserID}) && subs.userDB.getOne({_id: currentSession._currentUserID}).gender && subs.userDB.getOne({_id: currentSession._currentUserID}).heightInches && subs.userDB.getOne({_id: currentSession._currentUserID}).heightFeet && subs.userDB.getOne({_id: currentSession._currentUserID}).weight && subs.userDB.isReady && subs.userDB.getOne({_id: currentSession._currentUserID}).birthday){
                                console.log('birthday', subs.userDB.getOne({_id: currentSession._currentUserID}).birthday);
                                piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                                    piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port,
                                    "userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}", function(err, result){
                                        //userInfo:{weight:175.4, height: 78.1, age:38, gender:male}
                                        console.log("userInfo:{weight:" + tWeight + ", height:" + tHeight + ", gender:" + tGender + "}");
                                        loadingFunction();
                                        weightMode.set(false);
                                        bodyFatMode.set(true);
                                        self.stop();
                                        compu.stop();
                                    })
                            }
                        });

                        dataCollection.set(false);
                        weightMode.set(false);
                        bodyFatMode.set(true);
                    }, 1000)

                })


        },

        'click #weight' : function () {

            piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port, "selectMode:{mode:demoWeight}", function(err, result){
                    console.log("selectMode:{mode:demoWeight}");
                    dataCollection.set(false);
                    weightMode.set(true);
                    bodyFatMode.set(false);
                    loadingFunction();
            })
        },
        
        'click #dataCollection' : function () {

            piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand',
                piConnections.get(FlowRouter.current().params.id).serialports[scaleDemoIndex.get()].port, "selectMode:{mode:dataCollection}", function(err, result){
                    console.log("selectMode:{mode:dataCollection}");
                    weightMode.set(false);
                    dataCollection.set(true);
                    bodyFatMode.set(false);

                    var currentUserDetails = subs.userDB.getOne({_id: currentSession._currentUserID});
                    if(typeof currentUserDetails.weight !== 'undefined'){
                        var tWeight = currentUserDetails.weight;//lbs
                    }
                    if(typeof currentUserDetails.heightFeet !== 'undefined' && typeof currentUserDetails.heightInches !== 'undefined'){
                        var tHeight = currentUserDetails.heightFeet * 12 + parseInt(currentUserDetails.heightInches); //inches
                    }
                    if(typeof currentUserDetails.gender !== 'undefined'){
                        var tGender = currentUserDetails.gender; //male female
                    }

                    if(typeof currentUserDetails.birthday !== 'undefined'){
                        var tBirthday = moment(currentUserDetails.birthday).fromNow(true).replace(' years', '');
                    }

                    piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"}).set("filename", currentSession._userNumberName + ' ' + tWeight + ' ' + tHeight + ' ' + tGender + ' ' + tBirthday + '.csv');
                    piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"}).set("recordData", 'Start Logging Data');

                    Meteor.clearInterval(dataCollectionInterval);

                    dataCollectionInterval = Meteor.setInterval(function () {

                        if(typeof dataCollectionTimer.get() === 'undefined'){
                            dataCollectionTimer.set(19);
                        }
                        else{
                            dataCollectionTimer.set(dataCollectionTimer.get() - 1);
                        }
                    }, 1000);

                    Meteor.setTimeout(function () {

                        if(typeof FlowRouter.current().params.id !== 'undefined'){
                            if(typeof piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"}) !== 'undefined'){
                                piConnections.get(FlowRouter.current().params.id).serialports.getOne({portName: "scale demo"}).set("recordData", 'Stop Logging Data');
                                if(dataCollection.get()){
                                    weightMode.set(false);
                                    dataCollection.set(false);
                                    bodyFatMode.set(false);
                                }
                            }
                        }

                        Meteor.clearInterval(dataCollectionInterval);
                        dataCollectionTimer.set(undefined);
                    }, 20000)

                });
            loadingFunction();
        }

    });

    loadingFunction = function(){
        loadingStatus.set(true);
        setTimeout(function () {
            loadingStatus.set(false);
        }, 2000)

    }
}