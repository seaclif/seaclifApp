if (Meteor.isClient) {
    //[{option:'serialportData', alias: 'USB data'}, {option:'spectraDB', alias:'Spectra'}, {option:'urinalysis', alias:'Urinalysis'}];
    selectedTemplate = new ReactiveVar();
    queryList = new ReactiveVar();
    
    resultOfQuery = new ReactiveVar();

    //uniqueFromDB('serialports', 'row', {id: this.id});
    databases = [{option:'serialportData'}, {option:'spectraDB'}, {option:'urinalysis'}];

    Template.exportdata.onCreated(function(){
        subs.addCollection('queryTemplates');
        subs.addCollection('searchBy');

    });

    Template.exportdata.helpers({

        savedTemplatesReady: function(){
            return subs.queryTemplates.isReady && subs.searchBy.isReady;
        },
        savedTemplates:function(){
            if(subs.queryTemplates.find().count() === 0){
                subs.queryTemplates.insert({name:"Untitled", owner: currentSession.getUserNameNumber()});
            }
            return subs.queryTemplates.find().fetch();
        },
        hasTemplates: function () {
            if (subs.queryTemplates.find().count() === 0) {
                return selectedTemplate.set(subs.queryTemplates.insert({name: "Untitled", owner: currentSession.getUserNameNumber()})) && true;
            }
            else if(subs.queryTemplates.find().count() > 0){
                return true;
            }
            else{
                return false;
            }
        },
        selectedTemplateName : function(){
            return subs.queryTemplates.findOne({_id: selectedTemplate.get()}).name;
        },

        selectedTemplate: function(templateIn){
            if(selectedTemplate.get() === templateIn){
                return 'selected';
            }
            else{
                return '';
            }
        },

        searchBy: function(){
            return subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy;
        },

        databasesSelectedHelper: function(){
            var tempGetOne = subs.queryTemplates.getOne({_id: selectedTemplate.get()});
            if(typeof tempGetOne['databases'] === 'undefined'){
                if(typeof tempGetOne.databases === 'undefined'){
                    tempGetOne.set('databases',[{type: 'databases', tID: Math.random(), chosen: '' , query:''}]);
                    console.log('tempGetOne.databasesSelected;', tempGetOne.databases);
                    return tempGetOne.databases;
                }
            }
            else {
                //console.log('tempGetOne.databasesSelected;', tempGetOne.databases);
                return tempGetOne.databases;
            }
        },

        andOrQueries: function () {
            return subs.searchBy.find({tID: this.tID}).fetch();
        },

        resultOfQueries: function () {
            return resultOfQuery.get();
        },
        thisTemplate: function () {
            return subs.queryTemplates.findOne({_id: selectedTemplate.get()});
        },
        dateOneRange: function () {
            //this.dateRangeSpan
            return (moment(this.dateOne)).diff(moment(this.dateMin), 'days');
        },
        dateTwoRange: function () {
            //this.dateRangeSpan
            //console.log('dateTwoHelper', (moment(this.dateTwo)).diff(moment(this.dateMin), 'days'), 'Date:', new Date((moment(this.dateTwo)).diff(moment(this.dateMin), 'days')));
            return (moment(this.dateTwo)).diff(moment(this.dateMin), 'days');
        },
        dateOneHelper: function () {
            //this.dateRangeSpan

            if(this.dateOne < this.dateTwo){
                return moment(this.dateOne).format('MMM DD, YYYY')
            }
            else{
                return moment(this.dateTwo).format('MMM DD, YYYY')
            }

        },
        dateTwoHelper: function () {
            if(this.dateOne > this.dateTwo){
                return moment(this.dateOne).format('MMM DD, YYYY')
            }
            else{
                return moment(this.dateTwo).format('MMM DD, YYYY')
            }
        },

        hourOneRange: function () {
            //this.dateRangeSpan
            return (Number(this.hourOne) - new Date('January 1, 2016 0:00:00').getTime()) / 60 / 1000;
        },
        hourTwoRange: function () {
            //this.dateRangeSpan
            //console.log('dateTwoHelper', (moment(this.dateTwo)).diff(moment(this.dateMin), 'days'), 'Date:', new Date((moment(this.dateTwo)).diff(moment(this.dateMin), 'days')));
            return (Number(this.hourTwo) - new Date('January 1, 2016 0:00:00').getTime()) / 60 / 1000;
        },
        hourOneHelper: function () {
            //this.dateRangeSpan
            if(typeof this.hourOne === 'undefined'){
                subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('hourOne', (new Date('January 1, 2016 0:00:00')).getTime());
            }
            if(this.hourOne < this.hourTwo){
                return moment(this.hourOne).format('hh:mm A');
            }
            else{
                return moment(this.hourTwo).format('hh:mm A');
            }

        },
        hourTwoHelper: function () {
            if(typeof this.hourTwo === 'undefined') {
                subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('hourTwo', (new Date('January 1, 2016 0:00:00').setHours(24)));
            }
            if(this.hourOne > this.hourTwo){
                return moment(this.hourOne).format('hh:mm A');
            }
            else{
                return moment(this.hourTwo).format('hh:mm A');
            }
        },

    });

    Template.tdBlock.helpers({
        'multi': function () {

            if (this.type === 'or') {
                return 'multiple'
            }
            else {
                return '';
            }
        },
        displayPlus: function () {
            var querTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()});
            for(var d = 0; d< querTemp['databases'].length; d++) {
                if (this.tID == querTemp['databases'][d].tID && this._id === querTemp['databases'][d].searchBy[querTemp['databases'][d].searchBy.length - 1]) {
                    return 'display: block;';
                }
            }
            return 'display: none;';
        }
    });

    Template.tdBlock.events({
        'change .selectAndOr': function (event) {
            console.log(this, $(event.target).context.selectedIndex, $(event.target).val());

            if(typeof this.fields !== 'undefined' && typeof $(event.target).val() !== 'undefined' && $(event.target).val() !== '..'){
                subs.searchBy.getOne({_id: this._id}).set('field', $(event.target).val());
                subs.searchBy.getOne({_id: this._id}).set('value', "");

                var tempA = [];
                for(var a = 0; a < this.fields.length; a++){
                    if($(event.target).val() === this.fields[a]['option']) {
                        tempA.push({option: this.fields[a]['option'], selected: 'selected'});
                    }
                    else{
                        tempA.push({option: this.fields[a]['option']})
                    }
                }
                subs.searchBy.getOne({_id: this._id}).set('fields', tempA);

                var thisTemp = this;
                var tempQ = getQuery(this.tID, this.database, [$(event.target).val()], $(event.target).val());
                console.log('getQuery', tempQ);
                Meteor.call('uniqueQueryValues', this.database, tempQ, $(event.target).val(), function (err, result){
                    console.log('uniqueQueryValues', result);
                    subs.searchBy.getOne({_id: thisTemp._id}).set('values', result);
                });
            }
            else if($(event.target).val() !== '..'){
                subs.searchBy.getOne({_id: this._id}).set('field', "");
            }


        },

        'change .selectValue': function (event) {
            console.log(this, $(event.target).context.selectedIndex, $(event.target).val(), $(event.target).val()[0], $(event.target).val().length);

            if(typeof this.value !== 'undefined' && typeof $(event.target).val() !== 'undefined' && $(event.target).val() !== '..'){
                subs.searchBy.getOne({_id: this._id}).set('value', $(event.target).val());

                var tempA = [];

                if(typeof $(event.target).val() === 'object'){

                    for(var a = 0; a < this.values.length; a++) {
                        var found = false;
                        for (var b = 0; b < $(event.target).val().length; b++) {
                            if ($(event.target).val()[b] === this.values[a]['option']) {
                                tempA.push({option: this.values[a]['option'], selected: 'selected'});
                                found = true;
                            }
                        }
                        if(!found) {
                            tempA.push({option: this.values[a]['option']})
                        }
                    }
                }
                else{
                    for(var a = 0; a < this.values.length; a++) {
                        if ($(event.target).val() === this.values[a]['option']) {
                            tempA.push({option: this.values[a]['option'], selected: 'selected'});
                        }
                        else {
                            tempA.push({option: this.values[a]['option']})
                        }
                    }
                }

                subs.searchBy.getOne({_id: this._id}).set('values', tempA);
            }
            else if($(event.target).val() !== '..'){
                subs.searchBy.getOne({_id: this._id}).set('value', "");
            }
        },

        'click #another':function(){
            console.log(this);
            var searchByTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            var tempFields = new Array();
            for(var f=0; f< this.fields.length; f++){
                tempFields.push({option: this.fields[f].option})
            }
            for(var a = 0; a < searchByTemp.length; a++){
                if(searchByTemp[a].tID === this.tID){
                    console.log('tID', this.tID, searchByTemp[a], searchByTemp[a]);
                    for(var q=0; q< searchByTemp[a].searchBy.length;q++){
                        if(searchByTemp[a].searchBy[q] === this._id){
                            var insertTemp = subs.searchBy.insert({qTid: this.qTid, tID: this.tID, database: this.database, field:"", value:"", type:"and", fields: tempFields})
                            console.log('insertTemp', insertTemp)
                            searchByTemp[a].searchBy.splice(q + 1, 0, insertTemp);
                        }
                    }
                }
            }
            subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases']= searchByTemp;

        },
        'click #remove':function(event){
            console.log(this);
            var searchBy = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            var tempThis = this;
            for(var a = 0; a < searchBy.length; a++){
                if(searchBy[a].tID == this.tID){
                    for(var q=0; q< searchBy[a].searchBy.length;q++){
                        if(searchBy[a].searchBy[q] === this._id){
                            searchBy[a].searchBy.splice(q, 1);
                        }
                    }
                }
            }
            subs.searchBy.remove({_id: this._id});
            subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases']= searchBy;

            /*
             var searchBy = subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy;
             for(var a = 0; a < searchBy.length; a++){
             for(var b=0; b < searchBy[a].select.length; b++){
             if(searchBy[a].select[b].chosen == this.chosen && searchBy[a].select[b].type == this.type && searchBy[a].select[b].tID == this.tID){
             searchBy[a].select.splice(b, 1);
             b = searchBy[a].select.length;
             }
             }
             }
             subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy = searchBy;*/
        },

        'click .andOrType': function () {
            subs.searchBy.getOne({_id: this._id}).set('value', "");
            var tempA = new Array();
            for(var a = 0; a < this.values.length; a++) {
                tempA.push({option: this.values[a]['option']})
            }
            subs.searchBy.getOne({_id: this._id}).set('values', tempA);

            if(this.type === 'and'){
                subs.searchBy.getOne({_id: this._id}).type = 'or';
            }
            else{
                subs.searchBy.getOne({_id: this._id}).type = 'and';
            }
        },
    });

    Template.tdDBBlock.helpers({
        availableOptions: function(){
            //console.log('availableOptionsHere',this);
            var tempType = JSON.parse(JSON.stringify(databases));
            for(var tt=0; tt< tempType.length;tt++){
                if(this.chosen === tempType[tt].option){
                    tempType[tt]['selected'] = 'selected';
                    tt = tempType.length;
                }
            }
            return tempType;
        },
    });
    Template.exportdata.events({
        'input input[type=range]': function (event) {
            var thisTemplate = subs.queryTemplates.getOne({_id: selectedTemplate.get()});
            if(event.target.id.indexOf('date') > -1){
                thisTemplate.set(event.target.id, moment(this.dateMin).add($(event.target).val(), 'days').valueOf());
            }
            else{
                var valOf = (new Date('January 1, 2016 0:00:00')).getTime() + ($(event.target).val() * 60 * 1000);
                thisTemplate.set(event.target.id, valOf);
            }
        },

        'click #anotherDB':function(){
            console.log(this);
            var searchBy = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            for(var a = 0; a < searchBy.length; a++){
                if(searchBy[a].tID == this.tID){
                    searchBy.splice(a + 1, 0, {type: 'databases', tID: Math.random(), chosen:""});
                    a = searchBy.length;
                }
            }
            subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases']= searchBy;
        },
        'click #removeDB':function(event){
            console.log(this);
            var searchBy = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            for(var a = 0; a < searchBy.length; a++){
                if(searchBy[a].tID == this.tID){
                    searchBy.splice(a,1);
                    a = searchBy.length;
                }
            }
            subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases']= searchBy;
            /*
            var searchBy = subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy;
            for(var a = 0; a < searchBy.length; a++){
                for(var b=0; b < searchBy[a].select.length; b++){
                    if(searchBy[a].select[b].chosen == this.chosen && searchBy[a].select[b].type == this.type && searchBy[a].select[b].tID == this.tID){
                        searchBy[a].select.splice(b, 1);
                        b = searchBy[a].select.length;
                    }
                }
            }
            subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy = searchBy;*/
        },



        'change .selectTemplate': function (event) {
            if ($(event.target).context.selectedIndex === 0) {
                selectedTemplate.set(subs.queryTemplates.insert({
                    owner: currentSession.getUserNameNumber()
                }));
                $("#templateNameDeclare").focus();
            }
            else {
                selectedTemplate.set(subs.queryTemplates[$(event.target).context.selectedIndex - 1]._id);
            }
        },

        'keyup #templateNameDeclare': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur #templateNameDeclare': function (event) {
            $(event.target).blur();

            if($(event.target).val().length > 0){
                if($("#selectTemplate")[0].options.selectedIndex === 0){
                    selectedTemplate.set(subs.queryTemplates.insert({name: $(event.target).val(), owner: currentSession.getUserNameNumber()}));
                }
                else{
                    subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('name', $(event.target).val());
                }
            }
            else{
                if($("#selectTemplate")[0].options.length > 2){
                    subs.queryTemplates.remove({_id: selectedTemplate.get()});
                    for(var t=0; t< subs.searchBy.length; t++){
                        if(subs.searchBy[t].qTid == selectedTemplate.get()){
                            subs.searchBy.remove({_id: subs.searchBy[t]._id})
                        }
                    }

                    selectedTemplate.set(subs.queryTemplates[0]._id);
                }
            }
        },

        'change .selectDB': function (event) {
            console.log(this, $(event.target).context.selectedIndex, $(event.target).val());
            var tempThis = this;
            var tempChosen = $(event.target).val();
            if($(event.target).val() !== '..') {

                for(var t=0; t< subs.searchBy.length; t++){
                    if(subs.searchBy[t].tID === this.tID){
                        subs.searchBy.remove({_id: subs.searchBy[t]._id})
                    }
                }
                var tempTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
                for (var t = 0; t < tempTemp.length; t++) {
                    if (tempTemp[t].tID === tempThis.tID) {
                        tempTemp[t].chosen = $(event.target).val();

                        //tempTemp[t]['searchBy'] = [subs.searchBy.insert({qTid: selectedTemplate.get(), tID: tempThis.tID, database: tempChosen, field:"", value:"", type:"and", fields: result})];
                        //tempTemp[t]['fields'] = result;
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'] = tempTemp;
                        t = tempTemp.length;
                    }
                }
                if(subs.queryTemplates.getOne({_id: selectedTemplate.get()}).dateOne === 'undefined'){
                    Meteor.call('getDateSpan', 'serialportData', function(err, result){
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateMin', result.dateMin);
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateRangeSpan', (moment(result.dateMax)).diff(moment(result.dateMin), 'days'));
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateMax', result.dateMax);
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateOne', result.dateMin);
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateRangeSpan', (moment(result.dateMax)).diff(moment(result.dateMin), 'days'));
                        subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set('dateTwo', result.dateMax);
                    });
                }



                /*
                Meteor.call('getDBQuery', $(event.target).val(), tempThis.tID, function(err, result){
                    console.log('getDBQuery', result);
                    console.log('getDBQuerytempThis', tempThis);
                    console.log('getDBQuerytempThis', $(event.target).val());
                    var tempTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
                    for (var t = 0; t < tempTemp.length; t++) {
                        if (tempTemp[t].tID === tempThis.tID) {
                            tempTemp[t].chosen = $(event.target).val();

                            tempTemp[t]['searchBy'] = [subs.searchBy.insert({qTid: selectedTemplate.get(), tID: tempThis.tID, database: tempChosen, field:"", value:"", type:"and", fields: result})];
                            tempTemp[t]['fields'] = result;
                            subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'] = tempTemp;
                            t = tempTemp.length;
                        }
                    }
                });
                */
                /*for(var t=0; t< subs.searchBy.length; t++){
                    if(subs.searchBy[t].tID === this.tID){
                        subs.searchBy.remove({_id: subs.searchBy[t]._id})
                    }
                }*/


            }
             //= changeEntry(subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy, this, $(event.target).val());
            //subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set(, $(event.target).val());
        },

        //'click .

        
        'change .selectAndOrOld': function (event) {
            console.log(this, $(event.target).context.selectedIndex, $(event.target).val());
            var tempTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            for (var t = 0; t < tempTemp.length; t++) {
                if (tempTemp[t].tID === this.tID) {
                    for(var o = 0; o< tempTemp[t].andOrs.length;o++){
                        if(this.qID == tempTemp[t].andOrs[o].qID){
                            tempTemp[t].andOrs[o]['value'] =  "";
                            tempTemp[t].andOrs[o]['field'] =  $(event.target).val();
                        }
                    }
                    /*var mod = {};
                    mod[$(event.target).val()] = '';
                    if(typeof tempTemp[t].query.or[0]['field'] === 'undefined'){
                        tempTemp[t].query.or[0]['field'] = $(event.target).val();
                    }
                    else{
                        tempTemp[t].query.or.push(mod);
                    }*/
                    subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'] = tempTemp;
                    t = tempTemp.length;
                }
            }
            //= changeEntry(subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy, this, $(event.target).val());
            //subs.queryTemplates.getOne({_id: selectedTemplate.get()}).set(, $(event.target).val());
        },

        'change .selectValueold': function (event) {
            console.log(this, $(event.target).context.selectedIndex, $(event.target).val());
            var tempTemp = subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'];
            for (var t = 0; t < tempTemp.length; t++) {
                if (tempTemp[t].tID === this.tID) {
                    for(var o = 0; o< tempTemp[t].andOrs.length;o++){
                        if(this.qID == tempTemp[t].andOrs[o].qID){
                            tempTemp[t].andOrs[o]['value'] =  $(event.target).val();
                        }
                    }
                    subs.queryTemplates.getOne({_id: selectedTemplate.get()})['databases'] = tempTemp;
                    t = tempTemp.length;
                }
            }
        },
        
        'click #getResult': function () {
            console.log(this);
            var thisDetails = subs.queryTemplates.getOne({_id: selectedTemplate.get()});
            var querTemp = thisDetails.databases[0];
            var hourOne;
            var hourTwo;

            var dateOne = new Date(new Date(new Date(new Date(thisDetails['dateOne']).setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0);
            var dateTwo = new Date(new Date(new Date(new Date(thisDetails['dateTwo']).setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0);
            if(thisDetails.hourOne < thisDetails.hourTwo){
                hourOne = thisDetails.hourOne - new Date('January 1, 2016 0:00:00').getTime();
                hourTwo = thisDetails.hourTwo - new Date('January 1, 2016 0:00:00').getTime();
            }
            else{
                hourTwo = thisDetails.hourOne - new Date('January 1, 2016 0:00:00').getTime();
                hourOne = thisDetails.hourTwo - new Date('January 1, 2016 0:00:00').getTime();
            }


            var tempQ;
            //new Date(new Date(new Date(new Date(1459701010268).setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0);
            if(thisDetails.dateOne < dateTwo){
                tempQ = getQuery(querTemp.tID, querTemp.chosen, undefined, dateOne + hourOne, dateTwo + hourTwo, 'date', 50);
            }
            else{
                tempQ = getQuery(querTemp.tID, querTemp.chosen, undefined, dateTwo + hourOne, dateOne + hourTwo, 'date', 50);
            }

            console.log(tempQ);
            Meteor.call('doQueryWithSpan', tempQ, hourOne, hourTwo, function (err, result) {
                console.log('result', result);
                resultOfQuery.set(queryToCells(result.fetch));
            });
        }

    });

    changeEntry = function(searchBy, searchByOne, newChosen){
        console.log('changeEntryB4', searchBy, searchByOne, newChosen);
        for(var a = 0; a < searchBy.length; a++){
            for(var b=0; b < searchBy[a].select.length; b++){
                if(searchBy[a].select[b].chosen == searchByOne.chosen && searchBy[a].select[b].type == searchByOne.type && searchBy[a].select[b].tID == searchByOne.tID){
                    searchBy[a].select[b].chosen = newChosen;
                    b = searchBy[a].select.length;
                    console.log('changeEntry', searchBy[a], subs.queryTemplates.getOne({_id: selectedTemplate.get()}).searchBy);
                }
            }
        }
        return searchBy;
    };
}

templateToQuery = function(databaseChosen, templateQuery, fields, callback) {
    var concatQuery = databaseChosen + '.find({';
    if (templateQuery.or[0].field.length > 0 && templateQuery.or[0].value.length > 0) {
        concatQuery += '$or:[{' + templateQuery.or[0].field + ':"' + templateQuery.or[0].value + '"}';
        for (var r = 1; r < templateQuery.or.length; r++) {
            if (templateQuery.or[r].field.length > 0 && templateQuery.or[r].value.length > 0) {
                concatQuery += ', {"' + templateQuery.or[r].field + '":"' + templateQuery.or[r].value + '"}';
            }
        }
        concatQuery += ']';
    }
    if (templateQuery.and[0].field.length > 0 && templateQuery.and[0].value.length > 0) {
        if (concatQuery.indexOf('$or') > -1) {
            concatQuery += ', ';
        }
        concatQuery += '$and:[{' + templateQuery.and[0].field + ':"' + templateQuery.and[0].value + '"}';
        for (var r = 1; r < templateQuery.and.length; r++) {
            if (templateQuery.and[r].field.length > 0 && templateQuery.and[r].value.length > 0) {
                concatQuery += ', {"' + templateQuery.and[r].field + '":"' + templateQuery.and[r].value + '"}';
            }
        }
        concatQuery += ']';
    }
    concatQuery += '}, {fields:{_id:0';
    for(var f=0; f< fields.length; f++){
        if(typeof fields[f].show === 'undefined' || fields[f].show === '1' || fields[f].show === 1){
            concatQuery += ', "' + fields[f]['option'] + '":1';
        }
        else if (typeof fields[f].show !== 'undefined'){
            if(fields[f].show === '0' || fields[f].show === 0) {
                concatQuery += ', "' + fields[f]['option'] + '":0';
            }
        }
    }
    concatQuery += '}})';

    //console.log(concatQuery);
    return callback && callback(concatQuery);

    //, sort:{"' + this.field + '":1}})';


};

getQuery = function(tID, database, fields, dateOne, dateTwo, sort, limit) {
    var querTemp = subs.searchBy.find({tID: tID}).fetch();
    var setFieldIndex;
    var concatQuery = database + '.find({';
    var tempOrs = new Array();
    var tempAnds = new Array();

    //'data.prox.rgb.x.0': { $gte: 1458445148740, $lt: 1458445148751 }



    if(dateOne && dateTwo){
        if(dateOne < dateTwo){
            concatQuery += 'date:{$gte: ' + dateOne + ', $lt: ' + dateTwo + '}';
        }
        else{
            concatQuery += 'date:{$gte: ' + dateTwo + ', $lt: ' + dateOne + '}';
        }
    }

    /*
    for(var a=0; a< querTemp.length; a++) {
        if (querTemp[a].type === 'or') {
            tempOrs.push(querTemp[a])
        }
        if (querTemp[a].type === 'and') {
            tempAnds.push(querTemp[a])
        }
    }

    if(tempOrs.length > 0){
        if(tempOrs[0].field.length > 0 && tempOrs[0].value.length > 0) {
            concatQuery += '$or:[{' + tempOrs[0].field + ':"' + tempOrs[0].value + '"}';
            for (var r = 1; r < tempOrs.length; r++) {
                if(tempOrs[r].field.length > 0 && tempOrs[r].value.length > 0) {
                    concatQuery += ', {"' + tempOrs[r].field + '":"' + tempOrs[r].value + '"}';
                }
            }
            concatQuery += ']';
        }
    }
    if(tempOrs.length > 0){
        if(tempOrs[0].field.length > 0 && tempOrs[0].value.length > 0) {
            concatQuery += '"' + tempOrs[0].field + '":{$in:' + JSON.stringify(tempOrs[0].value) + '}';
            for (var r = 1; r < tempOrs.length; r++) {
                if(tempOrs[r].field.length > 0 && tempOrs[r].value.length > 0) {
                    //concatQuery += ', {"' + tempOrs[r].field + '":"' + tempOrs[r].value + '"}';
                    concatQuery += ', ' + tempOrs[r].field + ':{$in: ' + JSON.stringify(tempOrs[r].value) + '}';
                }
            }

            //concatQuery += '}';
        }
    }
    if(tempAnds.length > 0) {
        if (tempAnds[0].field.length > 0 && tempAnds[0].value.length > 0) {
            if (concatQuery.indexOf('$in') > -1) {
                concatQuery += ', ';
            }
            concatQuery += '$and:[{"' + tempAnds[0].field + '":"' + tempAnds[0].value + '"}';
            console.log('getQuery inside', tempAnds[0].field, tempAnds[0].value);
            for (var u = 1; u < tempAnds.length; u++) {
                if (tempAnds[u].field.length > 0 && tempAnds[u].value.length > 0) {
                    concatQuery += ', {"' + tempAnds[u].field + '":"' + tempAnds[u].value + '"}';
                }
            }
            concatQuery += ']';
        }
    }
    */

    concatQuery += '}';
    var afterFind = {};

    if(typeof fields !== 'undefined'){
        afterFind['fields'] = {};
        afterFind['fields']['_id'] = 0;
        for(var s = 0; s< fields.length; s++){
            afterFind['fields'][fields[s]] = 1;
        }
    }
    if(typeof sort !== 'undefined'){

        afterFind['sort'] = {};
        afterFind['sort'][sort] = 1;
    }
    if(typeof limit !== 'undefined'){
        afterFind['limit'] = limit;
    }
    if(typeof afterFind['fields'] !== 'undefined' || typeof afterFind['sort'] !== 'undefined' || typeof afterFind['limit'] !== 'undefined'){
        concatQuery += ', ' + JSON.stringify(afterFind);
    }

    return concatQuery + ')';


};

queryToCells = function (data) {
    var cols = [];
    var cells = [];
    for(var i = 0; i < data.length; i++){
        for(var p in data[i]){
            if(typeof data[i][p] === 'object'){
                for(var q in data[i][p]) {
                    var prop = p + '.' + q;
                    if (cols.indexOf(prop) === -1) {
                        cols.push(prop);
                    }
                }
            }
        }
        if(typeof data[i].date !== 'undefined'){
            var cellRow = {time: data[i].date, columns:[]};
            for(var x = 0; x < cols.length; x++) {
                var major = cols[x].split('.')[0];
                var minor = cols[x].split('.')[1];
                if(typeof data[i][major] !== 'undefined' && typeof data[i][major][minor] !== 'undefined') {
                    cellRow.columns.push({data: data[i][major][minor]})
                }
                else{
                    cellRow.columns.push({data: " "})
                }
            }
            cells.push(cellRow);
        }

    }
    var cellTitle = {time: 'Date', columns:[]};
    for(var c = 0; c< cols.length;c++){
        cellTitle.columns.push({data: cols[c]})
    }
    cells.splice(0, 0, cellTitle);
    return cells;
};

queryResultToTable = function (resultOfQuery) {
    console.log('inside queryResultToTable');
    var tempR = [];
    var cols = [];

    for(var r=0; r< resultOfQuery.length;r++){
        console.log('inside queryResultToTable1', r);
            //make a row of this unique resultOfQuery row
        var tempRrow = {};
        for(var p in resultOfQuery[r]){
            if(p !== 'date' && p !== 'file' && p !== '_id' && p !== 'timestamps' && p !== 'data'){
                tempRrow[p] = resultOfQuery[r][p];
            }
        }
        console.log('resultOfQuery[r]', r, 'tempRrow', tempRrow);

        var match = false;
        var matchIndex = -1;
        //is this tempRrow (resultOfQuery row) in tempR already?
        for(var w = 0; w < tempR.length; w++) {
            for(var p in tempRrow){
                if(typeof tempR[w][p] !== 'undefined') {
                    if(tempR[w][p] == tempRrow[p]){
                        match = true;
                    }
                    else{
                        match = false;
                        break;
                    }
                }
                else{
                    match = false;
                    break;
                }
            }
            if(match){
                matchIndex = w;
                w = tempR.length;
            }

        }
        if(!match){
            console.log('not a match:', r, 'tempRrow:', tempRrow)
            tempRrow['data'] = resultOfQuery[r]['data'];
            tempRrow['timestamps'] = resultOfQuery[r]['timestamps'];
            tempR.push(tempRrow)
        }
        else{
            console.log('a match:', r, 'matchIndex:', matchIndex, 'tempRrow:', tempRrow, 'tempR:', tempR);
            tempR[matchIndex]['data'] = tempR[matchIndex]['data'].concat(resultOfQuery[r]['data']);
            tempR[matchIndex]['timestamps'] = tempR[matchIndex]['timestamps'].concat(resultOfQuery[r]['timestamps']);
        }

    };



    var cols = [];
    var cells = [];
    Object.keys(data).sort().forEach(function(key) {
        var mod = {};
        mod['columns'] = [];
        //console.log(data[key], cols.length)
        for(var y =0; y< cols.length;y++){
            //console.log(y, data[key])
            var found = false;
            for(var p in data[key]){
                if(cols[y] === p){
                    mod['columns'].push({data:data[key][p]})
                    found = true;
                }
            }
            if(!found){
                mod['columns'].push({data:" "})
            }

        }
        mod['time'] = Number(key);
        cells.push(mod);
    });

/*
    var duplicates = [];
    for(var t = 0; t< tempR.length; t++){
        for(var p in tempR[t]){
            if(p !== 'date' && p !== 'file' && p !== '_id' && p !== 'timestamps' && p !== 'data'){
                var found = false;
                for(var d = 0; d < duplicates.length; d++){
                    if(duplicates[d].column === tempR[t][p]){
                        duplicates[d].count += 1;
                        found = true;
                    }
                }
                if(!found){
                    duplicates.push({field:p, column: tempR[t][p], count: 1})
                }
            }
        }
    }

    function compare(a,b) {
        if (a.count < b.count)
            return 1;
        else if (a.count> b.count)
            return -1;
        else
            return 0;
    }

    duplicates.sort(compare);
    console.log('duplicates', duplicates);

    var fieldsOrder = [];
    for(var s=0;s< duplicates.length; s++){
        if(fieldsOrder.indexOf(duplicates[s]['field']) === -1 && duplicates[s].count === 1){
            fieldsOrder.push(duplicates[s]['field'])
        }
    }
    console.log('fieldsOrder', fieldsOrder);

    var duplicatesIndex = 0;
    function compareTempR(a,b) {
        if (typeof a[duplicates[duplicatesIndex].field] !== 'undefined' && typeof b[duplicates[duplicatesIndex].field] !== 'undefined' && a[duplicates[duplicatesIndex].field] === a[duplicates[duplicatesIndex].field]){
            return 0;
        }
        else if (typeof a[duplicates[duplicatesIndex].field] !== 'undefined' && typeof b[duplicates[duplicatesIndex].field] !== 'undefined' && a[duplicates[duplicatesIndex].field] === a[duplicates[duplicatesIndex].field]) {
            return -1;
        }
        else
            return 0;
    }

    var columnHeaders = new Array();
    var tempTempR = new Array();
    for(var i=0;i<duplicates.length;i++){
        if(duplicates[i].count > 1){
            var foundColumn = false;
            for(var h=0;h<columnHeaders.length;h++){
                if(columnHeaders[h].field === duplicates[i].field)
                var tempCols = new Array();
                tempCols.push({data:duplicates[i].column});
                for(var e=1; e<duplicates[i].count;e++){
                    tempCols.push({data:' '});
                }
                columnHeaders = columnHeaders['columns'].concat(tempCols);
                foundColumn = true;
            }
            if(!foundColumn){
                var tempCols = new Array();
                tempCols.push({data:duplicates[i].column});
                for(var e=1; e<duplicates[i].count;e++){
                    tempCols.push({data:' '});
                }
                columnHeaders.push({field: duplicates[i].field, columns:tempCols});
            }
            for(var g=0; g<tempR.length;g++) {
                if (!tempR[g]['sorted']) {
                    if (typeof tempR[g][duplicates[i].field] !== 'undefined') {
                        if (tempR[g][duplicates[i].field] === duplicates[i].column) {
                            tempTempR.push(tempR[g]);
                            tempR[g]['sorted'] = true;
                        }
                    }
                }
            }
        }
    }
    tempR = tempTempR;




    for(var u=0; u< columnHeaders.length; u++){
        cells.push({time: '', columns:columnHeaders[u].columns})
    }


    for(var s=0;s< fieldsOrder.length; s++){
        if(fieldsOrder.indexOf(duplicates[s]['field']) === -1 && duplicates[s].count === 1){
            fieldsOrder.push(duplicates[s]['field'])
        }
    }*/

    var cells = new Array();
    var fieldsOrder = ['module', 'parameter'];
    for(var f=0; f<fieldsOrder.length;f++){
        var tempColsSpecific = new Array();
        for(var h=0;h< tempR.length;h++){
            if(typeof tempR[h][fieldsOrder[f]] !== 'undefined'){
                tempColsSpecific.push({data:tempR[h][fieldsOrder[f]]})
            }
            else{
                tempColsSpecific.push({data:' '})
            }
        }
        console.log('tempColsSpecific', tempColsSpecific);
        cells.push({time: '', columns:tempColsSpecific})
    }
    cells[cells.length-1]['time'] = 'Date';

    /*
    {time:'Date', columns:[{data: 'columnTitle'}, {data: 'columnTitle'}, {data: 'columnTitle'}]};
    */

    //find longest data
    var iLongest = 0;
    for(var c=1; c<tempR.length;c++){
        if(tempR[iLongest]['data'].length < tempR[c]['data'].length)
            iLongest = c;
    }
    console.log('cellHeaders', cells);



    var cellHeaderLength = cells.length;
    var runningIndex = cellHeaderLength;

    for(var l = 0; l<tempR[iLongest]['data'].length; l++){
        cells[runningIndex + l] = {};
        cells[runningIndex + l] = {time: tempR[iLongest]['timestamps'][l], columns:[{data: tempR[iLongest]['data'][l]}]};
    }

    var numOfCols = 0;
    for(var m = 0; m < tempR.length; m++) {
        runningIndex = 0;
        if (m !== iLongest) {
            //loop through tempR
            for (var n = 0; n < tempR[m]['data'].length; n++) {
                //loop through timestamps already there
                var inserted = false;

                    for (var s = runningIndex; s < cells.length; s++) {
                        if (tempR[m]['timestamps'][n] < cells[s]['time'] && s === 0) {
                            cells.splice(0, 0, {time: tempR[m]['timestamps'][n], columns: []});
                            for (var q = 0; q <= numOfCols; q++) {
                                cells[s]['columns'].push({data: ' '});
                            }
                            cells[s]['columns'].push({data: tempR[m]['data'][n]});
                            inserted = true;
                        }
                        else if (tempR[m]['timestamps'][n] === cells[s]['time']) {
                            for (var q = cells[s]['columns'].length; q < numOfCols; q++) {
                                cells[s]['columns'].push({data: ' '});
                            }
                            cells[s]['columns'].push({data: tempR[m]['data'][n]});
                            runningIndex = s -1;
                            inserted = true;
                        }
                        else if (tempR[m]['timestamps'][n] < cells[s]['time'] && tempR[m]['timestamps'][n] > cells[s - 1]['time']) {
                            //console.log('splicing', cells[s - 1]['time'], tempR[m]['timestamps'][n], cells[s]['time'], 'index tempR', n, 'index cells', s);
                            cells.splice(s, 0, {time: tempR[m]['timestamps'][n], columns: []});
                            for (var q = 0; q <= numOfCols; q++) {
                                cells[s]['columns'].push({data: ' '});
                            }
                            cells[s]['columns'].push({data: tempR[m]['data'][n]});
                            runningIndex = s -1;
                            inserted = true;
                        }
                    }
                try {
                    if (!inserted){
                        if(tempR[m]['timestamps'][n] > cells[cells.length - 1]['time']) {
                            //console.log('previous time', cells[cells.length - 1]['time']);

                            cells.push({time: tempR[m]['timestamps'][n], columns: []});
                            for (var q = 0; q <= numOfCols; q++) {
                                cells[cells.length - 1]['columns'].push({data: ' '});
                            }
                            cells[cells.length - 1]['columns'].push({data: tempR[m]['data'][n]});
                            runningIndex = cells.length -1;
                            inserted = true;
                        }
                        else {
                            console.log('error! not inserted here', 'runningIndex', runningIndex, 'cells.length - 1', cells.length - 1);
                            console.log('error!', tempR[m].module, tempR[m].parameter, tempR[m]['data'][n], tempR[m]['timestamps'][n], 'not inserted!')
                            n--;
                            runningIndex = cellHeaderLength;
                        }
                    }
                }catch(err){
                    console.log('n',n,'m',m, err);
                 }

            }
            numOfCols++;
        }

    }



    /*var cells = new Array();
    cells[0] = {};
    cells[0]['time'] = 'Time';*/
    /*
    tempR['timestamps'] = resultOfQuery[0].timestamps;


    for(var p in resultOfQuery[0]){

    }

    tempR['data'] = resultOfQuery[0].data;
    for(var p in resultOfQuery[0]){
        if(p !== 'date' && p !== 'file' && p !== '_id'){
            tempR[p] = resultOfQuery[0][p];
        }
    }

    for(var r = 1; r< resultOfQuery.length; r++){
        var column = '';
        for(var p in tempR){
            if(p !== 'data' && p !== 'timestamps'){
                if(resultOfQuery[r][p] !== tempR[p]){
                    column +=
                }
            }
        }
        if(matches){
            tempR['data'] = tempR['data'].concat(resultOfQuery[r]['data'])
            tempR['timestamps'] = tempR['timestamps'].concat(resultOfQuery[r]['timestamps'])
        }
    }
    var cells = new Array()

    cells[0] = {};
    cells[0]['time'] = 'Time';

    for(var p in tempR){
        if(p !== 'data' && p !== 'timestamps'){
            if(typeof cells[0]['data'] === 'undefined'){
                cells[0]['data'] = tempR[p] + ' ';
            }
            else{
                cells[0]['data'] += tempR[p] + ' ';
            }

        }
    }


    for(var c=0; c< 50; c++){
        cells[c + 1] = {};
        cells[c + 1]['time'] = tempR.timestamps[c];
        cells[c + 1]['data'] = tempR.data[c];
    }*/

    return cells;

}


//numDBS = new ReactiveVar([{'showPlus':true, 'num':0, databasesHere: JSON.parse(JSON.stringify(databases))}]);
//thedb = undefined;

/*numDatabases:function(){
 return numDBS.get();
 },*/

/*'click #anotherDB':function(){
 var tempNumDBs = numDBS.get();
 tempNumDBs.push({});
 for(n=0;n<tempNumDBs.length;n++)
 {
 tempNumDBs[n]['showPlus'] = false;
 tempNumDBs[n]['num'] = n;
 }
 tempNumDBs[tempNumDBs.length - 1]['showPlus'] = true;
 tempNumDBs[tempNumDBs.length - 1]['databasesHere'] = JSON.parse(JSON.stringify(databases));
 numDBS.set(tempNumDBs);
 },
 'click #removeDB':function(event){
 console.log('removeDB', $(event.target).attr('name'));
 var tempNumDBs = numDBS.get();
 tempNumDBs.splice($(event.target).attr('name'), 1);
 for(n=0;n<tempNumDBs.length;n++)
 {
 tempNumDBs[n]['showPlus'] = false;
 tempNumDBs[n]['num'] = n;
 }
 tempNumDBs[tempNumDBs.length - 1]['showPlus'] = true;
 numDBS.set(tempNumDBs);
 },

 'change .select': function (event) {
 var tempNumDBs = numDBS.get();
 console.log(this, $(event.target).context.selectedIndex);
 thedb = $(event.target).context.selectedIndex;
 tempNumDBs[this.num]['databasesHere'] = JSON.parse(JSON.stringify(databases));
 tempNumDBs[this.num]['databasesHere'][$(event.target).context.selectedIndex - 1]['selected'] = 'selected';
 tempNumDBs[this.num]['selected'] = tempNumDBs[this.num]['databasesHere'][$(event.target).context.selectedIndex - 1].db;
 numDBS.set(tempNumDBs);
 },



 */