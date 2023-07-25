//Inicio MQTT.
const dotenv = require('dotenv');
dotenv.config();
const mqtt = require('mqtt');
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${process.env.HOST}:${process.env.PORT_MOSQUITTO}`

const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
})
  
client.on('connect', () => {
    console.log('Connected')
    //Limpieza del mensaje recibido de mqtt.
    client.subscribe("/id/limpiar");
    client.subscribe("/listo");
    //Login
    client.subscribe("/login/auth");
    //Verificacion, de usuarios no repetidos.
    client.subscribe("/user/register/valid/email");
    client.subscribe("/user/register/valid/usuario");
})

const express = require("express");

const app = express()

//cargo entorno y corro app
let port = process.env.PORT || 5000;
app.use(express.json());


app.get('/recognition', (req, res) => {
    res.send('Api de reconocimiento');
  });

app.listen(port, () => {
    console.log("Server Listening on PORT:", port); 
});