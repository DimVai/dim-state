# dim-state.js
 ### Use State Variables in your JavaScript projects without a framework and without compilation. It just works! ###
 ### By Dimitris Vainanidis (c) 2021. ###
 Live Example here: https://dimvai.github.io/dim-state/

<br/>

# **Preparation**
Download the file **dim-state.js** and load it in your website. For example, in your .html head write:
```html
<script defer src="https://dimvai.github.io/dim-state/dim-state.js"></script>
```
_Important note_: Load this script:
* Using `defer`, or at the end of html body 
* **Before** any other script that accesses or sets any State Variables. 

This, will create a **public Object** named `State` or `window.State`. 

*As an alternative* (not recommended for now), you can import the `dim-state-module.js` (located in folder 4) *as a module*, but its functionality is not fully tested or supported. This way, you can also change the name of the State Object:
```JavaScript
    import StateWithWhateverNameYouWant from './dim-state-module.js';
```

<hr>
<hr>

# **How to use - Level 1, State Variables**


## **1st step: Mark your variables in your HTML**
In your .html file , declare variables like the following example (folder 1):
```html
    <h3>You have {{{enemies}}} enemies left to kill</h3>
    <h4>You have {{{friends}}} friends left to love</h4>
    <p>Summary: There are {{{enemies}}} enemies and {{{friends}}} friends!</p>
```
*If you ever want to create State Variables that are not shown in HTML, read note 1.2 below on how to create them with JavaScript.* 

## **2nd and last step: Access and change the variables**

**Set** or change variables the **right way**. If you want friends to be 3, then write one of the following:
```JavaScript
    State[friends] = 3;  //right way
    State.friends = 3;   //right way
```
**Get** the value of the variable in your code the **right way** using one of the following:
```JavaScript
    currentEnemies = State[enemies];   //right way
    currentEnemies = State.enemies;    //right way    
```
Do not use the following **wrong ways** to set or get a State Variable!
```JavaScript
    friends = 3;   //This is the wrong way! In strict mode you may get an error. 
    currentEnemies = enemies;     //This is the wrong way to get enemies!
```

Of course, you can mix and match the above ways. If you want to set `friends = 9-enemies`, then write:
```JavaScript
    State.friends = 9 - State[enemies];  
```

## **Notes**

### *Note 1.1 - Avoid public variables (skip this)*
This is optional, and not recommended if you don't know what you do, so skip this!

`dim-state` makes by default a public variable for every State Variable you declare. In the above examples, there are two public variables: `friends="friends"` and `enemies="enemies"`. If you **don't want** this, run the following command before `dim-state` loads (for example in an html inline script):
```JavaScript
var StatePublicVariables = false;
```
However, in this case, because there are no `friends` or `enemies` variables, you have to use square brackets and quotation marks when you access a State Variable:
```JavaScript
    State["friends"] = 3;
    currentEnemies = State["enemies"];
```

### *Note 1.2 - Create variables in JavaScript*
If you want to create a State Variable in your JavaScript file (instead of creating using the default HTML way above), use the following method (this is not fully tested yet). To create, for example, a State variable `health` with a value `12`:
```JavaScript
let health = 'health';      //so we do not use "health" in quotation marks in the next line
State.create(health,"12");  //(use "health" if you omit the previous line)
```

<hr>
<hr>

# **How to use - Level 2, LocalStorage and SessionStorage**
You can syncronize your State Variables with the `LocalStorage` or `SessionStorage`. At any point (preferably, in the beginning, when the page loads), run:
```JavaScript
State.synchronize(enemies,"localStorage")
State.synchronize(health,"sessionStorage");
```
If there are values already stored in `localStorage` or `sessionStorage`, they will override any value that State Variable has at this point. From this point on, every State Variable that changes, it also updates the `localStorage` or `sessionStorage`. 

<hr>
<hr>


# **How to use - Level 3, Use Dependencies**
You can set dependencies between your variables. So, if one gets updated, all the others get update automatically.
<br>In this example (folder 2), we use the command `State.createDependency()`. 

```JavaScript
State.createDependency(power,[enemies,friends], 'State[power] = 82 - 1*State[enemies] + 2*State[friends];');
State.createDependency(friends,[enemies], 'State[friends] = 9-State[enemies];');
State[enemies]=7;
```
In the first line, we declare that the variable `power` depends  on  `enemies` and `friends` using the relationship: `State[power] = 82 - 1*State[enemies] + 2*State[friends]; `. In the next line, we declare that the variable `friends` depends on `enemies` using the relationship: `State[friends] = 9-State[enemies];` The third argument must be a valid JavaScript code that gets executed when one of the variables in square brackets change. 
<br> In the third line we initialize `enemies` only. `friends` and `power` don't need initialization. They get their values according to the rules we just defined.

<hr>
<hr>

