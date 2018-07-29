const express = require('express');
const router = express.Router();

const oneSignal = require('onesignal-node')

const config = require('../config');


/* Initializers */
var osClient = new oneSignal.Client({
	app: { appAuthKey: config.oneSignalApiKey, appId: config.oneSignalAppId }
})

/**
 * Initializes the One Signal notification
 * @param {string} title 
 * @param {string} body 
 * @param {object} data 
 */
function _prepareNotification(title, body, data){

  // initialize notification
  let osNotification = new oneSignal.Notification({
		content_available: true,
		contents: {
			en: body
		}
	})

	// main parameters
	osNotification.setParameter('mutable_content', true)
  osNotification.setParameter('headings', { en: title ? title : config.defaultTitle })

  // add data if possible
	if (data) {
		if (typeof data === 'string') {
			osNotification.setParameter('data', JSON.parse(data))
		} else if (typeof data === 'object') {
			osNotification.setParameter('data', data)
		}
	}
  return osNotification;
}

/**
 * Completes the sending process of the One Signal notification
 * @param {oneSignal.Notification} notification 
 */
function _sendNotification(notification){
  osClient.sendNotification(notification, function(err, response, data){
    if(err){
      console.error(err);
      return 500;
    }
    return response.statusCode;
  })
}

/* Specific Devices Message */
router.post('/', function(req, res) {
  let { targets, title, body, data } = req.body;
  let osNotification = _prepareNotification(title, body, data);
  osNotification.setTargetDevices(targets)
  let responseCode = _sendNotification(osNotification)
  res.sendStatus(responseCode)
});

/* Broadcast Message */
router.post('/broadcast', function(req, res){
  let { title, body, data } = req.body;
  let osNotification = _prepareNotification(title, body, data);
  osNotification.setIncludedSegments(['All']);
  let responseCode = _sendNotification(osNotification)
  res.sendStatus(responseCode)
})

router.post('/topic', function(req, res){
  let { topic, title, body, data } = req.body;
  let osNotification = _prepareNotification(title, body, data);
  osNotification.setFilters([
    { field: 'tag', key: 'topic', relation: 'is', value: topic }
  ])
  let responseCode = _sendNotification(osNotification)
  res.sendStatus(responseCode)
})

module.exports = router;
