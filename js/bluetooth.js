if (Meteor.isClient) {

    var output = new ReactiveVar();

    Template.bluetooth.helpers({
        output: function () {
            return output.get();
        }
    });
    Template.bluetooth.onCreated(function () {
        setTimeout(function () {
            document.getElementById("answer").value = "running bluetooth";
            bluetoothle.initialize(function () {
                bluetoothle.startScan(function (device) {
                    allDevices += JSON.stringify(device);
                    console.log(JSON.stringify(device));
                    output.set(output.get() + allDevices);
                    //document.getElementById("answer").value = allDevices;

                });
            });
        }, 500);

        setTimeout(function () {
            bluetoothle.stopScan();
        }, 1000);

        setInterval(function () {
            bluetoothle.connect(function success(success) {
                document.getElementById("answer").value = "connect succcess " + JSON.stringify(success);
                console.log("connect succcess", JSON.stringify(success));
                
                bluetoothle.discover(function successful(success) {
                    //document.getElementById("answer").value = "discover succcess " + JSON.stringify(success);
                    output.set(output.get() + JSON.stringify(success));
                    console.log("discover succcess", JSON.stringify(success));
                    setTimeout(function () {
                        var string = "Pass Hello World and a bunch of other stuff because this is a really long string! Pass Hello World and a bunch 12345676342342342342342412342234234234234";
                        var bytes = bluetoothle.stringToBytes(string);
                        var encodedString = bluetoothle.bytesToEncodedString(bytes);

                        bluetoothle.write(
                            function writeSuccess(success) {
                                //document.getElementById("answer").value = "writeSuccess succcess " + JSON.stringify(success);
                                output.set(output.get() + " writeSuccess succcess " + JSON.stringify(success));
                                console.log("writeSuccess succcess", JSON.stringify(success));
                            }, function err(error) {
                                console.log("write Fail", error);
                                output.set(output.get() + " write fail " + JSON.stringify(error));
                                //document.getElementById("answer").value = "write fail " + JSON.stringify(error);

                            },
                            {
                                "address": "CD03257E-C886-FA12-28D8-CEB070FF4C65",
                                "value": encodedString,
                                "service": "4321",//"13333333-3333-3333-3333-333333333337",
                                "characteristic": "1234",//"13333333-3333-3333-3333-333333330001",
                                "descriptor": "2901",
                                "type": "noResponse",

                            });
                        setInterval(function () {
                            bluetoothle.read(function success(success) {
                                var bytes = bluetoothle.encodedStringToBytes(success.value);
                                var string = bluetoothle.bytesToString(bytes);
                                output.set(output.get() + " writeSuccess succcess " + JSON.stringify(success));
                                //document.getElementById("answer").value = "readSuccess succcess " + JSON.stringify(success) + " parsed string: " + string;
                                console.log("writeSuccess succcess", JSON.stringify(success));

                            }, function (fail) {
                                output.set(output.get() + " read fail " + JSON.stringify(fail));
                                //document.getElementById("answer").value = "readSuccess succcess " + JSON.stringify(fail);

                            }, {
                                "address": "CD03257E-C886-FA12-28D8-CEB070FF4C65",
                                "service": "4321",//"13333333-3333-3333-3333-333333333337",
                                "characteristic": "1234", //"13333333-3333-3333-3333-333333330001",
                                "descriptor": "2901",
                                "type": "noResponse",

                            })

                        }, 3000)
                    }, 1000)

                }, function discoverError() {

                }, success);
            }, function err(error) {
                output.set(output.get() + " read fail " + JSON.stringify(error));
                console.log("con Fail", error);
                //document.getElementById("answer").value = "conn fail " + error;

            }, {"address": "CD03257E-C886-FA12-28D8-CEB070FF4C65"});

        }, 500);
    });

}