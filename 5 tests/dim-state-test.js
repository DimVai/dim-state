/* jshint unused:false , strict:global , esversion: 10 */
/* RUN BEFORE ANY EVENT LISTENERS OR FUNCTION THAT CHANGE STATE VARIABLES */
"use strict"; 

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
     * The user can run State.setStateVarsPublic(), in order to use State Variables without using quotes.
     * (It does not create State.properties from DOM.)
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
        this["_"+variable] = value;
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

        } else {                  //If not jQuery. Updates state only in text (not values or attributes)
            let stateClass = "state-" + variable;
            let classes = document.getElementsByClassName(stateClass);
            for (let i = 0; i < classes.length; i++) {
                classes[i].innerHTML = State[variable];
                }
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
                // console.log(variable + " changed");
                // console.log("dependency rule: " +r);
                eval(dependency[2]);        // jshint ignore:line
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

    if (window.jQuery){
        //for every element that has data-state-value, *push* its value to the array
        $('[data-state-value]').each(function(e){
            dataStateVariables.push($(this).attr('data-state-value'))});
        $('[data-state-attribute-value]').each(function(e){dataStateVariables.push($(this).attr('data-state-attribute-value'))});
    } 
    let stateVariables = uniqueArray([...textStateVariables, ...dataStateVariables]);

    stateVariables.forEach(variable => {State.create(variable,null)});
    State.stateVariables = stateVariables;

    document.body.innerHTML = document.body.innerHTML.replace(DOMvariables, '<span class="state-$1"></span>');
})();  //execute it also!

// Never use JavaScript's window.onload for these. It gets overwritten by user's window.onload later! But you can use Query's $(window).on('load', ... 


if (window.jQuery){     //If jQuery, initiate data-states
    $(window).on('load', function() {           //set initial set values using html attributes add event listeners to every data-state-value 
        $('[data-state-value]').each(function(){
            if ($(this).attr('value')) {State[$(this).attr('data-state-value')] ??= $(this).attr('value');}     // jshint ignore:line
            let updateStateValue = () => {try{ State[$(this).attr('data-state-value')] = $(this).val(); } catch{}};
            // elem.attr('value') the initial value stated in html attribute "value". elem.val() the actual current value (input-range always has one!)

            $(this).on('input', function(){
                ExecuteAfterRapidFire(updateStateValue);
            });
    });
})}




let Executions = {};
var lastWord = str => {
    let words = str.split(" ");
    return words[words.length-1];
  }; 


/** Executes the function only once, even if you call it multiple times 
 *  How to use: executeOnce(update), executeOnce(notify.bind(this."error"))
*/
function executeOnce(func) {
    let functionName = lastWord(func.name);   //the last word (bind problems)
    if (!Executions[functionName]) {
      Executions[functionName]="true";
      func();
      //show({Executions.toString()});
    }
  }

/** Executes the function with minimum interval, even if you call it more often 
 *  How to use: executeSparsely(update,2000), executeSparsely(notify.bind(this."error"),2000)
 */
function executeSparsely(func, minInterval=1000){
    let functionName = lastWord(func.name);   //the last word (bind problems)
    if (!Executions[functionName]) {
      func();
      Executions[functionName]=true;
      setTimeout(()=> Executions[functionName]=false , minInterval);
    }
  }

/** Executes the function only after it has stopped being called for an interval
 *  How to use: ExecuteAfterRapidFire(update,500), ExecuteAfterRapidFire(notify.bind(this."error"),500)
 */
function ExecuteAfterRapidFire(func, pauseWait=200){
    let functionName = lastWord(func.name);   //the last word (bind problems)  
    clearTimeout(Executions[functionName]);
    Executions[functionName] = setTimeout(func,pauseWait);
  }
