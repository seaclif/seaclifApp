Meteor.methods({

    'saveFlowvolume': function (obj, folderPath) {
        console.log('saveflowvolume', folderPath);
        //console.log(obj);
        try {
            var data = 'Start:,' + obj.startDateTime.toString() + '\n' + 'End:,' + obj.endDateTime.toString() + '\n';
        }
        catch (er) {
        }

        for (i = 0; i < obj.data.length; i++) {
            data = data + ',' + (i + 1)
            if (i === obj.data.length - 1) {
                data = data + '\n';
            }
        }

        for (i = 0; i < obj.data.length; i++) {
            if (i === 0)
                data = data + 'Value';
            data = data + ',' + obj.data[i]
        }

        writeToFile(data, obj.filename, folderPath, function () {
            console.log('ya it was really saved!');
            return 'file was saved';
        });
    }
});