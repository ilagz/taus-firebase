const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const startingMemoryUsage = getMemoryUsage()
const app = express();
var lastMemoryUsage
var timeLastLogPrinted
var totalCount = 0;


admin.initializeApp();

//const firestoreDB = admin.firestore();

global.statusCode = 200;
global.statusBody = { "Success": "200" };




exports.isStorySaved = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const capiId = req.query.capiId;
    const environemt = req.query.env;
    
    if(environment){
        environment = environment.toUpperCase();
    }
    // make the request

    var rampartCheck = require('./lib/rampart');

    rampartCheck(rampartToken, environemt, function (err, thinkID) {
        if (!err) {
            if (thinkID !== "") {
                console.log("thinkID=" + thinkID);

                admin.database().ref('users/' + thinkID + '/stories/' + capiId).once('value', (snapshot) => {

                    if (snapshot.exists()) {
                        if (snapshot.val().delete === true) {
                            global.statusCode = 200;
                            global.statusBody = { "message": "Story is saved but deleted", "code": 410 };
                        } else {
                            global.statusCode = 200;
                            global.statusBody = { "message": "Story is saved", "code": 200 };
                        }
                    } else {
                        global.statusCode = 404;
                        global.statusBody = { "message": "Record Not Found", "code": 404 };
                    }
                    res.status(global.statusCode).send(global.statusBody);
                });

            } else {
                res.status(global.statusCode).send(global.statusBody);
            }
        } else {
            res.status(global.statusCode).send(global.statusBody);
        }
    });


})

/*exports.tvguide = functions.https.onRequest((req, res) => {

    var url = "https://www.foxtel.com.au/webepg/ws/foxtel/channels?regionId=8336";

    var request = require('request');

    // make the request
    request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("Success=" + body);
        } else{
            console.log("error=" + error);
        }
    })
})*/

exports.saveItem = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const itemId = req.query.itemId;
    const itemType = req.query.itemType;
    var environment = req.query.env;
    var itemData = req.query.itemData;
    var screenId = req.query.screenId;

    if(environment){
        environment = environment.toUpperCase();
    }
    if(!itemData){
        itemData = "";
    }
    if(!screenId){
        screenId = "";
    }

    // make the request

    var rampartCheck = require('./lib/rampart');
    rampartCheck(rampartToken, environment, function (err, thinkID) {
        if (!err) {
            if(!environment){
                environment = "";
            }

            if (thinkID !== "" && itemType && itemId) {
                var timeNow = new Date;
                admin.database().ref(environment + "users/" + thinkID + "/live/" + itemType.toString() + "/" + itemId).set({ id: itemId.toString(), data: itemData.toString(), screen: screenId.toString(), saveDate: timeNow.getTime(), saveDateDesc: (timeNow.getTime() * -1) });

                global.statusCode = 200;
                global.statusBody = { "message": "Success", "code": 200 };

            } else {
                global.statusCode = 400;
                global.statusBody = { "message": "Data Missing", "code": 400 };
            }
        }
    });
    res.status(global.statusCode).send(global.statusBody);

})

exports.savePodcast = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const podcastId = req.query.podcastId;
    const episodeId = req.query.episodeId;
    const title = req.query.title;
    const episodeTitle = req.query.episodeTitle;
    const totalDuration = req.query.totalDuration;
    const playedDuration = req.query.playedDuration;
    const thumbnail = req.query.thumbnail;
    const contentUrl = req.query.contentUrl;

    console.log("podcastID" + podcastId);

 var environment = req.query.env;
 
    if(environment){
    environment = environment.toUpperCase();
    }
    /*if(!itemData){
        itemData = "";
    }
    if(!screenId){
        screenId = "";
    }*/

    // make the request

    var rampartCheck = require('./lib/rampart');
    rampartCheck(rampartToken, environment, function (err, thinkID) {
        if (!err) {
            if(!environment){
                environment = "";
            }

            if (thinkID !== "" && podcastId) {
                var timeNow = new Date;
                admin.database().ref(environment + "users/" + thinkID + "/live/podcasts/continueplay/" + podcastId).set({ podcastId: podcastId.toString(), saveDate: timeNow.getTime(), saveDateDesc: (timeNow.getTime() * -1) });

                global.statusCode = 200;
                global.statusBody = { "message": "Success", "code": 200 };

            } else {
                global.statusCode = 400;
                global.statusBody = { "message": "Data Missing", "code": 400 };
            }
        }
    });
    res.status(global.statusCode).send(global.statusBody);

})

