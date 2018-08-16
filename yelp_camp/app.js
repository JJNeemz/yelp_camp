/*PACKAGES*/
var express     = require("express");
var app         = express();
var bodyParser  = require("body-parser");
var mongoose    = require("mongoose");

/*Import Modules*/
var Campground  = require("./models/campground.js");
var Comment     = require("./models/comment.js");
var User        = require("./models/user.js")
var SeedDB      = require("./seeds.js");


// Create and connect MongoDB
mongoose.connect("mongodb://localhost/yelp_camp")

SeedDB();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))


/*-------------------------------------------------------
ROUTES
-------------------------------------------------------*/
app.get("/", function(req, res) {
    res.render("landing")
});

// INDEX ROUTE - Show all campgrounds
app.get("/campgrounds", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, campgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: campgrounds});
        }
    });
});

// NEW ROUTE - Show form to make a new campsite
app.get("/campgrounds/new", function(req, res){
    res.render("campgrounds/new.ejs");
});

// CREATE ROUTE - Create new campground
app.post("/campgrounds", function(req, res) {
    // Get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var newCampground = {name: name, image: image, description:description};
    
    
    // Create new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
      if(err) {
          console.log(err);
      } else {
          console.log("Success!")
        // Redirect back to campgrounds page
        res.redirect("/campgrounds");
        }
    });

   
});


// SHOW ROUTE - Show details about one campsite
app.get("/campgrounds/:id", function(req, res){
    // Find the Campground
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            // Render SHOW template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    })
});


/*======================================================
COMMENTS ROUTES
======================================================*/

// NEW Comments Route
app.get("/campgrounds/:id/comments/new", function(req, res){
    // Find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            console.log("new form opened")
            res.render("comments/new.ejs", {campground: campground});
        }
    });
});

// CREATE Comments Route
app.post("/campgrounds/:id/comments", function(req, res){
    // Find campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/" + campground._id)
                }
            });
        }
    });
});


/*-------------------------------------------------------
SERVER
-------------------------------------------------------*/
app.listen(process.env.PORT, process.env.IP, function(){
    console.log('Welcome Campers...');
});