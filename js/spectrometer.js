if (Meteor.isClient) {

    spectrometerTabsReady = new ReactiveVar(false);

    Template.spectrometerWithTabs.onRendered(function () {
        Tracker.autorun(function () {
            var s = FlowRouter.watchPathChange();
            spectrometerTabsReady.set(true);
        });
    });

    Template.spectrometerWithTabs.helpers({
        createdReady: function () {
            return spectrometerTabsReady.get() && piConnections.get(FlowRouter.current().params.id);
        }
    });

    Template.spectrometer.onCreated(function(){
        subs.addCollection('spectroCompDB');
        piConnections.get(FlowRouter.current().params.id).addCollection('spectrometer');
    });

    Template.spectrometer.helpers({
        connectionReady: function () {
            return piConnections.get(FlowRouter.current().params.id).spectrometer.isReady && subs.spectroCompDB.isReady
        },

        spectroCompDB: function () {
            return subs.spectroCompDB.getOne({_id: FlowRouter.current().params.id})
        },

        spectrometer : function(){
            return piConnections.get(FlowRouter.current().params.id).spectrometer && piConnections.get(FlowRouter.current().params.id).spectrometer[0];
        },
        'barcodeUserHere': function () {
            console.log('thisBarcodeUser', this.barcodeUser);
            setTimeout(function(){
                JsBarcode($('#controlBarcode'), subs.spectroCompDB.getOne({_id: piConnections[0]._id}).barcodeUser, {
                    format: "CODE39",
                    displayValue: true,
                    fontSize: 20
                });
            }, 400);

            return this.barcodeUser;

        }
    });
    Template.spectrometer.events({
        'keyup [class=spectrometer]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                this.set($(event.target).attr('name'), $(event.target).val());
            }
        },

        'blur [class=spectrometer]': function (event) {
            $(event.target).blur();
            this.set($(event.target).attr('name'), $(event.target).val());
        },

        'change .select': function (event) {
            //console.log('.select', event, $(event.target).val())
            //var name = $(event.target).val();
            this.set($(event.target).attr('name'), $(event.target).val())
        },
        'click [name=choosePath]': function (event) {
            currentFolderObj = this;
            if (typeof this.folderPath !== 'undefined' && this.folderPath.length > 2)
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + this.folderPath)
            else
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);

        },
    })
}