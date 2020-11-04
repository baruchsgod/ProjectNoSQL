$(document).ready(function(){
  $("#aSignUp").click(function(){
    $("#first").slideUp("slow",function(){
      $("#second").slideDown("slow");
      $(".logIn").css("height","130%");
      $(".signUp").css("height","130%");
    })
  });

  $("#aLogIn").click(function(){
    $("#second").slideUp("slow",function(){
      $("#first").slideDown("slow");
      $(".logIn").css("height","100%");
      $(".signUp").css("height","100%");
    })
  });


});
