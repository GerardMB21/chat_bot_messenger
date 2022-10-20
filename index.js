require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const VERIFY_TOKEN = process.env.TOKEN;
const host = process.env.HOST;

app.use(bodyParser.json());

app.post('/webhook',(req,res)=>{
  console.log('POST: webhook');

  const { body } = req;

  if (body.object === 'page') {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);
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
    if (mode === 'suscribe' && verify === VERIFY_TOKEN) {
      console.log('WEBHOOK VERIFY');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(404);
    };
  } else {
    res.sendStatus(404);
  };
});

app.listen(host, ()=>{
  console.log(`http://localhost:${host}`);
});