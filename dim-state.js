/**
 * @file dim-state.
 * @copyright Dimitris Vainanidis 2021
 */

/* jshint unused:false , strict:global , esversion: 10 */
/* RUN BEFORE ANY EVENT LISTENERS OR FUNCTION THAT CHANGE STATE VARIABLES */
"use strict"; 

/**
 * @author Jane Smith <jsmith@example.com>
 */

/** A public object that contains all State Variables */
var State = {
    

    /** 
     * @type string[]
     * All State Variables in an array 
     */
    stateVariables: [],

    /**
     * @type string[<string,string>]
     * All dependencies in this format: (sourceVariable, codeToRunIfChange)
     */
    stateDependencies: [[]],

    /** the default value that is given in State variables when not defined */
    defaultStateValue: null,
    
    /** 
     * The user can run State.setStateVarsPublic() in order to use State Variables without using quotes.
     * (Only for ariables that have already been inserted in State.stateVariables)
    */
    setStateVariablesPublic: function() {
        this.stateVariables.map( e => {
            if (!window[e]) {
                Object.defineProperty(window,e,{
                    value: e,
                    writable: false,
                })}
            });
        },


     /** Initializes State Variables as State.properties, using DOM crawling*/  
    create: function(variable, value = this.defaultStateValue) {
        this["_"+variable] = value;     //use _ to bypass known issue with infinite recurssion with "set"... 
        this.updateDOMwithState(variable);
        Object.defineProperty(State, variable, {
            set: function(value) { 
                this["_"+variable] = value; 
                this.updateDOMwithState(variable);
                this.updateDependencies(variable);
            },
            get: function() { return this["_"+variable] },
          });
    },
        
    /** Searches corresponding classes in DOM and updates their value */
    updateDOMwithState: function(variable){
        if (window.jQuery){     //If jQuery
            let stateClass = ".state-" + variable;
            $(stateClass).html(State[variable]); 
            try{$('[data-state-value='+variable+']').val(State[variable]);}catch{}
            $('[data-state-attribute-value='+variable+']').each(function(e){
               try{ $(this).attr( $(this).attr('data-state-attribute-name') , State[variable]); }catch{}
            });

        } else {         
            let stateClass = "state-" + variable;
            let classes = document.getElementsByClassName(stateClass);
            for (let i = 0; i < classes.length; i++) {
                classes[i].innerHTML = State[variable];
                }
            document.querySelectorAll('[data-state-value='+variable+']').forEach(function(element){
                try{element.value = State[variable]}catch{}
            });
            document.querySelectorAll('[data-state-attribute-value='+variable+']').forEach(function(element){
                try{ element.setAttribute( element.getAttribute('data-state-attribute-name') , State[variable]); }catch{}
             });
        }
    },


    /** 
     * A function for the user to create dependencies between State Variables.
     * @param {string} the variable that depends on something other 
     * @param {string[]} dependenciesArray the variables that it depends on 
     * @param {string} AssignmentsAsString the code assignments in string form
     * */
    createDependency: function(variable, dependenciesArray, AssignmentsAsString) {
        dependenciesArray.forEach(dependency => { 
            this.stateDependencies.push([dependency,variable,AssignmentsAsString]);
        });
    },

    /**
     * Runs when a State Variable changes and updates its dependants, according to stateDependencies.
     * @param {string} the variable that changed
     */
    updateDependencies: function(variable){
        this.stateDependencies.forEach((dependency,r) => {
            if (dependency[0] == variable) {
                eval(dependency[2]);            // jshint ignore:line
            }
        });
    },

};



//Does these things when file gets loaded:
//Captures State Variables from DOM text 
//Captures State Variables from data-state-value and data-state-attribute-value attributes
//Formats DOM text to know where to put state value changes later
//
(function setHTMLclasses(){
    let DOMvariables = /{{{(\w+)}}}/gi;
    let unwantedChars = /[\{\}]/g;
    let uniqueArray = arr => [...new Set(arr)];       //without "...", we get a Set, not an Array

    //gets all variables in html that *match* {{{DOMvariable}}} and then for each one (*map*), remove the unwantedChars "{" and "}" *replacing* them with ''
    let textStateVariables = ( (document.body.innerHTML).match(DOMvariables) || [] ).map(e => e.replace(unwantedChars, ''));
    let dataStateVariables = [];

    //for every element that has data-state-value or data-state-attribute-value, *push* its value to the array
    if (window.jQuery){
        $('[data-state-value]').each(function(e){
            dataStateVariables.push($(this).attr('data-state-value'));
        });
        $('[data-state-attribute-value]').each(function(e){dataStateVariables.push($(this).attr('data-state-attribute-value'))});
    } else {
        document.querySelectorAll('[data-state-value]').forEach(function(element){
            dataStateVariables.push(element.getAttribute('data-state-value'));
        });
        document.querySelectorAll('[data-state-attribute-value]').forEach(function(element){dataStateVariables.push(element.getAttribute('data-state-attribute-value'))});
    }

    //the unique array of what we gathered from HTML. Create State variables
    let stateVariables = uniqueArray([...textStateVariables, ...dataStateVariables]);
    stateVariables.forEach(variable => {State.create(variable,null)});
    State.stateVariables = stateVariables;

    //Make DOM Ready for State changes
    document.body.innerHTML = document.body.innerHTML.replace(DOMvariables, '<span class="state-$1"></span>');
})();  //execute it also!


//set initial set values based on html attributes and html values. Next, add event listeners to every related element 
if (window.jQuery){     //If jQuery, initiate data-states
    $(window).on('load', function() {           
        $('[data-state-value]').each(function(){
            if ($(this).attr('value')) {State[$(this).attr('data-state-value')] ??= $(this).attr('value');}     // jshint ignore:line
            // elem.attr('value') the initial value stated in html attribute "value". elem.val() the actual current value (input-range always has one!)
            let updateStateValue = () => {try{ State[$(this).attr('data-state-value')] = $(this).val(); } catch{}};
            $(this).on('input change', function(){
                updateStateValue();
            });
        });
    });
} else {
    window.addEventListener("load", function() {           
        document.querySelectorAll('[data-state-value]').forEach(function(element){
            if (element.getAttribute('value')) {State[element.getAttribute('data-state-value')] ??= element.getAttribute('value');}     // jshint ignore:line
            //element.getAttribute('value') is the initial value stated in html attribute "value". element.value is the actual current value (input-range always has one!)
            let updateStateValue = () => {try{ State[element.getAttribute('data-state-value')] = element.value } catch{}};
            element.addEventListener('input', function(){updateStateValue()});
            element.addEventListener('change', function(){updateStateValue()});
        });
    });
}


