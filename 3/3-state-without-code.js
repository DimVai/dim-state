/* jshint unused:false , strict:global */
"use strict"; 

//Execute this line if you want to access state variables without quotes. 
//Alternatively, you can execute the following with the same result
//let enemies = "enemies", friends = "friends", power = "power"
State.setStateVariablesPublic();      

//Initialize State Variables values and relationships  
State.createDependency(power,[enemies,friends], `State[power] = 82 - 1*State[enemies] + 2*State[friends]; `);
State.createDependency(friends,[enemies], `State[friends] = 20-State[enemies]; `);
State[enemies]=7;

  