exports.getItems = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const rampartToken = req.query.rampartToken;
    const itemType = req.query.itemType;
    var environment = req.query.env;
    let deleteList = req.query.filter;
    let order = "";
    let dbPath = "";
    var returnString;
    returnString = "";
    //res.set('Cache-Control', 'public, max-age=300, s-maxage=300');

    if(environment){
        environment = environment.toUpperCase();
    }
    if (req.query.order === 'desc') {
        order = "saveDateDesc";
    } else {
        order = "saveDate";
    }

    // make the request

    var rampartCheck = require('./lib/rampart');

    rampartCheck(rampartToken, environment, function (err, thinkID) {
        if (!err) {
            if(!environment){
                environment = "";
            }
            if (thinkID !== "") {
                if (itemType) {
                    dbPath = environment + 'users/' + thinkID + '/live/' + itemType;
                } else {
                    dbPath = environment + 'users/' + thinkID + '/live';
                    dbPath = environment + 'users/' + thinkID;
                }

                return admin.database().ref(dbPath).orderByChild(order).once('value', (snapshot) => {
                    let items = {};
                    var itemref;
                    var newElement = {}
                    var jsonArg1 = new Object();
                    var temp = '';
                    const arrayOfResults = new Array();
                    if (itemType) {
                        snapshot.forEach(function (child) {
                           /* newElement = {};
                            newElement.id = child.key.toString();
                            newElement.data = child.val().data.toString();
                            newElement.saveDate = child.val().saveDate;
                            items[child.key] = newElement;*/
                            
                            // items.push({[child.key]:{ "saveDate": child.val().saveDate }});
                            returnString = { id : child.key.toString(), data : child.val().data.toString(), screen : child.val().screen.toString(), saveDate : child.val().saveDate };
                            //returnString = { "id" : "' + child.key.toString() + '", "data" : "' + child.val().data.toString() + '" };

                            arrayOfResults.push(returnString);
                        });
                        //returnString = returnString.slice(0, -1); 
                        //res.status(200).json({ [itemType]: items});
                        res.status(200).json({ [itemType] : arrayOfResults });
                    } else {

                        res.status(200).json({ "All": snapshot });
                    }

                });
            } else {
                res.status(global.statusCode).send(global.statusBody);
            }
        } else {
            res.status(global.statusCode).send(global.statusBody);
        }
    });

})

/*exports.deleteItem = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const itemId = req.query.itemId;
    const itemType = req.query.itemType;
    // make the request

    var rampartCheck = require('./lib/rampart');

    rampartCheck(rampartToken, function (err, thinkID) {
        if (!err) {
            if (thinkID !== "" && itemType && itemId) {

                admin.database().ref("users/" + thinkID + "/" + itemType + "/" + itemId).update({ delete: true });
                global.statusCode = 200;
                global.statusBody = { "message": "Success", "code": 200 };
            } else {
                global.statusCode = 400;
                global.statusBody = { "message": "Data Missing", "code": 400 };
            }
        }
    });
    res.status(global.statusCode).send(global.statusBody);

})*/

