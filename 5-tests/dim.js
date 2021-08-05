/* jshint unused:false , strict:global */
"use strict";



/**
 * Χρήση σε development περιβάλλον. για να ελέγχεις αν λειτουργεί ο κώδικας, πχ αν γίνεται trigger το κλικ κουμπιού.
 * Γράφεις check(); ή check("button click"); αντί για console.debug(κάτι)...
 * @param {string} message the message to console.debug 
 */
function check(message = "check ok") {console.debug(message)}


/**
 * Refresh/Reload of current page. 
 * @param {boolean} [keepGetParameters] - Optional. If true, then keeps the get parameters. Default=false
 */
function refreshWindow (keepGetParameters = true) {
    if (keepGetParameters){
        window.location.reload();
    } else {
        location.replace(window.location.origin + window.location.pathname);
    }
}

/**
 * Χρησιμοποιείται σε async functions σε εντολή τύπου ' await delay(2000); ' ώστε να περιμένει 2 sec πριν την επόμενη εντολή 
 * https://gist.github.com/eteeselink/81314282c95cd692ea1d
 * @param {number} ms time in milliseconds
 * @returns {Promise} 
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


//////////////////////////        EXECUTIONS       //////////////////////////

// https://codepen.io/dimvai/pen/xxddbNp
// https://codepen.io/dimvai/pen/qBmmRaW

/**
 * Execute a function multiple times. 
 * https://stackoverflow.com/questions/21648264/javascript-call-function-10-times-with-1-second-between/21648331 
 * @param {function} func the function to be executed (without parenthesis / use bind)
 * @param {number} num how many times to be executed
 * @param {number} interval time interval between executions in milliseconds
 * @param {function} [finallyExecute] Optinal. Another function to be executed in the end 
 * @returns {void} 
 */
function SetIntervalFiniteTimes(func, interval, num, finallyExecute) {
    if (!num) {finallyExecute();return}                 
    func();
    setTimeout(function() { SetIntervalFiniteTimes(func, interval, num - 1, finallyExecute) }, interval);
}

