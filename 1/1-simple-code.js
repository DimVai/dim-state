/* jshint ignore:start */


//Execute this line if you want to access state variables without quotes. 
//Alternatively, you can execute the following (with the same result):
//let enemies = "enemies", friends = "friends"
//State.setStateVariablesPublic();      

//Initialize State Variables values. Setting enemies to 7 and friends to 2.  
// State[enemies]=7;
// State[friends]=2;
enemies = 7;
friends = 2;


//Button logic//
document.getElementById("kill").addEventListener("click", killEnemy);
//when button clicked, decrease enemies by 1 and set friends = 9 - enemies
function killEnemy(){
    enemies = decrease(enemies);
    friends = 9-enemies;  
}
//decrease a positive variable (enemies) by one
function decrease(variable){
    return Math.max(variable-1,0);
}

