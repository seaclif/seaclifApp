if (Meteor.isClient) {
    Template.controlComputer.onCreated(function(){
        subs.addCollection('spectroCompDB');
        subs.addCollection('locations');

    });
    Template.controlComputer.helpers({
        controlComputerIsReady:function(){
            return subs.spectroCompDB.isReady;
        },
        thisControlComputer:function(){
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id});
        }

    });
    Template.connectionStatusToMaster.onCreated(function(){
        subs.addCollection('spectroCompDB');
    });
    Template.connectionStatusToMaster.helpers({
        connectionStatusIsReady:function(){
            return subs.spectroCompDB.isReady;
        },
        connectionStatus: function(){
            if(typeof subs.spectroCompDB.getOne({_id: this._id}).connectionStatus !== 'undefined'){
                return subs.spectroCompDB.getOne({_id: this._id}).connectionStatus;
            }
            else{
                return false;
            }
        }
    });

    Template.connectionStatus.onCreated(function(){
        subs.addCollection('connectionList');
    });
    Template.connectionStatus.helpers({
        connectionStatusIsReady:function(){
            return subs.connectionList.isReady;
        },
        connectionStatus: function(){
            if(typeof subs.connectionList[0][this._id].status !== 'undefined'){
                return subs.connectionList[0][this._id].status;
            }
            else{
                return false;
            }
        }
    })

    Template.currentControlComputer.helpers({

        configOptions: function(){
            return configOptions;
        },
        locationsReady:function(){
            return subs.locations.isReady && subs.spectroCompDB.isReady;
        },
        locations: function(){
            return subs.locations;
        },
        mylocation:function(){
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).location;
        },
        imConfiguredAs:function(event){
            //return console.log('imConfiguredAs', event, this, Template.currentData());
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).configureAs;
        }

    });
    Template.currentControlComputer.events({
        'change [class=select]': function (event) {
            this.set($(event.target).attr('name'), $(event.target).val());
        },

        'keyup [class=config]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                this.set($(event.target).attr('name'), $(event.target).val());

            }
        },
    })

}