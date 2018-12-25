var validate = require('express-validation');
var Joi = require('joi');
var validation = {
	newHabit:{
	  body: {
		name: Joi.string().required(),
		priority: Joi.string().regex(/[0-9]{1,3}/).required(),
		duration: Joi.string().regex(/[0-9.]{1,10}/).required(),
		min: Joi.string().regex(/[0-9.]{1,10}/).required(),
		max: Joi.string().regex(/[0-9.]{1,10}/).required(),
		split: Joi.string().regex(/[0-9.]{1,10}/).required()
	  }
	}
};
module.exports = function(app, passport) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
		if (req.user)
			res.redirect('/profile');
		else
        	res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

	app.post('/habit/new', validate(validation.newHabit), isLoggedIn, function(req, res) {
		console.log("hey", req.user.local)
		var tmp = {name: req.body.name,
			duration: parseFloat(req.body.duration),
			priority: parseFloat(req.body.priority),
			split: parseFloat(req.body.split),
			min: parseInt(req.body.min.split(":")[0]) + req.body.min.split(":")[1] / 60,
			max: parseInt(req.body.max.split(":")[0]) + req.body.max.split(":")[1] / 60,
			week: [!!req.body['Monday'], !!req.body['Tuesday'], !!req.body['Wednesday'], !!req.body['Thursday'], !!req.body['Friday'], !!req.body['Saturday'], !!req.body['Sunday']],
			progress: 0
		}
		for (var i in tmp)
		{
			if (tmp[i] < 0)
				return (res.redirect('/profile'));
		}
		req.user.local.habits.push(tmp);
		console.log(req.user, "us")
		req.user.save(function (err) {
			if (err)
			{
				console.log(err)
			}
			res.redirect('/profile');
		});
    });
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));
// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });



};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
