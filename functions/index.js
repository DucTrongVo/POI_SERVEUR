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
const { user } = require('firebase-functions/lib/providers/auth');
app.use(cors( { origin: true } ));


// Routes
app.get("/hello-world", (req, res) => {
    return res.status(200).send('Hello World');
});


// Create User
app.post('/api/users/create', (req,res) => {

    (async () => {
        try{
            await db.collection('utilisateur').doc('/'+req.body.identifiant+'/')
            .create({
                nom: req.body.nom,
                prenom: req.body.prenom,
                mail: req.body.mail,
                themes: req.body.themes,
                photoURL: req.body.photoURL,
                identifiant: req.body.identifiant,
                pointsVisites: req.body.pointsVisites
            });

            return res.status(200).send("OK");
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// Create pointInteret
app.post('/api/pointInteret/create', (req,res) => {

    (async () => {
        try{
            await db.collection('pointInteret').doc('/'+req.body.id+'/')
            .create({
                nom: req.body.nom,
                description: req.body.description,
                street: req.body.street,
                postalCode: req.body.postalCode,
                city: req.body.city,
                country: req.body.country,
                lat: req.body.lat,
                lon: req.body.lon,
                themes: req.body.themes,
                url: req.body.url,
                messages: req.body.messages
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

// get user by nom
app.get('/api/search/users/nom/:nom', (req,res) => {

    (async () => {
        try{
            var users = [];
            // Create a reference to the cities collection
            const utilisateurRef = db.collection('utilisateur');
            // Create a query against the collection
            const queryRef = await  utilisateurRef.where('nom', '==', req.params.nom).get();
            
            queryRef.forEach(doc => {
            users.push(doc.data());
            // console.log(doc.id, '=>', doc.data());
            console.log(users);
        

            }); 
            return res.status(200).send(users);  
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// get user by theme
app.get('/api/search/users/theme/:theme', (req,res) => {

    (async () => {
        try{
            // Create a reference to the cities collection
            const utilisateurRef = db.collection('utilisateur');
            // Create a query against the collection pas celle la a split mais l'attribut 
            
            if (utilisateurRef.empty) {

                console.log('No matching documents.');
                return;
            } 
            let users = [];
            await utilisateurRef.get().then(querySnapshot => {
                let docs = querySnapshot.docs;

                for(let doc of docs){
                    console.log("data : ",doc.data());
                    if(doc.data().themes.split(";").includes(req.params.theme)){
                        users.push(doc.data());
                    }
                }
                return users;
            });
            return res.status(200).send(users);  
            
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// get all Themes
app.get('/api/themes', (req,res) => {
    (async () => {
        try{
            const query = db.collection('Theme');
            let response = [];

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for(let doc of docs){
                    const theme = {
                        id: doc.id,
                        nom: doc.data().Nom
                    };
                    response.push(theme);
                }
                return response;
            });

            return res.status(200).send(response);
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// get points intérêt:
app.get('/api/pointInteret', (req,res) => {
    (async () => {
        try{
            const query = db.collection('pointInteret'); 
            let response = [];

            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for(let doc of docs){
                    const pointIteret = {
                        id: doc.id,
                        nom: doc.data().nom,
                        description: doc.data().description,
                        street: doc.data().street,
                        postalCode: doc.data().postalCode,
                        city: doc.data().city,
                        country: doc.data().country,
                        lat: doc.data().lat,
                        lon: doc.data().lon,
                        themes: doc.data().themes,
                        url: doc.data().url,
                        messages: doc.data().messages
                    }
                    response.push(pointIteret);
                }
                return response;
            });
            
            return res.status(200).send(response);
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});
// Update

// modify User
app.put('/api/update/user', (req,res) => {
    (async () => {
        try {
            const document = db.collection('utilisateur').doc(req.body.identifiant);

            await document.update({
                nom: req.body.nom,
                prenom: req.body.prenom,
                mail: req.body.mail,
                themes: req.body.themes,
                photoURL: req.body.photoURL,
                identifiant: req.body.identifiant,
                pointsVisites: req.body.pointsVisites
            });

            return res.status(200).send();
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// update points Visite
app.put('/api/update/user/:identifiant/:pointVisite', (req,res) => {
    (async () => {
        try {
            const document = db.collection('utilisateur').doc(req.params.identifiant);
            let doc = (await document.get());
            let pointsVisites = doc.data().pointsVisites;
            if(pointsVisites === "") {
                pointsVisites = req.params.pointVisite;
            }
            if(!pointsVisites.split(";").includes(req.params.pointVisite)){
                pointsVisites += ";"+req.params.pointVisite;
            }
            await document.update({
                pointsVisites: pointsVisites
            });

            return res.status(200).send();
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// update points interet
app.put('/api/update/pointInteret', (req,res) => {
    (async () => {
        try {
            const document = db.collection('pointInteret').doc(req.body.id);
           
            await document.update({
                nom: req.body.nom,
                description: req.body.description,
                street: req.body.street,
                postalCode: req.body.postalCode,
                city: req.body.city,
                country: req.body.country,
                lat: req.body.lat,
                lon: req.body.lon,
                themes: req.body.themes,
                url: req.body.url,
                messages: req.body.messages
            });

            return res.status(200).send();
        }catch(error) {
            console.log("Error : ",error);
            return res.status(500).send(error);
        }
    })();
});

// Delete



// Export the api to Firebase
exports.app = functions.https.onRequest(app);