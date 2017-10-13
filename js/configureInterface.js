if (Meteor.isClient) {
    Template.configureInterface.onCreated(function(){
        subs.addCollection('locations');
        subs.addCollection('spectroCompDB');
        subs.addCollection('interfaces', iid());
    });

    Template.configureInterface.helpers({
        interfaceConfig: function () {
            return subs.interfaces;
        },
        interfaceConfigIsReady: function(){
            return subs.interfaces.isReady;
        },
        locationsReady:function(){
            return subs.locations.isReady;
        },
        locations: function(){
            return subs.locations;
        },
        mylocation: function () {
            return subs.interfaces[0].location;
        },
        configOptions: function(){
            return configOptions;
        },
        imConfiguredAs:function(event){
            //return console.log('imConfiguredAs', event, this, Template.currentData());
            if(typeof subs.interfaces[0].configureAs === 'undefined'){
                subs.interfaces[0].set('configureAs', 'Configure')
            }
            return subs.interfaces[0].configureAs;
        }

    });

    Template.configureInterface.events({
        'change .select': function (event) {
            console.log($(event.target).attr('name'), $(event.target).val());
            this.set($(event.target).attr('name'), $(event.target).val());
        }
    });

    Template.computerList.onCreated(function(){
        subs.addCollection('connections');
    })
    Template.computerList.helpers({
        computerListReady:function(){
            //console.log('subs.spectroCompDB.isReady', subs.spectroCompDB.isReady)
            return subs.spectroCompDB.isReady;
        },

        controlComputerList:function(){
            //console.log(Template.currentData().configureAs, this.configureAs);
            if(this.configureAs === 'Configure'){
                //console.log('this.configureAs', this.configureAs);
                return configOptions;
            }
            else{
                //console.log('[this.configureAs]', [{configureAsOption: this.configureAs}], );
                return [{configureAsOption: this.configureAs}];
            }

        },

        controlComputer:function(){
            if(this.configureAsOption === 'Configure'){
                return subs.spectroCompDB.find({configureAs: 'Configure'}).fetch().concat(subs.spectroCompDB.find({configureAs:{$exists:false}}).fetch());
            }
            else{
                return subs.spectroCompDB.find({configureAs: this.configureAsOption}).fetch()
            }
        },
        controlComputerReady: function(){
            return subs.connectionList.isReady && subs.connections.isReady;
        }

    });
    Template.controlComputerConfig.events({
        'change [type=checkbox]': function (event) {
            console.log($(event.target).attr('name'), $(event.target).prop('checked'));
            if($(event.target).prop('checked')){
                subs.connectionList[0].set(this._id, {clientAddress: subs.interfaces[0].clientAddress, status: 'connected'});
                connectEm()
            }
            else{
                piConnections.remove(this._id);
                subs.connectionList[0].unset(this._id);
            }
        },
        'click [name=delete]':function(event){
            console.log(this, $(event.target)._id)
            subs.spectroCompDB.remove({_id: this._id});
            //subs.spectroCompDB.pluck(this._id)
        },
        'click [name=clearConnected]':function(event){
            console.log(this, $(event.target)._id)
            for(c=0; c<subs.connections.length; c++){
                if(typeof subs.connections[c][this._id] !== 'undefined'){
                    subs.connections.unset(subs.connections[c]._id, this._id);
                }
            }
            //subs.spectroCompDB.pluck(this._id)
        }
    });

    Template.controlComputerConfig.helpers({
        ischecked: function(){
            //console.log(this);
            if(typeof subs.connectionList[0][this._id] !== 'undefined'){
                return 'checked'
            }
            else{
                return 'unchecked';
            }

        },

        clients: function(){
            var limit = {}
            limit[this._id] = {$exists:true};
            //console.log(limit, subs.connections.find({},{fields:limit}).fetch());
            var temp = subs.connections.find(limit).fetch();
            //console.log(temp);
            var array = new Array();
            for(i=0;i<temp.length; i++){
                array.push(temp[i][this._id])
            }
            return array;
        },

        thisConnectionStatus: function(){
            if(subs.connectionList[0][this._id]){
                return subs.connectionList[0][this._id].status;
            }
            else{
                return 'undefined'
            }
        }

    })
}