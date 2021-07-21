/* jshint unused:false , strict:global */
"use strict"; 


//Execute this line if you want to access state variables without quotes. 
//Alternatively, you can execute the following with the same result
//let enemies = "enemies", friends = "friends"
State.setStateVarsPublic();      


//Initialize State Variables values. Setting enemies to 7 and friends to 2.  
setState(enemies,7);
setState(friends,2);


//Click logic//
document.getElementById("kill").addEventListener("click", killEnemy);

//when clicked, decrease enemies by 1 and increase friends by 1
function killEnemy(){
    // 2 different ways to change state
    setState(enemies, decrease(State[enemies]));
    State.set(friends, 9-State[enemies] );  
}

//decrease a positive variable by one
function decrease(variable){
    return Math.max(variable-1,0);
}



