if (Meteor.isClient) {

    arduinoProjects = new ReactiveVar();
    usbTabsReady = new ReactiveVar(false);
    justRenderedUSBs = true;
    globalFileInput = 'hello';
    globalFileInput2 = 'hello';
    globalFileInput3 = 'hello';
    
    Template.usbWithTabs.onRendered(function(){
        Tracker.autorun(function(){
            var s = FlowRouter.watchPathChange();
            usbTabsReady.set(true);
        });
    });

    Template.usbWithTabs.helpers({
        createdReady:function(){
            return usbTabsReady.get() && typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined' && subs.spectroCompDB.isReady;
        }
    });

    Template.usb.onCreated(function () {
        console.log('FlowRouter id', FlowRouter.current().params.id, FlowRouter.current().queryParams.control);
        piConnections.get(FlowRouter.current().params.id).addCollection('serialports');
        subs.addCollection('spectroCompDB');
        justRenderedUSBs = true;

        Meteor.call('folders', defaultFolder + "Arduino_for_Raspberry_Pi", function(err, result){
            arduinoProjects.set(result);

        });
    });

    Template.usb.helpers({
        connectionReady: function () {
            if (typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined' && subs.spectroCompDB.isReady) {
                return true;
            }
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
        usbportList: function () {
            return piConnections.get(FlowRouter.current().params.id).serialports;
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
        }

    });


    Template.usb.events({
        'change #uploadHexFile': function(e, tmpl){
            var fileInput = tmpl.find('input[id=uploadHexFile]');
            globalFileInput2 = fileInput;
            if(typeof fileInput.files !== 'undefined'){
                var fr = new FileReader();
                fr.onload = function(){
                    //piConnections.get(FlowRouter.current().params.id).serialports.getOne({_id: this.fromPort})
                    globalFileInput.set('hexFile', fr.result);
                    globalFileInput.set('hexFileName', fileInput.files[fileInput.files.length -1].name);
                    globalFileInput.set('hexFilelastModifiedDate', fileInput.files[fileInput.files.length -1].lastModifiedDate);
                    $('#uploadHexFile').val('');
                };
                fr.readAsText(fileInput.files[0]);
            }
        },

        'click #chooseHexFile': function (e, tmpl) {
            globalFileInput = this;

            $('#uploadHexFile').click();
        },

        'keyup .serialConfig': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .serialConfig': function (event) {
            this.set($(event.target).attr('name'), $(event.target).val());
            if($(event.target).val() == 'scale demo'){
                for(var p = 0; p< piConnections.get(FlowRouter.current().params.id).serialports.length; p++){
                    if(piConnections.get(FlowRouter.current().params.id).serialports[p].portName == 'scale demo'){
                        piConnections.get(FlowRouter.current().params.id).serialports[p].set('portName', '')
                        this.set($(event.target).attr('name'), $(event.target).val());
                    }
                }
            }
        },

        'click [name=display]': function (event) {
            if (typeof this[$(event.target).attr('name')] === 'undefined') {
                this.set($(event.target).attr('name'), false);
            }
            else {
                this.set($(event.target).attr('name'), !this[$(event.target).attr('name')]);
            }

        },
        'click [name=displayConfigsBox]':function(){
            this.displayConfigs = !this.displayConfigs;
        },
        'click [name=displayAddCommand]':function(){
            this.addCommand = !this.addCommand;

            if(this.addCommand){
                var tID = Math.random();
                var tempArray = this['commands'];
                if(typeof tempArray === 'undefined'){
                    tempArray = [{btn: tID, port: this._id}];
                }
                else{
                    tempArray.push({btn: tID, port: this._id})
                }
                console.log('this', this, Template.currentData());
                this.set('commands', tempArray);
            }
        },
        'click [name=displayAddComm]':function(){
            if(typeof this.addComm === 'undefined'){
                this.set('addComm', true);
            }
            else{
                this.addComm = !this.addComm;
            }

            if(this.addComm){
                var tID = Math.random();
                var tempArray;
                if(Array.isArray(this['crossComm'])){
                    tempArray = this['crossComm'];
                }
                else{
                    tempArray = new Array();
                }
                tempArray.push({numID: tID, fromPort: this._id});

                this.set('crossComm', tempArray);
            }
        },
        'click [name=deleteThisButton]':function(){
            var thisPi = piConnections.get(FlowRouter.current().params.id).serialports.getOne({_id: this.port});
            var tempArray = thisPi.commands;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].btn == $(event.target).attr('id')){
                    tempArray.splice(c, 1);
                }
            }
            thisPi.commands = tempArray;
        },

        'click [name=deleteThisComm]':function(){
            console.log(this, Template.currentData());
            var thisPi = piConnections.get(FlowRouter.current().params.id).serialports.getOne({_id: this.fromPort});
            var tempArray = thisPi.crossComm;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].numID == $(event.target).attr('id')){
                    tempArray.splice(c, 1);
                }
            }
            thisPi.crossComm = tempArray;
        },

        'click [name=choosePath]': function (event) {
            currentFolderObj = this;
            if (typeof this.folderPath !== 'undefined' && this.folderPath.length > 2)
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + this.folderPath);
            else
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);

        },

        'click [name=refreshList]': function (event) {
            piConnections.get(FlowRouter.current().params.id).serialports._connection.call('usbPortList', function (err, result) {
                console.log(result);
            })
        },
        'click [name=recordData]': function (event) {
            if($(event.target).val().indexOf('Start') > -1)
            {
                this.set($(event.target).attr('name'), 'Pending...');
                piConnections.get(FlowRouter.current().params.id).ddp.call('getUSBdata', this.port, function(err, result){

                });
                this.set($(event.target).attr('name'), 'Start Logging Data');
            }
            else{
                this.set($(event.target).attr('name'), 'Stop Logging Data');
            }

        },
        'click #uploadCodeToArduino': function(){
            console.log('uploadCodeToArduino');
            this.set('makeUploadError', false);
            this.set('uploadCode','Uploading....');
            var thisUploadCode = this;
            if(this.arduinoProject === 'hexFile'){
                if(typeof this.hexFile === 'undefined' || this.hexFile.length < 3){
                    alert("Please Upload a valid .hex file");
                }else{
                    console.log('uploadToArduinoHex', this.hexFile.substring(0, 20), this.hexFileName, this.arduinoChip, this.port);
                    piConnections.get(FlowRouter.current().params.id).ddp.call('uploadToArduinoHex', this.hexFile, this.hexFileName, this.arduinoChip, this.port, function(err, result){
                        console.log('uploading to arduino', err, result);
                        thisUploadCode.set('uploadCode','Upload Code');
                    });
                }
            }
            else{
                piConnections.get(FlowRouter.current().params.id).ddp.call('uploadToArduino', defaultFolder + "Arduino_for_Raspberry_Pi/", this.arduinoProject, this.arduinoBoard, this.port, undefined, function(err, result){
                    console.log('uploading to arduino', err, result);
                    thisUploadCode.set('uploadCode','Upload Code');
                });
            }

        },

        'blur [name="arduinoProject"]': function (event) {
            console.log("arduinoProject blur", $(event.target).val());
        },

        'change .arduinoProject': function (event) {
            this.set($(event.target).attr('name'), $(event.target).val());
        },
        'change [name="arduinoBoard"]': function (event) {
            this.set($(event.target).attr('name'), arduinoBoards[$(event.target).context.selectedIndex].board);
            this.set('arduinoChip', arduinoBoards[$(event.target).context.selectedIndex].chip);
        },

        'click [name=clearData]':function(){
            piConnections.get(FlowRouter.current().params.id).ddp.call('clearUSBdata', this._id);
        },
        'click [name=openPort]': function (event) {

            if ($(event.target).val().indexOf('Open') > -1) {
                piConnections.get(FlowRouter.current().params.id).ddp.call('getUSBdata', this._id, function (err, result) {

                });
                //this.set('portStatus', $(event.target).val());
            }
            else {
                piConnections.get(FlowRouter.current().params.id).ddp.call('stopUSBdata', this._id, function (err, result) {

                });
                //this.set('portStatus', $(event.target).val());
            }
        },

        'click [name=writeInterval]': function(event){
            this.set($(event.target).attr('name'), $(event.target).val());
        },
        'click [id=customUSBCommand]':function(event){
            piConnections.get(FlowRouter.current().params.id).ddp.call('customCommand', this.port, $(event.target).attr('name'))
        }

    });

    Template.newCommand.helpers({

        btnColorOptions: function(){
            return btnColorOptions;
        },

        numID:function(){
            return this.commands[this.commands.length - 1].btn;
        }
    });

    Template.newCommand.events({
        'keyup [class=newCommand]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur [class=newCommand]': function (event) {
            $(event.target).blur();
            //this.set($(event.target).attr('name'), $(event.target).val());
            var tempArray = this.commands;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].btn == $(event.target).attr('id')){
                    tempArray[c][$(event.target).attr('name')] = $(event.target).val();
                }
            }
            console.log('keyup', $(event.target).attr('id'), $(event.target).attr('name'), $(event.target).val())

            this.commands = tempArray;
        },

        'change .select': function (event) {
            var tempArray = this.commands;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].btn == $(event.target).attr('id')){
                    tempArray[c][$(event.target).attr('name')] = 'color-' + $(event.target).val();
                }
            }

            this.commands = tempArray;
        }
    });

    Template.newComm.helpers({

        numIDComm:function(){
            return this.crossComm[this.crossComm.length - 1].numID;
        },
        notThisUSB: function(help){
            return this.port;
        },

        usbportList: function(help){
            var tempArra = piConnections.get(FlowRouter.current().params.id).serialports.find().fetch();
            for(var ta = 0; ta< tempArra.length; ta++){
                if(tempArra[ta].port === this.port){
                    tempArra.splice(ta, 1);
                }
            }
            return tempArra;
        },


    });

    Template.newComm.events({
        'keyup [class=newComm]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur [class=newComm]': function (event) {
            $(event.target).blur();
            var tempArray = this.crossComm;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].numID == $(event.target).attr('id')){
                    tempArray[c][$(event.target).attr('name')] = $(event.target).val();
                    var tempList = piConnections.get(FlowRouter.current().params.id).serialports.find().fetch();
                    for(var s = 0; s < tempList.length; s++){
                        if(tempList[s].isConnected){
                            if(this.port !== tempList[s].port){
                                tempArray[c]['toPort'] = tempList[s].port;
                                tempArray[c]['toPortName'] = tempList[s].portName;
                                s = tempList.length;
                            }
                        }
                    }
                }
            }


            this.crossComm = tempArray;
        },

        'change .select': function (event) {
            console.log($(event.target).context, $(event.target));
            var tempArray = this.crossComm;
            for(var c = 0; c < tempArray.length; c++){
                if(tempArray[c].numID == $(event.target).attr('id')){
                    tempArray[c][$(event.target).attr('name')] = $(event.target).context.options[$(event.target).context.selectedIndex].value;
                    tempArray[c]['toPortName'] = $(event.target).context.options[$(event.target).context.selectedIndex].text;
                }
            }
            this.crossComm = tempArray;
        }
    });
    //
    //Template.usbDetail.helpers({
    //
    //
    //});
    //
    //Template.usbDetail.events({
    //    'click [id=startLogging]': function (event) {
    //        connectionList[Template.currentData()._id].DDP.call('getUSBdata', Template.currentData()._id);
    //
    //    },
    //
    //    'click [id=stopLogging]': function (event) {
    //        connectionList[Template.currentData()._id].DDP.call('getUSBdata', Template.currentData()._id);
    //
    //    },
    //
    //    'click [name=choosePath]': function (event) {
    //        folder.setCurrentObj(moxObj);
    //        var path = moxObj['saveSessionFoldersPath'];
    //        if (path){
    //            folder.setPath(path);
    //            Router.go('/folderNavigation'+ path.substring(path.lastIndexOf('/')));
    //        }
    //        else{
    //            Router.go('/folderNavigation');
    //        }
    //
    //        interface.addField('backBtn', Router.current().url.toString());
    //    },
    //    'keyup [name=filename]': function (event) {
    //        if (event.which == 13 || event.which == 27) {
    //            $(event.target).blur();
    //            if ($(event.target).val().indexOf('.csv') < 0){
    //                if(typeof moxObj[$(event.target).attr('name')] === 'undefined') {
    //                    moxObj.addField($(event.target).attr('name'),$(event.target).val() + '.csv');
    //                }
    //                else{
    //                    moxObj[$(event.target).attr('name')] = $(event.target).val() + '.csv';
    //                }
    //            }
    //
    //        } else {
    //            if(typeof moxObj[$(event.target).attr('name')] === 'undefined') {
    //                moxObj.addField($(event.target).attr('name'),$(event.target).val());
    //            }
    //            else{
    //                moxObj[$(event.target).attr('name')] = $(event.target).val();
    //            }
    //
    //        }
    //
    //
    //
    //    },
    //    'blur [name=filename]': function (event) {
    //        if ($(event.target).val().indexOf('.csv') < 0){
    //            if(typeof moxObj[$(event.target).attr('name')] === 'undefined') {
    //                moxObj.addField($(event.target).attr('name'),$(event.target).val() + '.csv');
    //            }
    //            else{
    //                moxObj[$(event.target).attr('name')] = $(event.target).val() + '.csv';
    //            }
    //        }
    //    }
    //});

}