exports.deleteItem = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const itemId = req.query.itemId;
    const itemType = req.query.itemType;
    var environment = req.query.env;
    // make the request
    if(environment){
        environment = environment.toUpperCase();
    }
    var rampartCheck = require('./lib/rampart');

    rampartCheck(rampartToken, environment, function (err, thinkID) {
        if (!err) {
            if(!environment){
                environment = "";
            }
            if (thinkID !== "") {
                if (itemType) {
                    dbPath = environment + 'users/' + thinkID + '/' + itemType;
                } else {
                    dbPath = environment + 'users/' + thinkID;
                }

                return admin.database().ref(environment + 'users/' + thinkID + '/live/' + itemType + '/' + itemId).once('value', (snapshot) => {
                    let items = [];
                    var jsonArg1 = new Object();
                    admin.database().ref(environment + "users/" + thinkID + "/delete/" + itemType + "/" + itemId).set(snapshot.val())
                    .then(admin.database().ref(environment + "users/" + thinkID + "/live/" + itemType + "/" + itemId).remove()       
                        .then(res.status(200).json({ "message": "Success", "code": 200 }))
                        .catch(error=>{
                            console.log(error);
                            res.status(200).send(error);
                        })  
                    )
                    .catch(error=>{
                        console.log(error);
                        res.status(200).send(error);
                    });      
                });
            } else {
                res.status(global.statusCode).send(global.statusBody);
            }
        } else {
            res.status(global.statusCode).send(global.statusBody);
        }
    });

    res.status(global.statusCode).send(global.statusBody);

})

exports.isItemSaved = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const itemId = req.query.itemId;
    const itemType = req.query.itemType;
    var environment = req.query.env;
    
    if(environment){
        environment = environment.toUpperCase();
    }
    // make the request

    var rampartCheck = require('./lib/rampart');

    rampartCheck(rampartToken, environment, function (err, thinkID) {
        if (!err) {
            if(!environment){
                environment = "";
            }
            if (thinkID !== "" && itemType && itemId) {

                admin.database().ref(environment + "users/" + thinkID + '/live/' + itemType + "/" + itemId).once('value', (snapshot) => {

                    if (snapshot.exists()) {
                        if (snapshot.val().delete === true) {
                            global.statusCode = 200;
                            global.statusBody = { "message": "Item is saved but deleted", "code": 410 };
                        } else {
                            global.statusCode = 200;
                            global.statusBody = { "message": "Item is saved", "code": 200 };
                        }
                    } else {
                        global.statusCode = 404;
                        global.statusBody = { "message": "Record Not Found", "code": 404 };
                    }
                    res.status(global.statusCode).send(global.statusBody);
                });

            } else {
                global.statusCode = 400;
                global.statusBody = { "message": "Data Missing", "code": 400 };

                res.status(global.statusCode).send(global.statusBody);
            }
        } else {
            res.status(global.statusCode).send(global.statusBody);
        }
    });


})

/*exports.scheduledFunctionCrontab = functions.pubsub.schedule('0,5,10,15,20,25 17-18 * * *')
    .timeZone('Australia/Sydney') // Users can choose timezone - default is America/Los_Angeles
    .onRun((context) => {
        console.log('This will be run every day at 8:30 AM Eastern!');
        return null;
    });*/


exports.getItemstest = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const thinkID = req.query.thinkid;
    const itemType = req.query.itemType;
    let deleteList = req.query.filter;
    let order = "";
    let dbPath = "";
    var returnString;
    returnString = "{";
    //res.set('Cache-Control', 'public, max-age=300, s-maxage=300');
    /*admin.database().ref("datafile/0").update({ upload: true });
    admin.database().ref("datafile/1").update({ upload: true });
    admin.database().ref("datafile/2").update({ upload: true });
    admin.database().ref("datafile/3").update({ upload: true });
    admin.database().ref("datafile/4").set({ filename: "sample50000e.json", upload: true });*/
    // admin.database().ref("datafile/files/5").set({ filename: "userfile5.json", upload: false });


    if (req.query.order === 'desc') {
        order = "saveDateDesc";
    } else {
        order = "saveDate";
    }

    // make the request

    // var rampartCheck = require('./lib/rampart');

    if (itemType) {
        dbPath = 'users/' + thinkID + '/live/' + itemType;
    } else {
        dbPath = 'users/' + thinkID;
    }

    return admin.database().ref(dbPath).once('value', (snapshot) => {
        let items = {};
        var itemref;
        var newElement = {}
        var jsonArg1 = new Object();
        var temp = '';
        const arrayOfResults = new Array();
       
        if (itemType) {
            snapshot.forEach(function (child) {
                //newElement = {};
               // newElement.id = child.key;
               // newElement.saveDate = child.val().saveDate;
               // items[child.key] = newElement;
                // items.push({[child.key]:{ "saveDate": child.val().saveDate }});
                //keys = Object.keys(child);
                //keys.forEach(function (field){
                   // returnString = returnString + field + " : " + child.val()[field];
               // })
               // returnString = { id : child.key.toString(), data : child.val().data.toString(), saveDate : child.val().saveDate };
                //returnString = { "id" : "' + child.key.toString() + '", "data" : "' + child.val().data.toString() + '" };
                //returnString = returnString + "}";
                //returnString = child.val();

                arrayOfResults.push(child.val());
            });

           // res.status(200).json({ [itemType]: items });
            res.status(200).json({ [itemType]: arrayOfResults });

        } else {

            res.status(200).json({ "All": snapshot });
        }

    });


})



