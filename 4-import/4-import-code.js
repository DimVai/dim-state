/* jshint unused:false , strict:global */
// jshint ignore: start
"use strict"; 

import Statue from './dim-state-module.js';
//const Statue = require( './dim-state-module');            //only in node, not in browser!
//var Statue2 = Statue;


//Execute this line if you want to access state variables without quotes. 
//Alternatively, you can execute the following with the same result
//let enemies = "enemies", friends = "friends", power = "power"
Statue.setStateVariablesPublic();      

//Initialize State Variables values and relationships  
//State.createDependency(power,[enemies,friends], `State[power] = 82 - 1*State[enemies] + 2*State[friends]; `);
// State.createDependency(friends,[enemies], `State[friends] = 100-State[enemies]; `);
//State.createDependency(sliderInputHeightX2, [sliderInputHeight],`State[sliderInputHeightX2] = State[sliderInputHeight]*2`)
let log = console.log;
log({Statue});
log(Statue[enemies])
Statue[enemies]=14;
log(Statue[enemies])
Statue[intelligence]=1;
log(Statue[intelligence])

//let state = new State;
//log({State});
  