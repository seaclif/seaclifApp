
if (Meteor.isClient) {
    Template.queue.onCreated(function(){
        subs.addCollection('barcodes');
        subs.addCollection('locations');
        subs.addCollection('spectroCompDB');
    });

    currentBarcode = undefined;
    printingP = new ReactiveVar('Print');

    Template.queue.helpers({
        spectroCompDBReady:function(){
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}) &&
                subs.spectroCompDB.isReady &&
                piConnections.get(FlowRouter.current().params.id).ddp.status().status === 'connected';
        },

        printDisplay: function(){
            return printingP.get();
        },

        spectroCompDB: function(){
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id});
        },

        barcodesReady: function(){
            return subs.barcodes.isReady && subs.locations.isReady;
        },

        barcodes: function () {
            //console.log("this this location is " + this.location);
            return subs.barcodes.find({location: this.location}).fetch();
        },

        locations: function () {
            return subs.locations;
        },
        hasBarcodes: function(){
            return subs.barcodes.find({display: 'show', location: this.location}).count() > 0;
        },

        spectroCompDBReadyMargin: function () {
            if (subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}) && subs.spectroCompDB.isReady &&
                piConnections[0].ddp.status().status === 'connected') {
                return 'margin-top: 120px';
            }
            else {
                return 'margin-top: 0px'
            }

        },

        'barcodeUserHere': function () {
            //console.log('thisBarcodeUser', this.barcodeUser);
            if(currentBarcode !== this.barcodeUser){
                currentBarcode = this.barcodeUser;

                setTimeout(function(){
                    JsBarcode($('#controlBarcode'), currentBarcode, {
                        format: "CODE39",
                        displayValue: true,
                        fontSize: 16
                    });
                    if ($('#controlBarcodeEvery').prop('checked') === true) {
                        setTimeout(function () {
                            printControlBarcode();
                        }, 500);
                    }
                }, 500);

                console.log('inside barcodeUserHere', currentBarcode);
            }

            return this.barcodeUser;
        }


    });

    printControlBarcode = function printBarcode() {
        console.log('gonna print dat barcode');

        piConnections.get(FlowRouter.current().params.id).ddp.call('printBarcode', document.getElementById("controlBarcode").src, function(err, result){
            console.log(err, result);
        });

    };

    Template.queue.events({
        'click [name=clearAll]': function (event){
            for (b=0; b<subs.barcodes.length; b++) {
                console.log('clearAll', b);
                subs.barcodes[b].set('display', 'none');
            }

        },
        'click [name=delete]': function (event) {
            subs.barcodes.getOne({_id: $(event.target).attr('id')}).set('display', 'none');
        },

        'focus #printCustomBarcode': function(){
            $('#controlBarcodeEvery').attr('checked', false);
        },

        'keyup #printCustomBarcode': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                if($(event.target).val().length > 0){
                    this.set($(event.target).attr('name'), $(event.target).val());
                }
            }
        },

        'blur #printCustomBarcode': function (event) {
            $(event.target).blur();
            if($(event.target).val().length > 0){
                this.set($(event.target).attr('name'), $(event.target).val());
            }
        },

        'click #controlBarcode': function () {
            console.log('mousedown');
            clearTimeout(this.downTimer);
            printControlBarcode();
            $('#controlBarcode').css('background-color', 'lightgray');
            this.downTimer = setTimeout(function () {
                $('#controlBarcode').css('background-color', 'white');
            }, 2000);
        },

        'mouseup #controlBarcode': function () {
            clearTimeout(this.downTimer);
            $('#controlBarcode').css('background-color', 'white');
        },



        'click [id=btnPrintP_barcodes]':function(event){
            if(printingP.get().indexOf('Printing') === -1){
                printingP.set('Printing...');

                var numOfBarcodes = $(".printCustomBarcodeNumber").val();
                console.log("Print this many barcodes:", numOfBarcodes);

                pNum = 0;
                printBarcodesID = this._id;
                max = numOfBarcodes;
                thisIDHere = this.id;

                $('#controlBarcodeEvery').attr('checked', true);
                $('#controlBarcodeEveryDiv').attr('checked', true);

                var intervalSet = Meteor.setInterval(function(){
                    if(pNum >= max){
                        Meteor.clearInterval(intervalSet);
                        $('#controlBarcodeEvery').attr('checked', false);
                        $('#controlBarcodeEveryDiv').attr('checked', false);
                        printingP.set('Print');
                    }
                    else{
                        $('#controlBarcodeEvery').attr('checked', true);
                        $('#controlBarcodeEveryDiv').attr('checked', true);
                        pNum = pNum + 1;
                        subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id}).barcodeUser = 'P'+ pNum + ' ' + moment().format('MM DD');
                    }

                }, 6000);
            }

        },
    });
}