exports.saveUserData = functions.https.onRequest((req, res) => {
    let count = 0;
    let count2 = 0;
    var keys = [];
    var filename = "No File";
    var filekey;

    console.log("Function Running");

    return admin.database().ref("datafile/files").once('value', (snapshot) => {

        snapshot.forEach(function (child) {

            if (!child.val().upload && filename === "No File") {
                filename = child.val().filename;
                filekey = child.key;
            }

        });

        console.log("Filename: " + filename);

        if (filename !== "No File") {

            const { Storage } = require('@google-cloud/storage');
            const gcs = new Storage();
            var bucket = gcs.bucket('ncau-tech-taus-sit.appspot.com');

            var remoteReadStream = bucket.file(filename).createReadStream();

            JSONStream = require('JSONStream');

            es = require('event-stream');

            return remoteReadStream.pipe(JSONStream.parse('*')).pipe(es.through(function write(data) {

                printMemoryUsage(count);
                // if(count % 10000 === 0){
                //    console.log("Count="+count);
                // }

                keys = Object.keys(data);

                count++;
                return admin.database().ref("test/" + keys[0] + "/recommendation").set(data[keys[0]]);

            },
                function end() { //optional
                    var timeNow = new Date;
                    console.log(filekey + " Total Import=" + count);
                    global.statusCode = 200;
                    global.statusBody = { "Imported": count, "Filename": filename };
                    return admin.database().ref("datafile/files/" + filekey).update({ upload: true, saveDate: timeNow.getTime() })
                        .then(snap => {
                            console.log("HOWDY!!!");
                            return
                        })

                })

            )

        } else {
            console.log("NO FILE");
            global.statusCode = 305;
            global.statusBody = { "filename": "NO FILE" };

        }

        res.status(global.statusCode).send(global.statusBody);

    });




})

function getMemoryUsage() {
    lastMemoryUsage = Math.ceil(process.memoryUsage().heapUsed / 1024 / 1024)
    return lastMemoryUsage
}


function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
    return
}

function printMemoryUsage(count) {
    if ((Date.now() - timeLastLogPrinted) < 10000) {
        // Only log every 10 seconds
        return
    }

    if (lastMemoryUsage === getMemoryUsage()) {
        // Nothing new to report
        return
    }

    console.log(`Memory usage relative to starting memory: ${lastMemoryUsage - startingMemoryUsage} MB count= ${count}`)
    timeLastLogPrinted = Date.now();
    return

}



