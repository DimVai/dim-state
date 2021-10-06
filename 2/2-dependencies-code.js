// jshint ignore: start
"use strict"; 

var State = window.State;

//Execute this line if you want to access state variables without quotes.      
//var StatePublicVariables = false;    //does not work in here. Set in html

//Initialize State Variables values and relationships  
State.createDependency(power,[enemies,friends], `State[power] = 82 - 1*State[enemies] + 2*State[friends];`);
State.createDependency(friends,[enemies], `State[friends] = 9-State[enemies];`);
State[enemies]=7;
//State[friends]=2;   //This is not needed any more because of dependency!


//Button logic
document.getElementById("kill").addEventListener("click", killEnemy);
//when button clicked, decrease enemies by 1. Friends and power will upadate automatically using the dependency
function killEnemy(){
    State[enemies] = decrease(State[enemies]);
}
//decrease a positive variable by one
function decrease(variable){
    return Math.max(variable-1,0);
}
