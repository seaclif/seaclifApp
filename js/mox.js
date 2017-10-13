if (Meteor.isClient) {
    var fartFromNow = new ReactiveVar();
    var peeFromNow =  new ReactiveVar();
    var pooFromNow = new ReactiveVar();
    var skidFromNow = new ReactiveVar();
    nowTime = new ReactiveVar();
    var urineBtnTitle = new ReactiveVar('1 Urine Start');
    var urineColor = new ReactiveVar('color-yellow');

    setFromNows = function(){
        try{
            fartFromNow.set(moment(new Date(subs.mox.findOne({active:true})['moxFart'])).fromNow());
            peeFromNow.set(moment(new Date(subs.mox.findOne({active:true})['moxPee'])).fromNow());
            pooFromNow.set(moment(new Date(subs.mox.findOne({active:true})['moxPoo'])).fromNow());
            skidFromNow.set(moment(new Date(subs.mox.findOne({active:true})['rgbSkid'])).fromNow());
        }catch(err){}

    };

    var changeBackToUrineStart = '';

    changeUrineColor = setInterval(function(){},1000000);

    changePeeBtn = function(){
        if( urineBtnTitle.get().indexOf('End') > -1){
            urineBtnTitle.set('1 Urine Start');
            clearInterval(changeUrineColor);
            urineColor.set('color-yellow');
        }
        else{
            urineBtnTitle.set('1 Urine End');
            //clearInterval(changeUrineColor);
            urineColor.set('color-orange');
            changeUrineColor = setInterval(function(){
                if(urineColor.get().indexOf('yellow') > -1){
                    urineColor.set('color-orange');
                }
                else{
                    urineColor.set('color-yellow');
                }

            }, 400)
        }
    };

    Template.mox.onCreated(function(){
       subs.addCollection('mox')
    });

    Template.mox.onRendered(function () {
        Meteor.setInterval(function(){
            nowTime.set(new Date());
        },400)

    });

    Template.mox.helpers({
        'moxReady':function(){
            if(subs.mox.isReady){
                setFromNows();
                Meteor.setInterval(function(){
                    setFromNows();
                },1000);
            }
            return subs.mox.isReady;
        },

        moxActive: function(){
          return subs.mox.getOne({active:true});
        },

        'fromNowFart': function () {
            return fartFromNow.get();
        },

        'fromNowPee': function () {
            return peeFromNow.get();
        },

        'fromNowPoo': function () {
            return pooFromNow.get();
        },

        'fromNowSkid': function () {
            return skidFromNow.get();
        },

        'nowTime': function(){
            nowTime.set(new Date());
            return nowTime.get();
        },
        'urineBtnTitle': function(){
            if(urineBtnTitle.get().indexOf('End') > -1){
                changeBackToUrineStart = setTimeout(function(){
                    urineBtnTitle.set('1 Urine Start');
                    clearInterval(changeUrineColor);
                    urineColor.set('color-yellow');
                }, 60000);
            }
            else{
                clearTimeout(changeBackToUrineStart);
            }
            return urineBtnTitle.get();
        },
        'colorUrine':function(){
            return urineColor.get();
        }
    });

    Template.mox.events({

        'click #eventBtn': function (event) {
            var dateTimeHere = new Date;
            var epochTime = dateTimeHere.getTime() / 1000;
            subs.mox.getOne({active:true}).set($(event.target).attr('name'), dateTimeHere);

            if($(event.target).attr('name').indexOf('Pee') > -1){
                changePeeBtn();
            }

            setFromNows();

            //console.log('btnSaveFile', this.saveSessionFoldersPath);
            callsave = function(obj, path, callback){
                Meteor.call('saveMox',obj, path, function (err, result) {
                    callback(null, result);
                });
            }

            var convertAsyncToSync = Meteor.wrapAsync(callsave),
                resultOfAsyncToSync = convertAsyncToSync({
                    filename: subs.mox.getOne({active:true}).filename,
                    startDateTime: subs.mox.getOne({active:true}).startDateTime,
                    data: epochTime + ',' + $(event.target).attr('value') +',' + '\r\n'
                }, subs.mox.getOne({active:true}).folderPath);
        },



    });

    Template.moxSettings.onCreated(function(){
        subs.addCollection('mox');
        subs.addCollection('locations');
    });

    Template.moxSettings.helpers({
        moxSettingsReady: function(){
            return subs.mox.isReady && subs.locations.isReady;
        },
        moxToilets:function(){
            return subs.mox.find().fetch();
        },

        locations: function(){
            return subs.locations;
        },
        currentToilet: function () {

            return subs.mox.getOne({active: true});
        }
    });

    Template.moxSettings.events({
        'change .select': function (event) {
            //console.log('.select', event, $(event.target).val())
            var name = $(event.target).val();
            if(name.indexOf('..') === -1){
                for(i=0;i<subs.mox.length; i++) {
                    subs.mox[i].set('active', false);
                }
                subs.mox.insert({toiletName: $(event.target).val(), active: true});
            }
        },

        'click #moxToiletBtn':function(event){
            //interface.moxToilet = $(event.target).attr('name');

            for(i=0;i<subs.mox.length; i++) {
                subs.mox[i].set('active', false);
            }
            subs.mox.getOne({_id: $(event.target).attr('name')}).set('active', true);
        },

        'click #deleteThisButton':function(event){
            subs.mox.remove({_id: $(event.target).attr('name')})
        },

        'click [name=choosePath]': function (event) {
            currentFolderObj = this;
            if (typeof this.folderPath !== 'undefined'){
                if(this.folderPath.length > 2){
                    FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + this.folderPath)
                }
                else
                    FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);
            }
            else
                FlowRouter.go("/folderNavigation/" + FlowRouter.current().path.split('/').join('.') + "?path=" + defaultFolder);

        },

        'keyup [class=moxSettings]': function (event) {
            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
                this.set($(event.target).attr('name'), $(event.target).val());

            }
        },

        'blur [class=moxSettings]': function (event) {
            $(event.target).blur();
            this.set($(event.target).attr('name'), $(event.target).val());
        },



    });

    Template.registerHelper("moxSelected", function(moxID) {

        //console.log('moxID', moxID, subs.mox.getOne({_id: moxID}));
        if(typeof moxID !== 'undefined') {
            if (subs.mox.findOne({_id: moxID})) {
                if (typeof subs.mox.findOne({_id: moxID}) !== 'undefined') {
                    if (typeof subs.mox.getOne({_id: moxID}).active !== 'undefined') {
                        if (subs.mox.getOne({_id: moxID}).active)
                            return 'color-black';
                        else {
                            return 'color-gray';
                        }
                    }

                }
            }
        }
    });
}