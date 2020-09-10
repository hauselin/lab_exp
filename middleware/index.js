// all middleware goes here

var middlewareObj = {}

middlewareObj.isLoggedIn = function(req, res, next) { // //req.isAuthenticated() will return true if user is logged in
    if(req.isAuthenticated()){
        return next();
    }
    req.session.returnTo = req.url;
    res.redirect("/login");
}

module.exports = middlewareObj;