# **How to use - Level 4A, State in HTML inputs without JavaScript code**
Using `dim-state.js`, we can synchronize things in HTML code, **without writing any JavaScript** code or event listeners. This works on every HTML item that has a `value` property, like `input`,`select` e.t.c.
Take a look at the third example (folder 3). **There is no custom `.js` file**. Just HTML! Among other things, HTML contains this code:
```HTML
        <h3>Enemies: {{{enemies}}}</h3>
        <input type="range" data-state-value="enemies" value="27">
        <input type="number" data-state-value="enemies">
```
The two attributes `data-state-value="enemies"` is how we declare that the value of the two inputs (input-range and input-text/number) must always be equal to the variable `enemies`, which is always displayed in the `{{{enemies}}}` position. We set the attribute `value="27"` in one (either) of them, so the initial value of `enemies` should be `27`. No need for JavaScript code. Everything is synchronized automatically.

### _Note 4.1: Initial values in multiple synchronized inputs_
If different inputs (with the same `data-state-value` attribute) have different initial values (`value` attribute), it is unknown (not defined) which value attribute will ultimately became the State Variable's value. Also, If you do not set any `value` attributes at all, the inputs won't get synchronized initially. So the advice is:
* Declare only one `value` attribute in your synchronized inputs. 
* Optionally/alternatively, initiate the variable in your .js file using `State[variable]="value".` This will override any `value` that is declared in HTML attributes.  


# **How to use - Level 4B, State in HTML Attributes**
In the same page there is a slider and an image. We synchronize the `value` of the slider to the `height` of the image: 
```HTML
<input type="range" 
    value="100" 
    data-state-value="sliderInputHeight">
<img src="YinYang.png" 
    height="100" 
    data-state-attribute-name="height" 
    data-state-attribute-value="sliderInputHeight">
```
In this case, we first declare that the value of the slider is called `sliderInputHeight` using the attribute `data-state-value="sliderInputHeight"`, exactly like the previous case. 
<br>Then, in the `img` we use the two last statements to declare that the attribute with name `height` has the value of (is determined by) the State Variable `sliderInputHeight`.
<br>Of course, no JavaScript here. We note again, that you have to load `jQuery` before. 
<br/>
### _Note 4.2: Dependencies between HTML State Variables_
Expanding the last example, we could have set the image's `data-state-attribute-value="sliderInputHeightX2"` (different variable) and in JavaScript we could have set the (dependency) rule
```JavaScript
State.createDependency(
    sliderInputHeightX2, 
    [sliderInputHeight],
    'State[sliderInputHeightX2] = State[sliderInputHeight]*2')
```
This way, the height of the image is always double the value of the slider. Try it yourself!

### _Note 4.3: Limitations for multiple attribute states_
At this time and version, you cannot use State Variables for more than one attribute per HTML element.

### _Note 4.4: Use jQuery if you encounter any problem_
At this time and version, if something is not working correctly, try to load jQuery before. This might fix the issue. 

<hr>
<hr>

# How it works behind the scenes. Technical Stuff...
### **Level 1: creating and updating State Variables**
When `dim-state.js` loads, it accesses your html, and changes your `{{{}}}` variables with a `span` with the appropriate class. For example, it will change `{{{friends}}}` with the following HTML object (with blank innerText at the moment):
```JavaScript
<span class="state-enemies"></span>
```
Moreover, it will create the property `State.friends` in the public object `State` that will be created. The `State` object has various properties and methods in order to work, but it certainly contains all the State Variables (names and values) as properties (names and values). 

The properties of the `State` are the single point of truth for the State Variables using `dim-state.js`.

But, when you set or change the variable, not only does it update the property, but it also updates the text inside every span with `class="state-enemies"` ! So, you don't need to babysit the DOM on every variable change. 

### **Level 2: creating and updating dependencies**
When you declare a dependency, dim-state.js creates a record in `State.stateDependencies` sub-object. Using, our examples,
```JavaScript
State.createDependency(power,[enemies,friends], `...code...`);
```
becomes the two records:
```JavaScript
["enemies", "power", '...code...']
["friends", "power", '...code...']
```
So, when `friends` changes, the program knows (second line above) that it must execute the `...code...`, so `power` will get updated instantly. The first argument on `State.createDependency` doesn't play any role at all (!!!), but it improves the readability of the user's code!

### **Level 3: HTML State without JavaScript**
`dim-state.js`, not only includes variables in brackets (like `{{{something}}}`) in the `State` object, but also includes variables that it finds in `data-state-value="something"` and in `data-state-attribute-value="somethingElse"` attributes. In case of an HTML input and `data-state-value`, it also adds an event listener to the element, so, every time the input changes, the State Variable gets updated too. On the other side, when every State Variable changes, the programs checks all HTML elements with these attributes (even if they do not exist), and update their value or attribute respectively.
