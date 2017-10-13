psdData = undefined;
tempArray = undefined;
excludeFromQueryable = ['_id', 'stats', 'data'];

Array.prototype.unique = function () {
    return this.reduce(function (accum, current) {
        if (accum.indexOf(current) < 0) {
            accum.push(current);
        }
        return accum;
    }, []);
}

parsePSD = function (data) {
    var lineArray = data.split('\n');
    var xArray = new Array();
    var yArray = new Array();

    for (var l = 0; l < lineArray.length; l++) {
        var temp = lineArray[l].split('\t');
        if(temp[0]) {
            if (temp[0].toString().length > 0) {
                xArray.push(temp[0]);
            }
        }
        if(temp[1]) {
            if (temp[1].toString().length > 0) {
                yArray.push(temp[1]);
            }
        }
    }
    return {x: xArray, y: yArray};

};

parseAURaw = function (data) {
    var lineArray = data.split('\n');
    var columns = lineArray[0].split(',');
    var idColumn = columns.indexOf('S.ID');
    var userData = {};

    for (var l = 1; l < lineArray.length; l++) {
        var data = lineArray[l].split(',');
        userData[data[idColumn]] = new Array();

        for (var u = 1; u < data.length; u++) {
            var tempData = {};
            tempData[userData[data[idColumn]]] = data[u];
            userData[data[idColumn]].push(tempData);
        }

    }
    return userData;
};

parseAU = function (data, columns) {
    var idColumn = columns.indexOf('S.ID');
    var userData = {};

    for (var l = 1; l < data.length; l++) {
        userData[data[idColumn]] = new Array();

        for (var u = 1; u < data.length; u++) {
            var tempData = {};
            tempData[userData[data[idColumn]]] = data[u];
            userData[data[idColumn]].push(tempData);
        }

    }
    return userData;
};

parseAUColumns = function (data) {
    var lineArray = data.split('\n');
    var columns = lineArray[0].split(',');

    return columns;
};

parseDateCreated = function (stats) {
    var earliest = undefined;

    for (var s in stats) {

        if (s.indexOf('time') > -1) {
            if (typeof earliest === 'undefined') {
                earliest = stats[s];
            }
            else {
                if (stats[s] < earliest) {
                    earliest = stats[s];
                }
            }

        }
    }

    return earliest;
};

parseFileName = function (filename) {
    if (filename.indexOf())

        return earliest;
};

parseDateFromFilename = function(filename){
    //20151104
    if(filename.indexOf('AU_') > -1){
        var parse = filename.substring(filename.indexOf('_') + 1);
        var parseTime = parse.substring(parse.indexOf('_') + 1);
        parse = parse.substring(0, parse.indexOf('_'));

        //console.log(parse)
        var dateTime = new Date();
        dateTime.setDate(parse.substring(6));
        dateTime.setYear(parse.substring(0, 4))
        dateTime.setMonth(Number(parse.substring(4, 6)) - 1);
        if(Number(parseTime.substring(0,2)) < 7)
            dateTime.setHours(Number(parseTime.substring(0,2)) + 12);
        else
            dateTime.setHours(parseTime.substring(0,2));


        dateTime.setMinutes(parseTime.substring(2,4));
        dateTime.setSeconds(0);

        return dateTime;

    }
};

parseGoogleSpreadsheet = function(r){
    //console.log(data);
    if(typeof r !== 'undefined'){
        var lineArray = r.data.content.toString().split('\r\n');
        var columns = lineArray[1].split(',');;
        var xArray = new Array();
        var tempO = new Object();
        var dateTime = undefined;

        for (var l = 2; l < lineArray.length; l++) {
            var temp = lineArray[l].split(',');


            if(temp[0].toString().indexOf('/') > -1) {
                //console.log(temp[0]);
                dateTime = temp[0].toString();
            }

            //console.log(columns.length);
            for (var c = 1; c < columns.length; c++) {
                //console.log(c, columns[c], temp[c])
                if(typeof temp[c] !== 'undefined'){
                    if (temp[c].toString().length > 0) {
                        tempO[columns[c].toString()] = temp[c];
                    }
                }

            }
            //console.log(tempO['Time'].toString());
            if(typeof tempO['Time'] !== 'undefined'){
                var min = tempO['Time'].toString().substring(tempO['Time'].toString().length - 2);
                var hour = tempO['Time'].substring(0, tempO['Time'].toString().length - 2);
                if(Number(hour) < 7)
                    hour = Number(hour) + 12;

                tempO['dateTime'] = new Date(dateTime + ' ' + hour + ':' + min + ':' + '00');
                xArray.push(tempO);
            }
            else if(typeof tempO[columns[1].toString()] !== 'undefined'){
                tempO['dateTime'] = new Date(dateTime + ' ' + 12 + ':' + 00 + ':' + '00');
                xArray.push(tempO);
            }
            else{
                console.log(tempO['Time'], tempO, dateTime);
            }

            tempO = new Object();
        }
        tempArray = xArray;
        return xArray;
    }
};

