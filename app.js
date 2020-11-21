const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const stripTags = require('striptags');
const _ = require('lodash');
const date = require(__dirname + "/date.js");


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
var user = "";
var name = "";
var lists = [];

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
  category: Number,
  plan:""
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

const taskSchema = new mongoose.Schema({
  id_task: Number,
  name:String,
  description:String,
  id_user:String,
  date_creatinon: { type: Date, default: Date.now },
  due_date:Date,
  activities:[]
})

const Job = mongoose.model("Job", jobSchema);
const Category = mongoose.model("Category", categorySchema);
const Country = mongoose.model("Country", countrySchema);
const User = mongoose.model("User", userSchema);
const Company = mongoose.model("Company", companySchema);
const Task = mongoose.model("Task", taskSchema);

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

app.get("/home",function(req,res){
  res.render("home",{user:user, name:name, checklist:lists});
})

app.get("/compose/:username",function(req,res){
  var path = req.params.username;
  var fnames = "";
  User.findOne({id_user:path},function(err,foundNames){
    if(!err){
      fnames = foundNames.name;

      res.render("compose",{username:path, name: fnames});
    }else{
      console.log(err);
    }
  })

});

app.get("/checklist/:id",function(req,res){
  let id_checklist = req.params.id;
  var new_id_checklist = mongoose.Types.ObjectId(id_checklist);
  console.log(new_id_checklist);
  Task.findById(new_id_checklist,function(err, foundTask){
    if(!err){
      if(foundTask!=null){
        let id = foundTask._id;
        let name = _.startCase(_.toLower(foundTask.name));
        let descrip = foundTask.description;
        let user_checklist = foundTask.id_user;
        let date_created = foundTask.date_creatinon;
        let due_da = date.getDate(foundTask.due_date);
        let activity = foundTask.activities;
        res.render("checklist",{id:id, name:name, descrip:descrip, user_checklist:user_checklist, date_created:date_created, due_da:due_da, activity:activity});
      }else{
        res.redirect("/");
      }
    }else{
      console.log(err);
    }
  });
});

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
    var email = stripTags(req.body.userEmail);
    email = email.replace(" ", "");

    var pass = stripTags(req.body.pass);
    pass = pass.replace(" ","");


    User.findOne({"credentials.email":email,"credentials.password":pass},function(err,foundUser){

      if(!err){
        if(foundUser!=null){
          user = foundUser.id_user;
          name = foundUser.name;
          User.findOne({plan:{$exists:true}},function(err,planUser){
            if(!err){
              if(planUser!=null){
                Task.find({id_user:user},function(err,foundTasks){
                  if(!err){
                    res.render("home",{user:user, name:name, checklist:foundTasks});
                  }else{
                    console.log(err);
                  }
                })

              }else{

                res.render("welcome",{user:user});
              }
            }
          });

        }else{
          success = "Email or Password does not match";
          res.redirect("/")
        }

      }else{
        console.log(err);
        console.log("Error Error");
      }
    });
  }


})

app.post("/home",function(req,res){
  if(req.body.planA==="Plan A"){
    let id = "ObjectId("+"5f89011fac3d89544a34d41d"+")";
    let user1 = req.body.user;
    User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
      if(!err){
        console.log("Plan was updated successfully");
        res.render("home",{user:user1, name:name, checklist:lists});
      }else{
        console.log(err);
      }
    });

  }else if(req.body.planB==="Plan B"){
    let id = "ObjectId("+"5f89013eac3d89544a34d41e"+")";
    let user1 = req.body.user;
    User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
      if(!err){
        console.log("Plan was updated successfully");
        res.render("home",{user:user1, name:name, checklist:lists});
      }else{
        console.log(err);
      }
    });
  }else{
    let id = "ObjectId("+"5f89015dac3d89544a34d41f"+")";
    let user1 = req.body.user;
    User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
      if(!err){
        console.log("Plan was updated successfully");
        res.render("home",{user:user1, name:name, checklist:lists});
      }else{
        console.log(err);
      }
    });
  }
});

app.post("/compose",function(req,res){
  let names = req.body.nombre;
  let usernames = req.body.user;
  let sticky_name = req.body.postTitle;
  let sticky_description = req.body.postBody;
  let due_date = req.body.due_date;

  Task.find({},function(err,foundAll){
    if(!err){
      if(foundAll.length>0){
        let id = foundAll.length+1;
        let arr = [{id_task:id,name:sticky_name,description:sticky_description,id_user:usernames,due_date:due_date}];
        Task.insertMany(arr,function(err){
          if(!err){
            Task.find({id_user:usernames},function(err,checklists){
              if(!err){
                if(checklists.length>0){
                  lists = checklists;
                  res.render("home",{user:usernames, name:names, checklist:lists});
                }else{
                  console.log("There isnt any checklist under your username");
                  res.render("home",{user:usernames, name:names, checklist:lists});
                }
              }else{
                console.log(err);
              }
            })
          }else{
            console.log(err);
          }
        });
      }else{

      }
    }else{
      console.log(err);
    }
  })
});

app.post("/checklist/add",function(req,res){
  let task = req.body.id_list;
  let body = req.body.post_body;
  console.log(task);
  console.log(body);
})



app.listen(process.env.PORT || "3000", function(req, res) {
  console.log("Listening to port 3000");
})
