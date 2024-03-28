const mongoose = require('mongoose');

const validationNniSchema = new mongoose.Schema({
    nom: { type: String },
    prenom: { type: String },
    nni: { type: String },
    sexe: { type: String, enum: ['M', 'F'] }, // Enum for Male and Female, adjust as needed
    age: { type: Number }
});

module.exports = mongoose.model("ValidationNni", validationNniSchema);
