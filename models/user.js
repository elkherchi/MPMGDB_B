const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
        nni: { type: Number,  },
        nom: { type: String, },
        prenom: { type: String,  },
        email: { type: String,  },
        password: { type: String,  },
        role:{type : String }
        
})

module.exports = mongoose.model("utilisateur", userSchema)
