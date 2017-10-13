if (Meteor.isClient) {


    configOptions = [{configureAsOption: 'Configure', selected: ''},
        {configureAsOption: 'Login and Print Barcode', selected: ''},
        {configureAsOption: 'Sensor Control & Data Device', selected: ''},
        {configureAsOption: 'Spectrometer Control Device', selected: ''},
        {configureAsOption: 'Scale Demo', selected: ''},
        {configureAsOption: 'Module Development', selected: ''}];

    btnColorOptions = [
        {colorOption: 'blue', color: 'color-blue'},
        {colorOption: 'green', color: 'color-green'},
        {colorOption: 'orange', color: 'color-orange'},
        {colorOption: 'red', color: 'color-red'},
        {colorOption: 'gray', color: 'color-gray'},
        {colorOption: 'pink', color: 'color-pink'},
        {colorOption: 'black', color: 'color-black'},
        {colorOption: 'yellow', color: 'color-yellow'},
        {colorOption: 'lightblue', color: 'color-lightblue'}
    ];
    analytes = [
        //{analyte: 'None', ifSelected: ''},
        {analyte: 'Urea', column:'UA', ifSelected: ''},
        {analyte: 'Glucose', column:'GLU', ifSelected: ''},
        {analyte: 'Creatine', column:'CRE', ifSelected: ''},
        {analyte: 'Creatinine', column:'BUN', ifSelected: ''},
        {analyte: 'Oxolic Acid', column:'UCSFP', ifSelected: ''},
        //{analyte: 'Other', ifSelected: ''},
    ];

    arduinoBoards = [{"board" : "nano328", chip:"ATmega328P", "alias" : "Nano w/ ATmega328"},
        {"board" : "pro328", chip:"ATmega328", "alias" : "Pro or Pro Mini (3.3V, 8 MHz) w/ ATmega328"},
        {"board" : "uno", chip:"ATmega328P","alias" : "Uno"},
        {"board" : "pro5v328", chip:"ATmega328", "alias" : "Pro or Pro Mini (5V, 16 MHz) w/ ATmega328"},
        {"board" : "mega2560", chip:"ATmega2560", "alias" : " Mega 2560 or Mega ADK"},
        {"board" : "atmega168", chip:"ATmega168", "alias" : "NG or older w/ ATmega168"},
        {"board" : "atmega328", chip:"ATmega328P", "alias" : "Duemilanove w/ ATmega328"},
        {"board" : "bt", chip:"ATmega168p",  "alias" : "BT w/ ATmega168"},
        {"board" : "bt328", chip:"ATmega328P", "alias" : "BT w/ ATmega328"},
        {"board" : "diecimila", chip:"ATmega168p", "alias" : "Diecimila or Duemilanove w/ ATmega168"},
        {"board" : "ethernet", chip:"ATmega328", "alias" : "Ethernet"},
        {"board" : "fio", chip:"ATmega328P", "alias" : "Fio"},
        {"board" : "leonardo", chip:"ATmega32u4", "alias" : "Leonardo"},
        {"board" : "lilypad", chip:"ATmega168p",  "alias" : "LilyPad w/ ATmega168"},
        {"board" : "lilypad328", chip:"ATmega328p", "alias" :"LilyPad w/ ATmega328"},
        {"board" : "mega", chip:"ATmega1280",   "alias" : "Mega (ATmega1280)"},
        {"board" : "mini", chip:"ATmega168p",   "alias" : " Mini w/ ATmega168"},
        {"board" : "mini328", chip:"ATmega328p", "alias" : "Mini w/ ATmega328"},
        {"board" : "nano", chip:"ATmega168p",   "alias" : "Nano w/ ATmega168"},
        {"board" : "pro", chip:"ATmega168p",  "alias" : "Pro or Pro Mini (3.3V, 8 MHz) w/ ATmega168"},
        {"board" : "pro5v", chip:"ATmega168p", "alias" : "Pro or Pro Mini (5V, 16 MHz) w/ ATmega168"}];

    spectrometerEachConnected = function(){
        for(var i in connectionList){
            if(connectionList[i].spectroCompDB.configureAs.indexOf('Control') > -1){
                if(spectrometer.find({_id:i}).count() === 0){
                    spectrometer.upsert({_id: i}, {$set: defaultSpectrometerSettings(connectionList[i].spectroCompDB.hostname)});
                }

                if(typeof spectrometerObj[i] === 'undefined'){
                    //spectrometerObj[i] = {};

                    return localObj(spectrometerObj[i] = {}, spectrometer, undefined, i);
                }
                else{
                    return spectrometerObj[i];
                }

            }
        }

    };

    toMilliseconds = function toMilliseconds(interval, units){

        if(units.indexOf('milli') < 0 && units.indexOf('seconds') > -1){
            return interval * 1000;
        }
        else if(units.indexOf('minutes') > - 1){
            return interval * 60 * 1000;
        }
        else{
            return interval ;
        }
    };

    Template.registerHelper("statusColorMS", function(status) {

        if (status === 'waiting'){
            return 'linear-gradient(#ffcc33, #ff6666);';
        }
        else if (status === 'connecting') {
            return 'linear-gradient(#ffff33, #ff9933);';
        }
        else if (status === 'connected') {
            return 'none';
        }
        else{
            return 'none';
        }
    });

    Template.registerHelper("statusColor", function(status) {

        if (status == 'waiting' || status === 'disconnected'){
            return 'linear-gradient(#ffcc33, #ff6666);';
        }
        else if (status == 'connecting') {
            return 'linear-gradient(#ffff33, #ff9933);';
        }
        else if (status == 'connected') {
            return 'linear-gradient(#74f283, #69db65);';
        }
        else {
            return 'none';
        }
    });

    Template.registerHelper("fromNow", function(timestamp) {
        return moment(new Date(timestamp)).fromNow();
    });

    Template.registerHelper("prettifyDateTime", function(timestamp) {
        if((new Date(timestamp)) == 'Invalid Date'){
            return timestamp;
        }
        else{
            return moment(new Date(timestamp)).format('MMM DD h:mm A');
        }

    });
    Template.registerHelper("prettifyDateTimeMilli", function(timestamp) {
        if((new Date(timestamp)) == 'Invalid Date'){
            return timestamp;
        }
        else{
            return moment(new Date(timestamp)).format('MMM DD h:mm:ss.SSS A');
        }

    });

    Template.registerHelper("prettifyDate", function(timestamp) {
        return moment(new Date(timestamp)).format('h:mm A');
    });


    Template.registerHelper("prettifyDateSecond", function(timestamp) {
        return moment(new Date(timestamp)).format('h:mm:ss A');
    });

    Template.registerHelper('computerTypeHelper', function(httpHeaders){
        if(httpHeaders['user-agent'].indexOf('Mac') > -1){
            return 'Mac'
        }
        else if (httpHeaders['user-agent'].indexOf('iPad') > -1){
            return 'iPad';
        }
        else if (httpHeaders['user-agent'].indexOf('iPhone') > -1){
            return 'iPhone';
        }
        else if (httpHeaders['user-agent'].indexOf('Windows') > -1){
            return 'PC';
        }
        else {
            return 'Unknown';
        }

    }) //this.httpHeaders

    Template.registerHelper("availableAnalytes", function (analyte) {

        for (i = 0; i < analytes.length; i++) {
            if (analyte === analytes[i].analyte) {
                console.log('There is this ' + analytes[i].analyte + " " + analyte);
                analytes[i].ifSelected = 'selected';
            }
            else {
                analytes[i].ifSelected = '';
            }
        }
        return analytes;
    });

    Template.registerHelper("arduinoBoardsHelp", function (board) {

        var tempBoards = JSON.parse(JSON.stringify(arduinoBoards));
        if(typeof board === 'undefined'){
            tempBoards[0]['ifSelected'] = 'selected';
            this.set('arduinoBoard', 'nano328');
            this.set('arduinoChip', 'atmega328p');
        }else{
            for (i = 0; i < tempBoards.length; i++) {
                if (board === tempBoards[i].board) {
                    tempBoards[i].ifSelected = 'selected';
                }
                else {
                    tempBoards[i].ifSelected = '';
                }
            }
        }

        return tempBoards;
    });

    Template.registerHelper("availableResolutions", function (resolution) {
        var resolutions = [{resolution: '8 nm @ 1550 nm', ifSelected: ''},
            {resolution: '16 nm @ 1550 nm', ifSelected: ''}];
        console.log("resolution length " + resolutions.length);

        for (i = 0; i < resolutions.length; i++) {

            if (resolution === resolutions[i].resolution) {
                console.log(resolutions[i].resolution);
                resolutions[i].ifSelected = 'selected';
            }
        }

        return resolutions;
    });

    Template.registerHelper("availableScanDurations", function (thisScanDuration) {
        scanDuration = [];

        for (i = 0; i < 99; i++) {
            scanDuration.push({scanDuration: i + 1, ifSelected: ''});
            if (thisScanDuration == scanDuration[i].scanDuration.toString()) {
                scanDuration[i].ifSelected = 'selected';
            }
        }
        for (i = 99; i < 108; i++) {
            scanDuration.push({scanDuration: ((i + 2) - 100) * 100, ifSelected: ''});
            if (thisScanDuration == scanDuration[i].scanDuration) {
                scanDuration[i].ifSelected = 'selected';
            }
        }

        return scanDuration;
    });

    Template.registerHelper("availableFeet", function (thisHeightFeet) {
        heightFeet = [];

        for (i = 0; i < 3; i++) {
            heightFeet.push({heightFeet: i + 4, ifSelected: ''});
            if (thisHeightFeet == heightFeet[i].heightFeet.toString()) {
                heightFeet[i].ifSelected = 'selected';
            }
        }

        return heightFeet;
    });

    Template.registerHelper("availableInches", function (thisHeightInches) {
        heightInches = [];

        if(typeof thisHeightInches === 'undefined'){
            
        }

        for (i = 0; i < 12; i++) {
            heightInches.push({heightInches: i, ifSelected: ''});
            if (thisHeightInches == heightInches[i].heightInches.toString()) {
                heightInches[i].ifSelected = 'selected';
            }
        }

        return heightInches;
    });

    Template.registerHelper("availableAges", function (thisAge) {
        ages = [];

        for (i = 0; i < 90; i++) {
            ages.push({ageOption: i + 1, ifSelected: ''});
            if (thisAge == ages[i].ageOption.toString()) {
                ages[i].ifSelected = 'selected';
            }
        }

        return ages;
    });

    Template.registerHelper("availableScanDurationUnits", function (thisScanDurationUnits) {
        var scanDurationUnits = [
            {scanDurationUnits: 'milliseconds', ifSelected: ''},
            {scanDurationUnits: 'seconds', ifSelected: ''},
            {scanDurationUnits: 'minutes', ifSelected: ''}
        ];

        for (i = 0; i < scanDurationUnits.length; i++) {
            if (thisScanDurationUnits == scanDurationUnits[i].scanDurationUnits) {
                console.log(scanDurationUnits[i].scanDurationUnits);
                scanDurationUnits[i].ifSelected = 'selected';
            }
        }

        return scanDurationUnits;
    });

    Template.registerHelper('locationsSelect', function(locationOption, mylocation){
        if(mylocation === locationOption){
            return {selected: 'selected'};
        }
    });

    Template.registerHelper('configureAsHelper', function(configureAsOption, configureAs){

        if(typeof configureAs === 'undefined'){
            if(configureAsOption.indexOf('Configure') > -1)
                return 'selected';
            else{
                return '';
            }
        }
        else if(configureAs.toLowerCase().indexOf(configureAsOption.toLowerCase()) > -1){
            return 'selected';
        }
        else{
            return '';
        }
    });
    
    Template.registerHelper("availableModeOptions", function (thisModeOption) {
        var modeOption = [{modeOption: 'Transmission', ifSelected: ''},
            {modeOption: 'Absorption', ifSelected: ''}];
        for (i = 0; i < modeOption.length; i++) {
            if (thisModeOption === modeOption[i].modeOption) {
                console.log(modeOption[i].modeOption);
                modeOption[i].ifSelected = 'selected';
            }
        }

        return modeOption;
    });

    Template.registerHelper('pathToQuery', function(path){
        if(typeof path !== 'undefined'){
            return path.split('/').join('.');
        }
    });

    Template.registerHelper('openClose', function(current){
        if(typeof current === 'undefined' || current.indexOf('Close') > -1){
            return 'Open Port'
        }
        else{
            return 'Close port'
        }
    });

    Template.registerHelper('openCloseColor', function(current){
        if(typeof current === 'undefined' || current.indexOf('Close') > -1){
            return '#007aff';
        }
        else {
            return '#ff9500;'
        }
    });

    Template.registerHelper('startStopLogging', function(current){
        if(typeof current === 'undefined' || current.indexOf('Stop') > -1){
            return 'Start Logging Data';
        }
        else if (current.indexOf('Start') > -1){
            return 'Stop Logging Data';
        }
        else{
            return 'Pending...';
        }
    });


    Template.registerHelper('loggingBtnColor', function(current){
        if(typeof current === 'undefined' || current.indexOf('Stop') > -1){
            return '#4cd964';
        }
        else if (current.indexOf('Start') > -1){
            return '#ff3b30';
        }
        else {
            return '#ffcc00';
        }
    });

    Template.registerHelper("statusTextColor", function(status) {

            if (status == 'waiting' || status == 'disconnected') {
                return '#ff6666';
            }
            else if (status == 'connecting') {
                return '#ff9933';
            }
            else if (status == 'connected') {
                return '#74f283';
            }
    });

    Template.registerHelper("statusTextColorPi", function(status, pi) {

        if (status == 'waiting' || status == 'disconnected') {
            return '#ff6666';
        }
        else if (status == 'connecting') {
            return '#ff9933';
        }
        else if (status == 'connected') {
            if(typeof pi !== 'undefined'){
                //console.log('pi', pi)
                if(typeof piConnections !== 'undefined') {
                    //console.log('piConnections')
                    if (typeof piConnections.get(pi) !== 'undefined') {
                        //console.log('piConnections.get')
                        if (typeof piConnections.get(pi).ddp !== 'undefined') {
                            //console.log('piConnections.get.ddp')
                            Meteor.setTimeout(function(){
                                var piHere = pi;
                                //console.log('setTimeout', piHere);
                                piConnections.get(piHere).ddp.reconnect();
                            }, 3000);
                        }
                    }
                }
            }
            return '#74f283';
        }
    });

    Template.registerHelper("oDriveAlias", function(folderPath){
        if(typeof folderPath !== 'undefined'){
            //console.log('oDriveAlias', folderPath, defaultFolder);
            return folderPath.replace(defaultFolder.substring(0,defaultFolder.length -1), 'O:')
        }

    });

    Template.registerHelper("selectHelper", function(options, value){
        var tempA = new Array();

        for(var i = 0; i<options.length; i++){
            if(options[i] === value){
                tempA.push({option: options[i], isSelected: 'selected'})
            }
            else{
                tempA.push({option: options[i], isSelected: ''})
            }
        }
        return tempA;

    });
}

addNestedField = function (obj,access,value){
    if (typeof(access)=='string'){
        access = access.split('.');
    }
    if (access.length > 1){
        var aShift = access.shift();
        //console.log(aShift, access, obj[aShift]);
        if(typeof obj[aShift] !== 'undefined') {
            addNestedField(obj[aShift], access, value);
        }
        else{
            //console.log('else', aShift, access, obj[aShift]);

            obj[aShift] = dotToObjects(access, value);

        }
    }else{
        //console.log('last else', access[0], access, obj, obj[access[0]]);

        obj[access[0]] = value;
    }

    return obj;
}

//this one as well
dotToObjects = function(array, x){
    var splitted = array; //dot.split('.');
    var bracketNotation = x;
    for(var s = splitted.length -1; s > 0; s--){
        var tempObj = {};
        tempObj[splitted[s]] = bracketNotation;
        bracketNotation = tempObj;
    }

    //obj[splitted[0]] = bracketNotation;
    var tempObj={}
    tempObj[splitted[0]] = bracketNotation;
    return tempObj;
};