exports.saveFiles = functions.https.onRequest((req, res) => {

    var varRunDate = req.query.runDate;
    var dataRunDate;
    const axios = require('axios');
    const { Storage } = require('@google-cloud/storage');
    var count = -1;
    var userfile;

    if (!varRunDate) {
        varRunDate = "No Run Date";
    }

    return admin.database().ref("datafile").once('value', (snapshot) => {

        dataRunDate = snapshot.val().runDate;
        return


    }).then(snap => {

        if (varRunDate.substring(0, 8) === dataRunDate.substring(0, 8)) {
            console.log("Already run today=" + dataRunDate.substring(0, 8));
            res.status(200).send({ message: "Already run today" });

        } else {
            console.log(dataRunDate);
            admin.database().ref("datafile").set({});


            const processFile = (fileUrl, fileName, countid) => {
                return new Promise((resolve, reject) => {

                    // Your Google Cloud Platform project ID
                    const projectId = 'ncau-tech-taus-sit.appspot.com';

                    // Creates a client
                    const storage = new Storage();

                    // Configure axios to receive a response type of stream, and get a readableStream of the file from the specified URL
                    axios({
                        method: 'get',
                        url: fileUrl,
                        responseType: 'stream'
                    })
                        .then((response) => {

                            gcFile = storage.bucket('ncau-tech-taus-sit.appspot.com').file(fileName)

                            // Pipe the axios response data through Google Cloud
                            response.data
                                .pipe(gcFile.createWriteStream({
                                    resumable: false,
                                    validation: false,
                                    contentType: "auto"
                                }))
                                .on('error', (error) => {
                                    reject(error)
                                    console.log(error);
                                    return null;
                                })
                                .on('finish', () => {
                                    resolve(true)
                                    console.log(fileName);
                                    if (countid !== 999) {
                                        return admin.database().ref("datafile/files/" + countid).set({ filename: fileName, originalfile: fileUrl, upload: false, runDate: varRunDate });
                                    } else {
                                        return null;
                                    }

                                });
                            return;
                        })
                        .catch(err => {
                            console.log(err);
                            return null
                        });

                })
            }
            var fileName = getS3SignedUrl("theaustralian/daily_personalizations/output.json.gz");
            console.log("Here it is:" + fileName);


            return processFile(fileName, 'myausXXfiles.json.gz', 999)
                .then(result => {
                    console.log("Complete.", result);

                    const gcs = new Storage();
                    var bucket = gcs.bucket('ncau-tech-taus-sit.appspot.com');

                    var remoteReadStream = bucket.file('myausfiles.json').createReadStream();

                    JSONStream = require('JSONStream');

                    es = require('event-stream');

                    return remoteReadStream.pipe(JSONStream.parse('*')).pipe(es.through(function write(data) {

                        keys = Object.keys(data);

                        console.log(data["id"]);

                        count++;
                        userfile = "userfile" + count + ".json";
                        return processFile(data["id"], userfile, count)
                            .then(result => {

                                return null;

                            })
                            .catch(err => {
                                console.log("Error", err);
                                return null;
                            });

                    },
                        function end() { //optional

                            global.statusCode = 200;
                            global.statusBody = "Success";
                            console.log("Success");
                            console.log(varRunDate);
                            admin.database().ref("datafile").update({ runDate: varRunDate });
                            // res.status(global.statusCode).send(global.statusBody);
                        })

                    )

                    // return null
                })
                .catch(err => {
                    console.log("Error", err);

                    global.statusCode = 304;
                    global.statusBody = err
                    return null

                });
            // res.status(global.statusCode).send(global.statusBody);
        }
        return
    })
})

/*exports.locationset = functions
.region('asia-northeast1')
.https.onRequest((req, res) => {

console.log("Hello");
res.status(200).send("hello");
})*/

