Meteor.methods({
    queryGetFields: function(db){
        var findAll = eval(db).find({});
        for(var f=0;f<findAll.count();f++){

        }
    }
});