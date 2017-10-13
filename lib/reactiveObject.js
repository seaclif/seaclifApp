addReactiveProperty = function (o, propName) {
    // Need special treatment if property already exists
    if (o.hasOwnProperty(propName)){}
    else {

        // Create the Symbol (key)
        var pSymbol = Symbol.for(propName);

        // Populate the property with a Reactive Variable
        // Using the Symbol as the key so it's not enumerable / readily available
        o[pSymbol] = new ReactiveVar();

        // Create the enumerated property with getter and setter
        Object.defineProperty(o,
            propName,
            {
                // we want the property to be enumerable
                enumerable: true,

                // In the setter, we call the ReactiveVar.set() which triggers the reactive context
                set: function (x) {
                    var pSymbol = Symbol.for(propName);
                    this[pSymbol].set(x);
                },

                get: function () {
                    var pSymbol = Symbol.for(propName);
                    return this[pSymbol].get();
                }

            });

        return o;
    }
};

addReady = function(obj, coll, callback){
    Object.defineProperty(obj[coll], 'isReady', {
        enumerable: true,
        get: function() {
            return this._connection.status().connected && this.ready();
        }
    });
    return callback && callback(obj, coll);
};

addRePush = function(ar, fields){
    var i = ar.length;
    ar[i] = {};
    ar[i]['_id'] = fields._id;
    Object.keys(fields).forEach(function (key) {
        if(key.indexOf('_id') === -1) {
            if (!ar[i].hasOwnProperty(key)) {
                Object.defineProperty(ar[i], key, {
                    enumerable: true,
                    set: function (x) {
                        var s = {};
                        s[key] = x;
                        ar.update({_id: ar[i]._id}, {$set: s});
                    },

                    get: function () {
                        return ar.findOne({_id: ar[i]._id})[key];
                    }
                });
            }
        }
        //obj[key] = fields[key];
        // use val
    });
    ar[i]['set'] = function(key, value){
        addReField(ar, this, key);
        this[key] = value;
    }
    Object.defineProperty(ar[i], 'set', {enumerable:false})
    ar[i]['unset'] = function(key){
        var mod = {}
        mod[key] = true;
        ar.update({_id: this._id}, {$unset: mod});
    }
    Object.defineProperty(ar[i], 'unset', {enumerable:false})
};

addReReplace = function(ar, index, fields){
    var i = index;
    ar[i] = {};
    ar[i]['_id'] = fields._id;
    Object.keys(fields).forEach(function (key) {
        if(key.indexOf('_id') === -1) {
            if (!ar[i].hasOwnProperty(key)) {
                Object.defineProperty(ar[i], key, {
                    enumerable: true,
                    set: function (x) {
                        var s = {};
                        s[key] = x;
                        ar.update({_id: ar[i]._id}, {$set: s});
                    },

                    get: function () {
                        return ar.findOne({_id: ar[i]._id})[key];
                    }
                });
            }
        }
        //obj[key] = fields[key];
        // use val
    });
    ar[i]['set'] = function(key, value){
        addReField(ar, this, key);
        this[key] = value;
    }
    Object.defineProperty(ar[i], 'set', {enumerable:false})

    ar[i]['unset'] = function(key){
        var mod = {}
        mod[key] = true;
        ar.update({_id: this._id}, {$unset: mod});
    }
    Object.defineProperty(ar[i], 'unset', {enumerable:false})
    //console.log('addReactive', obj);
};

addReactiveColl = function(obj, collection, callback){
    var t = new Array()
    var fetch = obj[collection].find().fetch();
    jQuery.extend(t, obj[collection]);

    if(fetch.length > 0) {
        for (var c in fetch) {
            addRe(t, c);
        }
    }
    obj[collection] = t;
    return callback && callback(obj, collection);
};

addReField = function(ar, arThis, key){
    if (!arThis.hasOwnProperty(key)) {
        Object.defineProperty(arThis, key, {
            enumerable: true,
            set: function (x) {
                var s = {};
                s[key] = x;
                ar.update({_id: arThis._id}, {$set: s});
            },

            get: function () {
                return ar.findOne({_id: arThis._id})[key];
            }
        });
    }
}

