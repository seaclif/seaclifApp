if (Meteor.isClient) {

    charRe = new ReactiveVar(false);
    chart = undefined;
    chartData = new Array();
    urinalysisUserData = new Array();
    tempAnalyteArray = new Array();
    logoutChart = undefined;

    Template.charts.onCreated(function () {
        subs.addCollection('urinalysisSettings');

        Meteor.call('getUrinalyisData', currentSession.getUserNameNumber().toUpperCase(), function (err, result) {
            if (result) {
                urinalysisUserData = result;
                charRe.set('true');
                renderChart();
            }
        });
    });

    renderChart = function(callback){
        if(chart){
            console.log('chart is good');
            if(chart.dataProvider){
                if(urinalysisUserData.length > 0) {
                    console.log('chart.dataProvider is good');
                    var analyte = FlowRouter.current().queryParams.column;
                    //console.log('analyte', analyte);

                    tempAnalyteArray = new Array();
                    console.log('urinalysisUserData.length', urinalysisUserData.length);

                    for (var p = 0; p < urinalysisUserData.length; p++) {
                        var analyteColumn;
                        for (var i = 0; i < urinalysisUserData[p].columns.length; i++) {
                            if (urinalysisUserData[p].columns[i].indexOf(analyte) > -1) {
                                analyteColumn = i;
                                i = urinalysisUserData[p].columns.length; //shortcircuit finishing the rest of the for loop after found
                            }
                        }
                        var analyteDataOne = urinalysisUserData[p].data[analyteColumn];
                        console.log('analyteDataOne', analyteDataOne);
                        if(typeof analyteDataOne !== 'undefined'){
                            if(analyteDataOne.toString()){
                                analyteDataOne = analyteDataOne.toString().split(' ').join("").replace(/(\r\n|\n|\r)/gm, "");
                                if(analyteDataOne.length > 0) {
                                    tempAnalyteArray.push({
                                        date: moment(urinalysisUserData[p].dateTime).format("YYYY MM DD"),
                                        dateDate: moment(urinalysisUserData[p].dateTime).format("ddd MMM D, YYYY hh:mm A"),
                                        value: Number(analyteDataOne)
                                    });

                                }
                            }
                        }
                    }

                    tempAnalyteArray.sort(function (a, b) {
                        var c = new Date(a.dateDate);
                        var d = new Date(b.dateDate);
                        return c - d;
                    });

                    chart.dataProvider = tempAnalyteArray;
                    chart.validateData();
                    //chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);

                }
            }
        }
    };


    Template.charts.onRendered(function () {
        logoutChart = setTimeout(function () {
            if (FlowRouter.current().path.indexOf('chart') > 0) {
                userCode.logout();
            }
        }, 60000);

        Tracker.autorun(function () {
            var s = FlowRouter.watchPathChange();
            charRe.set(true);

            Tracker.nonreactive(function(){
                renderChart();
            });
        });
    });

    Template.charts.helpers({
        urinalysisReady: function () {
            return subs.urinalysisSettings.isReady && charRe.get();
        },

        chartReady: function () {
            return charRe.get();
        },
        analytes: function () {
            return subs.urinalysisSettings.find().fetch();
        },
        isSelected: function (name) {
            if (FlowRouter.current().params.analyte === name) {
                return 'color: #6d6d72;'
            }

        }
    });
    changedNum = false;

    Template.charts.events({
        'mousedown #isAnalyte': function () {
            console.log('mousedown');
            clearTimeout(this.downTimer);
            this.downTimer = setTimeout(function () {
                FlowRouter.go('/charts/settings');
            }, 3000);
        },

        'mouseup #isAnalyte': function () {
            clearTimeout(this.downTimer);
        }
    });

    Template.urinalysisSettings.onCreated(function () {
        subs.addCollection('urinalysisSettings');
    });

    Template.urinalysisSettings.helpers({
        analytesReady: function () {
            return subs.urinalysisSettings.isReady;
        },
        availableAnalytesHere: function () {
            return subs.urinalysisSettings.find().fetch();
        }
    });

    Template.urinalysisSettings.events({

        'keyup #newColumn': function (event) {
            if (event.which == 13 || event.which == 27)
                $(event.target).blur();
        },

        'blur #newColumn': function (event) {
            $(event.target).blur();
            if ($(event.target).val().length > 0) {
                subs.urinalysisSettings.insert({
                    db: 'urinalysis',
                    analyte: $('#newAnalyte').val(),
                    column: $(event.target).val()
                });
            }

            $('#newAnalyte').val('');
            $('#newColumn').val('');
        },

        'keyup .aUrinalysisSetting': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();

            }
        },
        'blur .aUrinalysisSetting': function (event) {
            $(event.target).blur();
            var mod = {};
            mod[$(event.target).attr('name')] = $(event.target).val();
            subs.urinalysisSettings.update({_id: this._id}, {$set: mod});
        },

        'click [class=swipeout-delete]': function (event) {
            //console.log($(event.target).context)
            //console.log('$(event.target).context.id', $(event.target).context.id)
            subs.urinalysisSettings.remove({_id: $(event.target).context.id});
        },

    });

    Template.chartsSub.onRendered(function () {
        chart = AmCharts.makeChart("chartdiv", {
            "type": "serial",
            "theme": "none",
            "pathToImages": "/images/",
            dataDateFormat : "YYYY MM DD",
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left"
            }],
            "graphs": [{
                "id": "g1",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<div style='margin:5px;'><b>[[value]]</b><br><b>[[dateDate]]</b></div>",
            }],
            "chartScrollbar": {
                "graph": "g1",
                "scrollbarHeight": 30
            },
            "chartCursor": {
                "cursorPosition": "mouse",
                "pan": true,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "dashLength": 1,
                "minorGridEnabled": true,
                "position": "top"
            },
            //"export": {
            //    "enabled": true,
            //    "libs": {
            //        "path": "http://www.amcharts.com/lib/3/plugins/export/libs/"
            //    }
            //},
            "dataProvider": [{
                "date": "2015 06 01",
                "value": 20
            }, {
                "date": "2016 06 01",
                "value": 90
            }]
        });


        chart.zoomToIndexes(chart.dataProvider.length - 40, chart.dataProvider.length - 1);

        // store the chart in the data context in case you need it later
        this.data.chart = chart;

        renderChart();
    });

}