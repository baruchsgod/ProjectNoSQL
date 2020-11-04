const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const stripTags = require('striptags');
const _ = require('lodash');


const app = express();



app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + "/public"));

app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost:27017/projectFinalDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var countryArray = [];
var companyArray = [];
var success = "";

const jobSchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String
});

const categorySchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true
  },
  category: {
    type: String
  },
  description: String,
  price: Number
})

const countrySchema = new mongoose.Schema({
  codigo: Number,
  name: String,
  currency: String,
  continent: Number
})

const userSchema = new mongoose.Schema({
  id_user: String,
  name: String,
  lname: String,
  credentials: {
    password: String,
    email: String
  },
  role: String,
  company: Object(),
  category: Number
})

const companySchema = new mongoose.Schema({
  name: String,
  id_company: Number,
  country: String,
  num_Employees: String,
  address: [{
    streetAddres: String,
    city: String,
    dept: String,
    zip: Number
  }],
  plan: Number,
  extras: [{
    codigo: Number
  }]
})

const Job = mongoose.model("Job", jobSchema);
const Category = mongoose.model("Category", categorySchema);
const Country = mongoose.model("Country", countrySchema);
const User = mongoose.model("User", userSchema);
const Company = mongoose.model("Company", companySchema);

app.get("/", function(req, res) {

  Country.find({}, function(err, countryItems) {
    if (!err) {
      if (countryItems.length > 0) {
        countryArray = countryItems;

      }
    } else {
      console.log(err);
    }
  });

  Company.find({}, function(err, companyItems) {
    if (!err) {
      if (companyItems.length > 0) {
        companyArray = companyItems;
      }
    } else {
      console.log(err);
    }
  })

  Job.find({}, function(err, foundItems) {
    if (!err) {
      res.render("login", {
        jobDesc: foundItems,
        countryDesc: countryArray,
        companyDesc: companyArray,
        success:success
      });
      success="";
    } else {
      console.log(err);
    }
  });

});

app.get("/welcome",function(req,res){
  res.render("welcome",{});
})

app.post("/", function(req, res) {
  if (req.body.companyButton === "Sign Up") {
    var email = stripTags(req.body.userEmailRegister);
    email = email.replace(" ", "");

    var namePost = stripTags(req.body.fname);
    namePost = namePost.replace(" ", "");
    namePost = _.upperFirst(_.kebabCase(_.lowerCase(namePost)));

    var lnamePost = stripTags(req.body.lname);
    lnamePost = lnamePost.replace(" ", "");
    lnamePost = _.upperFirst(_.kebabCase(_.lowerCase(lnamePost)));

    var idUser = namePost.charAt(0);
    idUser = _.lowerCase(idUser) + _.lowerCase(lnamePost);

    var i = 0;
    var foundUser = ["getin"];
    while(foundUser.length > 0){
      foundUser=[];
      User.find({id_user:idUser},function(err,foundUsers){
        foundUser = foundUsers;
        if(foundUsers.length>0){
          i++;
          idUser=idUser + i;
        }
      })
    }

    var passPost = stripTags(req.body.userPassword);

    var userProfile = req.body.selectedJob;

    var userCompany = req.body.companySelected;

    var userCountry = req.body.countrySelected;

    var userArray = [{
      id_user: idUser,
      name: namePost,
      lname: lnamePost,
      credentials: {
        password: passPost,
        email: email
      },
      role: userProfile
    }];

    User.insertMany(userArray,function(err){
      if(!err){
        console.log("Information uploaded succesfully");
        
        success = "Welcome to Sticky, Please Log In";
        res.redirect("/");
      }else{
        console.log(err);
      }
    })

    // filter_var
  } else {
    res.redirect("/welcome");
  }


})


app.listen(process.env.PORT || "3000", function(req, res) {
  console.log("Listening to port 3000");
})
