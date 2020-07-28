const functions = require('firebase-functions');
const admin = require('firebase-admin');
const pubkey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyR5lICHbqsMNjdJFvtHFIspDBtIJPGFvmMEyAncyM4Bqi4nHuYBu62yvnD28PC4Hx2f67g2FTUtWXWO9jPkQlnxctG3WPu52Fq9PfNAdVTtCj3JGqSeCnlVJweDd0dKmoiQ+UjlyPkgkukF0kcgAS3WFiKwA8d7UCels1oH2aqcLM4fQjEXMO8hFx2yKU8hDKhb6ECjsTl6QwfwgFg6b88JSCeRPh/pmc21mjx0IEkTgPT7Z9RRk7KodSL9XEf6LVT99zdlHwhAVjOaIGy/BFoCyXw0RK0drVPHa0rU6QL3VK5g7ZQXTta0WBknbUtQQgA2t/QkzJOPIc7td1ALmiwIDAQAB\n-----END PUBLIC KEY-----";

//admin.initializeApp(functions.config().firebase);

//let db = admin.firestore();


//const admin = require('firebase-admin');
admin.initializeApp();

const firestoreDB = admin.firestore();

global.statusCode = 200;
global.statusBody = { "Success": "203" };


exports.saveStory = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    const capiId = req.query.capiId;

    // make the request

    var jwt = require('jsonwebtoken');

    jwt.verify(rampartToken, pubkey, function (err, decoded) {
        if (!err) {
            var thinkID = decoded["http://login.newscorpaustralia.com.au/profile"].think_id;
            if (thinkID !== "") {
                console.log("thinkID=" + thinkID);
                var timeNow = new Date;
                admin.database().ref("users/" + thinkID + "/stories/" + capiId).set({ saveDate: timeNow.getTime(),saveDateDesc: (timeNow.getTime()*-1) });
                //console.log("XXXHELLLLLO!!!");
                //const citiesRef = db.collection('users');

                //('users/'+thinkID+'/stories/'+capiId).set({saveDate: timeNow.getTime()}).catch(error => {console.log('Error writing document: ' + error);return false;});
                
               /* let docRef =firestoreDB.collection('users').doc(thinkID).set({saveDate: timeNow.getTime()})
                 .then(console.log("DOCSUCCESS!"))
                 .catch(function(error){
                     console.log("Error adding collections to Firestore: " + error);
                   });*/
                
                /* let docRef2 =firestoreDB.collection('users').doc(thinkID).collection('stories').doc(capiId).set({saveDate: timeNow.getTime()})
                 .then(console.log("SUBDOCSUCCESS!"))
                 .catch(function(error){
                     console.log("Error adding subcollections to Firestore: " + error);
                   });*/

                global.statusCode = 200;
                global.statusBody = { "message": "Success", "code": 200 };

                //var db = admin.database();

                /*ref.orderByChild("saveDate").on("child_added", function(snapshot) {
                  console.log(snapshot.key + " was " + snapshot.val().saveDate + " meters tall");*/

              /*  var ref = db.ref("users/" + thinkID + "/stories");
                ref.orderByChild("saveDate").on("child_added", function(snapshot) {
                    snapshot.forEach(function (data) {
                        console.log("The " + data.key + " dinosaur's score is " + data.val().saveDate);
                    });
                });*/


            } else {
                global.statusCode = 412;
                global.statusBody = { "message": "Rampart Token doesn't belong to News Corp", "code": 412 };
            }
        } else {
            global.statusCode = 412;
            global.statusBody = { "message": "Cannot verify Rampart Token", "code": 412, "error": err };
        }
    });
    res.status(global.statusCode).send(global.statusBody);

})

exports.getStories = functions.https.onRequest((req, res) => {
    const rampartToken = req.query.rampartToken;
    let order="";
    
    if(req.query.order === 'desc'){
        order="saveDateDesc";
    }else{
        order="saveDate";
    }
   
    // make the request

    var jwt = require('jsonwebtoken');
    console.log("rampart="+rampartToken);

    jwt.verify(rampartToken, pubkey, function (err, decoded) {
        if (!err) {
            var thinkID = decoded["http://login.newscorpaustralia.com.au/profile"].think_id;
            if (thinkID !== "") {
                console.log("tink="+thinkID);
                admin.database().ref('users/'+thinkID+'/stories').orderByChild(order).once('value', (snapshot) => {
                 let stories = [];
                  var jsonArg1 = new Object();
    
           //console.log(stories);
                  snapshot.forEach(function(child) {
             //stories.push({ [child.key] : child.val().saveDate}); 
                     stories.push({ "id" : child.key, "saveDate" : child.val().saveDate}); 
           //jsonArg1.name = 'calc this';
           //jsonArg1.value = 3.1415;
           //jsonArg1.key = child.value;
           //jsonArg1.value= child.val().saveDate;

          // stories.push(jsonArg1);
                   });

        //stories = stories.slice(0,-1) + ']';
        //res.status(200).send('{"stories":'+JSON.stringify(stories)+'}');
                  res.status(200).json(stories);
        
             });
            } else {
                global.statusCode = 412;
                global.statusBody = { "message": "Rampart Token doesn't belong to News Corp", "code": 412 };
                res.status(global.statusCode).send(global.statusBody);
            }
        } else {
            global.statusCode = 412;
            global.statusBody = { "message": "Cannot verify Rampart Token", "code": 412, "error": err };
            res.status(global.statusCode).send(global.statusBody);
        }
    });
    
})
