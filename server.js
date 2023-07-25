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
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al crear el perfil'});
        res.status(200).json({status: 'Éxito', message: 'Perfil creado exitosamente'});
    });
});

app.post('/detect', (req, res) => {
    const detect = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 detect.py']);
    let status_code = 200;
    detect.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al intentar identificar'});
        
        if (status_code === 401) {
            return res.status(401).json({status: 'Fallo', message: 'Persona no autorizada'});
        }
        
        res.status(200).json({status: 'Éxito', message: 'Persona autorizada'});
    });
    detect.stdout.on('data', (data) => {
        // Parse the data to check for the status_code value
        const output = data.toString();
        const regex = /status_code = (\d+)/;
        const match = output.match(regex);
        if (match) {
            status_code = parseInt(match[1]);
        }
    });
});

app.post('/register-photo-profile', (req, res) => {
    const registerPhotoProfile = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 register_photo_profile.py']);
    registerPhotoProfile.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al tomar la foto'});
        res.status(200).json({status: 'Éxito', message: 'Foto tomada exitosamente'});
    });
});

app.listen(port, () => {
    console.log("Server Listening on PORT:", port); 
});