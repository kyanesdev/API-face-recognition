//Inicio MQTT.
const dotenv = require('dotenv');
dotenv.config();
const mqtt = require('mqtt');
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const { spawn } = require('child_process');

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


app.post('/build-profile', (req, res) => {
    const buildProfile = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 build_profile.py']);
    buildProfile.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'failure', message: 'Error occurred in Python script'});
        res.status(200).json({status: 'success', message: 'Python script ran successfully'});
    });
});

app.post('/detect', (req, res) => {
    const detect = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 detect.py']);
    detect.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'failure', message: 'Error occurred in Python script'});
        res.status(200).json({status: 'success', message: 'Python script ran successfully'});
    });
});

app.post('/register-photo-profile', (req, res) => {
    const registerPhotoProfile = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 register_photo_profile.py']);
    registerPhotoProfile.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'failure', message: 'Error occurred in Python script'});
        res.status(200).json({status: 'success', message: 'Python script ran successfully'});
    });
});

app.listen(port, () => {
    console.log("Server Listening on PORT:", port); 
});