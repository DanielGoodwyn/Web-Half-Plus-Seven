const firebaseConfig = {
  apiKey: "AIzaSyDUYv4vMY4GzZsTeia7sYE0ZNk-siRzmc4",
  authDomain: "half-plus-seven.firebaseapp.com",
  projectId: "half-plus-seven",
  storageBucket: "half-plus-seven.firebasestorage.app",
  messagingSenderId: "877628237323",
  appId: "1:877628237323:web:7b4505488300f17954890e"
};

// Initialize Firebase if it hasn't been initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

var username;
var email;
var userId;

var passwordInput;
var emailInput;

var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

var newestName = "";

$(document).ready(function() {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            userId = user.uid;
            db.collection("users").doc(userId).get().then((doc) => {
                if (doc.exists) {
                    username = doc.data().name || user.email;
                } else {
                    username = user.email;
                }
                setElementById("usernameDiv", "<b>" + username + "</b>");
                if (sPage == "index.html" || sPage == "") {
                    $( ".login-panel" ).hide();
                    $( ".content-panel" ).show();
                    populateList();
                } else if (sPage == "about.html") {
                    $( "#loginBtn" ).hide();
                    $( "#beginBtn" ).show();
                }
            });
        } else {
            userId = null;
            username = null;
            setElementById("usernameDiv", "log in to begin.");
            if (sPage == "index.html" || sPage == "") {
                $( ".login-panel" ).show();
                $( ".content-panel" ).hide();
            } else if (sPage == "about.html") {
                $( "#loginBtn" ).show();
                $( "#beginBtn" ).hide();
            }
        }
    });

	if (sPage == "index.html" || sPage == "") {
        $( ".addPerson" ).on( "click", function() {
            addPerson();
        });
        $( "#nameInput" ).keyup(function( event ) {
            var keycode = (event.keyCode ? event.keyCode : event.which);
            if ( keycode == 13 ) {
                addPerson();
            }
        });
        $( "#dobInput" ).on("input change", function( event ) {
            var val = $('#dobInput').val();
            if (!val) return;
            var parts = val.split('-');
            if(parts.length === 3) {
                var dob = new Date(parts[0], parts[1]-1, parts[2]);
                var now = new Date();
                var age = ((now.getTime() - dob.getTime())/365.25/24/60/60/1000).toFixed(2);
                if ($( "#ageInput" ).val() != age) {
                    $( "#ageInput" ).val(age);
                }
                if (age>14) {
                    var lowerRange = ((age/2)+7).toFixed(2);
                    var upperRange = ((age-7)*2).toFixed(2);
                    setElementById("range", lowerRange + "-" +  upperRange);
                } else {
                    setElementById("range", "0");
                }
            }
        }).keyup(function(event) {
            if ( (event.keyCode ? event.keyCode : event.which) == 13 ) addPerson();
        });

        $( "#ageInput" ).on("input change", function( event ) {
            var now = new Date().getTime();
            var age = $('#ageInput').val();
            if (!age) return;
            var dobMs = age*365.25*24*60*60*1000;
            var date = new Date(now-dobMs);
            var day = ("0" + date.getDate()).slice(-2);
            var month = ("0" + (date.getMonth()+1)).slice(-2);
            var year = date.getFullYear();
            var dString = year + "-" + month + "-" + day;
            if ($( "#dobInput" ).val() != dString) {
                $( "#dobInput" ).val(dString);
            }
            if (age>14) {
                var lowerRange = ((age/2)+7).toFixed(2);
                var upperRange = ((age-7)*2).toFixed(2);
                setElementById("range", lowerRange + "-" +  upperRange);
            } else {
                setElementById("range", "0");
            }
        }).keyup(function(event) {
            if ( (event.keyCode ? event.keyCode : event.which) == 13 ) addPerson();
        });
	}
});

