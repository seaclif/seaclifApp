if (Meteor.isClient) {

    Template.garage.onCreated(function () {
        subs.addCollection('garageServer');
        subs.addCollection('interfaces', iid());
    });
    doVibrate = 'undefined';

    Template.garage.helpers({
        garageIsReady: function(){
            return subs.garageServer.isReady;
        },
        garageOpenClose: function () {
            if(subs.garageServer[0].open){
                return "Close";
            }
            else{
                return "Open";
            }
        },

        garageOpenCloseColor: function () {
            if(subs.garageServer[0].open){
                return "red";
            }
            else{
                return "green";
            }
        },

        garageState: function () {
            return subs.garageServer[0].state;
        }
    });

    Template.garage.events({

        'click #garageBtn': function () {

            if(typeof subs.garageServer[0].click === 'undefined'){
                subs.garageServer[0].set("click", true);
                setTimeout(function(){subs.garageServer[0].set("click", false)}, 2000);
            }
            else if (subs.garageServer[0].click != true){
                subs.garageServer[0].set("click", true);
                setTimeout(function(){subs.garageServer[0].set("click", false)}, 2000);
                
            }
            setTimeout(function(){subs.garageServer[0].set("click", false)}, 4000);
        },

        'click #showConfigSettings': function () {
            if(doVibrate == 'undefined'){
                doVibrate = setInterval(function(){navigator.vibrate(3000)}, 2000);
            }else{
                clearInterval(doVibrate);
                doVibrate = 'undefined'
            }

        }

    });
}