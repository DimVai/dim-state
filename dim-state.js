/* jshint unused:false , strict:global */
/* RUN BEFORE ANY EVENT LISTENERS OR FUNCTION THAT CHANGE STATE VARIABLES */
"use strict"; 

/** A public object that contains all State Variables */
var State = {
    
    /** 
     * @type string[]
     * All State Variables in an array 
     */
    stateVariablesArray: [],
    
    /** 
     * Run State.setStateVarsPublic(), in order to set and get State Variables without using quotes.
     * (It does not create initialize State.properties from DOM.)
    */
    setStateVarsPublic: function() {
        this.stateVariablesArray.map( e => 
            Object.defineProperty(window,e,{
                value: e,
                writable: false,
            })
            //window[e]??=e 
        );
      },

    /** Initialize state variables as State.properties */  
    create: function(variable, value) {
        this["_"+variable] = value;
        this.updateDOMwithState(variable);
        Object.defineProperty(State, variable, {
            set: function(value) { 
                State["_"+variable] = value; 
                State.updateDOMwithState(variable);
            },
            get: function() { return State["_"+variable] },
          });
    },

    /** Searches specific classes in DOM and updates their value */
    updateDOMwithState: function(variable){
        if (window.jQuery){     //If jQuery
            let stateClass = ".state-" + variable;
            $(stateClass).html(State[variable]); 
        } else {                  //If not jQuery
            let stateClass = "state-" + variable;
            let classes = document.getElementsByClassName(stateClass);
            for (let i = 0; i < classes.length; i++) {
                classes[i].innerHTML = State[variable];
                }
        }
    }
};

//Format DOM to know where to put state values
(function setHTMLclasses(){
    let DOMvariables = /{{{(\w+)}}}/gi;
    let unwantedChars = /[\{\}]/g;
    let uniqueArray = arr => [...new Set(arr)];       //without "...", we get a Set, not an Array

    let stateVariablesArray = (document.body.innerHTML).match(DOMvariables) || [];
    State.stateVariablesArray = uniqueArray(stateVariablesArray.map(e => e.replace(unwantedChars, '')));
    (State.stateVariablesArray).forEach(variable => {State.create(variable,null)})

    document.body.innerHTML = document.body.innerHTML.replace(DOMvariables, '<span class="state-$1"></span>');
})();  //execute it also!

// Never use window.onload for these. It gets overritten by user's window.onload later! 