validGlucose = function(gSheet){
    var didntFind = 0;
    var errorReport = new Array();
    for(var g = 0; g< gSheet.length; g++){
        var fetch = urinalysis.find({dateTime: gSheet[g].dateTime, user: 'USER ' + gSheet[g]['User#']}).fetch();
        if(fetch.length == 1){
            //console.log(gSheet[g]['Spiked?'], fetch[0].user, 'uriDate:', fetch[0].dateTime, 'gSheet Date:', gSheet[g].dateTime);
            urinalysis.update({_id: fetch[0]._id}, {$set:{validGlucose: gSheet[g]['Spiked?']}});
        }
        else{
            if(gSheet[g]['Spiked?'].toUpperCase().indexOf('N') > -1){
                didntFind += 1;
                errorReport.push(gSheet[g])
            }

        }


    }
    errorReport.push('didnt find ' + didntFind  + ' entries that were spiked');
    return errorReport;
    //console.log('foundNum:', foundNum, 'gSheet length:', gSheet.length);
};
parseSerialData = function(data){
    var lineArray = data.split(" ").join("").split(/(\r\n|\n|\r)/gm);
    var jsonPortion;
    var dataArray = [];
    var previous = {};

    for (var la = 0; la < lineArray.length; la++) {
        //console.log(lineArray[la]);
        if(lineArray.length > 0){
            if(lineArray[la].indexOf('data:,') > -1 && lineArray[la].indexOf('timestamp:,') > -1){
                if(lineArray[la].indexOf(':{') > -1 && lineArray[la].indexOf('}') > -1){
                    //timestamp
                    var timeStamp = lineArray[la].substring(lineArray[la].indexOf('timestamp:') + ('timestamp:').length + 1);
                    timeStamp = timeStamp.substring(0, timeStamp.indexOf(','));
                    if(timeStamp > 1400000000){
                        if(timeStamp < 1400000000000) {
                            timeStamp *= 1000;
                        }
                        jsonPortion = lineArray[la].substring(lineArray[la].indexOf('data:,') + 6, lineArray[la].indexOf('}') + 1);
                        if(jsonPortion.indexOf(':{') > -1){
                            var jsonModule = jsonPortion.substring(0, jsonPortion.indexOf(':{'));
                            jsonPortion = jsonPortion.substring(jsonPortion.indexOf(':{') + 1);
                        }
                        jsonData = JSON.parse(jsonPortion.split(':').join('":').split(',').join(', "').split('{').join('{"'));

                        var mod = {};
                        mod[jsonModule] = jsonData;
                        if(typeof previous[jsonModule] === 'undefined'){
                            previous[jsonModule] = {};
                        }
                        for (var p in mod[jsonModule]) {
                            if (typeof previous[jsonModule][p] !== 'undefined' && previous[jsonModule][p] === mod[jsonModule][p]) {
                                //console.log('deleting', p + ':', mod[jsonModule][p], 'at', dataArray.length -1);
                                delete mod[jsonModule][p];
                            }
                            else{
                                previous[jsonModule][p] = mod[jsonModule][p];
                            }
                        }
                        if (!_.isEmpty(mod[jsonModule])) {
                            mod['date'] = Number(timeStamp);
                            dataArray.push(mod);
                        }
                    }
                }
            }
        }
    }
    return dataArray;

};

