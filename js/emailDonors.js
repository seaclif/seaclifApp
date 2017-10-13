if (Meteor.isClient) {
    selectedEmailTemplate = new ReactiveVar();

    Template.emailDonors.onCreated(function () {
        subs.addCollection('emailTemplates');

    });
    Template.emailDonors.helpers({

        savedTemplatesReady: function () {
            return subs.emailTemplates.isReady;
        },
        hasTemplates: function () {
            if (subs.emailTemplates.find().count() === 0) {
                return selectedEmailTemplate.set(subs.emailTemplates.insert({name: "Untitled", owner: currentSession.getUserNameNumber()})) && true;
            }
            else if(subs.emailTemplates.find().count() > 0){
                return true;
            }
            else{
                return false;
            }
        },

        savedTemplates: function () {
            return subs.emailTemplates.find().fetch();
        },
        selectedTemplateName: function () {
            if (typeof selectedEmailTemplate.get() === 'undefined')
                selectedEmailTemplate.set(subs.emailTemplates[0]._id);
            return subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).name;
        },

        selectedTemplate: function (templateIn) {
            if (selectedEmailTemplate.get() === templateIn) {
                return 'selected';
            }
            else {
                return '';
            }
        },

        emailAddressesReady: function () {
            if(typeof subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).emailAddresses === 'undefined'){
                Meteor.call('getEmailAddresses', 1, function (err, result) {
                    subs.emailTemplates.getOne({_id: selectedEmailTemplate.get()}).set('emailAddresses', result)
                })
            }
            return subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).emailAddresses && true;
        },
        
        emailAddress: function () {
            return subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).emailAddresses;
        },
        dateSince: function () {
            return subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).dateSince;
        },
        
        listOfAddresses: function () {
            var tempFind = subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).emailAddresses;
            var list = "";
            for (var e=0; e< tempFind.length -1; e++){
                list += tempFind[e].email + ', ';
            }
            list += tempFind[tempFind.length -1].email;
            return list;
        }
    });
    
    Template.emailDonors.events({
        'change .selectTemplate': function (event) {
            if ($(event.target).context.selectedIndex === 0) {
                selectedEmailTemplate.set(subs.emailTemplates.insert({
                    owner: currentSession.getUserNameNumber()
                }));
                $("#templateNameDeclare").focus();
            }
            else {
                selectedEmailTemplate.set(subs.emailTemplates[$(event.target).context.selectedIndex - 1]._id);
            }
        },
        'keyup #templateNameDeclare': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            }
        },

        'change [name=dateSince]': function (event) {
            console.log($(event.target).val())
            subs.emailTemplates.getOne({_id: selectedEmailTemplate.get()}).set('dateSince', $(event.target).val());
        },

        'blur #templateNameDeclare': function (event) {
            $(event.target).blur();

            if($(event.target).val().length > 0){
                if($("#selectTemplate")[0].options.selectedIndex === 0){
                    selectedEmailTemplate.set(subs.emailTemplates.insert({name: $(event.target).val(), owner: currentSession.getUserNameNumber()}));
                }
                else{
                    subs.emailTemplates.getOne({_id: selectedEmailTemplate.get()}).set('name', $(event.target).val());
                }
            }
            else{
                if($("#selectTemplate")[0].options.length > 2){
                    subs.emailTemplates.remove({_id: selectedEmailTemplate.get()});
                    selectedEmailTemplate.set(subs.emailTemplates[0]._id);
                }
            }
        },
        'click [name=delete]': function (event) {
            console.log('delete my id is ', $(event.target).attr('id'));
            var tempA = subs.emailTemplates.findOne({_id: selectedEmailTemplate.get()}).emailAddresses;
            for(var a=0; a<tempA.length;a++){
                if(tempA[a]._id === $(event.target).attr('id')){
                    tempA.splice(a,1);
                }
            }
            subs.emailTemplates.getOne({_id: selectedEmailTemplate.get()}).emailAddresses = tempA;
        },
        
    })
}