const mongoose = require('mongoose')

const Electeur = mongoose.Schema({
    nom: { type: String,  },
    prenom: { type: String,  },
    age:{ type: Number,  },
    telephone: { type: String,  },
    profil: { type: String,  },
    
  });
module.exports = mongoose.model("electeur", Electeur)