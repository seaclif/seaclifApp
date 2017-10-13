if (Meteor.isClient) {
    var owner = new ReactiveVar('');

    Template.bugReporting.onCreated(function () {
        subs.addCollection('bugsfeatures');
        owner.set('');
    });
    Template.bugReporting.helpers({
        bugsfeaturesReady: function () {
            return subs.bugsfeatures.isReady;
        },

        bugsfeatures: function () {
            return subs.bugsfeatures.find({display: 'show'},{sort: {dateTime: -1}}).fetch();
        },

        bugOrFeatureIcon: function(){

            if(this.type === 'bug'){
                return "/img/bug.png";
            }
            if(this.type === 'feature'){
                return "/img/newFeature.png";
            }
        },

        hasOwner: function(){
            return owner.get().length > 0;
        },
        
        joething: function () {
            return "Joe"
        }
        


    });

    Template.bugReporting.events({
        'keyup #newFeature': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur #newFeature': function (event) {
            if($(event.target).val().length > 0) {
                subs.bugsfeatures.insert({
                    type: 'feature',
                    number: subs.bugsfeatures.find({}).count(),
                    description: $(event.target).val(),
                    dateTime: (new Date()),
                    owner: $('#owner').val(),
                    display: 'show'
                });
                $('#newFeature').val('');
            }
        },

        'keyup #newBug': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'blur #newBug': function (event) {
            if($(event.target).val().length > 0) {
                text = $(event.target).val()
                subs.bugsfeatures.insert({
                    type: 'bug',
                    number: subs.bugsfeatures.find({}).count(),
                    description: $(event.target).val(),
                    dateTime: (new Date()),
                    owner: $('#owner').val(),
                    display: 'show'
                });
                $('#newBug').val('');
                
                Meteor.call('sendEmail',
                    'austen.schulz@gmail.com', text)
            }
        },

        'keyup #owner': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
            owner.set($(event.target).val());
        },

        'blur #owner': function (event) {
            if($(event.target).val().length > 0) {

            }
        },
        'click [name=delete]': function (event) {
            console.log('delete my id is ', $(event.target).attr('id'))
            console.log('delete my getOne is ', subs.bugsfeatures.getOne({_id: $(event.target).attr('id')}));
            subs.bugsfeatures.getOne({_id: $(event.target).attr('id')}).set('display', 'none');
        },
    })
}