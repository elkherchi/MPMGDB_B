const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const Electeur = require('../models/electeur');
const Candidat = require('../models/candidat')
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const candidat = require('../models/candidat');
filename= '';
const mystorage= multer.diskStorage({
  destination:'./uploads',
  filename:(req , file , cb)=>{
    let date =Date.now();
    let fl = date + '.'+file.mimetype.split('/')[1];
    cb(null,fl);
    filename =fl;
  }
})
const upload = multer({storage: mystorage});

router.post("/Createelecteurs", upload.any('profile'), async (req, res) => {
  try {
    const electeur = new Electeur(req.body);
    electeur.profile = filename;
    await electeur.save();
    filename='';
    console.log(electeur)
  } catch (err) {
    res.json({
      message: err.message,
      type: "danger",
    });
  }
})



router.get('/GetCandidat', async (req, res) => {
    try {
      const candidat = await Candidat.find();
      
      res.send(candidat);
      console.log(candidat);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });


  router.get('/Getelecteurs', async (req, res) => {
    try {
      const electeurs = await Electeur.find({});      
      res.send(electeurs);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
router.get('/GetelecteurbyID/:id', async (req, res) => {
    try {
      const electeur = await Electeur.findById(req.params.id);
      if (!electeur) {
        return res.status(404).send({ message: 'Electeur not found' });
      }
      res.send(electeur);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Update electeur by ID endpoint
router.put('/Updateelecteurs/:id', async (req, res) => {
    try {
      const electeur = await Electeur.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!electeur) {
        return res.status(404).send({ message: 'Electeur not found' });
      }
      res.send(electeur);
      console.log(electeur)
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  
  // Delete electeur by ID endpoint
router.delete('/Deleteelecteurs/:id', async (req, res) => {
    try {
      const electeur = await Electeur.findByIdAndDelete(req.params.id);
      if (!electeur) {
        return res.status(404).send({ message: 'Electeur not found' });
      }
      res.send({ message: 'Electeur deleted successfully' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  router.post('/register', async (req, res) => {
    try {
        // Vérifier d'abord si le NNI est valide en recherchant dans la collection de validation NNI
        const validationNni = await candidat.findOne({ nni: req.body.nni });
        if (!validationNni) {
            return res.status(400).send({ message: 'NNI invalide' });
        }
        
        // Si le NNI est valide, continuer avec le processus d'inscription
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            nni : req.body.nni,
            email: req.body.email,
            password: hashedPassword,
            role: "candidat",
        });

        const result = await user.save();

        // Modifier la valeur de la propriété "inscrit" dans le document du candidat correspondant
        await Candidat.updateOne({ nni: req.body.nni }, { inscrit: true });

        const { password, ...data } = await result.toJSON();

        res.send(data);
        console.log(data);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});


router.post('/login', async (req, res) => {
    const user = await User.findOne({email: req.body.email})

    if (!user) {
        return res.status(404).send({
            message: 'user not found'
        })
    }

    if (!await bcrypt.compare(req.body.password, user.password)) {
        return res.status(400).send({
            message: 'invalid credentials'
        })
    }

    const token = jwt.sign({_id: user._id}, "secret")

    res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })

    res.send({
        message: 'success',
        role:user.role
    })
})

router.get('/user', async (req, res) => {
    try {
        const cookie = req.cookies['jwt']

        const claims = jwt.verify(cookie, 'secret')

        if (!claims) {
            return res.status(401).send({
                message: 'unauthenticated'
            })
        }

        const user = await User.findOne({_id: claims._id})

        const {password, ...data} = await user.toJSON()

        res.send(data)
    } catch (e) {
        return res.status(401).send({
            message: 'unauthenticated'
        })
    }
})


router.post('/logout', (req, res) => {
    res.cookie('jwt', '', {maxAge: 0})

    res.send({
        message: 'success'
    })
})
router.post('/createCandidat', async (req, res) => {
  try {
      const candidatData = {
          nom: req.body.nom,
          prenom: req.body.prenom,
          nni: req.body.nni,
          sexe: req.body.sexe,
          age: req.body.age,
          inscrit: req.body.inscrit || false // Valeur par défaut si non fournie
      };

      const newCandidat = await Candidat.create(candidatData);

      res.status(201).send(newCandidat);
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
});

router.delete('/deleteCandidatByNni/:nni', async (req, res) => {
  try {
      const deletedCandidat = await Candidat.deleteOne({ nni: req.params.nni });
      if (deletedCandidat.deletedCount === 0) {
          return res.status(404).send({ message: 'Aucun candidat trouvé avec ce NNI' });
      }
      res.send({ message: 'Candidat supprimé avec succès' });
  } catch (error) {
      res.status(500).send({ message: error.message });
  }
});
module.exports = router;
