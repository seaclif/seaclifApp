if (Meteor.isClient) {
    moduleViewNumber = new ReactiveVar(new Object());
    editing = new ReactiveVar(new Object());

    getUniqueArray = function(field, findSpecific) {
        var fieldQ = {};
        fieldQ[field] = 1;

        if(!findSpecific){
            findSpecific = {};
        }
        var distinctEntries = _.uniq(piConnections.get(FlowRouter.current().params.id).modules.find(findSpecific, {sort: fieldQ}, {fields: fieldQ}).fetch().map(
            function (x) {
                return x[field];
            }),
        true);

        var tempArrayH = new Array();
        for(var d = 0; d< distinctEntries.length; d++){
            var mod = new Object();
            if(typeof findSpecific !== 'undefined')
                mod = JSON.parse(JSON.stringify(findSpecific));
            else
                mod = new Object();
            mod[field] = distinctEntries[d];
            tempArrayH.push(mod);
        }
        return tempArrayH;
    };

    moduleTabsReady = new ReactiveVar(false);
    Template.modulesWithTabs.onRendered(function(){
        Tracker.autorun(function(){
            var s = FlowRouter.watchPathChange();
            moduleTabsReady.set(true);
        });
    });
    Template.modulesWithTabs.helpers({
        createdReady:function(){
            return moduleTabsReady.get();
        }
    })

    Template.modules.onCreated(function () {
        console.log('FlowRouter id', FlowRouter.current().params.id);
        piConnections.get(FlowRouter.current().params.id).addCollection('modules');
        //subs.addCollection('modules');
        piConnections.get(FlowRouter.current().params.id).addCollection('moduleErrors');
        moduleViewNumber = new ReactiveVar(new Object());
    });
    Template.modules.helpers({
        connectionReady: function () {
            if (typeof piConnections.get(FlowRouter.current().params.id) !== 'undefined') {
                return true;
            }
        },

        moduleErrorsReady: function () {
            return piConnections.get(FlowRouter.current().params.id).moduleErrors.isReady;//subs.moduleControl.isReady;
        },

        modulePi:function(){
            return piConnections.get(FlowRouter.current().params.id)
        },

        moduleControlReady: function () {
            return piConnections.get(FlowRouter.current().params.id).modules.isReady;//subs.moduleControl.isReady;
        },

        moduleErrors: function(){
            return piConnections.get(FlowRouter.current().params.id).moduleErrors.find({}, {sort: { timeStamp : 1 } })
        },

        uniqueModule: function(){
          return getUniqueArray('id');
        },

        uniqueRow:function(){
            return getUniqueArray('row', {id: this.id});
        },

        rowModule:function(module, row){
            return piConnections.get(FlowRouter.current().params.id).modules.find({id: module, row: row}).fetch();
        },

        aModuleNumber: function (module) {
            var tempO = moduleViewNumber.get();
            if (typeof tempO[module] === 'undefined') {
                tempO[module] = 0;
                moduleViewNumber.set(tempO);
            }
            return moduleViewNumber.get()[module];
        },
        countOfModules:function(module){
            return piConnections.get(FlowRouter.current().params.id).modules.find({id:module}).count()
        },

        aModuleEntry:function(module){
            //console.log('aModuleNumber', moduleViewNumber.get()[module]);
            if(piConnections.get(FlowRouter.current().params.id).modules.find({id:module}).count() == moduleViewNumber.get()[module]){
                piConnections.get(FlowRouter.current().params.id).modules.insert({id: module})
            }
            return piConnections.get(FlowRouter.current().params.id).modules.find({id:module}).fetch()[moduleViewNumber.get()[module]]
        },

        meToJson:function(){
            var tempS = this;
            delete tempS._id;
            delete tempS['_value'];
            return JSON.stringify(tempS).split(',').join(',\r');
        },

        editing: function(module){
            if(typeof editing.get()[module] === 'undefined'){
                return false;
            }
            else{
                return true;
            }

        }

    });

    Template.modules.events({
        'click .mButton': function () {
            var nextVal;
            if(this.bool.indexOf(this.value) === 0){
                nextVal = this.bool[1];
            }
            else{
                nextVal = this.bool[0];
            }
            console.log('nexVal', nextVal);
            piConnections.get(FlowRouter.current().params.id).ddp.call('changeValue', this._id, {variable: this.variable, id:this.id, value: nextVal});
        },
        'change .mSelect': function(event){
            piConnections.get(FlowRouter.current().params.id).ddp.call('changeValue', this._id, {variable: this.variable, id:this.id, value: this.options[$(event.target).context.selectedIndex]});
        },

        'keyup .mSend': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .mSend': function (event) {
            $(event.target).blur();
            piConnections.get(FlowRouter.current().params.id).ddp.call('changeValue', this._id, {variable: this.variable, id:this.id, value: $(event.target).val()});
        },

        'click .editModule': function(event){
            //console.log('editModule', $(event.target).attr('name'), $(event.target), $(event.target).id);
            var tempEditing = editing.get();
            if(typeof tempEditing[$(event.target).attr('name')] === 'undefined'){
                tempEditing[$(event.target).attr('name')] = true;
            }
            else{
                delete tempEditing[$(event.target).attr('name')];
            }
            editing.set(tempEditing);

        },



        'change #aModuleNumber': function(event){
            var tempO = moduleViewNumber.get();
            tempO[$(event.target).attr('name')] = $(event.target).val();
            moduleViewNumber.set(tempO);
        },
        'keyup .modifyEntry': function (event) {
            if (event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .modifyEntry': function (event) {
            $(event.target).blur();
            if($(event.target).val().length == 0){
                var tempO = moduleViewNumber.get();
                tempO[this.id] = tempO[this.id] - 1;
                moduleViewNumber.set(tempO);
                piConnections.get(FlowRouter.current().params.id).modules.remove({_id: $(event.target).attr('id')})
            }
            else if($(event.target).val().indexOf('{') > -1 && $(event.target).val().indexOf('}') > -1) {
                piConnections.get(FlowRouter.current().params.id).modules.update({_id: $(event.target).attr('id')}, {$set: JSON.parse($(event.target).val())})
            }
            else{
                var tempO = moduleViewNumber.get();
                tempO[this.id] = tempO[this.id] - 1;
                moduleViewNumber.set(tempO);
                piConnections.get(FlowRouter.current().params.id).modules.remove({_id: $(event.target).attr('id')})
            }
        },
        'keyup .newModule': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .newModule': function (event) {
            $(event.target).blur();
            if($(event.target).val().length > 0){
                piConnections.get(FlowRouter.current().params.id).modules.insert({id: $(event.target).val()})
            }
            $(event.target).val('');
        },
        'keyup .fileConfig': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur .fileConfig': function (event) {
            this.set($(event.target).attr('name'), $(event.target).val());
        },
        'click [name=choosePath]': function (event) {
            currentFolderObj = this;
            if (typeof this.folderPath !== 'undefined' && this.folderPath.length > 2)
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + this.folderPath);
            else
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);

        },

    })

}