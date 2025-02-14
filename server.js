const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Stocker le nombre de clics dans un fichier JSON
const clickDataPath = path.join(__dirname, 'clicks.json');

// Middleware pour servir les fichiers statiques (HTML, CSS)
app.use(express.static('public'));

// Middleware pour parser les requêtes JSON (utile pour POST)
app.use(express.json());

// Route pour enregistrer un clic (POST)
app.post('/record-click', (req, res) => {
    fs.readFile(clickDataPath, (err, data) => {
        if (err) {
            return res.status(500).send('Erreur de lecture du fichier');
        }

        let clickData = JSON.parse(data);
        clickData.clicks += 1;

        // Mise à jour du fichier avec le nouveau nombre de clics
        fs.writeFile(clickDataPath, JSON.stringify(clickData), (err) => {
            if (err) {
                return res.status(500).send('Erreur d\'écriture du fichier');
            }
            res.status(200).send('Clic enregistré');
        });
    });
});

app.get('/get-clicks', (req, res) => {
    const secret = req.headers['x-secret'];
    if (secret !== 'monSuperSecret') {
        return res.status(403).send('Accès interdit');
    }

    fs.readFile(clickDataPath, (err, data) => {
        if (err) {
            return res.status(500).send('Erreur de lecture du fichier');
        }

        res.json(JSON.parse(data));
    });
});


// Initialiser les données de clic dans le fichier JSON si elles n'existent pas
fs.access(clickDataPath, fs.constants.F_OK, (err) => {
    if (err) {
        fs.writeFile(clickDataPath, JSON.stringify({ clicks: 0 }), (err) => {
            if (err) console.error('Erreur de création du fichier JSON');
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
