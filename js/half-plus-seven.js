
Parse.initialize("xxUw77Hqfy0HzwspWZMUprW3k6EK64WevWUGzpEn", "RQswjcgMZlM2Lg0HLNeIgNzQs2botgwU3JkuYKuw");

var username;
var email;

var passwordInput;
var emailInput;

var sPath = window.location.pathname;
var sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

var newestName = "";

$(document).ready(function() {
	if (sPage == "index.html") {
		var currentUser = Parse.User.current();
		username = currentUser.getUsername();
		setElementById("usernameDiv", "<b>" + username + "</b>");
		if (currentUser) {
			$( ".login-panel" ).hide();
			$( ".content-panel" ).show();
			populateList();			
			$( ".addPerson" ).on( "click", function() {
				addPerson();
			});
			$( "#nameInput" ).keyup(function( event ) {
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if ( keycode == 13 ) {
					addPerson();
				}
			});
			$( "#dobInput" ).keyup(function( event ) {
				var now = new Date().getTime()/365.25/24/60/60/1000;	
				var dob = new Date( $('#dobInput').val() );
				var age = (now-(Date.parse((dob))/365.25/24/60/60/1000)).toFixed(2);
				$( "#ageInput" ).val(age);
				if (age>14) {
					var lowerRange = ((age/2)+7).toFixed(2);
					var upperRange = ((age-7)*2).toFixed(2);
					setElementById("range", lowerRange + "-" +  upperRange);
				} else {
					setElementById("range", "0");
				}
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if ( keycode == 13 ) {
					addPerson();
				}
			});
			$( "#ageInput" ).keyup(function( event ) {
				var now = new Date().getTime();
				var age = $('#ageInput').val();
				var dob = age*365.25*24*60*60*1000;
				var date = new Date(now-dob);
				var day = date.getDate();
				var month = date.getMonth()+1;
				var year = date.getFullYear();
				$( "#dobInput" ).val( month + "/" + day + "/" + year );
				if (age>14) {
					var lowerRange = ((age/2)+7).toFixed(2);
					var upperRange = ((age-7)*2).toFixed(2);
					setElementById("range", lowerRange + "-" +  upperRange);
				} else {
					setElementById("range", "0");
				}
				var keycode = (event.keyCode ? event.keyCode : event.which);
				if ( keycode == 13 ) {
					addPerson();
				}
		});
		} else {
			$( ".login-panel" ).show();
			$( ".content-panel" ).hide();
		}
	} else if (sPage == "about.html") {		
		var currentUser = Parse.User.current();
		username = currentUser.getUsername();
		setElementById("usernameDiv", "<b>" + username + "</b>");
		if (currentUser) {
			$( "#loginBtn" ).hide();
			$( "#beginBtn" ).show();
		}
	}
});

function signup(e) {
	if (e.keyCode == 13 || e == "click") {
		usernameInput = document.getElementById("emailInput").value.toLowerCase();
		passwordInput = document.getElementById("passwordInput").value;
		emailInput = document.getElementById("emailInput").value.toLowerCase();
		var user = new Parse.User();
		user.set("username", usernameInput);
		user.set("password", passwordInput);
		user.set("email", emailInput);
		user.set("name", emailInput);
		var dob = new Date();
		user.set("DOB", dob);
		user.signUp(null, {
			success: function(user) {
				var currentUser = Parse.User.current();
				username = currentUser.getUsername();
				userId = currentUser.id;
				setElementById("usernameDiv", "<b>" + username + "</b>");
				$( ".login-panel" ).hide();
				$( ".content-panel" ).show();
				populateList();
			},
			error: function(user, error) {
		    	//alert("Error: " + error.code + " " + error.message);
				login('click');
		  	}
		});
	}
}

