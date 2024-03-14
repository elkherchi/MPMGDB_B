const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user');
const Electeur = require('../models/electeur');
const Candidat = require('../models/candidat')
const express = require('express');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/') // Ensure this directory exists
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Append extension
  }
});
const fileFilter =function (req,file,cb){
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Please upload'))
  }
  cb(null, true)
}
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});
router.use('/uploads', express.static('uploads'));

router.post('/Createelecteurs', upload.single('profil'), async (req, res) => {
  const electeur = new Electeur({
    nom: req.body.nom,
    prenom: req.body.prenom,
    age: 20, // Assuming this is static for simplicity
    telephone: req.body.telephone,
    profil: req.file.filename  // Save file path
  });
  try {
    const result = await electeur.save();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})
router.get('/Getelecteurs', async (req, res) => {
    try {
      const electeurs = await User.find({ role: 'electeur' });      
      res.send(electeurs);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  });
  router.get('/GetCandidat', async (req, res) => {
    try {
      const candidat = await Candidat.find();
      
      res.send(candidat);
      console.log(candidat);
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
        role:"candidat",
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
