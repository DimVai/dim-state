# dim-state
 ### Use State Variables in your JavaScript projects without a framework and without compilation. It just works! ###
 ### By Dimitris Vainanidis (c) 2021. ###
 Live Example here: https://dimvai.github.io/dim-state/

<br/>

## **Preparation**
Download the file **dim-state.js** and import it in your website. For example, in your .html file write:
```html
<script defer src="dim-state.js"></script>
```
_Important note_: Import this script **before** any other script that accesses or sets any State Variables!
This, will create a **public Object** named `State` or `window.State`. 


<br/>

## **How to use**


### **1st step:**
In your .html file, declare variables like the following example:
```html
    <h3>You have {{{enemies}}} enemies left to kill</h3>
    <h4>You have {{{friends}}} friends left to love</h4>
    <p>Summary: There are {{{enemies}}} enemies and {{{friends}}} friends!</p>
```


### **2st step:**
Optionally, run the following command **once**, on ```window.load``` for example, to make your life better later:
```Javascript
    State.setStateVarsPublic();
```
This will allow you to use your State Variables without any quotation marks.
It will make more public non-writable variables, one for every State Variable.
If you don't want this (because you may not want public variables), you must use quotation marks every time you access a variable (read below for examples).


### **3rd step:**
**Access and change the variables.**

Set or change variables the **right way**. If you want friends to be 3, then write one of the following:
```JavaScript
    State[friends] = 3;  //right way
    State.friends = 3;   //right way
```
Do not use the following **wrong way** to set a State Variable!
```JavaScript
    friends = 3;   //This is the wrong way! In strict mode you will get an error. 
```

Get the value of the variable in your code the **right way** using one of the following:
```JavaScript
    currentEnemies = State[enemies];   //right way
    currentEnemies = State.enemies;    //right way    
```
Do not use the following **wrong way**!
```JavaScript
    currentEnemies = enemies;     //This is the wrong way to get enemies!
```

Of course, you can mix and match. If you want to set `friends = 9 - enemies`, then write:
```JavaScript
    State.friends = 9 - State[enemies];  
```


### _Note:_
If you do not run `State.setStateVarsPublic()`, you have to use square brackets and quotation marks when you access a State Variable:
```JavaScript
    State["friends"] = 3;
    currentEnemies = State["enemies"];
```

<br/>

## How it works behind the scenes. Technical Stuff...
When `dim-state.js` loads, it accesses your html, and changes your `{{{}}}` variables with a span with the appropriate class. For example, it will change `{{{friends}}}` with the following HTML object (with blank innerText at the moment):
```JavaScript
<span class="state-enemies"></span>
```
Moreover, it will create the property `State.friends` in the public object `State` that will be created. The `State` object has various properties and methods in order to work, but it certainly contains all the State Variables (names and values) as properties (names and values). 

The properties of the `State` are the single point of truth for the State Variables using `dim-state.js`.

But, when you set or change the variable, not only does it update the property, but it also updates the text inside every `state-enemies` span! So, you don't need to babysit the DOM on every variable change. 
