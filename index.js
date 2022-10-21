require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

const VERIFY_TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 4001;
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const LINK_FB = process.env.LINK_FB

app.use(bodyParser.json());

app.post('/webhook',(req,res)=>{
  console.log('POST: webhook');

  const { body } = req;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      const sender_psid = webhookEvent.sender.id;
      console.log(`Sender PSID: ${sender_psid}`);

      if (webhookEvent.message) {
        handleMessage(sender_psid,webhookEvent.message);
      } else if (webhookEvent.postback) {
        handlePostback(sender_psid,webhookEvent.postback);
      };
    });

    res.status(200).send('EVENT RECIBID')
  } else {
    res.sendStatus(404);
  };
});

app.get('/webhook',(req,res)=>{
  console.log('GET: webhook');

  const mode = req.query['hub.mode'];
  const verify = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && verify) {
    if (mode === 'subscribe' && verify === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFY');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(404);
    };
  } else {
    res.sendStatus(404);
  };
});

function handleMessage(sender_psid,recevied_message) {
  let response;

  if (recevied_message.text) {
    response = {
      'text': `Tu mensaje fue: ${recevied_message.text}`
    };
  } else if (recevied_message.attachments) {
    const url = recevied_message.attachments[0].payload.url;
    response = {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
             {
              "title":"Confirm image",
              "image_url":url,
              "subtitle":"Example proob",
              // REDIRECT WEB
              // "default_action": {
              //   "type": "web_url",
              //   "url": "https://petersfancybrownhats.com/view?item=103",
              //   "messenger_extensions": false,
              //   "webview_height_ratio": "tall",
              //   "fallback_url": "https://petersfancybrownhats.com/"
              // },
              "buttons":[
                {
                  // REDIRECT WEB
                  // "type":"web_url",
                  "type":"postback",
                  // "url":"https://petersfancybrownhats.com",
                  "title":"Yes",
                  "payload":"yes"
                },
                {
                  "type":"postback",
                  "title":"NO",
                  "payload":"no"
                }              
              ]      
            }
          ]
        }
      }
    };
  }

  callSendAPI(sender_psid,response)
}

function handlePostback(sender_psid,recevied_postback) {
  let response = '';

  const payload = recevied_postback.payload;

  if (payload === 'yes') {
    response = {'text':'Thanks for the picture'};
  } else if (payload === 'no') {
    response = {'text':'Try other image'};
  };

  callSendAPI(sender_psid,response);
}

function callSendAPI(sender_psid,response) {
  const requestBody = {
    'recipient': {
      'id': sender_psid
    },
    'message': response
  };

  request({
    'uri': LINK_FB,
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  },(err,res,body)=>{
    if (!err) {
      console.log('Send Message return');
    } else {
      console.log(err)
      console.error('Message not send');
    };
  });
}

app.listen(PORT, ()=>{
  console.log(`http://localhost:${PORT}`);
});