minimizeSerialPortData = function (dataArray) {
    var dataArrayTemp = new Array();

    for(var i=0;i<dataArray.length;i++){
        if(typeof dataArray[i]['data'] !== 'undefined' && typeof dataArray[i]['timestamps'] !== 'undefined'){
            if(dataArray[i]['data'].length > 3){
                var dataTempA = [dataArray[i].data[0]];
                var tsTempA = [dataArray[i].timestamps[0]];
                var dataTemp = undefined;
                var tsTemp = undefined;

                for(var d=1; d< dataArray[i].data.length-1; d++){
                    if(dataArray[i].data[d] !== dataTempA[dataTempA.length-1]){
                        if(typeof dataTemp !== 'undefined'){
                            dataTempA.push(dataTemp);
                            tsTempA.push(tsTemp);
                            dataTemp = undefined;
                        }
                        dataTempA.push(dataArray[i].data[d]);
                        tsTempA.push(dataArray[i].timestamps[d]);
                    }
                    else{
                        dataTemp = dataArray[i].data[d];
                        tsTemp = dataArray[i].timestamps[d];
                    }
                }

                //get last in array no matter what
                dataTempA.push(dataArray[i].data[dataArray[i].data.length-1]);
                tsTempA.push(dataArray[i].timestamps[dataArray[i].timestamps.length-1]);

                var tempDA = dataArray[i];
                tempDA['data'] = dataTempA;
                tempDA['timestamps'] = tsTempA;
                dataArrayTemp.push(tempDA)
            }
            else{
                dataArrayTemp.push(dataArray[i])
            }
        }
        else{
            dataArrayTemp.push(dataArray[i])
        }
    }

    return dataArrayTemp;

};