function authenticate(e) {
	if (e.keyCode == 13 || e == "click") {
		var emailInputStr = document.getElementById("emailInput").value.toLowerCase();
		var passwordInputStr = document.getElementById("passwordInput").value;
        
        if (!emailInputStr || !passwordInputStr) {
            alert("Please enter both email and password.");
            return;
        }

        // Try to log in first
        auth.signInWithEmailAndPassword(emailInputStr, passwordInputStr)
            .then((userCredential) => {
                // onAuthStateChanged will handle UI updates
            })
            .catch((loginError) => {
                // If login fails because user doesn't exist or wrong password
                if (loginError.code === 'auth/invalid-login-credentials' || loginError.code === 'auth/invalid-credential' || loginError.code === 'auth/user-not-found' || loginError.code === 'auth/wrong-password') {
                    // Try to sign them up instead
                    auth.createUserWithEmailAndPassword(emailInputStr, passwordInputStr)
                        .then((userCredential) => {
                            var user = userCredential.user;
                            var dob = new Date();
                            db.collection("users").doc(user.uid).set({
                                email: emailInputStr,
                                name: emailInputStr,
                                dob: firebase.firestore.Timestamp.fromDate(dob)
                            }).then(() => {
                                // onAuthStateChanged will handle UI updates
                            });
                        })
                        .catch((signupError) => {
                            // If sign up fails because the email is in use, it means they just typed the wrong password!
                            if (signupError.code === 'auth/email-already-in-use') {
                                alert("Login failed: Incorrect password. Please try again or use Forgot Password.");
                            } else {
                                alert("Error: " + signupError.message);
                            }
                        });
                } else {
                    alert("Error: " + loginError.message);
                }
            });
	}
}

