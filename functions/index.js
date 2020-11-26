const functions = require('firebase-functions');

var admin = require("firebase-admin");
var serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://projetmobilite-a0b6f.firebaseio.com"
});

const express = require('express');
const app = express();
const db = admin.firestore();

const cors = require('cors');
app.use(cors( { origin: true } ));


// Routes
app.get("/hello-world", (req, res) => {
    return res.status(200).send('Hello World');
});


// Create
app.post('/api/users/create', (req,res) => {

    (async () => {
        try{
            await db.collection('utilisateur').doc()
            .create({
                nom: req.body.nom,
                prenom: req.body.prenom,
                mail: req.body.mail,
                themes: req.body.themes,
                identifiant: req.body.identifiant
            });

            return res.status(200).send("OK");
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});


// Read

// get user by id
app.get('/api/users/:id', (req,res) => {
    (async () => {
        try{
            const doc = db.collection('utilisateur').doc(req.params.id); 
            let user = await doc.get();
            let response = user.data();
            
            return res.status(200).send(response);
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// Update


// Delete



// Export the api to Firebase
exports.app = functions.https.onRequest(app);