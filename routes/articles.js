const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const router = express.Router();
const Joi = require('joi');
const methodOverride = require('method-override');
const { auth } = require('../middleware/auth');
const { upload } = require('../routes/images.js');
 
//article model
const { Article, validate } = require("../models/Article");

// Save an article to mongodb
router.post("/", upload.single("file"), ensureAuthenticated, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    const articles = await Article.find().sort("-time");
    res.status(400).render("dashboard", {
      articles: articles,
      loggedIn: req.user,
    });
  }
  //Validation passed
  const newArticle = new Article({
    title: req.body.title,
    author: req.body.author,
    image: req.body.image,
    body: req.body.body,
  });

  //save user to database
  await newArticle.save();

  const articles = await Article.find().sort("-time");
  res.render("dashboard", {
    articles: articles,
    loggedIn: req.user,
  });
});

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    const id = req.params.id.trim();
    const article = await Article.findOneAndDelete({ _id: id });
    if (!article) return res.status(404).send("This article does not exist");
    const articles = await Article.find().sort('-time');
    res.render('dashboard', {
        articles: articles,
        loggedIn: req.user,
    });
})

module.exports = router;