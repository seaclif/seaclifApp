if (Meteor.isClient) {
    Template.locations.onCreated(function(){
        subs.addCollection('locations');
    });
    Template.locations.helpers({
        locationsReady: function(){
            return subs.locations.isReady;
        },

        locations: function () {
            return subs.locations
        },

        'numberOfBarcodes': function (){
            //return barcodes.find({location: this.location, display: 'show'}).count()
        }

    });
    Template.locations.events({
        'keyup [name=newLocation]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur [name=newLocation]': function (event) {
            $(event.target).blur();
            subs.locations.insert({number: subs.locations.find({}).count(), location: $(event.target).val()});
            $('#newLocation').val('');
        },

        'keyup [name=aLocation]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                subs.locations.update({_id: this._id}, {$set:{location: $(event.target).val()}});

            }
        },
        'blur [name=aLocation]': function (event) {
            $(event.target).blur();
            subs.locations.update({_id: this._id}, {$set:{location: $(event.target).val()}});
        },

        'click [class=swipeout-delete]': function (event) {
            //console.log($(event.target).context)
            //console.log('$(event.target).context.id', $(event.target).context.id)
            subs.locations.remove({_id: $(event.target).context.id});
        },

    });
}