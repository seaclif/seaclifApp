toInterPSD = function toInterPSD(xData, yData) {
    var header = "x_Axis:Wavelength (nm)    y_Axis:PSD (a.u.)\n";
    var xArray = xData.trim('{').trim('}').split(',');
    var yArray = yData.trim('{').trim('}').split(',');
    var fileData = header;

    if (xArray.length == yArray.length) {
        for (i = 0; i < xArray.length; i++) {
            fileData = fileData + xArray[i] + '\t' + yArray[i] + '\n';
        }
    }
    else {
        fileData = 'Error - mismatched x and y lengths, please validate data and rerun.';
    }

    return fileData;
};


Meteor.methods({
    'newScanFile': function (file) {
        var uidSt = 'UniqueID:';
        var uid = file.substring(file.indexOf(uidSt) + uidSt.toString().length, file.indexOf(',{'));
        console.log(uid);
        //console.log(file.substring(file.indexOf(',{')));

        if (spectraDB.update({_id: uid}, {$set: EJSON.parse(file.substring(file.indexOf(',{') + 1))}) == 1) {
            if (spectraDB.update({_id: uid}, {$set: {dataComplete: "Successful Scan"}}) == 1) {
                var scanObj = spectraDB.findOne({_id: uid}).Scan;
                var controlDB = spectroCompDB.findOne({_id: spectraDB.findOne({_id: uid}).controlComp}).controlDB;
                //console.log(scanObj.Wavelength);
                //console.log(scanObj.SamplePSD);
                var spectraDetails = spectraDB.findOne({_id: uid});
                if (spectraDetails.typeSub == 'sample') {
                    var additionalBackgroundDetail = '';
                    if (spectraDetails.analyte == 'None') {
                    }
                    else {
                        additionalBackgroundDetail = ' ' + spectraDetails.analyte;
                    }

                    writeToFile(toInterPSD(scanObj.Wavelength, scanObj.SamplePSD), spectraDetails.barcode + additionalBackgroundDetail + ' (' + spectraDetails.sessionSNum + ')' + '.interPSD', spectroCompDB.findOne({_id: spectraDB.findOne({_id: uid}).controlComp}).saveSessionFoldersPath + '/' + controlDB.sessionFolder);
                }
                else {
                    var additionalBackgroundDetail = '';
                    if (spectraDetails.analyte == 'None') {
                    }
                    else {
                        additionalBackgroundDetail = ' ' + spectraDetails.analyte;
                    }

                    writeToFile(toInterPSD(scanObj.Wavelength, scanObj.SamplePSD), spectraDetails.backgroundNumber + additionalBackgroundDetail + ' (' + spectraDetails.sessionBNum + ')' + '.interPSD', spectroCompDB.findOne({_id: spectraDB.findOne({_id: uid}).controlComp}).saveSessionFoldersPath + '/' + controlDB.sessionFolder);
                }

            }

        }
    },
})