function forgotPassword() {
    var emailInputStr = document.getElementById("emailInput").value.toLowerCase();
    if (!emailInputStr) {
        alert("Please enter your email address first, then click 'Forgot password?'.");
        return;
    }
    auth.sendPasswordResetEmail(emailInputStr)
        .then(() => {
            alert("Password reset email sent to " + emailInputStr + "!");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}

function logout() {
    auth.signOut().then(() => {
        // onAuthStateChanged will handle UI updates
    }).catch((error) => {
        alert("Error logging out: " + error.message);
    });
}

var usersUnsubscribe = null;
var webPersonsUnsubscribe = null;
var legacyPersonsUnsubscribe = null;

var globalUserData = null;
var globalWebDocs = [];
var globalLegacyDocs = [];

function populateList() {
    if (!userId) return;
    
    if (usersUnsubscribe) usersUnsubscribe();
    if (webPersonsUnsubscribe) webPersonsUnsubscribe();
    if (legacyPersonsUnsubscribe) legacyPersonsUnsubscribe();
    
    usersUnsubscribe = db.collection("users").doc(userId).onSnapshot((userDoc) => {
        globalUserData = userDoc.data();
        if (globalUserData) {
            username = globalUserData.name || globalUserData.email;
            setElementById("usernameDiv", "<b>" + username + "</b>");
        }
        renderWebList();
    });
    
    webPersonsUnsubscribe = db.collection("persons").where("userId", "==", userId).onSnapshot((snapshot) => {
        globalWebDocs = [];
        snapshot.forEach(doc => globalWebDocs.push(doc));
        renderWebList();
    });
    
    legacyPersonsUnsubscribe = db.collection("persons").where("user", "==", userId).onSnapshot((snapshot) => {
        globalLegacyDocs = [];
        snapshot.forEach(doc => globalLegacyDocs.push(doc));
        renderWebList();
    });
}

function renderWebList() {
    if (!globalUserData) return;
    
    var now = new Date().getTime()/365.25/24/60/60/1000;
    
    var userDOB = globalUserData.dob ? globalUserData.dob.toDate() : new Date();
    var currentUserAge = (now - userDOB.getTime()/365.25/24/60/60/1000).toFixed(2);
    var currentUserLowerRange = ((currentUserAge/2)+7).toFixed(2);
    var currentUserUpperRange = ((currentUserAge-7)*2).toFixed(2);
    
    let allDocs = [...globalWebDocs, ...globalLegacyDocs];
    let uniqueDocsMap = new Map();
    allDocs.forEach(d => {
        uniqueDocsMap.set(d.id, d);
    });
    
    let docs = Array.from(uniqueDocsMap.values());
    
    docs.sort((a,b) => {
        let nameA = (a.data().name || "").toLowerCase();
        let nameB = (b.data().name || "").toLowerCase();
        return (nameA > nameB) ? 1 : ((nameB > nameA) ? -1 : 0);
    });
    
    var list = "<ul><div style='clear:both;'></div>";
    var altNum = 0;
    
    docs.forEach(doc => {
        altNum++;
        var object = doc.data();
        var objectId = doc.id;
        var dob = object.dob ? object.dob.toDate() : new Date();
        var day = dob.getDate();
        var month = dob.getMonth()+1;
        var year = dob.getFullYear();
        var age = (now - dob.getTime()/365.25/24/60/60/1000).toFixed(2);
        var lowerRange = ((age/2)+7).toFixed(2);
        var upperRange = ((age-7)*2).toFixed(2);
        let altCol = (altNum % 2 == 0) ? "fafafa" : "f0f0f0";
        
        let oRange = "";
        if (age<currentUserLowerRange||age>currentUserUpperRange) {
            oRange = "<i style='color:#eee;left:-2em;top:-3.5em;background:#e30c00;border-radius:1in;padding:1em;' class='float-left glyphicon glyphicon-thumbs-down'></i>";
        } else {
            oRange = "<i style='color:#eee;left:-2em;top:-3.5em;background:#4d80cc;border-radius:1in;padding:1em;' class='float-left glyphicon glyphicon-thumbs-up'></i>";
        }
        list += "<li class='" + objectId + "' style='background: #"+ altCol +" ;'>";
        list += "<i data-id='" + objectId + "' class='li-remove float-right glyphicon glyphicon-remove-circle'></i>";
        list += "<div class='stealth'><span>" + oRange + "</span></div>";
        list += "<span class='quarter name'>" + object.name + "</span>";
        list += "<span class='quarter age'>" + age + "</span>";
        list += "<span class='quarter dob'>" + month + "/" + day + "/" + year + "</span>";
        list += "<span class='quarter range'>" + lowerRange + "-" +  upperRange + "</span>";
        list += "<div style='clear:both;'><br></div>";
    });
    
    list += "</ul>";
    setElementById("list", list);
    populateProfile(globalUserData);
};

function populateProfile(currentUserData) {
	var now = new Date().getTime()/365.25/24/60/60/1000;	
	var info = "<div class='profile-panel'><ul>";
	var dob = currentUserData.dob ? currentUserData.dob.toDate() : new Date();
	var day = ("0" + dob.getDate()).slice(-2);
	var month = ("0" + (dob.getMonth()+1)).slice(-2);
	var year = dob.getFullYear();
	var age = (now-dob.getTime()/365.25/24/60/60/1000).toFixed(2);
	var lowerRange = ((age/2)+7).toFixed(2);
	var upperRange = ((age-7)*2).toFixed(2);
	info = info + "<li>"
	info = info + "<span class='quarter'><input id='userNameInput' placeholder='Name' type='text' value='" + capitaliseEveryFirstLetter(currentUserData.name || "") + "'></span>";
	info = info + "<span class='quarter age'><input id='userAgeInput' placeholder='Age' type='number' value='" + age + "'></span>";
	info = info + "<span class='quarter dob'><input id='userDobInput' placeholder='DOB' type='date' value='" + year + "-" + month + "-" + day + "'></span>";
	info = info + "<span style='color:black;' class='quarter range'>";
	info = info + "<span class='half'><b>Range</b><br>" + lowerRange + "-" +  upperRange + "</span>";
    info = info + "<span class='half'></span></span></li></ul></div>";

	setElementById("profile", info);

    $( ".li-remove" ).off("click").on( "click", function() {
		$ ( this ).parent().addClass( "deleting" );
		$ ( this ).parent().removeClass( "rowHover" );		
		remove( $( this ).data('id') );
	});	
    $( "li" ).hover(
  		function() {
            $( this ).addClass( "rowHover" );
            $( this ).find(".stealth i").addClass( "opaque" );
  		}, function() {
            $( this ).removeClass( "rowHover" );
            $( this ).find(".stealth i").removeClass( "opaque" );
  		}
	);
    
    // Automatically save profile when input changes
    var profileSaveTimeout;
    function triggerSave() {
        clearTimeout(profileSaveTimeout);
        profileSaveTimeout = setTimeout(updateSelf, 500);
    }
    
	$( "#userNameInput" ).off("input change").on("input change", function() {
        triggerSave();
	});
	$( "#userDobInput" ).off("input change").on("input change", function() {
        var val = $('#userDobInput').val();
        if (!val) return;
        var parts = val.split('-');
        if (parts.length === 3) {
            var newDob = new Date(parts[0], parts[1]-1, parts[2]);
            var newNow = new Date();
            var newAge = ((newNow.getTime() - newDob.getTime())/365.25/24/60/60/1000).toFixed(2);
            if ($( "#userAgeInput" ).val() != newAge) {
                $( "#userAgeInput" ).val(newAge);
            }
            triggerSave();
        }
	});
	$( "#userAgeInput" ).off("input change").on("input change", function() {
		var newNow = new Date().getTime();
		var newAge = $('#userAgeInput').val();
        if (!newAge) return;
		var dobMs = newAge*365.25*24*60*60*1000;
		var date = new Date(newNow-dobMs);
		var newDay = ("0" + date.getDate()).slice(-2);
		var newMonth = ("0" + (date.getMonth()+1)).slice(-2);
		var newYear = date.getFullYear();
        var dString = newYear + "-" + newMonth + "-" + newDay;
        if ($( "#userDobInput" ).val() != dString) {
		    $( "#userDobInput" ).val( dString );
        }
		triggerSave();
	});
	if (newestName != "") {
		scrollTo(newestName);	
	}	
}

function updateSelf() {
    if (!userId) return;
    var name = $('#userNameInput').val().toLowerCase();
    var val = $('#userDobInput').val();
    if (!val) return;
    var parts = val.split('-');
    var dob = new Date(parts[0], parts[1]-1, parts[2]);
    
    db.collection("users").doc(userId).update({
        name: name,
        dob: firebase.firestore.Timestamp.fromDate(dob)
    }).catch((error) => {
        alert("Error updating profile: " + error.message);
    });
}

function addPerson() {
    if (!userId) return;
	var name = $('#nameInput').val();
    var val = $('#dobInput').val();
    if (!val) return;
    var parts = val.split('-');
	var dob = new Date(parts[0], parts[1]-1, parts[2]);
	
    db.collection("persons").add({
        userId: userId,
        name: capitaliseFirstLetter(name),
        dob: firebase.firestore.Timestamp.fromDate(dob)
    }).then((docRef) => {
        newestName = "." + docRef.id;
    }).catch((error) => {
        console.error("Error adding person: ", error);
    });
}

function remove(personId) {
    db.collection("persons").doc(personId).delete().catch((error) => {
        alert("Error deleting person: " + error.message);
    });
}

function scrollTo(ElementValue) {
	if (ElementValue != "") {
		$('html, body').animate({scrollTop: $(ElementValue).offset().top}, 750);
	}
}

function setElementById(identification, string) {
	document.getElementById(identification).innerHTML = string;
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function capitaliseEveryFirstLetter(string)
{
    return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function visit(string) {
	window.open(string);
}