function login(e) {
	if (e.keyCode == 13 || e == "click") {
		usernameInput = document.getElementById("emailInput").value.toLowerCase();
		passwordInput = document.getElementById("passwordInput").value.toLowerCase();
		Parse.User.logIn(usernameInput, passwordInput, {
			success: function(user) {
				var currentUser = Parse.User.current();
				username = currentUser.getUsername();
				userId = currentUser.id;
				setElementById("usernameDiv", "<b>" + username + "</b>");
				$( ".login-panel" ).hide();
				$( ".content-panel" ).show();
				populateList();
			},
			error: function(user, error) {
				alert("Error: " + error.code + " " + error.message);				
			}
		});
	}
}

function logout() {
	Parse.User.logOut();
	setElementById("usernameDiv", "log in to begin.");
	if (sPage == "index.html") {
		$( ".login-panel" ).show();
		$( ".content-panel" ).hide();
	} else if (sPage == "about.html") {
		$( "#loginBtn" ).show();
		$( "#beginBtn" ).hide();
	}
}

/*
function resetPassword() {
	currentUser = Parse.User.current();
	email = $("#changeEmailInput").val().toLowerCase();
	Parse.User.requestPasswordReset(email, {
		success: function() {
	alert("Password reset request sent to " + email + ".");
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}
*/

function populateList() {
	var currentUser = Parse.User.current();
	var outOfRange = "";
	var now = new Date().getTime()/365.25/24/60/60/1000;
	var currentUserAge = (now - currentUser.get('DOB')/365.25/24/60/60/1000).toFixed(2);
	var currentUserLowerRange = ((currentUserAge/2)+7).toFixed(2);
	var currentUserUpperRange = ((currentUserAge-7)*2).toFixed(2);
	var alternatingNumber = 0;
	var alternatingColor = 0;
	var list = "";
	list = list + "<ul><div style='clear:both;'></div>";
	currentUser = Parse.User.current();
	var Person = Parse.Object.extend("Person");
	var query = new Parse.Query(Person);
	query.equalTo("user", currentUser);
	query.ascending("name");
	query.find({
	success: function(results) {
		for (var i = 0; i < results.length; i++) {
			alternatingNumber++;
			var object = results[i];
			var dob = object.get('DOB');
			var day = dob.getDate();
			var month = dob.getMonth()+1;
			var year = dob.getFullYear();
			var age = (now-dob/365.25/24/60/60/1000).toFixed(2);
			var lowerRange = ((age/2)+7).toFixed(2);
			var upperRange = ((age-7)*2).toFixed(2);
			if (alternatingNumber % 2 == 0) {
				alternatingColor = "fafafa";
			} else {
				alternatingColor = "f0f0f0";
			}
			if (age<currentUserLowerRange||age>currentUserUpperRange) {
				outOfRange = "<i style='color:#eee;left:-2em;top:-3.5em;background:#e44;border-radius:1in;padding:1em;'";
				outOfRange = outOfRange + "class='float-left glyphicon glyphicon-thumbs-down'></i>";
			} else {
				outOfRange = "<i style='color:#eee;left:-2em;top:-3.5em;background:#4d80cc;border-radius:1in;padding:1em;'";
				outOfRange = outOfRange + "class='float-left glyphicon glyphicon-thumbs-up'></i>";
			}
			list = list + "<li class='" + object.id + "' style='background: #"+ alternatingColor +" ;'>";
			list = list + "<i data-id='" + object.id + "' class='li-remove float-right glyphicon glyphicon-remove-circle'></i>";
			list = list + "<div class='stealth'><span>" + outOfRange + "</span></div>";
			list = list + "<span class='quarter name'>" + object.get('name') + "</span>";
			list = list + "<span class='quarter age'>" + age + "</span>";
			list = list + "<span class='quarter dob'>" + month + "/" + day + "/" + year + "</span>";
			list = list + "<span class='quarter range'>" + lowerRange + "-" +  upperRange + "</span>";
			list = list + "<div style='clear:both;'><br></div>";
		}
		list = list + "</ul>";
		setElementById("list", list);
		populateProfile();
	},
	error: function(error) {
		alert("Error: " + error.code + " " + error.message);
	}
	});
}