Meteor.methods({
/*
{_id:'2342353525',
    port:'/dev/ttyUSB0',
    date:145524634636,
    module: 'mox',
    type: 'arduino'
    parameter: 'F',
    data: [234, ..],
    timestamps:[1423514534634, ..]
}
*/

    importSerialData: function (folderPath, files, inFile, interfaceID, toilet) {

        importSerialDataFut = new Future();

        for (var f = 0; f < files.length; f++) {
            console.log('Importing ' + files[f] + ' ...');
            interfaces.update({interfaceID: interfaceID}, {$set:{importStatus: 'Importing ' + files[f] + ' ...'}});
            if (files[f].toLowerCase().indexOf(inFile.toLowerCase()) > -1) {
                Meteor.call('readFile', folderPath + '/' + files[f], function (err, result) {
                    //var dateCreated = parseDateCreated(result.stats);
                    //var parsedData = parseSerialData(result.data);
                    //var parsedMinimum = minimizeSerialPortData(JSON.parse(JSON.stringify(parsedData)));
                    var lineArray = result.data.split(" ").join("").split(/(\r\n|\n|\r)/gm);
                    var jsonPortion;
                    var previous = {};

                    for (var la = 0; la < lineArray.length; la++) {
                        //console.log(lineArray[la]);
                        if(lineArray.length > 0){
                            if(lineArray[la].indexOf('data:,') > -1 && lineArray[la].indexOf('timestamp:,') > -1){
                                if(lineArray[la].indexOf(':{') > -1 && lineArray[la].indexOf('}') > -1){
                                    //timestamp
                                    var timeStamp = lineArray[la].substring(lineArray[la].indexOf('timestamp:') + ('timestamp:').length + 1);
                                    timeStamp = timeStamp.substring(0, timeStamp.indexOf(','));
                                    if(timeStamp > 1400000000){
                                        if(timeStamp < 1400000000000) {
                                            timeStamp *= 1000;
                                        }
                                        jsonPortion = lineArray[la].substring(lineArray[la].indexOf('data:,') + 6, lineArray[la].indexOf('}') + 1);
                                        if(jsonPortion.indexOf(':{') > -1){
                                            var jsonModule = jsonPortion.substring(0, jsonPortion.indexOf(':{'));
                                            jsonPortion = jsonPortion.substring(jsonPortion.indexOf(':{') + 1);
                                        }
                                        jsonData = JSON.parse(jsonPortion.split(':').join('":').split(',').join(', "').split('{').join('{"'));

                                        var mod = {};
                                        mod[jsonModule] = jsonData;
                                        if(typeof previous[jsonModule] === 'undefined'){
                                            previous[jsonModule] = {};
                                        }
                                        for (var p in mod[jsonModule]) {
                                            if (typeof previous[jsonModule][p] !== 'undefined' && previous[jsonModule][p] === mod[jsonModule][p]) {
                                                //console.log('deleting', p + ':', mod[jsonModule][p], 'at', dataArray.length -1);
                                                delete mod[jsonModule][p];
                                            }
                                            else{
                                                previous[jsonModule][p] = mod[jsonModule][p];
                                            }
                                        }
                                        if (!_.isEmpty(mod[jsonModule])) {
                                            mod['date'] = Number(timeStamp);
                                            if(files[f].indexOf('mox2') > -1 && typeof mod['mox'] !== 'undefined'){
                                                mod['mox2']= mod['mox'];
                                                delete mod['mox'];
                                            }
                                            mod['toilet'] = toilet;
                                            mod['filename'] = files[f];
                                            serialportData.insert(mod);
                                        }
                                    }
                                }
                            }
                        }
                    }

                });
            }
        }
        importSerialDataFut['return'](serialportData.findOne({}));

        return importSerialDataFut.wait();
    },

    importPSD: function (folderPath, inFile) {

        importDataFut = new Future();

        Meteor.call('getFiles', folderPath, function (err, files) {
            tempArray = new Array();

            for (var f = 0; f < files.length; f++) {
                if (files[f].toLowerCase().indexOf(inFile.toLowerCase()) > -1) {
                    Meteor.call('readFile', folderPath + '/' + files[f], function (err, result) {
                        var parsedData = parsePSD(result.data);
                        var dateCreated = parseDateCreated(result.stats);
                        tempArray.push({filename: files[f], path: folderPath, stats: result.stats, data: parsedData});
                        if (spectraDB.find({dateCreated: dateCreated, filename: files[f]}).count() == 0) {
                            spectraDB.insert({
                                filename: files[f],
                                path: folderPath,
                                dateCreated: dateCreated,
                                stats: result.stats,
                                data: parsedData
                            });
                        }
                    });
                }
            }

            importDataFut['return'](tempArray);
        });

        return importDataFut.wait();
    },

    importAU: function (folderPath, inFile) {

        var importDataFut = new Future();

        Meteor.call('getFiles', folderPath, function (err, files) {
            tempArray = new Array();

            for (var f = 0; f < files.length; f++) {
                if (files[f].toLowerCase().indexOf(inFile.toLowerCase()) > -1) {
                    Meteor.call('readFile', folderPath + '/' + files[f], function (err, result) {
                        var lineArray = result.data.split('\n');
                        var columns = lineArray[0].split(',');
                        var dateCreated = parseDateCreated(result.stats);
                        for(var i=1; i<result.data.length;i++){
                            var parsedData = result.data[i];
                            tempArray.push({filename: files[f], path: folderPath, stats: result.stats, columns: columns, data: parsedData});
                        }
                       /* if (spectraDB.find({dateCreated: dateCreated, filename: files[f]}).count() == 0) {
                            spectraDB.insert({
                                filename: files[f],
                                path: folderPath,
                                dateCreated: dateCreated,
                                stats: result.stats,
                                data: parsedData
                            });
                        }*/
                    });
                }
            }

            importDataFut['return'](tempArray);
        });

        return importDataFut.wait();
    },

    importUrinalysis: function (folderPath, files) {

        var importDataFut = new Future();

        for (var f = 0; f < files.length; f++) {
            Meteor.call('readFile', folderPath + '/' + files[f], function (err, result) {
                var lineArray = result.data.split('\n');
                var columns = lineArray[0].split(',');
                var idColumn = columns.indexOf('S.ID');

                var dateCreated = parseDateFromFilename(files[f]);
                for(var i=1; i<result.data.length;i++){
                    if(typeof lineArray[i] !== 'undefined'){
                        if(lineArray[i].indexOf(',') > -1){
                            var dataArray = lineArray[i].split(',');
                            if(dataArray.length > idColumn + 3) {
                                if(typeof dataArray[idColumn] !== 'undefined') {
                                    var sID = dataArray[idColumn].toString().toLocaleUpperCase();

                                    if (sID.toString().indexOf('USER ') > -1) {
                                        sID = sID.substring(sID.indexOf('USER '));
                                        //console.log(idColumn, sID.toString());
                                        var user = sID.substring(sID.indexOf('USER'), sID.lastIndexOf(' ')).trim();
                                        var ts = sID.substring(sID.indexOf('USER') + user.length);
                                        var hourHere = Number(ts.substring(0, ts.length - 2));
                                        var dateTime;
                                        if(hourHere < 8){
                                            dateTime = new Date(dateCreated.toDateString() + " " + (hourHere + 12) + ':' + ts.substring(ts.length - 2) + ':00 ');
                                        }
                                        else{
                                            dateTime = new Date(dateCreated.toDateString() + " " +  hourHere + ':' + ts.substring(ts.length - 2) + ':00 ');
                                        }
                                         //+ new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1]

                                        if (urinalysis.find({dateTime: dateTime, user: user}).count() === 0) {
                                            urinalysis.insert({
                                                filename: files[f],
                                                path: folderPath,
                                                stats: result.stats,
                                                type: "au480",
                                                dateCreated: dateCreated,
                                                dateTime: dateTime,
                                                columns: columns,
                                                urineBarcode: sID,
                                                user: user,
                                                data: dataArray
                                            });
                                        }
                                    }
                                }

                            }
                        }
                    }

                }
            });

        }
        importDataFut['return']('Done importing!');
        return importDataFut.wait();
    },

    importSpectra: function (folderPath, files, spectrometer, scanTime) {
        //console.log(folderPath, files);
        var importSpectraFut = new Future();

        for (var f = 0; f < files.length; f++) {
            Meteor.call('readFile', folderPath + '/' + files[f], function (err, result) {
                var sID = files[f].toString().toUpperCase();
                var user = undefined;
                var uNum = undefined;
                var background = undefined;
                sID = sID.substring(0, sID.indexOf('.INTERPSD')).trim();

                if(sID.length <=5){
                    if(sID.indexOf('P') > -1){
                        //user = 'P' + user.substring(sID.indexOf('P') + 1, sID.substring(sID.indexOf('P') + 2).indexOf(' ') + 1).split(' ').join('');
                        if(sID.substring(1, 2) === ' '){
                            uNum = sID.substring(2); //P 1
                            if(uNum.indexOf(' ') > -1){
                                uNum = uNum.substring(0, uNum.indexOf(' ')) //P 1 2
                            }
                        }
                        else{
                            uNum = sID.substring(1); //P1
                            if(uNum.indexOf(' ') > -1){
                                uNum = uNum.substring(0, uNum.indexOf(' ')) //P1 2
                            }
                        }
                        user = 'P ' + uNum;
                    }
                    else{
                        user = sID;
                    }
                }
                else{
                    if(sID.indexOf('U') > -1 && (sID.indexOf('S') > -1 || sID.indexOf('E') > -1)){
                        if(sID.substring(4, 5) === ' '){
                            uNum = sID.substring(5); //USER 1
                            if(uNum.indexOf(' ') > -1){
                                uNum = uNum.substring(0, uNum.indexOf(' ')) //USER 1 2
                            }
                        }
                        else{
                            uNum = sID.substring(4); //USER1
                            if(uNum.indexOf(' ') > -1){
                                uNum = uNum.substring(0, uNum.indexOf(' ')) //USER1 2
                            }
                        }
                        user = 'USER ' + uNum;
                    }
                    else if (sID.indexOf('B') > -1) {
                        if(sID.indexOf(' ') > -1){
                            uNum = sID.substring(sID.indexOf(' ') + 1); //Background 1
                            if(uNum.indexOf(' ') > -1){
                                uNum = uNum.substring(0, uNum.indexOf(' ')) //Background 1 2
                            }
                        }
                        else{
                            uNum = sID.substring(sID.length - 1)//Background1
                        }
                        background = 'BACKGROUND ' + uNum;

                    }
                    else{
                        user = sID;
                    }

                }
                //console.log(idColumn, sID.toString());
                console.log(user, background);

                var tempData = parsePSD(result.data);

                var xColumn = tempData.x[0];
                var yColumn = tempData.y[0];
                tempData.x.splice(0,1);
                tempData.y.splice(0,1);
                var dateCreated = parseDateCreated(result.stats);
                var folder = folderPath.substring(folderPath.lastIndexOf('/') + 1);

                if(typeof background !== 'undefined'){
                    if (spectraDB.find({dateTime: dateCreated, background: background}).count() === 0) {
                        spectraDB.insert({
                            filename: files[f],
                            path: folderPath,
                            stats: result.stats,
                            folder: folder,
                            spectrometer: spectrometer,
                            scanDuration: scanTime,
                            xTitle: xColumn,
                            yTitle: yColumn,
                            dateCreated: dateCreated,
                            dateTime: dateCreated,
                            x: tempData.x,
                            background: background,
                            y: tempData.y
                        });
                    }
                }
                if(typeof user !== 'undefined'){
                    if (spectraDB.find({dateTime: dateCreated, user: user}).count() === 0) {
                        spectraDB.insert({
                            filename: files[f],
                            path: folderPath,
                            stats: result.stats,
                            folder: folder,
                            spectrometer: spectrometer,
                            scanDuration: scanTime,
                            xTitle: xColumn,
                            yTitle: yColumn,
                            dateCreated: dateCreated,
                            dateTime: dateCreated,
                            x: tempData.x,
                            urineBarcode: sID,
                            user: user,
                            y: tempData.y
                        });
                    }
                }


            });

        }
        importSpectraFut['return']('Done importing!');
        return importSpectraFut.wait();
    },

    getFiles: function (folderPath, db) {
        console.log(db);
        if(typeof folderPath !== 'undefined' && typeof db !== 'undefined' && db) {
            var fileFut = new Future();
            fs.readdir(folderPath, Meteor.bindEnvironment(function (err, files) {
                var tempFiles = new Array();
                for(var f = 0; f< files.length; f++){
                    if(eval(db).find({filename: files[f]}).count() === 0){
                        tempFiles.push({name: files[f], ischecked: 'checked'})
                    }
                    else{
                        tempFiles.push({name: files[f], ischecked: ''})
                    }
                }
                fileFut['return'](tempFiles);
            }));
            return fileFut.wait();
        }
    },

    readFile: function (path) {
        if(typeof path !== 'undefined'){
            var statFut = new Future();
            fs.stat(path, function (err, stats) {
                if (stats.isFile()) {
                    fs.readFile(path, function (err, data) {
                        if (typeof data !== 'undefined') {
                            //Meteor.call('parsePSD', data.toString(), Meteor.bindEnvironment(function(err, result){
                            statFut['return']({stats: stats, data: data.toString()});
                            //}));
                        }
                    });
                }
            });
            return statFut.wait();
        }
    },

    getTheStats : function(path){
        var statFut = new Future();
        fs.stat(path, Meteor.bindEnvironment(function (err, statsOut) {
            statFut['return'](statsOut.isFile())
        }));
        return statFut.wait();
    },

    readAllInDir: function (folderPath) {
        if(typeof folderPath !== 'undefined') {
            var fileFut = new Future();
            var tempAll = new Array();
            var all = undefined;
            var stats = undefined;

            fs.readdir(folderPath, Meteor.bindEnvironment(function (err, allIn) {

                if(typeof allIn !== 'undefined'){
                    all = allIn;
                    for(var f = 0; f< all.length; f++){
                        //console.log(all[f]);
                        Meteor.call('getTheStats', folderPath+'/'+ all[f], function(err, isFile){
                            //console.log(all[f], isFile);
                            if (isFile) {
                                Meteor.call('readFileData', folderPath + '/' + all[f], function(err, result){
                                    if(all[f].indexOf('DS_Store') === -1){
                                        tempAll.push({type: 'file',
                                            fullpath: folderPath + '/' + all[f],
                                            subpath: (folderPath + '/' + all[f]).split(folderPath).join(''),
                                            name: all[f],
                                            data: result.data});
                                    }
                                });
                            }
                            else {
                                tempAll.push({type: 'folder',
                                    fullpath: folderPath + '/' + all[f],
                                    subpath: (folderPath + '/' + all[f]).split(folderPath).join(''),
                                    name: all[f]});
                            }
                        });
                    }
                    fileFut['return'](tempAll);
                }
                else{
                    fileFut['return']('error finding directory');
                }

            }));
            return fileFut.wait();
        }
    },

    readFileData: function (path) {
        if(typeof path !== 'undefined'){
            var fFut = new Future();
            fs.readFile(path, function (err, data) {
                if (typeof data !== 'undefined') {
                    fFut['return']({data: data.toString()});
                }
            });

            return fFut.wait();
        }
    },

    /*getAllFilesDeeper: function(folderPath){
        if(typeof folderPath !== 'undefined') {
            var fileFut = new Future();
            var foldersFiles = new Array();

            Meteor.call('readAllInDir', folderPath, function(err, result){
                foldersFiles = result;

            });

            return fileFut.wait();
        }
    },*/

    getAllFiles: function(folderPath){
        if(typeof folderPath !== 'undefined') {
            var fileFut = new Future();
            var foldersFiles = new Array();
            Meteor.call('readAllInDir', folderPath, function(err, result1){
                foldersFiles = result1;
                for(var f=0; f< foldersFiles.length; f++){
                    console.log(foldersFiles[f].type, foldersFiles[f].name);
                    if(foldersFiles[f].type == 'folder'){
                        Meteor.call('readAllInDir', foldersFiles[f].fullpath, function(err, result2){
                            foldersFiles[f]['foldersFiles'] = result2;
                            if(Array.isArray(foldersFiles[f]['foldersFiles'])){
                                for(var g=0; g< foldersFiles[f]['foldersFiles'].length; g++){
                                    console.log(foldersFiles[f]['foldersFiles'][g].type);
                                    if(foldersFiles[f]['foldersFiles'][g].type == 'folder'){
                                        Meteor.call('readAllInDir', foldersFiles[f]['foldersFiles'][g].fullpath, function(err, result3){
                                            foldersFiles[f]['foldersFiles'][g]['foldersFiles'] = result3;
                                            if(Array.isArray(foldersFiles[f]['foldersFiles'][g]['foldersFiles'])){
                                                for(var h=0; h< foldersFiles[f]['foldersFiles'][g]['foldersFiles'].length; h++){
                                                    console.log(foldersFiles[f]['foldersFiles'][g]['foldersFiles'].type);
                                                    if(foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h].type == 'folder'){
                                                        Meteor.call('readAllInDir', foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h].fullpath, function(err, result4){
                                                            foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'] = result4;
                                                            if(Array.isArray(foldersFiles[f]['foldersFiles'][g]['foldersFiles'])){
                                                                for(var i=0; i< foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'].length; i++){
                                                                    console.log(foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'].type);
                                                                    if(foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'][i].type == 'folder'){
                                                                        Meteor.call('readAllInDir', foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'][i].fullpath, function(err, result5){
                                                                            foldersFiles[f]['foldersFiles'][g]['foldersFiles'][h]['foldersFiles'][i]['foldersFiles'] = result5;
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                            else{
                                                                //console.log(foldersFiles[f].name, result2);
                                                            }
                                                        })
                                                    }
                                                }
                                            }
                                            else{
                                                //console.log(foldersFiles[f].name, result2);
                                            }
                                        })
                                    }
                                }
                            }
                            else{
                                //console.log(foldersFiles[f].name, result2);
                            }

                        })
                    }
                }
                fileFut['return'](foldersFiles);
            });

            return fileFut.wait();
        }
    },

    alreadyImported:function(db, key, value){
        var mod = {};
        mod[key]=value;
        return eval(db).find(mod).count()
    },


    //https://docs.google.com/spreadsheets/d/1tAIh5SEEmSVYgNVlK8PeyXsLZg8pC00TEg3GvAKIlBE/export?format=csv&usp=sharing&gid=0
    getCSV: function () {
            var csvFut = new Future();
        HTTP.get('https://docs.google.com/spreadsheets/d/1tAIh5SEEmSVYgNVlK8PeyXsLZg8pC00TEg3GvAKIlBE/export?format=csv&usp=sharing', function( error, response ) {
            // Handle the error or response here.
            //console.log(error, response);
            if(response){
                //console.log(response);

                //{data: response});
                csvFut['return'](validGlucose(parseGoogleSpreadsheet({data: response})));

            }

        });
            return csvFut.wait();
    },

    /*getOldCSV: function () {
        var csvFut = new Future();
        fs.readFile(process.env.PWD + '/' + gSheet_2015_glucose.cs, function (err, data) {
            if (typeof data !== 'undefined') {
                //Meteor.call('parsePSD', data.toString(), Meteor.bindEnvironment(function(err, result){
                statFut['return']({stats: stats, data: data.toString()});
                //}));
            }
        });

        csvFut['return'](validGlucose(parseGoogleSpreadsheet({data: response})));

        return csvFut.wait();
    },*/

    getUrinalyisData: function(user){
        if(typeof user !== 'undefined'){
            //var tempArray = new Array();
            //var urinalysisUserData = urinalysis.find({user: user}).fetch();

            //for(var p = 0; p <urinalysisUserData.length; p++){
            //    var analyteColumn;
            //    for(var i=0; i< urinalysisUserData[p].columns.length; i++){
            //        if(urinalysisUserData[p].columns[i].indexOf(analyte) > -1 ){
            //            analyteColumn = i;
            //            i = urinalysisUserData[p].columns.length; //shortcircuit finishing the rest of the for loop after found
            //        }
            //    }
            //    tempArray.push({date: urinalysisUserData[p].dateTime, value: urinalysisUserData[p].data[analyteColumn].split(' ').join("")})
            //}
            //return tempArray;
            return urinalysis.find({user: user}).fetch();
        }
    },

    getUserHasUrinalysis: function(user){
        if(typeof user !== 'undefined'){
            if(typeof urinalysis.findOne({user: user.toUpperCase()}) !== 'undefined'){
                return typeof urinalysis.findOne({user: user.toUpperCase()}).user !== 'undefined';
            }
            else{
                return false;
            }
        }
        else
            return false
    },

    //6597275367\n2166.227667177558\t1.4548602030468147\n2160.3411789515317\t1.4040980840522044\n2154.4865958107416\t1.3432967861106864\n2148.6636590653075\t1.2760181931791803\n2142.8721128144575\t1.2045514932470225\n2137.1117039090423\t1.1300655365221068\n2131.382181914648\t1.0531235209662233\n2125.683299075304\t0.974204687033056\n2120.01481027777\t0.8940040308928413\n2114.376473016393\t0.8134687367032801\n2108.7680473585247\t0.7336712458137742\n2103.1892959104857\t0.6556638044042087\n2097.639983784073\t0.5804129736160399\n2092.119878563589\t0.5088204737851348\n2086.628750273396\t0.4417619493542155\n2081.1663713459784\t0.3800630781026347\n2075.732516590506\t0.32438293878316427\n2070.3269631618846\t0.27504846798005633\n2064.9494905302954\t0.23193511962194552\n2059.5998804512014\t0.1944867870689665\n2054.2779169358237\t0.16189914229124588\n2048.9833862220717\t0.13337936382824225\n2043.716076745922\t0.10833405520191017\n2038.4757791132406\t0.08641585276009608\n2033.26228607203\t0.0675129717427283\n2028.0753924851117\t0.05178098694695361\n2022.9148953032156\t0.03959477463076017\n2017.7805935384865\t0.031123657422298195\n2012.672288238389\t0.02572819004597098\n2007.5897824600095\t0.022238097
});


addDataToObj = function(myObj, data) {
    for(var i in data){
        var dateTime = (new Date()).getTime();

        if(typeof myObj[i] === 'undefined'){
            myObj[i] = {};
        }
        for(var j in data[i]){
            if(typeof myObj[i][j] === 'undefined') {
                myObj[i][j] = {};
            }

            //x
            var tempX = new Array();
            tempX[0] = dateTime;

            if(typeof myObj[i][j]['x'] === 'undefined') {
                myObj[i][j]['x'] = new Array();
            }
            if(typeof data[i][j]['x'] !== 'undefined')
                tempX = data[i][j]['x'];

            myObj[i][j]['x'] = myObj[i][j]['x'].concat(tempX);


            //y
            var tempY = new Array();
            tempY[0] = data[i][j];

            if(typeof myObj[i][j]['y'] === 'undefined') {
                myObj[i][j]['y'] = new Array();
            }
            if(typeof data[i][j]['y'] !== 'undefined')
                tempY = data[i][j]['y'];

            myObj[i][j]['y'] = myObj[i][j]['y'].concat(tempY);

        };
    };
    return myObj;
};

