flowvolumeObj = {};

addLocalControl = function(spectroComp, type){
    if(control){
        if(typeof control.findOne({spectroComp: spectroComp, type: type}) === 'undefined' && control.find({spectroComp: spectroComp, type: type}).count() == 0){
            return control.insert({spectroComp: spectroComp, type: type, connectedAt: moment().format('YYYY-MM-DD hh:mm:ss')});
        }
        else{
            control.update({_id: control.findOne({spectroComp: spectroComp, type: type})._id}, {$set: {connectedAt: moment().format('YYYY-MM-DD hh:mm:ss').toString()}});
            return control.findOne({spectroComp: spectroComp, type: type})._id;
        }
    }
}

if (Meteor.isClient) {

    Template.tabComputersFlowvolume.helpers({
        'controlComputer': function(){

            return toArrayOfTypeSub(connectionList, 'spectroCompDB', 'Spectrometer Control Device', 'hostname', 'id');
        },

        'selectedClass': function(){
            if(Router.current().url.toString().indexOf(Template.currentData()._id) > -1){
                return "tabSelected";
            }
            else{
                return "notSelected";
            }
        },
    });

    Template.flowvolume.onRendered(function () {
        console.log('flowwwwwwwwwvolume', Template.currentData());
        if(typeof flowvolumeObj[Template.currentData()] === 'undefined'){
            //subscription(flowvolumeObj[Template.currentData()] = {}, spectroCompDB.findOne({_id: Template.currentData()}).ip, 'control', {type: 'flowvolume'});
        }
        else{
            //subscription(flowvolumeObj[Template.currentData()], spectroCompDB.findOne({_id: Template.currentData()}).ip, 'control', {type: 'flowvolume'});
        }
/*
        var idThis = Template.currentData()._id;

        //subscribe to flowvolume collection for folderpath
        Meteor.subscribe("flowvolume", Template.currentData()._id, {

            onReady: function () {
                localObj(flowvolumeObj[idThis]['settings'] = {}, flowvolume);

            },
        });

        //Blaze.renderWithData(Template.flowvol, Template.currentData(), $('#renderdiv').get(0));

        //console.log('flowwwwwwwwwvolume', Template.parentData(2));

        /*var convertAsyncToSync  = Meteor.wrapAsync( addInitial),
         resultOfAsyncToSync = convertAsyncToSync(this.data._id, 'flowvolume');
         subscription(flowvolumeObj, this.data.ip, "control", {type:'flowvolume'});
         */
        //attachSubscription(flowvolumeObj, this.data.ip, "control", {type:'flowvolume'}, ['colorStatus', 'data', 'log']);
        //graph(attachSubscription(flowvolumeObj, this.data.ip, "control", {type:'flowvolume'}, ['colorStatus']));
        //rxDoc(flowvolumeObj, control, resultOfAsyncToSync);
        //graph();

        //var convertAsyncToSync  = Meteor.wrapAsync( subscription),
        //    resultOfAsyncToSync = convertAsyncToSync(flowvolumeObj, this.data.ip, "control", {type:'flowvolume'});

    });

    Template.flowvolume.onDestroyed(function () {
        console.log('flowvolume is now deeeeeeeestroyed');
        //flowvolumeObj = {};
    })

    Template.flowvolume.helpers({

        'connectionStatus': function () {
            try{
                return connectionList[Template.currentData()._id].DDP.status().status;
            }
            catch(er){}

        },

        'recordBtn': function () {

            if (Template.currentData().record)
                return 'Stop Recording';
            else
                return 'Record';
        },

        'folderPath': function (){

            try{
                return flowvolumeObj[Template.currentData()._id]['settings']['saveSessionFoldersPath'];
            }catch(err){}


        }


    });

    Template.flowvolume.events({

        'change [class=select]': function (event) {

            if ($(event.target).attr('name') == 'searchDate') {
                Session.set('searchDate', $(event.target).val());
            }

        },

        'click [id=btnConnect]': function (event) {
            connectionList[Template.currentData()._id].DDP.call('startFlowvolume');

        },

        'click [id=btnDisconnect]': function (event) {
            connectionList[Template.currentData()._id].DDP.call('stopFlowvolume');

        },

        'click [id=btnRecord]': function (event) {
            if (Template.currentData().record) {
                flowvolumeObj[Template.currentData()._id].set('endDateTime', (new Date()).toString(), Template.currentData()._id);
                flowvolumeObj[Template.currentData()._id].set('record', false, Template.currentData()._id);
            }

            else {
                if (typeof Template.currentData().startDateTime === 'undefined') {
                    //console.log('adding reactive var startDateTime');
                    //addReactiveProperty(flowvolumeObj, 'startDateTime');
                }

                //flowvolumeObj.startDateTime = (new Date()).toString();
                flowvolumeObj[Template.currentData()._id].set('record', true, Template.currentData()._id);
            }

        },

        'click [id=flowcontrol]': function (event) {
            console.log('********************* flowcontrol', $(event.target).attr('name'));
            connectionList[Template.currentData()._id].DDP.call('sendValue', $(event.target).attr('name'));
            flowvolumeObj[Template.currentData()._id].set('currentValue', $(event.target).attr('name'), Template.currentData()._id);
        },

        'click .btnNewFile': function () {
            //graph(arrToObj(flowvolumeObj.data));
            flowvolumeObj[Template.currentData()._id].set('data', new Array(), Template.currentData()._id);
            flowvolumeObj[Template.currentData()._id].set('filename','flow volume ' + moment().format('MM|DD|YY_h|mm|ss a') + '.csv', Template.currentData()._id);
        },
        'click .btnSaveFile': function () {
            if (Template.currentData().record) {
                flowvolumeObj[Template.currentData()._id].set('endDateTime', (new Date()).toString(), Template.currentData()._id);
                console.log('endDateTime!@#', flowvolumeObj[Template.currentData()._id].get('endDateTime', Template.currentData()._id));

            }

            //console.log('btnSaveFile', this.saveSessionFoldersPath);
            callsave = function(obj, path, callback){
                Meteor.call('saveFlowvolume',obj, path, function (err, result) {
                    callback(null, result);
                    console.log(err, result);
                });
            }

            var convertAsyncToSync = Meteor.wrapAsync(callsave),
                resultOfAsyncToSync = convertAsyncToSync({
                    filename: Template.currentData().filename,
                    startDateTime: Template.currentData().startDateTime,
                    data: Template.currentData().data,
                    endDateTime: flowvolumeObj[Template.currentData()._id].get('endDateTime', Template.currentData()._id)
                }, flowvolumeObj[Template.currentData()._id]['settings']['saveSessionFoldersPath']);
            console.log('endDateTime!@# 2', flowvolumeObj[Template.currentData()._id].get('endDateTime', Template.currentData()._id));

                console.log(resultOfAsyncToSync);
        },

        'click [name=choosePath]': function (event) {
            folder.setCurrentObj(flowvolumeObj[Template.currentData()._id]['settings']);
            var path = flowvolumeObj[Template.currentData()._id]['settings']['saveSessionFoldersPath'];
            if (path){
                folder.setPath(path);
                Router.go('/folderNavigation'+ path.substring(path.lastIndexOf('/')));
            }
            else{
                Router.go('/folderNavigation');
            }
        },

        'keyup [class=flowvolume]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                flowvolumeObj[Template.currentData()._id].set($(event.target).attr('name'),$(event.target).val(), Template.currentData()._id);

            } else {
                flowvolumeObj[Template.currentData()._id].set($(event.target).attr('name'),$(event.target).val(), Template.currentData()._id);
            }
        }

    });

    Template.flowvolume.onRendered(function (nothing) {

        //var convertAsyncToSync = Meteor.wrapAsync(subscription),
            //resultOfAsyncToSync = convertAsyncToSync(flowvolumeObj[this._id], this.data.ip, "control", {type: 'flowvolume'});
        //flowvolumeObj['localDB'] = control;
        //flowvolumeObj['id'] = addLocalControl(this.data.id, 'flowvolume');
        var intervalOfUpdate = 31;
        //Width and height

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = $(window).width() - margin.left - margin.right,
            height = 200 - margin.top - margin.bottom;

        var x = d3.scale.linear()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

        var line = d3.svg.line()
            .x(function (d) {
                return x(d.index);
            })
            .y(function (d) {
                return y(d.value);
            });

        var svg = d3.select("#lineChart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

        svg.append("g")
            .attr("class", "y axis")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")

        console.log('initialized graph');
        var lastLength;

        dataforgraph = new ReactiveVar();
        this.autorun(function () {
            dataforgraph.set(Template.currentData().data);
            //var dataset = Points.find({},{sort:{date:-1}}).fetch();

            console.log('data to graph');
        });
        this.autorun(function () {
            var data = dataforgraph.get();

            if(typeof data !== 'undefined'){
                if(data.length !== lastLength){
                    lastLength = data.length;
                    graph(arrToObj(data));
                }
            }
        });




         function graph(dataset) {
            var paths = svg.selectAll("path.line").data([dataset]);

            x.domain(d3.extent(dataset, function (d) {
                return d.index;
            }));
            y.domain(d3.extent(dataset, function (d) {
                return d.value;
            }));

            //Update X axis
            svg.select(".x.axis")
                .transition()
                .duration(1000)
                .call(xAxis);

            //Update Y axis
            svg.select(".y.axis")
                .transition()
                .duration(1000)
                .call(yAxis);

            paths
                .enter()
                .append("path")
                .attr("class", "line")
                .attr('d', line);

            paths
                .attr('d', line);

            paths
                .exit()
                .remove();

        }
    });

    arrToObj = function(dataArray){
        try{
            var dataset = [{index: 0, value: dataArray[0]}];

            for (i = 1; i < dataArray.length; i++) {
                if (!isNaN(dataArray[i])) {
                    dataset.push({index: i, value: dataArray[i]});
                }
            }
            return dataset;
        }
        catch(er){
            return [{index: 0, value: 1}]
        }
    };

}

