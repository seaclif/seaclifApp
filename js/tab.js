if (Meteor.isClient) {


    Template.tabComputers.onCreated(function () {
        subs.addCollection('connectionList');
        subs.addCollection('spectroCompDB');

    });
    Template.tabComputers.helpers({
        connectionListReady: function () {
            return subs.connectionList.isReady && subs.spectroCompDB.isReady;
        },

        controlComputer: function () {
            var list = new Array();
            for (var c in subs.connectionList[0]) {
                if(c.indexOf('_id') === -1){
                    list.push(subs.spectroCompDB.findOne({_id: c}))
                }
            }
            return list;
        },
        currentRoute: function(){
            return FlowRouter.current().path.substring(1, FlowRouter.current().path.lastIndexOf('/'))
        },

        'selectedClass': function(){
            if(FlowRouter.current().params.id.indexOf(Template.currentData()._id) > -1){
                return "tabSelected";
            }
            else{
                return "notSelected";
            }
        },

    });
}