addRe = function(ar, i){
    ar[i] = {};
    ar[i]['_id'] = ar.find().fetch()[i]._id;
    var fields = ar.find().fetch()[i];
    Object.keys(fields).forEach(function (key) {
        if(key.indexOf('_id') === -1) {
            if (!ar[i].hasOwnProperty(key)) {
                Object.defineProperty(ar[i], key, {
                    enumerable: true,
                    set: function (x) {
                        var s = {};
                        s[key] = x;
                        ar.update({_id: ar[i]._id}, {$set: s});
                    },

                    get: function () {
                        return ar.findOne({_id: ar[i]._id})[key];
                    }
                });
            }
        }
        //obj[key] = fields[key];
        // use val
    });

    ar[i]['set'] = function(key, value){
        addReField(ar, this, key);
        this[key] = value;
    }
    Object.defineProperty(ar[i], 'set', {enumerable:false});

    ar[i]['unset'] = function(key){
        var mod = {}
        mod[key] = true;
        ar.update({_id: this._id}, {$unset: mod});
    }
    Object.defineProperty(ar[i], 'unset', {enumerable:false})
};

addReRemove = function(ar, i){
    ar[i] = {};
    ar[i]['_id'] = ar.find().fetch()[i]._id;
    var fields = ar.find().fetch()[i];
    Object.keys(fields).forEach(function (key) {
        if(key.indexOf('_id') === -1) {
            if (!ar[i].hasOwnProperty(key)) {
                Object.defineProperty(ar[i], key, {
                    enumerable: true,
                    set: function (x) {
                        var s = {};
                        s[key] = x;
                        ar.update({_id: ar[i]._id}, {$set: s});
                    },

                    get: function () {
                        return ar.findOne({_id: ar[i]._id})[key];
                    }
                });
            }
        }
        //obj[key] = fields[key];
        // use val
    });

    ar[i]['set'] = function(key, value){
        addReField(ar, this, key);
        this[key] = value;
    }
    Object.defineProperty(ar[i], 'set', {enumerable:false});

    ar[i]['unset'] = function(key){
        var mod = {}
        mod[key] = true;
        ar.update({_id: this._id}, {$unset: mod});
    }
    Object.defineProperty(ar[i], 'unset', {enumerable:false})
};

subSimple = function (obj, coll) {
    //db['ob'] = new Tracker.autorun(function(){
    obj[coll].find().observeChanges({
        added: function (id, field) {
            var s = id;
            if(typeof obj[coll]['arrayReady'] !== 'undefined'){
                obj[coll].push({_id: id})
            }
            //console.log('changed', id, obj[coll]);
        },
        changed: function (id, fields) {
            if(typeof obj[coll]['arrayReady'] !== 'undefined'){
                obj[coll].replace({_id: id});
                //console.log('changed', id);
            }
        },
        removed: function (id, fields) {
            console.log('removed');
            console.log(id, fields);
            if(typeof obj[coll]['arrayReady'] !== 'undefined'){
                obj[coll].pluck(id);
            }
        }
    });
    //})
};