function populateProfile() {
	currentUser = Parse.User.current();
	var now = new Date().getTime()/365.25/24/60/60/1000;	
	var info = "<div class='profile-panel'><ul>";
	var dob = currentUser.get('DOB');
	var day = dob.getDate();
	var month = dob.getMonth()+1;
	var year = dob.getFullYear();
	var age = (now-dob/365.25/24/60/60/1000).toFixed(2);
	var lowerRange = ((age/2)+7).toFixed(2);
	var upperRange = ((age-7)*2).toFixed(2);
	info = info + "<li>"
	info = info + "<span class='quarter'><input id='userNameInput' placeholder='Name' type='text' value='" + capitaliseEveryFirstLetter(currentUser.get('name')) + "'></span>";
	info = info + "<span class='quarter age'><input id='userAgeInput' placeholder='Name' type='number' value='" + age + "'></span>";
	info = info + "<span class='quarter dob'><input id='userDobInput' placeholder='Name' type='datetime' value='" + month + "/" + day + "/" + year + "'></span>";
	info = info + "<span style='color:black;' class='quarter range'>";
	info = info + "<span class='half'><b>Range</b><br>" + lowerRange + "-" +  upperRange + "</span>";
    info = info + "<span class='half'></span></span></li></ul></div>";

	setElementById("profile", info);

    $( ".li-remove" ).on( "click", function() {
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
    $( ".updateSelf" ).on( "click", function() {
		updateSelf();
	});	
	$( "#userNameInput" ).keyup(function( event ) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if ( keycode == 13 ) {
			updateSelf();
		}
	});
	$( "#userDobInput" ).keyup(function( event ) {
		var now = new Date().getTime()/365.25/24/60/60/1000;	
		var dob = new Date( $('#userDobInput').val() );
		var age = (now-(Date.parse((dob))/365.25/24/60/60/1000)).toFixed(2);
		$( "#userAgeInput" ).val(age);
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if ( keycode == 13 ) {
			updateSelf();
		}
	});
	$( "#userAgeInput" ).keyup(function( event ) {
		var now = new Date().getTime();
		var age = $('#userAgeInput').val()*365.25*24*60*60*1000;
		var date = new Date(now-age);
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear();
		$( "#userDobInput" ).val( month + "/" + day + "/" + year );
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if ( keycode == 13 ) {
			updateSelf();
		}
	});
	if (newestName != "") {
		scrollTo(newestName);	
	}	
}

function updateSelf() {
	currentUser = Parse.User.current();
	var User = Parse.Object.extend("User");
	var user = new Parse.Query(User);
	user.get(currentUser.id, {
		success: function(user) {
			var name = $('#userNameInput').val();
			var age = $('#userAgeInput').val();
			var dob = new Date( $('#userDobInput').val() );
			user.set("user", user);
			user.set("name", name.toLowerCase());
			user.set("DOB", dob);
			currentUser.set("user", user);
			currentUser.set("name", name.toLowerCase());
			currentUser.set("DOB", dob);
			currentUser.save();
			user.save(null, {
				success: function(user) {
					populateList();
				},
				error: function(user, error) {
				}
			});
		},
		error: function(object, error) {
		}
	});
}

function addPerson() {
	var currentUser = Parse.User.current();
	var name = $('#nameInput').val();
	var age = $('#ageInput').val();
	var dob = new Date( $('#dobInput').val() );
	
	var Person = Parse.Object.extend("Person");
	var person = new Person();

	person.set("user", currentUser);
	person.set("name", capitaliseFirstLetter(name));
	person.set("DOB", dob);

	person.save(null, {
		success: function(person) {
			newestName = "." + person.id;
			populateList();
		},
		error: function(person, error) {
		}
	});
}

function remove(id) {
	var currentUser = Parse.User.current();
	var Person = Parse.Object.extend("Person");
	var query = new Parse.Query(Person);
	query.equalTo("objectId", id);
	query.find({
		success: function(results) {
			var object = results[0];
			object.destroy({
				success: function(object) {
					newestName = "";
					populateList();
				},
				error: function(object, error) {
				}
			});			
	    },
	    error: function(error) {
	    	alert("Error: " + error.code + " " + error.message);
	    }
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