let Executions = {};
let lastWord = str => {
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


/**
 * Returns an Object with the current URL's GET parameters in key-value format
 * https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
* @type {{}} Object with key values 
 */
var GetParameters = function () {
    var urlParams;
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (!!(match = search.exec(query)))          // = ανάθεση όχι ισότητα,
        {urlParams[decode(match[1])] = decode(match[2])}
    return urlParams;
};


//Φορτώνει τις εικόνες οι οποίες στην html δηλώνονται έτσι: 
// <img data-lazy="#" src="#" data-src="url-εικόνας">  ή  <img src="προσωρινή-ελαφριά-εικόνα" data-src="μόνιμη-εικόνα">
//απαιτεί να έχει φορτωθεί το jQuery πρώτα
//απαιτεί και css:   img[data-src][data-lazy="#"]{opacity: 0;}
//Αν δεν οριστεί παράμετρος καθυστέρησης, τότε φορτώνει τις εικόνες σε 1 sec. 
//έχει νόημα μόνο όταν οι εικόνες έχουν σταθερό μέγεθος. 

/**
 * Loads images after a while. Needs appropriate CSS. Use fixed image sizes.
 * @param {number} delay Delay in seconds
 */
function LazyLoadImages(delay=1) {
	setTimeout(() => {
            $('img').each(function(){
                $(this).attr('src', $(this).attr('data-src'));
            });
            setTimeout(()=>{$('[data-src]').fadeTo(500, 1)},200);			//το fadeTo ελέγχει το opacity        
    }, delay*1000);
}

/**
 * Loads a .CSS or .JS file. Needs JQuery 
 * @param {URL} resourceURL Path of .js or .css file
 * @param {number} delay Delay in seconds. Optinal. Default=0 
 */
function LazyLoadResource(resourceURL, delay = 3){
    let resourceExtention = resourceURL.split('.').pop();       //CSS or JS?
    setTimeout(() => {
        switch (resourceExtention) {
            case 'css':
                $("head").append($(`<link rel='stylesheet' href=${resourceURL} type='text/css' media='screen' />`));    
                break;
            case 'js':
                $.getScript(resourceURL);
                break;
            default:
                break;
        }
    }, delay*1000);
}


//φόρτωση στοιχείου στην σελίδα όπως jQuery.load. πχ  load(document.getElementById('app-header-container'), '../pages/header.html');
/**
 * jQuery.load alternative
 * @param {HTMLElement} target div element
 * @param {URL} url html to be loaded in div
 */
function load(target, url) {
    var r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.onreadystatechange = function () {
        if (r.readyState != 4 || r.status != 200) {return;}
        target.innerHTML = r.responseText;
    };
    r.send();
}


// Συναρτήσεις αναμονής. Όταν ισχύσει μια συνθήκη, εκτέλεσε τη συνάρτηση τάδε. //
// https://stackoverflow.com/questions/22125865/wait-until-flag-true

// Πρώτος τρόπος. Παραλλαγή της setTimeout
// όπως ξέρουμε, οι συναρτήσεις παίρνουν ορίσματα είτε μεταβλητές, είτε συναρτήσεις
// όχι συνθήκες, ούτε εκφράσεις! πχ όχι  size=='big' , αλλά  () => size == 'big'  !!!
// χρήση: setTimeoutUntil(() => window.waitForMe, () => console.log('got you'))
// δεν έχει τεσταριστεί αν η callback λειτουργεί με arguments... 
/**
 * Wait for a condition to be met and, only then, execute a function 
 * @param {any} condition Use a variable or a function (that returnes true/false). Do not use condition or expression!
 * @param {Function} callback Function to call when condition is met
 * @param {number} milliseconds Check condition every this interval in milliseconds. 
 */
function setTimeoutUntil(condition, callback, milliseconds = 200) {
    if(!condition()) {
        //console.log('waiting');
        setTimeout(setTimeoutUntil.bind(null, condition, callback), milliseconds); /* this checks the flag every 200 milliseconds*/
    } else {
        //console.log('done');
        callback();
    }
}

// Δεύτερος τρόπος. Χρήση await εντολής μέσα σε async συνάρτηση. Κάνουμε async την "μαμά" function.  
// Εδώ ορίζουμε τη συνθήκη που πρέπει να ισχύει ώστε να συνεχίσει η εκτέλεση της κύριας μαμάς function 
// Χρήση στη μαμά: await until(_ => flag == true);

/**
 * Wait for a condition to be met and, only then, continue execution of function. 
 * Use only inside async function!  
 * Use this way: await until(_ => flag == true);
 * @param {boolean|Function} condition Use a variable or a function (that returnes true/false). Do not use condition or expression!
 * @returns {Promise} 
 */
var until = condition => {
    const poll = resolve => {
      if(condition()) {resolve()}
      else {setTimeout(_ => poll(resolve), 200)}
    };
    return new Promise(poll);
  };



//Cookie Handling    -   Δεν έχουν τεσταριστεί~
//Δουλεύουν με ασφάλεια με τιμές (value) strings. Με περίεργους χαρακτήρες (πχ semicolons ή =), δεν δουλεύει
//https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
//Για πιο συστηματική δουλειά, χρησιμοποίησε αυτό: https://github.com/js-cookie/js-cookie
/**
 * Sets a cookie
 * @param {string} name 
 * @param {string} value 
 * @param {number} days 
 */
function setCookie(name, value, days =30) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
/**
 * Gets a cookie 
 * @param {string} name 
 * @returns {string} cookie value
 */
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {c = c.substring(1,c.length)}
        if (c.indexOf(nameEQ) == 0) {return c.substring(nameEQ.length,c.length)}
    }
    return null;
}
/**
 * Erases a cookie 
 * @param {string} name 
 * @returns 
 */
function eraseCookie(name) {   
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}







/***************        Simulate Typing      ******************/
function SimulateTyping(placeID, text, interval, nextFunction){
var i=0;
var timer = setInterval(function(){
    document.getElementById(placeID).value += text.charAt(i++);
        if(i==text.length){
            clearInterval(timer);
            nextFunction();
            //nextFunction;
        }
},interval);
}



    


//TESTING FUNCTIONS (Run in Visual Studio Code with CODE RUNNER) - DIM

let test = {a:"2",b:"3"};  //testing strict mode
let x=0;

function testing(){
    x++;
    console.log(x);
}
function finfunc(){
    console.log("final step");
}

async function testingUntilFunction(){
    console.log('before');
    await until (()=>x==3);
    console.log('finally');
}
//testingUntilFunction();

//SetIntervalFiniteTimes(testing,1000, 4,finfunc);

var nextnum=1;
function next(){ console.log (nextnum++)}
next();
next();
next();

