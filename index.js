const express = require('express');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

//connect mongodb
const vcap_services = JSON.parse(process.env.VCAP_SERVICES);
const replicaSetName = vcap_services['mongodb'][0].credentials.replicaSetName;
const db = vcap_services['mongodb'][0].credentials.uri + '?replicaSet=' + replicaSetName;


//creat shema
mongoose.connect(db)
  .then(() => console.log('Connected to the MongoDB...'))
  .catch(err => console.log('Could not connect to MongoDB...', err));
  
  const sensorSchema = new mongoose.Schema({
    Status: Boolean,
    SamplingFrequency: Number,
    RawData: [Number],
    Datatf1: Number,
    Datatf2: Number,
    Datatf3: Number,
    Datatf4: Number,
    Datatf5: Number,
    Datatf6: Number,
    Datatf7: Number,
    Datatf8: Number,
    Datatf9: Number,
    Datatf10: Number,
    Datatf11: Number,
    Datatf12: Number,
    Datatf13: Number,
    Datatf14: Number,
    Datatf15: Number,
    Datatf16: Number,
    Dataf1: Number,
    Datat2: Number,
    Dataf3: Number,
    Dataf4: Number,
    Dataf5: Number,
    Datapar: Number,
    Datacf: Number,
    Dataskewness: Number,
    Datavar: Number,
    Datastd: Number,
    Datapp: Number,
    Datamax: Number,
    Datamean: Number,
    Range: Number,
    Datamin: Number,
    Accuracy: Number,
    Resolution: Number

  });
  
//creat model
const sensor = mongoose.model('sensor', sensorSchema);


//API
app.get('/', (req, res) => {
  res.send('It looks like you are testing mqtt-sensor-mongodb data-worker.');
});

//PORT
const port = process.env.PORT || 3030;
const server = app.listen(port, () => console.log(`Listening on port ${port}...`));

// -- Get env variables for rabbitmq service
const vcapServices = JSON.parse(process.env.VCAP_SERVICES);
const mqttUri = vcapServices['p-rabbitmq'][0].credentials.protocols.mqtt.uri

const client = mqtt.connect(mqttUri);

// Subscribe
client.on('connect', (connack) => {
  client.subscribe('sensor', (err, granted) => {
    if (err) console.log(err);

    console.log('@' + formatTime() + ' -- Subscribed to the topic: sensor');
  });
}); 

// Receiving data
client.on('message', (topic, message, packet) => {
  let time = formatTime();
  console.log(`@${time} -- Got data from: ${topic}`);

  // insert machine  data sample
  var SensorInformation = message.toString();
  var Sensorinfo = SensorInformation.split(",");

  const newsensor =  new sensor({
    SamplingFrequency: Number(Sensorinfo[0]),
    Datamean: parseFloat(Sensorinfo[1]),
    Resolution: Number(Sensorinfo[2])
  });
 
  // save
  newsensor.save(function(err){
    if(err){
      console.log(err);
    }else{
      console.log('sensor saved.');
    }
  });
});

// Return current formatted time
function formatTime() {
  const currentDate = new Date();
  return currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds();
}
