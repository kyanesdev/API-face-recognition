//Inicio MQTT.
const dotenv = require('dotenv');
dotenv.config();
const mqtt = require('mqtt');
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const { spawn } = require('child_process');
const fs = require('fs');

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
    const buildProfile = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && python3 build_profile.py']);
    let saved_user = ''; // this will store the matrix
    
    buildProfile.stdout.on('data', (data) => {
        // append the data to the variable
        saved_user += data.toString();
    });

    buildProfile.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    buildProfile.on('close', (code) => {
        if(code !== 0) {
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al crear el perfil'});
        } else {
            // remove the newline characters
            saved_user = saved_user.replace(/\n/g, '');
            // respond with the status and the matrix
            res.status(200).json({status: 'Éxito', message: 'Perfil creado exitosamente', saved_user: saved_user});
        }
    });
});

app.post('/detect', (req, res) => {

    const saved_user = req.body.saved_user;
    try {
        fs.writeFileSync('AI-face-recognition/saved_user.txt', saved_user);
    } catch (err) {
        console.error('Ocurrio el siguiente error:', err);
        return res.status(500).json({message: 'Fallo al escribir la matriz'});
    }

    const detect = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && pip install -r requirements.txt && python3 detect.py']);
    let status_code = 0;
    let identificado;  // Declare variable to store identificado.

    detect.stdout.on('data', (data) => {
        const output = data.toString();
        
        // Extract the status code
        const statusRegex = /status_code = (\d+)/;
        const statusMatch = output.match(statusRegex);
        if (statusMatch) {
            status_code = parseInt(statusMatch[1]);
        }

        // Extract the identificado value
        const identificadoRegex = /identificado = (\d+)/;
        const identificadoMatch = output.match(identificadoRegex);
        if (identificadoMatch) {
            identificado = parseInt(identificadoMatch[1]);
        }
    });

    detect.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al intentar identificar'});
        
        if (status_code === 401) {
            return res.status(401).json({status: 'Fallo', message: 'Persona no autorizada', identificado: identificado});
        }
        
        res.status(200).json({status: 'Éxito', message: 'Persona autorizada', identificado: identificado});
    });
});

app.post('/register-photo-profile', (req, res) => {
    const registerPhotoProfile = spawn('/bin/bash', ['-c', 'cd AI-face-recognition && source ./venv/bin/activate && python3 register_photo_profile.py']);
    registerPhotoProfile.on('close', (code) => {
        if (code !== 0)
            return res.status(500).json({status: 'Fallo', message: 'Ocurrio un error al tomar la foto'});
        res.status(200).json({status: 'Éxito', message: 'Foto tomada exitosamente'});
    });
});

app.listen(port, () => {
    console.log("Server Listening on PORT:", port); 
});