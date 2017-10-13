if (Meteor.isClient) {
    printed = false;
    reprinted = false;
    userHasAnalyteData = new ReactiveVar(false);

    Template.directionsRender.onCreated(function(){
        subs.addCollection('barcodes');
        subs.addCollection('spectroCompDB');

        logoutDirections = setTimeout(function () {
            if (FlowRouter.current().path.indexOf('directions') > 0) {
                userCode.logout();
            }
        }, 20000);

    });

    Template.directionsRender.onDestroyed(function(){
        clearTimeout(logoutDirections);
        logoutDirections = undefined;

    });

    Template.directionsRender.helpers({
        directionsReady:function(){
            return subs.barcodes.isReady && subs.spectroCompDB.isReady;
        }
    });

    Template.directions.onCreated(function(){
        printed = false;
        Tracker.autorun(function(){
            if(currentSession.getUserNameNumber().length > 0){
                Meteor.call('getUserHasUrinalysis', currentSession.getUserNameNumber().toUpperCase(), function (err, result) {
                    if (result) {
                        userHasAnalyteData.set(true);
                    }
                });
            }
        })

    });
    Template.directions.onDestroyed(function(){
        userHasAnalyteData.set(false);
    });

    Template.directions.events({
        'click [name=rePrintBarcode]': function() {
            printBarcode(currentSession.getUserNameNumber());
        }
    });

    Template.directions.helpers({
        isConnectedToPrinter : function(){
            if(piConnections.length > 0) {
                return piConnections.get(FlowRouter.current().params.id).ddp.status().status === 'connected';
            }
            else{
                return false;
            }
        },

        barcodeSt: function() {
            renderBarcode = setInterval(function () {
                if(currentSession.getUserNameNumber().length > 4){

                    JsBarcode($('#barcode'), currentSession.getUserNameNumber() + " " + moment().format('hmm'), {
                        format: "CODE39",
                        displayValue: true,
                        fontSize: 14
                    });
                    if(!printed){
                        printBarcode(currentSession.getUserNameNumber());
                        printed = true;
                    }
                    clearInterval(renderBarcode);
                }

            }, 300);

            return currentSession.getUserNameNumber();
        },

        hasData: function(){

            return userHasAnalyteData.get()
        }

    });

    printBarcode = function printBarcode(barcode) {
        console.log('gonna print dat barcode', barcode);
        var dateTime = new Date();

        Meteor.call('noOtherBarcode', barcode, function(err, count){
            console.log('noOtherBarcode', count);
            if(typeof count !== 'undefined'){
                if (!isNaN(count)) {
                    subs.barcodes.insert({
                        user: barcode,
                        number: count + 1,
                        location: subs.interfaces[0].location,
                        display: 'show',
                        dateTime: dateTime
                    });
                }
            }

            //for(var p in piConnections){
            //    if(subs.spectroCompDB.findOne({_id: piConnections[p]._id}).configureAs.toLowerCase().indexOf('print') > -1){
            if(piConnections.length > 0){
                piConnections.get(FlowRouter.current().params.id).ddp.call('printBarcode', document.getElementById("barcode").src, function (err, result) {
                    console.log(err, result);
                });
            }

            //    }
            //}
        });

    };
}


