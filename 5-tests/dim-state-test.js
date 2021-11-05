/**
 * @file dim-state.
 * @author Dimitris Vainanidis
 * @copyright Dimitris Vainanidis, 2021
 */

/* jshint unused:false , strict:global , esversion: 10 */
/* RUN BEFORE ANY EVENT LISTENERS OR FUNCTION THAT CHANGE STATE VARIABLES */
"use strict"; 


/** A public object that contains all State Variables */
var State = {

    
    /** 
     * @type Set<string>
     * All State Variables in a map 
     */
    stateVariables: new Set(),

    /**
     * @type string[<string,string>]
     * All dependencies in this format: (sourceVariable, codeToRunIfChange)
     */
    stateDependencies: [[]],

    /** the default value that is given in State variables when not defined */
    defaultStateValue: null,
    
    /** Shows if the State Variables are public (window) variables */
    areStateVariablesPublic: false,

    /** The set of variables that are syncronized with localStorage */
    localStorageVariables: new Set(),

    /** The set of variables that are syncronized with sessionStorage */
    sessionStorageVariables: new Set(),

    /** Returns if State[variable] has a valid value (not null or undefined) */
    hasValue: function(stateVariable) {return this[stateVariable] != null},


    /** Initializes State Variables as State.properties and window.properties, using DOM crawling or called by user*/  
    create: function(variable, value = this.defaultStateValue) {
        if (this.freezedMethods.includes(variable)) {
            console.error(`You can't use "${variable}" as a name for a State Variable`);
            return;
        }
        this["_"+variable] = value;     //use _ to bypass known issue with infinite recursion with "set"... 
        this.stateVariables.add(variable); //it is a set
        Object.defineProperty(State, variable, {
            set: function(value) { 
                this["_"+variable] = value;
                if (this.areStateVariablesPublic) {try{window["_"+variable]=value}catch(e){}}  
                if (this.sessionStorageVariables.has(variable)) {sessionStorage[variable] = value}
                if (this.localStorageVariables.has(variable)) {localStorage[variable] = value}
                this.updateDOMwithState(variable);
                this.updateDependencies(variable);
            },
            get: function() { return this["_"+variable] },
        });
        if (this.areStateVariablesPublic){
            try{
                window["_"+variable] = value;     //use _ to bypass known issue with infinite recursion with "set"... 
                let that = this;
                Object.defineProperty(window, variable, {
                    set: function(value) { 
                        that["_"+variable] = value;
                        window["_"+variable] = value; 
                        if (that.sessionStorageVariables.has(variable)) {sessionStorage[variable] = value}
                        if (that.localStorageVariables.has(variable)) {localStorage[variable] = value}
                        that.updateDOMwithState(variable);
                        that.updateDependencies(variable);
                    },
                    get: function() { return window["_"+variable] },
                });
            }catch(e){console.error(`You can't use "${variable}" as a name for a State Variable`);}
        }
        //During creation (not during set). But, is it really needed? maybe during creation via Javascript (not html)??? 
        this.updateDOMwithState(variable);      
        return value;
    },

    createStateVariable: function(variable, value=null){return this.create(variable,value)},

    /** Synchronize a State Variable with localStorage or sessionStorage */
    synchronize: function(variable,storageType) {
        if (storageType=="localStorage") {
            this.localStorageVariables.add(variable);
            if (typeof localStorage[variable] === 'undefined') {
                localStorage[variable] = this[variable]||'';
            } else {
                this[variable] = localStorage[variable];
            }
        }
        else if (storageType=="sessionStorage") {
            this.sessionStorageVariables.add(variable);
            if (typeof sessionStorage[variable] === 'undefined') {
                sessionStorage[variable] = this[variable]||'';
            } else {
                this[variable] = sessionStorage[variable];
            }
        }
        return State[variable];
    },
        
    /** Searches corresponding classes in DOM and updates their value */
    updateDOMwithState: function(variable){
        if (this.hasValue(variable)) {
            document.querySelectorAll('[data-state-variable='+variable+']').forEach(element => element.innerHTML = State[variable]);
            document.querySelectorAll('[data-state-value='+variable+']').forEach(function(element){
                //console.log("update",variable, typeof State[variable],State[variable]);
                try{ {element.value = State[variable]} }catch{}
            });
            document.querySelectorAll('[data-state-attribute-value='+variable+']').forEach(function(element){
                try{ element.setAttribute( element.getAttribute('data-state-attribute-name') , State[variable]); }catch{}
                });
            }
        return State[variable];
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
        return State[variable];
    },

    /**
     * Runs when a State Variable changes and updates its dependants, according to stateDependencies.
     * @param {string} the variable that changed
     */
    updateDependencies: function(variable){
        if (this.hasValue(variable)) {
            this.stateDependencies.forEach((dependency,r) => {
                if (dependency[0] == variable) {
                    eval(dependency[2]);            
                }
            });
        }
        return State[variable];
    },

    /** All State methods that must not be changed accidentally by the user 
     * (for example, she must not set a State variable named "synchronize") 
    */
    freezedMethods: ["stateVariables","stateDependencies","localStorageVariables","sessionStorageVariables",
    "hasValue","create","synchronize","updateDOMwithState","createDependency","updateDependencies",
    "freezedMethods"],

};


//if user has set var StatePublicVariables = false, do not make public variables 
if (typeof StatePublicVariables === 'undefined' || StatePublicVariables) {State.areStateVariablesPublic = true}  //jshint ignore:line


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
    document.querySelectorAll('[data-state-value]').forEach(function(element){
        dataStateVariables.push(element.getAttribute('data-state-value'));
    });
    document.querySelectorAll('[data-state-attribute-value]').forEach(function(element){
        dataStateVariables.push(element.getAttribute('data-state-attribute-value'));
    });

    //the unique array of what we gathered from HTML. Create State variables
    let stateVariables = uniqueArray([...textStateVariables, ...dataStateVariables]);
    stateVariables.forEach(variable => {State.create(variable,null)});

    //Make DOM Ready for State changes
    document.body.innerHTML = document.body.innerHTML.replace(DOMvariables, '<span data-state-variable="$1"></span>');
})();  //execute it also!


//set initial set values based on html attributes and html values. Next, add event listeners to every related element 
document.addEventListener('DOMContentLoaded', () => {           //$(document).ready()     
    document.querySelectorAll('[data-state-value]').forEach(function(element){
        if (  element.getAttribute('value') && !State.hasValue(element.getAttribute('data-state-value')) ) 
            {  State[element.getAttribute('data-state-value')] = element.getAttribute('value');  }    
        //element.getAttribute('value') is the initial value stated in html attribute "value". element.value is the actual current value (input-range always has one!)
        let updateStateValue = () => {try{ State[element.getAttribute('data-state-value')] = element.value } catch{}};
        element.addEventListener('input', function(){updateStateValue()});
        element.addEventListener('change', function(){updateStateValue()});
    });
});


//inform the developer in the console for non public variables, only if we are in dev/local environment
setTimeout(()=>{
    if (!State.areStateVariablesPublic && ["localhost","127.0","172.16","10.","192.168."].some((text)=>window.location.hostname.includes(text))) 
        { console.debug('State variables are not public. You must use the State object to access them.') }
},2500);
