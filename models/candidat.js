const mongoose = require('mongoose')

const Candidat = mongoose.Schema({
    nom: { type: String,  },
    parti: { type: String,  },
    circonscription:{ type: String,  },
    profile : {type : String},
});
module.exports = mongoose.model("candidat", Candidat)