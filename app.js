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
var managerArray = [];
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
  plan:Object(),
  team:[{
    id_users:String,
    names:String,
    lnames:String,
    credential:{
      passwords: String,
      emails: String
    },
    roles:String
  }]
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

const commentSchema = new mongoose.Schema({
  idComment:Number,
  id_user:String,
  body:String,
  id_task:Object(),
  fecha:{ type: Date, default: Date.now }
})

const planSchema = new mongoose.Schema({
  codigo:Number,
  category:String,
  description:String,
  price:Number,
  quantity:Number
})

const Job = mongoose.model("Job", jobSchema);
const Category = mongoose.model("Category", categorySchema);
const Country = mongoose.model("Country", countrySchema);
const User = mongoose.model("User", userSchema);
const Company = mongoose.model("Company", companySchema);
const Task = mongoose.model("Task", taskSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Plan = mongoose.model("Plan", planSchema);

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

  User.find({role:"Manager"}, function(err, managers){
    if (!err) {
      if (managers.length > 0) {
        managerArray = managers;
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
        managerDesc:managerArray,
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

app.get("/home/:user",function(req,res){
  let user_checklist = req.params.user;
  User.findOne({id_user:user_checklist},function(err,users){
    if(!err){
      let names = users.name;
      let roleUser = users.role;
      console.log(users);
      console.log("this is yuval role: "+roleUser);
      Task.find({id_user:user_checklist},function(err,itemChecklists){
        if(!err){
          let list = itemChecklists;
          res.render("home1",{user:user_checklist, name:names, role:roleUser ,checklist:list});
        }else{
          console.log(err);
        }
      })
    }else{
      console.log(err);
    }
  })
})

app.get("/home/:manager/:employee/:name",function(req,res){
  let user_manager = req.params.manager;
  let user_employee = req.params.employee;
  let name_manager = req.params.name;
  User.findOne({id_user:user_employee},function(err,users){
    if(!err){
      let names = users.name;
      Task.find({id_user:user_employee},function(err,itemChecklists){
        if(!err){
          let list = itemChecklists;
          console.log(list);
          res.render("home",{user:user_manager, name:name_manager, name_emp: names ,role:"Manager" ,checklist:list});
        }else{
          console.log(err);
        }
      })
    }else{
      console.log(err);
    }
  })
})

app.get("/home/reports/:user", function(req, res){
  let user = req.params.user;
  User.findOne({id_user:user}, function(err, userFound){
    if(!err){
      let name = userFound.name;
      let role = userFound.role;
      let team = userFound.team;

      res.render("report",{name:name, user:user, role:role, employee_list:team});
    }else{
      console.log(err);
    }
  });
});

app.get("/capacity/:user", function(req,res){
  let user_capacity = req.params.user;
  var fnames = "";
  User.findOne({id_user:user_capacity},function(err,foundNames){
    if(!err){
      fnames = foundNames.name;
      role = foundNames.role;
      res.render("message",{username:user_capacity,role:role ,name: fnames});
    }else{
      console.log(err);
    }
  })

});

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

app.get("/capacity1/:user", function(req,res){
  let username = req.params.user;
  User.findOne({id_user:username},function(err,foundNames){
    if(!err){
      let fnames = foundNames.name;
      let role = foundNames.role;
      Task.find({id_user:username}, function(err, foundList){
        if(!err){
          let lists = foundList;
          res.render("capacity", {user:username, name:fnames, role:role, checklist: lists});
        }else{
          console.log(err);
        }
      })

    }else{
      console.log(err);
    }
  })
})

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
        Comment.find({id_task:new_id_checklist},function(err,foundComment){
          if(!err){
            let comment_list = foundComment;
            res.render("checklist",{object_id:new_id_checklist,id:id, name:name, descrip:descrip, user_checklist:user_checklist, date_created:date_created, due_da:due_da, activity:activity,comments:comment_list});
          }else{
            console.log(err);
          }
        })

      }else{
        res.redirect("/");
      }
    }else{
      console.log(err);
    }
  });
});

app.get("/setting/:selector/:user", function(req, res){
  let selector = req.params.selector;
  let user = req.params.user;

  User.findOne({id_user:user}, function(err, foundUser){
    if(!err){

    }else{
      
    }
  });

});

