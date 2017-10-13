
if (Meteor.isClient) {

    iid = function () {
        if (localStorage.getItem('myInterfaceIDstring') === null) {
            interfaceID = Math.random();
            interfaceID = interfaceID * 1000;
            localStorage.setItem('myInterfaceIDstring', interfaceID);
        }

        return localStorage.getItem('myInterfaceIDstring');
    };


    Meteor.call('systemOS', function(err, result){
        console.log('systemOS', result);
        if(result.indexOf('mac') > -1){
            defaultFolder = '/Users/austenschulz/Desktop/';
        }
        else{
            defaultFolder = '/mnt/hgfs/Urinos/'; //'/Users/austenschulz/Desktop/'; //
        }
    });

    subs = new reactiveObject();
    piConnections = new Array();
    piConnections['get'] = function(id){
        var found;
        for(var i in piConnections){
            if(piConnections[i]._id === id){
                found = piConnections[i];
            }
        }
        return found;
    };
    piConnections['getIndex'] = function(id){
        var found;
        for(var i in piConnections){
            if(piConnections[i]._id === id){
                found = i;
            }
        }
        return found;
    };
    piConnections['remove'] = function(id){
        for(var i in piConnections){
            if(piConnections[i]._id === id){
                this.splice(i, 1);
            }
        }
    };
    Object.defineProperty(piConnections, 'get', {enumerable:false});
    Object.defineProperty(piConnections, 'getIndex', {enumerable:false});
    Object.defineProperty(piConnections, 'remove', {enumerable:false});

    subs.addCollection('interfaces', iid());
    //console.log('iid()', iid());
    subs.addCollection('interfaces', iid());
    subs.addCollection('spectroCompDB');
    subs.addCollection('connectionList', iid());

    connectEm = function () {
        connectAll = new Tracker.autorun(function (c) {
            if (subs.connectionList.isReady && subs.spectroCompDB.isReady) {
                for (var p in subs.connectionList[0]) {
                    if (p.indexOf('_id') === -1) {
                        //console.log('p', p);
                        if (subs.spectroCompDB.find({_id: p}).count() === 0) {
                            subs.connectionList[0].unset(p);
                        }
                        else {
                            if(typeof piConnections.get(p) === 'undefined')
                            {
                                piConnections[piConnections.length] = new reactiveObject(subs.spectroCompDB.findOne({_id: p}).ip, p, subs.connectionList, subs.interfaces[0].clientAddress);
                            }
                        }
                    }
                }
                c.stop();
            }

        });
    };
    connectEm();

    //console.log('running tracker');
    connectionsComputation = new Tracker.autorun(function(){
        if (typeof piConnections[0] !== 'undefined') {
            if (typeof piConnections[0].ddp !== 'undefined') {
                var s =  piConnections[0].ddp.status();
                for (i=0;i<piConnections.length;i++) {
                    s = piConnections[i].ddp.connectionStatus();
                }
                //Tracker.nonreactive(function(){
                //    for (i=0;i<piConnections.length;i++) {
                //        piConnections[i].ddp.connectionStatus();
                //    }
                //})
            }
        }
    });

    BlazeLayout.setRoot('#mainLayoutPlace');

    FlowRouter.route('/', {
        action: function(params, queryParams) {
            BlazeLayout.render('mainLayout', { content: "key"});
        }
    });
    FlowRouter.route('/userprofile', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "userprofile"});
        }
    });

    FlowRouter.route('/directions', {
        triggersEnter: [function(context, redirect) {
            if(piConnections.length > 0){
                FlowRouter.redirect('/directions/' + piConnections[0]._id);
            }
        }],
        action: function(params, queryParams) {
            if(piConnections.length === 0){
                BlazeLayout.render("mainLayout", { content: "directionsRender"});
            }
        }
    });

    FlowRouter.route('/directions/:id', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "directionsRender"});
        }
    });

    FlowRouter.route('/mox', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "mox"});
        }
    });
    FlowRouter.route('/flowDemo', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "flowvolume"});
        }
    });
    FlowRouter.route('/importdata', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "importData"});
        }
    });
    FlowRouter.route('/garage', {
        action: function(params, queryParams) {
            if(subs.interfaces[0] && subs.interfaces[0].currentUser){
                Meteor.call('isLoggedIn', subs.interfaces[0].currentUser, function (err, data) {
                    if (data){
                        if (data.auth.indexOf('User') > -1) {
                            BlazeLayout.render("mainLayout", {content: "garage"});
                        }else{
                            FlowRouter.redirect('/');
                        }
                    }else{
                        FlowRouter.redirect('/');
                    }
                });
            }else{
                FlowRouter.redirect('/');
            }
        }
    });
    FlowRouter.route('/importdata/:set', {
        action: function(params, queryParams) {
            if(params.set.toLowerCase().indexOf('spectrometersettings') > -1) {
                BlazeLayout.render("mainLayout", {content: "spectrometerSettings"});
            }
        }
    });
    FlowRouter.route('/mox/:settings', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "moxSettings"});
        }
    });
    FlowRouter.route('/queue', {
        triggersEnter: [function(context, redirect) {
            if(piConnections.length > 0){
                FlowRouter.redirect('/queue/' + piConnections[0]._id);
            }
        }],
        action: function(params, queryParams) {
            if(piConnections.length === 0){
                BlazeLayout.render("mainLayout", { content: "queue"});
            }
        }
    });

    FlowRouter.route('/queue/:id', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "queue"});
        }
    });

    FlowRouter.route('/bugsfeatures', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "bugReporting"});
        }
    });
    FlowRouter.route('/downloadapp', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "updateios"});
        }
    });

    FlowRouter.route('/bluetooth', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "bluetooth"});
        }
    });
    /*FlowRouter.route('/modules', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "modules"});
        }
    });*/

    FlowRouter.route('/modules/:id', {
        triggersEnter: [function(context, redirect) {
            moduleTabsReady.set(false);

            if(typeof context.params.id === 'undefined'){
                if(piConnections[0]){
                    FlowRouter.redirect('/modules/' + piConnections[0]._id);
                }
                else{
                    FlowRouter.redirect('/configureInterface');
                }
            }
        }],
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "modulesWithTabs"});
        }
    });

    FlowRouter.route('/modules', {
        triggersEnter: [function(context, redirect) {
            if(piConnections[0]){
                FlowRouter.redirect('/modules/' + piConnections[0]._id);
            }
            else{
                FlowRouter.redirect('/configureInterface');
            }
        }],
    });

    FlowRouter.route('/exportdata', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "exportdata"});
        }
    });
    FlowRouter.route('/emaildonors', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "emailDonors"});
        }
    });
    FlowRouter.route('/charts', {
        triggersEnter: [function(context, redirect) {
            FlowRouter.redirect('/charts/Glucose'+ '?column=' +'GLU');
        }]
    });
    FlowRouter.route('/charts/:analyte', {
        triggersEnter: [function(context, redirect) {
            charRe.set(false);
        }],
        action: function(params, queryParams) {
            if(params.analyte.toLowerCase().indexOf('settings') > -1){
                BlazeLayout.render("mainLayout", { content: "urinalysisSettings"});
            }
            else{
                BlazeLayout.render("mainLayout", { content: "charts"});
            }

        }
    });

    FlowRouter.route('/scaleDemo', {
        triggersEnter: [function(context, redirect) {
            if (subs.connectionList.isReady && subs.spectroCompDB.isReady) {
                for (var p = 0; p<subs.spectroCompDB.length; p++) {
                    if(subs.spectroCompDB[p].configureAs === 'Scale Demo'){
                        FlowRouter.redirect('/scaleDemo/' + subs.spectroCompDB[p]._id);
                    }
                }
            }
        }],
    });

    FlowRouter.route('/scaleDemo/:id', {
        triggersEnter: [function(context, redirect) {
            scaleDemoPageReady.set(false);
            Tracker.autorun(function (self) {
               var t = subs.connectionList.isReady;
                if(subs.connectionList.isReady && subs.interfaces.isReady){
                    subs.connectionList[0].set(context.params.id, {clientAddress: subs.interfaces[0].clientAddress, status: 'connected'});
                    connectEm();
                    self.stop()
                }
            });

        }],
        
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "scaleDemoPage"});
        }
    });

    FlowRouter.route('/usb/:id', {
        triggersEnter: [function(context, redirect) {
            usbTabsReady.set(false);
            
            if(typeof context.params.id === 'undefined'){
                if(piConnections[0]){
                    FlowRouter.redirect('/usb/' + piConnections[0]._id);
                }
                else{
                    FlowRouter.redirect('/configureInterface');
                }
            }
        }],
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "usbWithTabs"});
        }
    });

    FlowRouter.route('/usb', {
        triggersEnter: [function(context, redirect) {
            if(piConnections[0]){
                FlowRouter.redirect('/usb/' + piConnections[0]._id);
            }
            else{
                FlowRouter.redirect('/configureInterface');
            }
        }],
    });

    FlowRouter.route('/spectrometer/:id', {
        triggersEnter: [function(context, redirect) {
            spectrometerTabsReady.set(false);

            if(typeof context.params.id === 'undefined'){
                if(piConnections[0]){
                    FlowRouter.redirect('/spectrometer/' + piConnections[0]._id);
                }
                else{
                    FlowRouter.redirect('/configureInterface');
                }
            }
        }],
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "spectrometerWithTabs"});
        }
    });

    FlowRouter.route('/spectrometer', {
        triggersEnter: [function(context, redirect) {
            if(piConnections[0]){
                FlowRouter.redirect('/spectrometer/' + piConnections[0]._id);
            }
            else{
                FlowRouter.redirect('/configureInterface');
            }
        }],
    });

    FlowRouter.route('/folderNavigation/', {
        triggersEnter: [function(context, redirect) {
            FlowRouter.redirect('/configureInterface');
        }],
    });

    FlowRouter.route('/folderNavigation/:configFor', {
        triggersEnter: [function(context, redirect) {
            if(typeof currentFolderObj === 'undefined') {
                FlowRouter.redirect('/configureInterface');
            }
        }],

        action: function(params, queryParams) {
            //console.log(params, queryParams, currentFolderObj);
            if(typeof currentFolderObj !== 'undefined'){
                currentFolderObj.set('folderPath', queryParams.path.split('.').join('/'));
                folderPath.set(queryParams.path);
                Meteor.call('folders', queryParams.path.split('.').join('/'), function(err, result){
                    folderList.set(result);
                    foldersReady.set(true);
                });
                BlazeLayout.render("mainLayout", { content: "folderNavigation"});
            }
            else{
                FlowRouter.redirect('/configureInterface');
            }
        }
    });

    FlowRouter.route('/configureInterface', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "configureInterface"});
        }
    });

    FlowRouter.route('/locations', {
        action: function(params, queryParams) {
            BlazeLayout.render("mainLayout", { content: "locations"});
        }
    });
    FlowRouter.route('/controlComputer/:id', {
        action: function(params, queryParams) {
            //console.log(params, queryParams);
            BlazeLayout.render("mainLayout", { content: "controlComputer"});
        }
    });
    Template.mainLayout.helpers({
        masterServerStatus: function(){
            return subs.ddp.status().status;
        },
        masterServerIsReady: function(){
            return subs.interfaces.isReady;
        }
    });

    Template.navBar.helpers({
        'interfaceID': function () {
            if (localStorage.getItem('myInterfaceIDstring') === null) {
                interfaceID = Math.random();
                interfaceID = interfaceID * 1000;
                localStorage.setItem('myInterfaceIDstring', interfaceID);
            }

            Session.set('iid', localStorage.getItem('myInterfaceIDstring'));
            return Session.get('iid');
        },

        'currentUserNumber': function () {
            try{
                console.log(currentSession.getUserNameNumber());
                return currentSession.getUserNameNumber();
            }
            catch(err){
                console.log('currentUserNumber error', err);
                return false;
            }
        },

        'currentUserID': function () {
            return currentSession.getCurrentUserID();
        },

        'authToShow': function () {
            if (currentSession.getAuth() == 'lab') {
                return currentSession.getUserNameNumber();
            }
            else {
                return currentSession.getAuth();
            }

        },

        connectionStatus: function () {
            if(once < 2){
                once = once + 1;
                //_.once(connectAll());
            }

        }
    });
    var once = 0;

    Template.mainLayout.events({
        //in html due to .on(touchstart, necessary for touch
    });
}