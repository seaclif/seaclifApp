databases = [{option:'serialportData'}, {option:'spectraDB'}, {option:'urinalysis'}];

Meteor.publish('searchBy', function(){
    return searchBy.find();
});



Meteor.methods({
    doAQuery:function(query){
        console.log(query);
        if(query.indexOf('fetch()') > -1){
            return eval(query);
        }
        else{
            var result = {};
            result['fetch'] = eval(query + '.fetch()');
            result['count'] = eval(query + '.count()');
            return result;
        }

    },
    doQueryWithSpan:function(query, d1, d2){
        console.log(query);


        var result = {};
        result['fetch'] = eval(query + '.fetch()');
        console.log('result.fetch.length', result.fetch.length);
        for(var f=0;f<result.fetch.length;f++){
            var fm = moment(result.fetch[f].date);
            var fmZero = new Date(new Date(new Date(new Date(result.fetch[f].date).setHours(0)).setMinutes(0)).setSeconds(0)).setMilliseconds(0);
            console.log(result.fetch[f].date, 'fmZero', fmZero, fmZero  + d1, fmZero + d2);

            var d1m = moment( fmZero  + d1);
            var d2m = moment(fmZero + d2);
            if(fm.diff(d1m) <0 || d2m.diff(fm) < 0){
                result.fetch[f].date = undefined;
            }
        }

        result['count'] = eval(query + '.count()');
        return result;
        

    },
    getDateSpan: function(database){
        //this.unblock();
        console.log(database);
        var dateMinMax = {};
        //eval(database)._ensureIndex({}, {sort: mod});
        var findTemp = eval(database).find({}, {sort:{date:1}});
        dateMinMax['dateMin'] = eval(database).findOne({}, {sort:{date:1}}).date;
        var findCount = findTemp.count();
        dateMinMax['dateMax'] = eval(database).findOne({}, {sort:{date:-1}}).date;
        return dateMinMax;
    },
    
    getDBQuery: function(db, tID){
        var limitNum = 5;
        var getFind = eval(db).find({},{limit: limitNum});
        var fields = new Array();
        //fields.push({option: '_id'});
        for(var g=0;g< limitNum;g++){
            console.log('g of getFind', getFind.fetch()[g]);
            for(var p in getFind.fetch()[g]){
                console.log('p', p)
                if(typeof getFind.fetch()[g][p] === 'object' && typeof getFind.fetch()[g][p][0] === 'undefined'){
                    for(var h in getFind.fetch()[g][p]){
                        console.log('h', h)
                        if(typeof getFind.fetch()[g][p][h] !== 'object'){
                            //if(typeof getFind.fetch()[g][p][h][0] === 'undefined') {
                                if (typeof fields.find(function (e) {
                                        if (e.option === p + '.' + h) {
                                            return true
                                        }
                                    }) === 'undefined') {
                                    var mod = {};
                                    mod['option'] = p + '.' + h;
                                    fields.push(mod);
                                }
                            //}
                        }
                    }
                }
                else{
                    if(typeof getFind.fetch()[g][p] !== 'object'){
                        if(typeof fields.find(function(e){if(e.option === p){return true}}) === 'undefined' && p !== '_id'){
                            var mod = {};
                            mod['option'] = p;
                            fields.push(mod);
                        }
                    }

                }
            }
        }
        return fields;
    },

    uniqueQueryValues: function(database, query, field){
        //this.unblock();
        console.log(database, query, field);
        var tempResult = new Array();
        var mod = {};
        mod[field] = 1;
        var fieldTemp = field.split('.');
        eval(database)._ensureIndex(mod, {sort: mod});
        var tempFind = eval(query);
        var result =  _.uniq(tempFind.fetch().map(
            function (x) {
                if(fieldTemp.length === 1){
                    return x[field];
                }
                else{
                    return x[fieldTemp[0]][fieldTemp[1]];
                }

            }),
            true);
        for (var r = 0; r< result.length; r++){
            tempResult.push({option: result[r]})
        }
        console.log('after _uniq')
        return tempResult;

    },

    queryAble: function (db) {
        var queryAble = new Array();
        var mod = {};
        mod['_id'] = 0;


        for (var p in eval(db).findOne()) {
            if (excludeFromQueryable.indexOf(p) === -1) {
                queryAble.push({field: p});
                mod[p] = 1;
            }
        }

        var possible = eval(db).find({}, {fields: mod}).fetch();

        for (var q = 0; q < queryAble.length; q++) {
            var tempA = new Array();
            for (var s = 0; s < possible.length; s++) {
                if (tempA.indexOf(possible[s][queryAble[q].field]) == -1) {
                    console.log('possible[s][q]', possible[s][queryAble[q].field]);
                    tempA.push(possible[s][queryAble[q].field])
                }
            }

            var tempB = new Array();
            for (var t = 0; t < tempA.length; t++) {
                tempB[t] = {'value': tempA[t]}
            }
            queryAble[q]['unique'] = tempB;
        }

        return queryAble;
    },

    uniqueFromDB : function(database, field, findSpecific) {
        var fieldQ = {};
        fieldQ[field] = 1;

        if(!findSpecific){
            findSpecific = {};
        }
        var distinctEntries = _.uniq(eval(database).find(findSpecific, {sort: fieldQ}, {fields: fieldQ}).fetch().map(
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
    },

    uniqueKeys : function(database) {
        var uniq = new Future();
        var numEntries = eval(database).find().count();
        var uniqueFields = new Array();
        var dbTemp = eval(database);
        console.log('running uniqueKeys');

        for(var u = 0; u< 4; u++){
            for (var p in dbTemp.find().fetch()[u]){
                if(uniqueFields.indexOf(p) === -1){
                    uniqueFields.push(p);
                }
            }
        }
        for (var t= 0; t< uniqueFields.length; t++){
            uniqueFields[t] = {option: uniqueFields[t]};
        }
        console.log(uniqueFields);
        uniq['return'](uniqueFields);
        return uniq.wait();
    },

    uniqueFrom : function(searchBy) {
        var uniqFrom = new Future();
        if(searchBy.type === 'databases'){
            availableOptions.upsert({type: 'databases'}, {$set:{select: databases}});
            uniqFrom['return'](databases);
        }
        else if(searchBy.type === 'fields'){
            var findAll = eval(searchBy.db).find(searchBy.query);
            var numEntries = findAll.count();
            var uniqueFields = new Array();
            var divNum = 4;
            console.log('running uniqueKeys');

            if(numEntries > 0){
                if(numEntries/ divNum < 1){
                    for (var q in findAll.fetch()[0]){
                        if(uniqueFields.indexOf(q) === -1){
                            uniqueFields.push(q);
                        }
                    }
                }
                else{
                    for(var u = 0; u < numEntries; u + (numEntries/divNum)){
                        for (var p in findAll.fetch()[u]){
                            if(uniqueFields.indexOf(p) === -1){
                                uniqueFields.push(p);
                            }
                        }
                    }
                }
            }
            for (var t= 0; t< uniqueFields.length; t++){
                uniqueFields[t] = {option: uniqueFields[t]};
            }
            availableOptions.upsert({type: searchBy.type, db: searchBy.db, query: searchBy.query}, {$set:{select: uniqueFields}});
            uniqFrom['return'](uniqueFields);
        }

        return uniqFrom.wait();
    },

    availableOptions: function(){}
});