reactiveObject = function(ip, id, updateConnection, clientAddress) {

    if (ip) {

        this['ddp'] = DDP.connect(ip);
        if (updateConnection) {
            this['ddp']['updateConnection'] = updateConnection;
            this['ddp']['clientAddress'] = clientAddress;
            this['ddp']['_id'] = id;
            this['ddp']['connectionStatus'] = function () {
                if (this['updateConnection'].isReady) {

                    var ddpStatus = this.status().status;
                    //console.log('ddp status', ddpStatus);
                    //console.log("this['clientAddress']", this['clientAddress']);

                    this['updateConnection'][0].set(this['_id'], {
                        clientAddress: this['clientAddress'],
                        status: ddpStatus
                    });

                }
                //connectionsTracker.depend();
            }
            connectionsComputation.invalidate();
        }
    }
    else {
        this['ddp'] = Meteor.connection;
    }
    if (id) {
        this['_id'] = id;
    }

    this['addCollection'] = function (collection, params) {
        if (!this[collection]) {
            addReactiveProperty(this, collection);
            this[collection] = new Mongo.Collection(collection, {connection: this.ddp});
            if (params)
                jQuery.extend(this[collection], this.ddp.subscribe(collection, params));
            else
                jQuery.extend(this[collection], this.ddp.subscribe(collection));

            subSimple(this, collection);

            addReady(this, collection, function (obj, coll) {
                new Tracker.autorun(function (c) {
                    var s = obj[coll].isReady;
                    if (obj[coll].isReady) {
                        addReactiveColl(obj, coll, function (obj, collection) {
                            obj[collection].push = function () {
                                //console.log(this, arguments);
                                addRePush(obj[collection], obj[collection].findOne(arguments[0]));
                                //var re = Array.prototype.push.apply(this,arguments);
                                obj[collection] = obj[collection];
                                return obj[collection];
                            };
                            obj[collection].pop = function () {
                                var re = Array.prototype.pop.apply(this, arguments);
                                obj[collection] = obj[collection];
                                return re;
                            };
                            obj[collection].pluck = function (id) {
                                for (i = 0; i < obj[collection].length; i++) {
                                    console.log('pluck', id, obj[collection][i]._id);
                                    if (id === obj[collection][i]._id) {
                                        return obj[collection].splice(i,1);
                                    }
                                }
                                return undefined;
                            };
                            obj[collection].unset = function (id, key) {
                                //console.log('splice', arguments);
                                var mod = {};
                                mod[key]= true;
                                var re = obj[collection].update({_id: id}, {$unset:mod});
                                //addReactiveColl(obj, collection);
                                //obj[collection] = obj[collection];
                                return re;
                            };
                            obj[collection].splice = function () {
                                //console.log('splice', arguments);
                                var re = Array.prototype.splice.apply(this, arguments);
                                addReactiveColl(obj, collection);
                                obj[collection] = obj[collection];
                                return re;
                            };
                            obj[collection].getOne = function () {
                                /*console.log('getOne', arguments, Object.keys(arguments[0])[0], arguments[0][Object.keys(arguments[0])[0]]);
                                var s = obj[collection].findIndex(function (x) {
                                    return x[Object.keys(arguments[0])[0]] === arguments[0][Object.keys(arguments[0])[0]];
                                });
                                if(s == -1){
                                    return undefined;
                                }
                                else{
                                    return obj[collection][s];
                                }*/
                                if(obj[collection].findOne(arguments[0])){
                                    var match = false;
                                    for (i = 0; i < obj[collection].length; i++) {
                                        for(var p in arguments[0]){
                                            //console.log('getOne', p, arguments[0][p]);
                                            if (arguments[0][p] === obj[collection][i][p]) {
                                                match = true;
                                            }
                                            else{
                                                match = false;
                                            }
                                        }
                                        if(match){
                                            return obj[collection][i];
                                        }
                                    }

                                    if(!match){
                                        return false;
                                    }
                                }
                                else
                                    return undefined;

                            };
                            obj[collection].remove = function () {
                                //console.log(arguments, this, obj, collection);
                                var re = 'remove';
                                for (i = 0; i < obj[collection].length; i++) {
                                    //console.log('remove', arguments[0]._id, obj[collection][i]._id);
                                    if (arguments[0]._id === obj[collection][i]._id) {
                                        re = obj[collection].splice(i,1);
                                    }
                                }
                                Mongo.Collection.prototype.remove.apply(obj[collection], arguments);
                                return re;
                            };
                            obj[collection].replace = function () {
                                for (i = 0; i < obj[collection].length; i++) {
                                    if (obj[collection][i]._id === arguments[0]._id) {
                                        //console.log('replace', {_id: arguments[0]._id});
                                        addReReplace(obj[collection], i, obj[collection].findOne({_id: arguments[0]._id}));
                                    }
                                }
                                //var re = Array.prototype.splice.apply(this,arguments);
                                obj[collection] = obj[collection];
                                //return re;
                            };
                            obj[collection]['arrayReady'] = true;
                            c.stop();
                            if (typeof obj['tracker'] !== 'undefined') {
                                obj['tracker']();
                            }

                            addReady(obj, collection);
                        });

                    }
                })
            });
        }
    }
};