exports.saveFiles2 = functions.https.onRequest((req, res) => {

    var varRunDate = req.query.runDate;
    var dataRunDate;
    const axios = require('axios');
    // const unzip = require('unzipper');
    var zlib = require('zlib');
    const { Storage } = require('@google-cloud/storage');
    var count = -1;
    var userfile;

    if (!varRunDate) {
        varRunDate = "No Run Date";
    }

    return admin.database().ref("datafile").once('value', (snapshot) => {

        //dataRunDate = snapshot.val().runDate;
        return


    }).then(snap => {

        /* if (varRunDate.substring(0, 8) === dataRunDate.substring(0, 8)) {
             console.log("Already run today=" + dataRunDate.substring(0, 8));
             res.status(200).send({ message: "Already run today" });
 
         } else {*/
        console.log(dataRunDate);
        admin.database().ref("datafile").set({});


        const processFile = (fileUrl, fileName, countid) => {
            return new Promise((resolve, reject) => {

                // Your Google Cloud Platform project ID
                const projectId = 'ncau-tech-taus-sit.appspot.com';

                // Creates a client
                const storage = new Storage();

                // Configure axios to receive a response type of stream, and get a readableStream of the file from the specified URL
                axios({
                    method: 'get',
                    url: fileUrl,
                    responseType: 'stream'
                })
                    .then((response) => {

                        gcFile = storage.bucket('ncau-tech-taus-sit.appspot.com').file(fileName)

                        // Pipe the axios response data through Google Cloud
                        response.data
                            .pipe(gcFile.createWriteStream({
                                resumable: false,
                                validation: false,
                                metadata: { contentEncoding: "gzip" },
                                contentType: "application/json"
                            }))
                            .on('error', (error) => {
                                reject(error)
                                console.log(error);
                                return null;
                            })
                            .on('finish', () => {
                                resolve(true)
                                console.log(fileName);
                                if (countid !== 999) {
                                    return admin.database().ref("datafile/files/" + countid).set({ filename: fileName, originalfile: fileUrl, upload: false, runDate: varRunDate });
                                } else {
                                    return null;
                                }

                            });
                        return;
                    })
                    .catch(err => {
                        console.log(err);
                        return null
                    });

            })
        }
        var fileName = getS3SignedUrl("theaustralian/daily_personalizations/output.json.gz");
        console.log("Here it is:" + fileName);


        return processFile(fileName, 'myausXXfiles.json.gz', 999)
            .then(result => {
                console.log("Complete.", result);

                const gcs = new Storage();
                getMetadata(gcs).catch(console.error);
                var bucket = gcs.bucket('ncau-tech-taus-sit.appspot.com');

                var remoteReadStream = bucket.file('myausXXfiles.json.gz').createReadStream();

                JSONStream = require('JSONStream');

                es = require('event-stream');

                return remoteReadStream.pipe(JSONStream.parse('*')).pipe(es.through(function write(data) {

                    //keys = Object.entries(data);

                    console.log("DATA=" + data);

                    count++;
                    //userfile = "userfile" + count + ".json.gz";
                    userfile = data.split("/").pop();
                    fileName = getS3SignedUrl(data);
                    console.log(userfile + " Here it is:" + fileName);
                    return processFile(fileName, userfile, count)
                        .then(result => {

                            return null;

                        })
                        .catch(err => {
                            console.log("Error", err);
                            return null;
                        });

                },
                    function end() { //optional

                        global.statusCode = 200;
                        global.statusBody = "Success";
                        console.log("Success");
                        console.log(varRunDate);
                        admin.database().ref("datafile").update({ runDate: varRunDate });
                        // res.status(global.statusCode).send(global.statusBody);
                    })

                )

                // return null
            })
            .catch(err => {
                console.log("Error", err);

                global.statusCode = 304;
                global.statusBody = err
                return null

            });
        // res.status(global.statusCode).send(global.statusBody);
        //}
        // return
    })
})

exports.saveUserData3 = functions.https.onRequest((req, res) => {

    var filename = "No File";
    var filekey;

    console.log("Function Running");

    //return new Promise((resolve, reject) => {

    return admin.database().ref("datafile/files").once('value', (snapshot) => {

        snapshot.forEach(function (child) {

            // if (!child.val().upload && filename === "No File") {
            filename = child.val().filename;
            filekey = child.key;
            // }

            console.log("Filename: " + filename + " : " + child.val().upload);

            if (!child.val().upload) {
                if (filename !== "No File") {

                    return importFile(filename, filekey);


                } else {
                    console.log("NO FILE");
                    global.statusCode = 305;
                    global.statusBody = { "filename": "NO FILE" };
                    res.status(global.statusCode).send(global.statusBody);
                }

            }
        });

        res.status(200).send("Success!!!");

    });
    //res.status(global.statusCode).send(global.statusBody);
    // }).then(resolve) => {res.status(global.statusCode).send(global.statusBody}).catch(err => {res.status(global.statusCode).send(global.statusBody});


})

