var Datastore = require('nedb');
module.exports = {
	actions: new Datastore({ filename: __dirname + '/actions_db' }),
	users: new Datastore({ filename: __dirname + '/users_db' }),
	actions_history: new Datastore({ filename: __dirname + '/actions_history_db' })
}
for ( var i in module.exports)
{
	module.exports[i].loadDatabase();
}
