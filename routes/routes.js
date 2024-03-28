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


///////////////////////////////////////////////////////////////////////////////////////////

  router.get('/Getelecteurs', async (req, res) => {
    try {
      const electeurs = await Electeur.find({});      
      res.send(electeurs);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  // Get electeur by ID endpoint
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
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const user = new User({
        nni : req.body.nni,
        nom: req.body.nom,
        prenom: req.body.prenom,
        email: req.body.email,
        password: hashedPassword,
        role:"electeur",
    })

    const result = await user.save()

    const {password, ...data} = await result.toJSON()

    res.send(data)
    console.log(data)

})

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

module.exports = router;
