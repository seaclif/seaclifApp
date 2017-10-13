
if (Meteor.isClient) {

    Session.setDefault('displayCode', '');
    Session.setDefault('userNumberName', '');

    currentSession = {
        _userNumberName: '',
        _currentUserID: '',
        _interfaceType: '',
        _configuredAs: 'Configure',
        _auth: '',
        _iid: '',
        _deviceType: '',
        _dep3: new Tracker.Dependency,

        reset: function () {
            this.setAuth('');
            this.setCurrentUserID('');
            this.setUserCurrentUserIDwCode('');
            this.setUserNameNumber('');
            _userNumberName = '';
            _currentUserID = '';
            _auth = '';
            _iid = '';
        },

        iid: function () {
            if (localStorage.getItem('myInterfaceIDstring') === null) {
                interfaceID = Math.random();
                interfaceID = interfaceID * 1000;
                localStorage.setItem('myInterfaceIDstring', interfaceID);
            }
            this._iid = localStorage.getItem('myInterfaceIDstring');
            this._dep3.changed();

            return this._iid;
        },

        getCurrentUserID: function () {
            //if this is in, it will loop infinitly: this._dep2.depend();
            return this._currentUserID;
        },

        setCurrentUserID: function (userID) {
            this._currentUserID = userID;
            this._dep3.changed();
            return this._currentUserID;
        },

        getUserNameNumber: function () {
            this._dep3.depend();
            return this._userNumberName;
        },

        setUserCurrentUserIDwCode: function (userCode) {
            this._dep3.changed();
            return this._currentUserID;
        },

        setUserNameNumber: function (userNameNumber) {
            this._userNumberName = userNameNumber;

        },

        setAuth: function (authentication) {
            this._auth = authentication;
            this._dep3.changed();
            return this._auth;
        },

        getAuth: function () {
            this._dep3.depend();
            return this._auth;
        },

        user: function (value) {
            this._user = value;
            this._dep3.changed();
            this._dep3.depend();
            return this._userID;
        },

        setInterfaceType: function (type) {
            this._interfaceType = type;
            this._dep3.changed();
            return this._interfaceType;
        },

        interfaceType: function () {
            this._dep3.depend();
            return this._interfaceType;
        },

        getConfigureAs: function(){
            /*
            if (this._configuredAs == ''){

                var conAs = interfaces.findOne({interfaceID: this._iid}).configuredAs;
                this._configuredAs = conAs;
                return conAs;
            }
             */
            this._dep3.depend();
            return this._configuredAs;
        },

        setConfiguredAs: function(configuredAs){
            this._configuredAs = configuredAs;
            this._dep3.changed();
            return this._configuredAs;
        },

        setInterfaceType: function(){
            if(this._deviceType == ''){
                this._deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
            }
            this._dep3.changed();
            return this._deviceType;
        },

        deviceType: function() {
            if(this._deviceType == ''){
                this._deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
            }
            this._dep3.depend();
            return this._deviceType;
        }


    };


    //populate userNumber wehn currentUserID changes
    Tracker.autorun(function getUserNumber() {
        try {
            var currentUserInDB = subs.interfaces.findOne({interfaceID: currentSession.iid()}).currentUser;
        }
        catch (err) {
        }
        if (currentSession.getCurrentUserID() !== currentUserInDB) {
            currentSession.setCurrentUserID(currentUserInDB);
        }
        try {
            currentSession.setInterfaceType(subs.interfaces.findOne({interfaceID: currentSession.iid()}).interfaceType);
        }
        catch (err) {
        }

        try {
            currentSession.setConfigureAs(subs.interfaces.findOne({interfaceID: currentSession.iid()}).configureAs);
        }
        catch (err) {
        }

        var userID = currentSession.getCurrentUserID();

        if (userID == 'undefined' || userID == null ||
            userID == '' || userID < 5) {
        }
        else {
            Meteor.call('getUserDetail', userID, 'userNumber', function (err, result) {
                if (result == 'undefined' || result == null || result == '' || result.length < 5) {
                    Session.set('userNumberName', '');
                    //currentSession.setUserNameNumber(Session.get('userNumberName'));
                    currentSession.setUserNameNumber('');
                } else {
                    //Session.set('userNumberName', result);
                    currentSession.setUserNameNumber(result);
                }
            });
            Meteor.call('getUserDetail', userID, 'auth', function (err, result) {
                if (result == 'undefined' || result == null || result == '') {
                    currentSession.setAuth('');
                } else {
                    currentSession.setAuth(result);
                }
            });
        }
    });


    logoutTime = function () {

        if (FlowRouter.current().path === '/') {
            userCode.logout();
        }
        console.log('would like to logout');
        clearTimeout(logoutTimer);
        logoutTimer = undefined;

    };
    logoutTimer = undefined;

    userCode = {
        _currentKey: '',
        _displayCode: '',
        _userCode: '',
        _fullCode: '',
        _dep4: new Tracker.Dependency,

        getFullCode: function () {
            return this._fullCode;
        },

        setFullCode: function (stuff) {
            this._fullCode = stuff;
            this._dep4.changed();
            return this._fullCode;
        },

        logout: function (callback) {
            console.log('logging out');

            this._currentKey = '';
            this.setDisplayCode('');
            this._userCode = '';
            Session.set('displayCode', '');
            Meteor.call('interfaceSetParam', currentSession.iid(), 'currentUser', '');

            currentSession.setUserNameNumber('');
            currentSession.setCurrentUserID('');
            currentSession.reset();

            userProfile.reset();

            FlowRouter.go('/');
            this._dep4.changed();
            this._dep4.depend();



            return callback && callback();

        },

        set: function (value) {
            console.log('value of login is', value);
            if(typeof logoutTimer !== 'undefined'){
                clearTimeout(logoutTimer);
                logoutTimer = undefined;
            }
            if(typeof logoutTimer === 'undefined') {
                logoutTimer = setTimeout(function () { logoutTime() }, 20000);
            }

            if (value == '#') {
                this.setFullCode(this._userCode);
                if(typeof this._userCode !== 'undefined'){
                    if(typeof this._userCode.length !== 'undefined') {
                        if(this._userCode.length > 0) {
                            Meteor.call('loginWuserCode', currentSession.iid(), this._userCode, function (err, result) {
                                if (result.length > 0) {
                                    if(piConnections.length === 0){
                                        FlowRouter.go('/scaledemo');
                                    }
                                    else if(subs.spectroCompDB.getOne({_id: piConnections[0]._id}).configureAs.indexOf("Login") > -1){
                                        FlowRouter.go('/directions');
                                    }
                                    else{
                                        FlowRouter.go('/scaledemo');
                                    }

                                }
                            });
                        }
                    }
                }
                //Router.go('/');

                this._currentKey = '';
                this._displayCode = '';
                this._userCode = '';
                Session.set('displayCode', '');

                this._fullCode = '';
                //console.log('value of login is', value);

                this._dep4.depend();
                this._dep4.changed();


            }

            else if (value == '*') {
                if(typeof this._userCode !== 'undefined') {
                    if (typeof this._userCode.length !== 'undefined') {
                        if (this._userCode.length > 0) {

                            Meteor.call('loginWuserCode', currentSession.iid(), this._userCode, function (err, result) {
                                if (result.length > 0) {
                                    Meteor.call('getUserDetail', result, 'auth', function (err, result) {
                                        if (result == 'undefined' || result == null || result == '') {
                                            currentSession.setAuth('');
                                            FlowRouter.go('/');

                                        } else {
                                            currentSession.setAuth(result);
                                            if (result == 'lab') {
                                                FlowRouter.go('/queue');
                                            }
                                            else {
                                                FlowRouter.go('/');
                                            }
                                        }

                                    });


                                }
                            });
                        }
                    }

                }


                this._currentKey = '';
                this._displayCode = '';
                this._userCode = '';
                Session.set('displayCode', '');

                this._fullCode = '';

                this._dep4.depend();
                this._dep4.changed();
            }

            else {
                this._currentKey = value;
                this._userCode = this._userCode + value;
                cStat = '';
                for (i = 0; i < this._userCode.length - 1; i++) {
                    cStat = cStat + '\u25CF';

                }
                this._displayCode = cStat + this._currentKey;

                Session.set('displayCode', this._displayCode);

                this._dep4.changed();
                return this._userCode;
            }

        },

        setDisplayCode: function (displayCode) {
            this._displayCode = displayCode;
            this._dep4.changed();
            return this._displayCode;
        },

        displayCode: function () {
            this._dep4.depend();
            return this._displayCode;
        },

        get: function () {
            this._dep4.depend();
            return this._userCode;
        }
    };

    Tracker.autorun(function userCodeStuff() {
        var userID = userCode.getFullCode();
        if (userCode.getFullCode().length > 2) {
            if(currentSession.iid() && userCode.getFullCode()){
                Meteor.call('loginWuserCode', currentSession.iid(), userCode.getFullCode(), function (err, result) {
                    userCode.setFullCode('');
                });
            }


        }
        //currentSession.setUser()
    });
    Template.key.onCreated(function(){
        if(typeof currentSession.getCurrentUserID() !== 'undefined'){
            if(currentSession.getCurrentUserID().length > 0){
                if(typeof logoutTimer === 'undefined'){
                    logoutTimer = setTimeout(function(){ logoutTime()}, 30000);
                }

            }
        }
    });

    Template.key.onDestroyed(function(){
        if(typeof logoutTimer !== 'undefined') {
            clearTimeout(logoutTimer);
            logoutTimer = undefined;
        }
    });

    Template.key.helpers({
        keyCode: function () {
            return userCode.displayCode();
        },

        'serverStatus':function(){
            return Meteor.status().status;
        },
    });

    createAccount = function () {
        userCode.logout();

        Meteor.call('newUser', currentSession.iid(), function (err, result) {
            currentSession.setCurrentUserID(result);
        });

        FlowRouter.go('/userprofile')
    }


}
