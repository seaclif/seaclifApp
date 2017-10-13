Meteor.methods({

    'saveMox': function (obj, folderPath) {
        console.log('saveMox', folderPath);
        //console.log(obj);


        appendToFile(obj.data, obj.filename, folderPath, function () {
            console.log('ya it was really saved!');
            return 'file was saved';
        });
    }
});