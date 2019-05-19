var bcrypt = require('bcryptjs');
var Datastore = require('nedb');
var db = {
	users: new Datastore({ filename: __dirname + '/users_db' })
}
db.users.loadDatabase();
module.exports.createUser = function createUser(newUser, callback){
  bcrypt.genSalt(10, function(err, salt) {
		if (err) return console.error(err);
    bcrypt.hash(newUser.password, salt, function(err, hash) {
			if (err) return console.error(err);
      newUser.password = hash;
			db.users.insert(newUser, (err) => {
				if (err) return console.error(err);
				callback(err, "OK")
			});
    });
  });
}
module.exports.getUserByUsername = function getUserByUsername(login, callback)
{
	db.users.find({login}, (err, users) => callback(err, users[0]));
}
module.exports.getUserById = function getUserById(id, callback)
{
	db.users.find({_id: id}, (err, users) => callback(err, users[0]));
}
module.exports.comparePassword = function comparePassword(candidatePassword, hash, callback){
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if(err) throw err;
    callback(null, isMatch);
  });
}
