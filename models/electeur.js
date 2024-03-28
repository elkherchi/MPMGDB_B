const mongoose = require('mongoose')

const Electeur = mongoose.Schema({
    nom: { type: String,  },
    nni: { type: Number,  },
    age:{ type: Number,  },
    adresse: { type: String,  },
    circonscription: {type: String,},
    id_candidat:{ type: Number,  },
    profile: { type: String,  },
    
  });
module.exports = mongoose.model("electeur", Electeur)