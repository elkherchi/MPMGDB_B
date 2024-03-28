const mongoose = require('mongoose');

const candidat = new mongoose.Schema({
    nom: { type: String },
    prenom: { type: String },
    nni: { type: Number },
    sexe: { type: String, enum: ['M', 'F'] }, // Enum for Male and Female, adjust as needed
    age: { type: Number },
    inscrit: { type: Boolean, default: false }
});

module.exports = mongoose.model("candidat", candidat);
