if (Meteor.isClient) {

    countInDB = new ReactiveVar();
    selectedFiles = new ReactiveVar();
    filesFromFolder = undefined;
    importDataBtn = new ReactiveVar('Import Data');
    importGSheet = new ReactiveVar('Validate Glucose (Google Sheets)');
    errorsFromImport = new ReactiveVar(false);

    getSelectedFiles = function () {
        var tempArray = new Array();

        for (var f = 0; f < filesFromFolder.length; f++) {
            if (filesFromFolder[f].name.toLowerCase().indexOf(subs.interfaces[0].importFileType.toLowerCase()) > -1) {
                tempArray.push(filesFromFolder[f]); //{name: filesFromFolder[f], ischecked: ''}
            }
        }
        selectedFiles.set(tempArray);
    };

    databaseTypes = [
        {db: 'spectraDB', fileType: '.interPSD', alias: 'Spectra'},
        {db: 'urinalysis', fileType: '.csv', alias: 'Urinalysis'},
        {db: 'serialportData', fileType: '.csv', alias: 'USB Data'}];

    Template.importData.onCreated(function () {
        subs.addCollection('interfaces', iid());
        subs.addCollection('spectrometersSettings');
        if (subs.interfaces.isReady) {
            if (typeof subs.interfaces[0].folderPath === 'undefined') {
                subs.interfaces[0].set('folderPath', defaultFolder)
            }
            Meteor.call('getFiles', subs.interfaces[0].folderPath, subs.interfaces[0]['importToDatabase'], function (err, files) {
                filesFromFolder = files;
                getSelectedFiles();
            });
        }
    });

    Template.importData.helpers({
        importDataReady: function () {
            return subs.interfaces.isReady && subs.spectrometersSettings.isReady;
        },

        importSettings: function () {
            return subs.interfaces[0];
        },

        spectrometerOptions: function(){
            if(subs.spectrometersSettings.length > 0){
                return subs.spectrometersSettings.find().fetch();
            }
            else{
                return [{spectrometer:'Please Add A Spectrometer'}]
            }

        },

        errorsFromImport: function(){
          return errorsFromImport.get();
        },

        importGSheet: function(){
            return importGSheet.get();
        },

        selectedSpectrometer: function(spectrometer){
            if(typeof subs.interfaces[0].spectrometer === 'undefined'){
                if(subs.spectrometersSettings.length > 0) {
                    subs.interfaces[0].spectrometer = subs.spectrometersSettings[0].spectrometer;
                    return 'selected';
                }
            }
            else{
                if(subs.interfaces[0].spectrometer === spectrometer){
                    return 'selected'
                }
                else{
                    return '';
                }
            }

        },

        files: function () {
            return selectedFiles.get();
        },

        importDataBtn: function () {
            if(importDataBtn.get().indexOf( '..') > -1 && typeof subs.interfaces[0].importStatus !== 'undefined'){
                if(subs.interfaces[0].importStatus !== '') {
                    return subs.interfaces[0].importStatus;
                }
                else{
                    return importDataBtn.get();
                }
            }
            return importDataBtn.get();
            
            
            
        },

        databaseOptions: function () {
            Meteor.call('countInDB', 'spectraDB', function (err, result) {
                countInDB.set(result);
            });

            if (typeof subs.interfaces[0]['importToDatabase'] !== 'undefined') {
                for (var d = 0; d < databaseTypes.length; d++) {

                    if (databaseTypes[d].db === subs.interfaces[0]['importToDatabase']) {
                        databaseTypes[d].selected = 'selected';
                    }
                    else {
                        databaseTypes[d]['selected'] = '';
                    }
                }
            }
            return databaseTypes;
        },

        dbCount: function () {
            return countInDB.get();
        },
        importSpectra:function(db){
            if(db === 'spectraDB'){
                return true;
            }
            else{
                return false;
            }
        },
        importGSheetDisplay:function(db){
            //if(db === 'urinalysis'){
            //    return true;
            //}
            //else{
                return false;
            //}
        },

    });

    Template.importData.events({
        'click [name=importDataBtn]': function (event) {
            importDataBtn.set('Importing Data ......');

            console.log(this, Template.currentData(), event);
            var files = new Array();

            for (var i = 0; i < selectedFiles.get().length; i++) {
                if (selectedFiles.get()[i].ischecked === 'checked') {
                    files.push(selectedFiles.get()[i].name)
                }
            }
            if (subs.interfaces[0]['importToDatabase'] === 'urinalysis') {
                Meteor.call('importUrinalysis', this.folderPath, files, function (err, result) {
                    console.log(result);
                    subs.interfaces[0].importStatus = '';
                    importDataBtn.set('Import Data');
                });
            }
            if (subs.interfaces[0]['importToDatabase'] === 'spectraDB') {
                if($('#spectrometer').val().indexOf('Please Add') === -1){
                    var scanTime = toMilliseconds($('#scanDuration').val(), $('#scanDurationUnits').val());
                    var spectro = subs.spectrometersSettings.findOne({spectrometer: $('#spectrometer').val()}).spectrometerID;
                    Meteor.call('importSpectra', this.folderPath, files, spectro, scanTime, function (err, result) {
                        console.log(result);
                        subs.interfaces[0].importStatus = '';
                        importDataBtn.set('Import Data');
                    });
                }
                else{
                    importDataBtn.set('Import Data');
                }
            }
            if (subs.interfaces[0]['importToDatabase'] === 'serialportData') {
                Meteor.call('importSerialData', this.folderPath, files, subs.interfaces[0]['importFileType'], iid(), 'Bay 3 Bathroom 1', function (err, result) {
                    console.log(result);
                    subs.interfaces[0].importStatus = '';
                    importDataBtn.set('Import Data');
                });
            }

        },

        'click [name=importGSheet]': function (event) {
            importGSheet.set('Validating Glucose...');
            errorsFromImport.set('');

            var allErrors = new Array();
            Meteor.call('getOldCSV', function (err, results_old) {
                allErrors.concat(results_old);
                Meteor.call('getCSV', function (err, result) {
                    allErrors.concat(result);
                    errorsFromImport.set(allErrors);
                    importDataBtn.set('Validate Glucose (Google Sheets)');
                });
            });



        },

        'keyup .importData': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .importData': function (event) {
            $(event.target).blur();
            if ($(event.target).val().length > 0) {
                this.set($(event.target).attr('name'), $(event.target).val());
                if ($(event.target).attr('name') === 'importFileType') {
                    getSelectedFiles();
                }
            }
        },

        'change .select': function (event) {
            this.set('importToDatabase', databaseTypes[$(event.target).context.selectedIndex - 1].db);
            this.set('importFileType', databaseTypes[$(event.target).context.selectedIndex - 1].fileType);
            Meteor.call('getFiles', subs.interfaces[0].folderPath, subs.interfaces[0]['importToDatabase'], function (err, files) {
                filesFromFolder = files;
                getSelectedFiles();
            });
        },

        'change .selectSpectrometer': function (event) {
            this.set($(event.target).attr('name'), $(event.target).val());
        },

        'change .scanSelect': function(event){
            console.log(this, $(event.target).context.selectedIndex);
            this.set($(event.target).attr('name'), $(event.target).val());
            //toMilliseconds(toInsert.scanDuration, toInsert.scanDurationUnits)
        },

        'click [name=choosePath]': function (event) {
            currentFolderObj = this;
            if (typeof this.folderPath !== 'undefined' && this.folderPath.length > 2)
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + this.folderPath);
            else
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);
        },

        'change [type=checkbox]': function (event) {
            console.log($(event.target).attr('name'), $(event.target).prop('checked'), this);
            if ($(event.target).prop('checked')) {
                var i = selectedFiles.get().map(function (x) {
                    return x.name;
                }).indexOf(
                    this.name);
                selectedFiles.get()[i].ischecked = 'checked';
            }
            else {
                var i = selectedFiles.get().map(function (x) {
                    return x.name;
                }).indexOf(
                    this.name);
                selectedFiles.get()[i].ischecked = '';
            }

        },

        'mousedown #spectroLabel': function () {
            console.log('mousedown');
            clearTimeout(this.downTimer);
            this.downTimer = setTimeout(function () {
                FlowRouter.go('/importdata/spectrometerSettings');
            }, 3000);
        },

        'mouseup #spectroLabel': function () {
            clearTimeout(this.downTimer);
        }

    });

    Template.spectrometerSettings.onCreated(function () {
        subs.addCollection('spectrometersSettings');
    });

    Template.spectrometerSettings.helpers({
        spectrometersReady: function () {
            return subs.spectrometersSettings.isReady;
        },
        availableSpectrometers: function () {
            return subs.spectrometersSettings.find().fetch();
        }
    });

    Template.spectrometerSettings.events({

        'keyup #newSpectrometerID': function (event) {
            if (event.which == 13 || event.which == 27)
                $(event.target).blur();
        },

        'blur #newSpectrometerID': function (event) {
            $(event.target).blur();
            if ($(event.target).val().length > 0) {
                subs.spectrometersSettings.insert({
                    db: 'spectrometers',
                    spectrometer: $('#newSpectrometer').val(),
                    spectrometerID: $(event.target).val()
                });
            }

            $('#newSpectrometerID').val('');
            $('#newSpectrometer').val('');
        },

        'keyup .aSpectrometerSetting': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();

            }
        },
        'blur .aSpectrometerSetting': function (event) {
            $(event.target).blur();
            var mod = {};
            mod[$(event.target).attr('name')] = $(event.target).val();
            subs.spectrometersSettings.update({_id: this._id}, {$set: mod});
        },

        'click [class=swipeout-delete]': function (event) {
            //console.log($(event.target).context)
            //console.log('$(event.target).context.id', $(event.target).context.id)
            subs.spectrometersSettings.remove({_id: $(event.target).context.id});
        },

    });

    queryAble = new ReactiveVar();
    exportDatabases = JSON.parse(JSON.stringify(databaseTypes));

    countInDBExport = new ReactiveVar();

    Template.exportData2.onCreated(function () {

        subs.addCollection('interfaces', iid());
        if (typeof subs.interfaces[0]['exportToDatabase'] !== 'undefined') {
            Meteor.call('queryAble', subs.interfaces[0].exportToDatabase, function (err, result) {
                queryAble.set(result);
            });
        }

    });

    Template.exportData2.helpers({
        queryAble: function () {
            return queryAble.get();
        },

        dbCount: function () {
            return countInDBExport.get();
        },

        databaseOptions: function () {

            if (typeof subs.interfaces[0]['exportToDatabase'] !== 'undefined') {
                for (var d = 0; d < exportDatabases.length; d++) {

                    if (exportDatabases[d].db === subs.interfaces[0]['exportToDatabase']) {
                        exportDatabases[d].selected = 'selected';
                    }
                    else {
                        exportDatabases[d]['selected'] = '';
                    }
                }
            }
            return exportDatabases;
        }
    });

    Template.exportData2.events({
        'change .select': function (event) {

            console.log(this, $(event.target).context.selectedIndex);
            this.set('exportToDatabase', exportDatabases[$(event.target).context.selectedIndex - 1].db);

            Meteor.call('countInDB', subs.interfaces[0]['exportToDatabase'], function (err, result) {
                countInDBExport.set(result);
            });

            if (typeof subs.interfaces[0]['exportToDatabase'] !== 'undefined') {
                Meteor.call('queryAble', subs.interfaces[0].exportToDatabase, function (err, result) {
                    queryAble.set(result);
                });
            }
        }
    })
}