exports.saveUserData2 = functions.https.onRequest((req, res) => {

    var filename = "No File";
    var filekey;

    console.log("Function Running");

    //return new Promise((resolve, reject) => {

    return admin.database().ref("datafile/files").once('value')
        .then(snapshot => {

            const promises = [];

            snapshot.forEach(function (child) {

                // if (!child.val().upload && filename === "No File") {
                filename = child.val().filename;
                filekey = child.key;
                // }

                console.log("Filename: " + filename + " : " + child.val().upload);

                if (!child.val().upload) {
                    if (filename !== "No File") {

                        promises.push(importFile(filename, filekey));


                    } else {
                        console.log("NO FILE");
                        global.statusCode = 305;
                        global.statusBody = { "filename": "NO FILE" };
                        res.status(global.statusCode).send(global.statusBody);
                    }

                }
            });

            return Promise.all(promises);
        })
        // Edits made below to parentheses/brackets
        .then(results => {
            console.log("FINISHED!!!");
            res.status(200).send("FINISHED!!!");
            return;
        })
        .catch(err => {
            res.status(500).send(err);
        })
    //res.status(global.statusCode).send(global.statusBody);
    // }).then(resolve) => {res.status(global.statusCode).send(global.statusBody}).catch(err => {res.status(global.statusCode).send(global.statusBody});


})

function importFile(filename, filekey) {
    let count = 0;
    let count2 = 0;
    var keys = [];

    const { Storage } = require('@google-cloud/storage');
    const gcs = new Storage();
    var bucket = gcs.bucket('ncau-tech-taus-sit.appspot.com');
    var remoteReadStream;
    JSONStream = require('JSONStream');
    es = require('event-stream');

    remoteReadStream = bucket.file(filename).createReadStream();

    return new Promise(function (resolve, reject) {


        remoteReadStream.pipe(JSONStream.parse('*')).pipe(es.through(function write(data) {

            printMemoryUsage(count);
            // if(count % 10000 === 0){
            //    console.log("Count="+count);
            // }

            keys = Object.keys(data);

            count++;
            totalCount++;

            admin.database().ref("test/" + keys[0] + "/recommendation").set(data[keys[0]])
                .then(function () {
                    var timeNow = new Date;
                    console.log("ffff = " + keys[0]);
                    return admin.database().ref("test/" + keys[0] + "/recommendation").update({ saveDate: timeNow.getTime() })
                })
                .catch(error => {
                    console.log(error);
                    return;
                })

            return

        },
            function end() { //optional
                var timeNow = new Date;
                console.log(filekey + " Total Import=" + count + " Total Count=" + totalCount);
                //global.statusCode = 200;
                //global.statusBody = { "Imported": count, "Filename": filename };
                resolve(admin.database().ref("datafile/files/" + filekey).update({ upload: true, saveDate: timeNow.getTime() }));
                //return;
            })
        )
    })

}

exports.getS3SignedUrlDownload = functions.https.onRequest((req, res) => {
    const AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: "AKIAIYYLBRVHCHFKHPWQ",
        secretAccessKey: "34OQ/05SPWx45hGiaDNOiURyrZRZc1ApMpitqJNU",
        region: "us-east-1" // (e.g. :)"eu-west-1"
    });
    var s3 = new AWS.S3();
    const s3Params = {
        Bucket: "partners.vidora.com",
        Key: "theaustralian/daily_personalizations/2020-04-09/part00022.json.gz",
        Expires: 600, // Expires in 10 minutes
        ResponseContentType: "text"
    };
    res.status(200).json([s3.getSignedUrl('getObject', s3Params)]);
});

