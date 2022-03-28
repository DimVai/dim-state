/**
 * @file lightstate.js
 * @author Dimitris Vainanidis
 * @copyright Dimitris Vainanidis, 2021
 */

/* jshint unused:false , strict:global , esversion: 10 */
// jshint ignore:start
/* RUN BEFORE ANY EVENT LISTENERS OR FUNCTION THAT CHANGE STATE VARIABLES */
"use strict"; 


{       // brackets for local variables

/** Local helper function to select elements */
let Q = (queryString) => [...document.querySelectorAll(queryString)];


/** A public object that contains all State Variables and methods */
window.State ??= {

    /** 
     * @type Set<string>
     * All State Variables in a map 
     */
    stateVariables: new Set(),

    /** the default value that is given in State variables when not defined */
    defaultStateValue: null,
    
    /** Shows if the State Variables are public (window) variables */
    areStateVariablesPublic: window?.StatePublicVariables ?? true,

    /** The subset of variables that are syncronized with localStorage */
    localStorageVariables: new Set(),

    /** The subset of variables that are syncronized with sessionStorage */
    sessionStorageVariables: new Set(),

    /** State methods (also future methods) must not be variable names to avoid conflict */
    disallowedNames: ["variables","stateVariables","defaultStateValue","localStorageVariables","sessionStorageVariables",
    "has","hasValue","exists","set","get","create","synchronize","updateDOMwithState","dependencies","createDependency","updateDependencies",
    "disallowedNames"],


    /** Initializes State Variables as State.properties and window.properties, using DOM crawling or called by user*/  
    create: function(variable, value = this.defaultStateValue) {
        
        if (this.disallowedNames.includes(variable)) {       // check if variable name is allowed
            console.error(`You can't use "${variable}" as a name for a State Variable`);
            return;
        }
        
        try{            // create State.varialbe
            this["_"+variable] = value;     // use _ to bypass known issue with infinite recursion with "set"... 
            this.stateVariables.add(variable); // it is a set
            Object.defineProperty(this, variable, {
                set: function(value) { 
                    this["_"+variable] = value;
                    if (this.areStateVariablesPublic) {try{window["_"+variable]=value}catch(e){}}  
                    if (this.sessionStorageVariables.has(variable)) {sessionStorage[variable] = value}
                    if (this.localStorageVariables.has(variable)) {localStorage[variable] = value}
                    this.updateDOMwithState(variable);
                },
                get: function() { return this["_"+variable] },
            });
        }catch(e){console.error(`You can't use "${variable}" as a name for a State Variable`)}
        
        if (this.areStateVariablesPublic){   try{            // create window.variable. only if globals allowed, do the same to window  
            window["_"+variable] = value;     //use _ to bypass known issue with infinite recursion with "set"... 
            let that = this;                    // that = State 
            Object.defineProperty(window, variable, {
                set: function(value) { 
                    that["_"+variable] = value;
                    window["_"+variable] = value; 
                    if (that.sessionStorageVariables.has(variable)) {sessionStorage[variable] = value}
                    if (that.localStorageVariables.has(variable)) {localStorage[variable] = value}
                    that.updateDOMwithState(variable);
                },
                get: function() { return window["_"+variable] },
            });
            }catch(e){console.error(`You can't use "${variable}" as a name for a State Variable`)} }

        // During creation via Javascript State.create, not HTML. this.set won't get called. (is it really needed?)
        this.updateDOMwithState(variable);    
        return value;           // just for "return" purposes
    },

    /** Synchronize a State Variable with localStorage or sessionStorage. Local/session has always priority. Method called by user. */
    synchronize: function(variable,storageType) {
        if (storageType=="localStorage") {
            this.localStorageVariables.add(variable);
            if ( localStorage.getItem(variable)===null ) { localStorage[variable] = this[variable]??'' } 
            else { this[variable] = localStorage[variable] }
        }
        else if (storageType=="sessionStorage") {
            this.sessionStorageVariables.add(variable);
            if ( sessionStorage.getItem(variable)===null ) { sessionStorage[variable] = this[variable]??'' } 
            else { this[variable] = sessionStorage[variable] }
        }
        return this[variable];
    },
        
    /** Searches corresponding DOM elements and updates their value */
    updateDOMwithState: function(variable){
        Q('[data-state-variable='+variable+']').forEach(element => element.innerHTML=this[variable]);
        Q('[data-state-value='+variable+']').forEach(element => { try{ {element.value=this[variable]} }catch{}  });
        Q('[data-state-attribute-value='+variable+']').forEach((element)=>{
            try{ element.setAttribute( element.getAttribute('data-state-attribute-name') , this[variable]) }catch{}
        });
        return this[variable];
    },

};


// Does these things when file gets loaded:
// Formats DOM text to know where to put state value changes later
// Captures State Variables from DOM text, data-state-value attributes
(function initializeState(){
    
    // Make DOM Ready for State changes, replacing {{{variables}}} with the <span>
    let DOMvariables = /{{{(\w+)}}}/gi;
    document.body.innerHTML = document.body.innerHTML.replace(DOMvariables, '<span data-state-variable="$1"></span>');
    
    // Now, gather the variable names from theese three sources
    let VariablesFromText = Q('[data-state-variable]').map(el=>el.getAttribute('data-state-variable'));
    let VariablesFromInputs = Q('[data-state-value]').map(el=>el.getAttribute('data-state-value'));
    let VariablesFromAttributes = Q('[data-state-attribute-value]').map(el=>el.getAttribute('data-state-attribute-value'));
    
    // The unique array of what we gathered from HTML. Create State variables
    let uniqueArray = arr => [...new Set(arr)];       // without "...", we get a Set, not an Array
    uniqueArray([...VariablesFromText, ...VariablesFromInputs, ...VariablesFromAttributes])
        .forEach(variable => {State.create(variable,null)});

})();  // execute it also!


// set initial set values based on html attributes (and not html values). Next, add event listeners to every related element 
document.addEventListener('DOMContentLoaded', ()=>{           //$(document).ready()
    Q('[data-state-value]').forEach(function(element){
        if ( element.getAttribute('value') && State?.[element.getAttribute('data-state-value')]==null )  // if State.variable exists but with no value yet
            {  State[element.getAttribute('data-state-value')] = element.getAttribute('value')  }    
        // element.getAttribute('value') is the initial value stated in html attribute "value". element.value is the actual current value (input-range always has one!)
        let updateStateValue = () => {try{ State[element.getAttribute('data-state-value')] = element.value } catch{}};
        element.addEventListener('input', function(){updateStateValue()});
        element.addEventListener('change', function(){updateStateValue()});
    });
});


// inform the developer in the console for non public variables, only if we are in dev/local environment
setTimeout(()=>{
    if (!State.areStateVariablesPublic && ["localhost","127.0","172.16","10.","192.168."].some((text)=>window.location.hostname.includes(text))) 
        { console.warn('State variables are not public. You must use the State object to access them. (this message appears only in development enviromnent)') }
},2500);


} // local brackets