app.get("/checklist/:id/:user",function(req,res){
  let id_checklist = req.params.id;
  let user_manager = req.params.user;

  var new_id_checklist = mongoose.Types.ObjectId(id_checklist);
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
        Comment.find({id_task:new_id_checklist},function(err,foundComment){
          if(!err){
            let comment_list = foundComment;
            res.render("checklist_manager",{object_id:new_id_checklist,id:id, name:name, descrip:descrip, user_checklist:user_manager, date_created:date_created, due_da:due_da, activity:activity,comments:comment_list});
          }else{
            console.log(err);
          }
        })

      }else{
        res.redirect("/");
      }
    }else{
      console.log(err);
    }
  });
});

app.get("/home/settings/:user", function(req,res){
  let user = req.params.user;
  User.findOne({id_user:user}, function(err, foundUser){
    if(!err){
      let role= foundUser.role;
      let name = foundUser.name;
      res.render("setting", {user:user, role:role, name:name});
    }else{

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

    var userManagers = req.body.selectedManager;

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

    var object_user = {
      id_users: idUser,
    names: namePost,
    lnames: lnamePost,
    credential: {
      passwords: passPost,
      emails: email
    },
    roles: userProfile};

    User.insertMany(userArray,function(err){
      if(!err){
        console.log("Information uploaded succesfully");
        if(!_.isEmpty(userManagers)){
          console.log("este es el manager id"+ userManagers);
          console.log(object_user);
          User.findOneAndUpdate({id_user:userManagers}, {$push :{team:object_user}},function(err){
            if(!err){
              console.log("push of array item done");
              }else{
                console.log(err);
              }
          });
        }

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
          role = foundUser.role;
          User.findOne({$and:[{plan:{$exists:true}},{id_user:user}]},function(err,planUser){
            if(!err){
              if(_.isEmpty(planUser)){

                res.render("welcome",{user:user});
              }else{
                Task.find({id_user:user},function(err,foundTasks){
                  if(!err){
                    // res.render("home",{user:user, name:name, role:role ,checklist:foundTasks});
                    res.redirect("/home/"+user);
                  }else{
                    console.log(err);
                  }
                })

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
    User.findOne({id_user:user1}, function(err, foundUser){
      if(!err){
        var roleHome1= foundUser.role;
        User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
          if(!err){
            console.log("Plan was updated successfully");
            res.redirect("/home/"+user1);
          }else{
            console.log(err);
          }
        });
      }else{
        console.log(err);
      }
    });


  }else if(req.body.planB==="Plan B"){
    let id = "ObjectId("+"5f89013eac3d89544a34d41e"+")";
    let user1 = req.body.userB;

    console.log("Estoy pasando por B y este es el user: "+user1);
    User.findOne({id_user:user1}, function(err, foundUser){
      if(!err){
        var roleHome1= foundUser.role;
        User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
          if(!err){
            console.log("Plan was updated successfully");
            // res.render("home1",{user:user1, name:name, role:roleHome1 ,checklist:lists});
            res.redirect("/home/"+user1);
          }else{
            console.log(err);
          }
        });
      }else{
        console.log(err);
      }
    });

  }else{
    let id = "ObjectId("+"5f89015dac3d89544a34d41f"+")";
    let user1 = req.body.userC;
    User.findOne({id_user:user1}, function(err, foundUser){
      if(!err){
        var roleHome1= foundUser.role;
        User.updateOne({id_user:user1},{$set:{plan:id}},function(err){
          if(!err){
            console.log("Plan was updated successfully");
            res.redirect("/home/"+user1);
          }else{
            console.log(err);
          }
        });
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

        User.findOne({id_user:usernames}, function(err, foundCompose){
            if(!err){
              let plan = foundCompose.plan;
              let role = foundCompose.role;
              plan = _.trimStart(plan, 'ObjectId(');
              plan = _.trimEnd(plan, ')');
              Task.find({id_user:usernames},function(err,checklists){
              if(!err){
                if(checklists.length>0){
                  lists = checklists;
                  let plan_quantity = checklists.length;
                  console.log("Este es el plan quantity "+plan_quantity);
                  Plan.findById(plan, function(err, foundPlan){
                        if(!err){
                          console.log("Esta es la capacidad "+foundPlan.quantity);
                          if(plan_quantity < foundPlan.quantity ){
                            Task.insertMany(arr,function(err){
                                if(!err){
                                  Task.find({id_user:usernames}, function(err, userChecklist){
                                    if(!err){
                                      let lists = userChecklist;
                                      res.render("home1",{user:usernames, name:names, role:"Supervisor" ,checklist:lists});
                                    }else{
                                      console.log(err);
                                    }
                                  });
                                }else{
                                  console.log(err);
                                }
                              });

                          }else{
                            res.render("capacity", {user:usernames, name:names,role:role, checklist:lists});
                          }
                        }else{
                          console.log(err);
                        }
                      });

                }else{
                  Task.insertMany(arr, function(err){
                    if(!err){
                      Task.find({id_user:usernames}, function(err, userChecklist){
                        if(!err){
                          let lists = userChecklist;
                          res.render("home1",{user:usernames, name:names, role:"Supervisor" ,checklist:lists});
                        }else{
                          console.log(err);
                        }
                      });

                    }else{
                      console.log(err);
                    }
                  })

                }
              }else{
                console.log(err);
              }
            })
            }else{
              console.log(err);
            }
          })
      }else{
        console.log("There are no tasks");
      }
    }else{
      console.log(err);
    }
  })
});

app.post("/checklist/add",function(req,res){
  let task = req.body.id_list;
  let body = req.body.post_body;

  let manager = req.body.user_manager;
  let object = req.body.object_id;

  Task.findByIdAndUpdate(task, {$push:{activities:body}},function(err){
    if(!err){
      if(req.body.submit_post === "Manager"){
        res.redirect("/checklist/"+object+"/"+manager);
      }else{
        res.redirect("/checklist/"+task);
      }

    }else{
      console.log(err);
    }
  })
})

app.post("/checklist/delete", function(req,res){
  let id = req.body.input_check;
  let task = req.body.delete_item;
  Task.findById(id,function(err,foundItems){

    if(!err){

        let task_delete = foundItems.activities[task];
        console.log(task_delete);
        Task.findByIdAndUpdate(id,{$pull:{activities:task_delete}},function(err){
          if(!err){
            res.redirect("/checklist/"+id);
          }else{
            console.log(err);
          }
        });

    }else{
      console.log(err);
    }
  })
})

app.post("/task/delete", function(req,res){
    let id_task = req.body.desc_task;
    let user_name = req.body.user_name;

    Task.deleteOne({id_task:id_task},function(err){
      if(!err){
        res.redirect("/home/"+user_name);
      }else{
        console.log(err);
      }
    });

});

app.post("/comment/post",function(req,res){
  var id_object = req.body.id_task_comment;
  var user_task = req.body.username_task;
  let comment_array = [];
  var body = req.body.post_body;
  Comment.find({},function(err, foundComments){
    if(!err){
      if(foundComments!=null){
        let id_comment = foundComments.length+1;
        let comment_array = [{
          idComment:id_comment,
          id_user:user_task,
          body:body,
          id_task: mongoose.Types.ObjectId(id_object),
          fecha: new Date()
        }];
        Comment.insertMany(comment_array,function(err){
          if(!err){
            if(req.body.postComments === "Add"){
              res.redirect("/checklist/"+id_object+"/"+user_task);
            }else{
              res.redirect("/checklist/"+id_object);
            }

          }else{
            console.log(err);
          }
        });
      }else{
        let id_comment = 1;
        let comment_array = [{
          idComment:id_comment,
          id_user:user_task,
          body:body,
          id_task: mongoose.Types.ObjectId(id_object),
          fecha: new Date()
        }];
        Comment.insertMany(comment_array,function(err){
          if(!err){
            if(req.body.postComments === "Add"){
              res.redirect("/checklist/"+id_object+"/"+user_task);
            }else{
              res.redirect("/checklist/"+id_object);
            }
          }else{
            console.log(err);
          }
        });
      }
    }else{
      console.log(err);
    }

  });

});

app.post("/home/checklist", function(req,res){
  let employee = req.body.employeeSelected;
  let user = req.body.txtUser;
  let role = req.body.txtRole;
  let name = req.body.txtName;
  res.redirect("/home/"+user+"/"+employee+"/"+name);

});


app.listen(process.env.PORT || "3000", function(req, res) {
  console.log("Listening to port 3000");
})
