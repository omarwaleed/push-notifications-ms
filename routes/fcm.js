const express = require('express');
const router = express.Router();

const firebase = require('firebase-admin');
if(process.env.FIREBASE_ENABLED){
  firebase.initializeApp({
    credential: firebase.credential.cert('../firebaseCredentials.json')
  })
}
const fcm = firebase.messaging();

/* Specific Devices Message */
router.get('/', function(req, res, next) {
  let { targets, title, body, data } = req.body;
  fcm.sendToDevice(targets, {
    notification: {
      title, body
    },
    data
  })
  .then((value)=>{
    console.log(value);
    res.sendStatus(200);
  })
  .catch((err)=>{
    console.error(err);
    res.sendStatus(500);
  })
});

/* Broadcast Message */
router.post('/broadcast', function(req, res){
  let { title, body, data } = req.body;
  fcm.send({
    notification: {
      title, body
    },
    data
  })
  .then((value)=>{
    console.log(value);
    res.sendStatus(200);
  })
  .catch((err)=>{
    console.error(err);
    res.sendStatus(500);
  })
})

router.post('/topic', function(req, res){
  let { topic, title, body, data } = req.body;
  fcm.sendToTopic(topic, {
    notification: {
      title,
      body
    },
    data
  })
  .then((value)=>{
    console.log(value)
    res.sendStatus(200);
  })
  .catch((err)=>{
    console.error(err);
    res.sendStatus(500);
  })
})

module.exports = router;
