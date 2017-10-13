if (Meteor.isClient) {

    userProfile = {
        _btnCheckColor: 'color-red',
        _passcode: '',
        _generated:'',
        _passOrText: 'password',
        _validCreateUser:'',
        _allowLabAccount:'',

        _dep: new Tracker.Dependency,
        _dep1: new Tracker.Dependency,
        _dep2: new Tracker.Dependency,
        _dep6: new Tracker.Dependency,
        _dep7: new Tracker.Dependency,

        reset: function () {
            this.setAllowLabAccount(false);
            this.setBtnCheckColor(false);
            this.setPasscode('');
            this.setPasswordOrText('password');
            this.setValidCreateUser(true);
            this.clearGeneratedCode();
            _btnCheckColor = 'color-red';
            _passcode = '';
            _generated = '';
            _passOrText = 'password';
            _validCreateUser = '';
            _allowLabAccount = '';
        },

        getBtnCheckColor: function () {
            this._dep1.depend();
            return this._btnCheckColor;
        },
        setBtnCheckColor: function (good) {
            if (good) {
                this._btnCheckColor = 'color-green';
            }
            else{
                this._btnCheckColor = 'color-red';
            }
            this._dep1.changed();
            return this._btnCheckColor;
        },
        getPasscode: function () {
            this._dep.depend();
            return this._passcode;
        },
        setPasscode: function (passcode) {
            this._passcode = passcode;
            this._dep.changed();
            return this._passcode;
        },
        clearGeneratedCode: function(){
            this._generated = '';
            this._dep2.changed();
            return this._generated;
        },
        setGeneratedCode: function() {

            var code = parseInt(Math.random() * 100000);
            while(code.toString().length < 5){
                code = parseInt(Math.random() * 100000);
            }
            this._generated = code;
            this._dep2.changed();
            return code;
        },
        getGeneratedCode: function () {
            this._dep2.depend();
            return this._generated;
        },
        getPasswordOrText: function(){
            this._dep.depend();
            return this._passOrText;
        },
        setPasswordOrText: function(val){
            this._passOrText = val;
            this._dep.changed();
            return this._passOrText;
        },
        setValidCreateUser: function (isValid) {
            if(isValid){
                this._validCreateUser = '';
            }
            else{
                this._validCreateUser = "Please enter a valid Email and Passcode.";
            }
            this._dep6.changed();
        },
        getIsValidCreateUser: function () {
            this._dep6.depend();
            return this._validCreateUser;
        },
        setAllowLabAccount: function (allow) {
            if(allow){
                this._allowLabAccount = 'Data/Lab User';
            }
            else{
                this._allowLabAccount = '';
            }
            this._dep7.changed();
        },
        getAllowLabAccount: function () {
            this._dep7.depend();
            return this._allowLabAccount;
        }
    };

    Tracker.autorun(function checkGeneratedCode() {
        var usrCode = userProfile.getGeneratedCode();
        if(usrCode.toString().length > 4){
            Meteor.call('checkCodeGood', usrCode.toString(), function(err, result){
                if(result){
                    userProfile.setPasscode(usrCode.toString());
                    userProfile.setPasswordOrText('text');
                    Meteor.call('setUserDetail', currentSession.getCurrentUserID(), 'userCode', usrCode.toString());
                }
                else{

                }
            });
        }
    });

    /*
    Tracker.autorun(function validCreateUser() {
        Meteor.call('validCreateUser', currentSession.getCurrentUserID(), function (err, result) {
            if (result) {
                Router.go('/');
            }
            else {
                userProfile.setValidCreateUser(false);
            }
        });
    });
    */

    Tracker.autorun(function checkUserEnteredCode() {
        var usrCode = userProfile.getPasscode();
        userProfile.setBtnCheckColor(false);

        if (usrCode.length > 4) {
            Meteor.call('checkCodeGood', userProfile.getPasscode(), function (err, result) {
                userProfile.setBtnCheckColor(result);
            });
        }
        else {
            userProfile.setBtnCheckColor(false);
        }
    });

    Template.userprofile.onCreated(function(){
        createAccount();
    });

    Template.userprofile.helpers({
        'colorCheck': function () {
            return userProfile.getBtnCheckColor();
        },
        'generated': function (){
            return userProfile.getGeneratedCode();
        },
        'passwordOrText': function () {
            return userProfile.getPasswordOrText();
        },
        'validCreateUser': function (){
            return userProfile.getIsValidCreateUser();
        },
        'datalabUser':function(){
            return userProfile.getAllowLabAccount();
        }

    });

    Template.userprofile.events({
        'keyup [class=item-input]': function (event) {

            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            } else {
                Meteor.call('setUserDetail', currentSession.getCurrentUserID(), $(event.target).attr('name'), $(event.target).val());
            }
        },

        'change [class=select]': function (event) {
            if($(event.target).val().indexOf('Part') > -1 || $(event.target).val().indexOf('..') > -1){
                var s = currentSession.setAuth('');
            }
            if($(event.target).val().indexOf('Lab') > -1 ){
                var s = currentSession.setAuth('lab');
            }
            Meteor.call('setUserDetail', currentSession.getCurrentUserID(), $(event.target).attr('name'), $(event.target).val());
        },

        'click #generateCode': function (event) {
            userProfile.setGeneratedCode();
        },

        'keydown [class=select]': function (event) {

            if (event.which == 65) {
                event.preventDefault();
                var s = currentSession.setAuth('lab');
                userProfile.setAllowLabAccount(true);
            }
        },

        'click #submitForm': function (event) {
            console.log('currentSession.getCurrentUserID()', currentSession.getCurrentUserID())
            Meteor.call('validCreateUser', currentSession.getCurrentUserID(), function(err, result){
                if(result){
                    Meteor.call('setUserDetail', currentSession.getCurrentUserID(), 'interfaceCreatedOn', currentSession.iid());
                    Meteor.call('setUserDetail', currentSession.getCurrentUserID(), 'emailSent', true);
                    Meteor.call('sendEmail',
                        currentSession.getCurrentUserID(),
                        'aschulz@newvistas.com',
                        'Thank You for Registering',
                        'You are now a participant. Your key code is ');
                    FlowRouter.go('/directions');

                }
                else{
                    userProfile.setValidCreateUser(result);
                }
            });

        },

        'click #cancelForm': function (event) {
            Meteor.call('setUserDetail', currentSession.getCurrentUserID(), 'userCode', '', function(err, result){
                userCode.logout();
            });

            userCode.logout();
            FlowRouter.go('/');
        },

        'keyup [name=userCode]': function (event) {

            if (event.which == 13 || event.which == 27) {
                $(event.target).blur();
            } else {
                userProfile.setPasscode($(event.target).val());
                Meteor.call('setUserDetail', currentSession.getCurrentUserID(), $(event.target).attr('name'), $(event.target).val());
            }
        }

    });

// In your client code: asynchronously send an email

}
