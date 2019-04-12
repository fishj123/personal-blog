const express = require('express');
const { ensureAuthenticated } = require('../config/auth');
const router = express.Router();


//article model
const Article = require("../models/Article");


// instantiate variables ready to receive data
let articleBody = [];
let articleTitle = [];
let articleAuthor = [];
let articleTime = [];
let articleID = [];

// wrap my database call functions in some middleware - right now it is adding each blog to the list again
// on each page reload - need to think about how I can prevent this so that only new blogs are added
function findAllArticles(req, res, next){ 


// retrieve the existing articles from the database - i think this needs to be passed in as middleware on page load
function getArticleQuery() {
    let query = Article.find();
    return query;
}

// want to move this to another file and import it in using require 
let query = getArticleQuery();
query.exec(function (err, results) {
    if (err)
        return console.log(err);

    for(var i = 0; i < results.length; i++) {
        if (!articleID.includes(String(results[i]._id))) {
                articleID.push(String(results[i]._id));
                articleTitle.push(results[i].title);
                articleBody.push(results[i].body);
                articleAuthor.push(results[i].author);
                articleTime.push(results[i].time);
        }
    }

    next();
});

}
router.get('/', (req, res) => {
    res.render('home');
})


// ensureAuthenticated, is required to auth the page
router.get('/dashboard', findAllArticles, (req, res) => {
    // console.log(articleTitle)
    res.render('dashboard', {
        // create variable name that contains users name to be used on the dashboard
        // name: req.user.name
        articleBody: articleBody,
        articleTitle: articleTitle,
        articleAuthor: articleAuthor,
        articleTime: articleTime
        
    });


})



// Save an article to mongodb
router.post('/post-article', (req, res) => {
    const { title, author, time, body } = req.body;
    let errors = []

    // Check required fields
    if (!title || !author || !time || !body) {
        errors.push({ msg: "Please fill in all fields" });
    }

    if (errors.length > 0) {
        console.log(req.body)
        res.render("dashboard", {
            errors,
            title,
            author,
            time,
            body,
        });
    } else {
    //Validation passed
        const newArticle = new Article({
            title,
            author,
            time,
            body,
        });

        //save user to database
        newArticle
            .save()
            .then(article => {
                req.flash(
                    "success_msg",
                    "You have posted a new article"
                );
                res.redirect("/");
            })
            .catch(err => console.log(err));
}


});





module.exports = router;