function getS3SignedUrl(myFile) {
    const AWS = require('aws-sdk');
    AWS.config.update({
        accessKeyId: "AKIAIYYLBRVHCHFKHPWQ",
        secretAccessKey: "34OQ/05SPWx45hGiaDNOiURyrZRZc1ApMpitqJNU",
        region: "us-east-1" // (e.g. :)"eu-west-1"
    });
    var s3 = new AWS.S3();
    const s3Params = {
        Bucket: "partners.vidora.com",
        Key: myFile,
        Expires: 600, // Expires in 10 minutes
        ResponseContentType: "text"
    };
    return s3.getSignedUrl('getObject', s3Params);
}



function getMetadata(storage) {
    // Gets the metadata for the file

    var myfile = storage
        .bucket('ncau-tech-taus-sit.appspot.com')
        .file('myausXXfiles.json.gz');

    var newMetadata = {
        contentEncoding: 'gzip'
    }

    // Update metadata properties
    // return myfile.setMetadata(newMetadata).then(function(data) {
    return myfile.getMetadata().then(function (data) {
        const metadata = data[0].metadata;

        /*console.log(`File: ${metadata.name}`);
        console.log(`Bucket: ${metadata.bucket}`);
        console.log(`Storage class: ${metadata.storageClass}`);
        console.log(`Self link: ${metadata.selfLink}`);
        console.log(`ID: ${metadata.id}`);
        console.log(`Size: ${metadata.size}`);
        console.log(`Updated: ${metadata.updated}`);
        console.log(`Generation: ${metadata.generation}`);
        console.log(`Metageneration: ${metadata.metageneration}`);
        console.log(`Etag: ${metadata.etag}`);
        console.log(`Owner: ${metadata.owner}`);
        console.log(`Component count: ${metadata.component_count}`);
        console.log(`Crc32c: ${metadata.crc32c}`);
        console.log(`md5Hash: ${metadata.md5Hash}`);
        console.log(`Cache-control: ${metadata.cacheControl}`);
        console.log(`Content-type: ${metadata.contentType}`);
        console.log(`Content-disposition: ${metadata.contentDisposition}`);
        console.log(`Content-encoding: ${metadata.contentEncoding}`);
        console.log(`Content-language: ${metadata.contentLanguage}`);
        console.log(`Media link: ${metadata.mediaLink}`);
        console.log(`KMS Key Name: ${metadata.kmsKeyName}`);
        console.log(`Temporary Hold: ${metadata.temporaryHold}`);
        console.log(`Event-based hold: ${metadata.eventBasedHold}`);
        console.log(
            `Effective Expiration Time: ${metadata.effectiveExpirationTime}`
        );*/
        console.log('Metadata: ' + JSON.stringify(data));
        return;
    }

    );
}

exports.testapp = functions.https.onRequest((req, res) => {
    
    var jason = JSON.stringify(req.headers);

        res.status(200).json(jason);

})

exports.getQuiz = functions.https.onRequest((req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    const quizId = req.query.quizId;
    res.set('Cache-Control', 'public, max-age=900, s-maxage=900');
    let app = admin.app();

    return app.database("https://ncau-ed-taus-quiz.firebaseio.com/").ref(quizId).once('value', (snapshot) => {

        res.status(200).json({ [quizId]: snapshot });


    });

})


app.get('/getQuiz-Cache', (req, res) => {
    res.set('Cache-Control', 'public, max-age=900, s-maxage=900');
    res.set('Access-Control-Allow-Origin', '*');
    
    const quizId = req.query.quizId;
    
    let app = admin.app();

    return app.database("https://ncau-ed-taus-quiz.firebaseio.com/").ref(quizId).once('value', (snapshot) => {

        res.status(200).json({ [quizId]: snapshot });


    });

});

app.get('/getEmbeds-Cache', (req, res) => {
    res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
    res.set('Access-Control-Allow-Origin', '*');
    
    let app = admin.app();

    return app.database("https://ncau-ed-taus-embeds.firebaseio.com/").ref("embeds").once('value', (snapshot) => {

        res.status(200).json({ embeds : snapshot });

    });

});

exports.app = functions.https.onRequest(app);