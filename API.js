var Datastore = require('nedb');
var db = {
	actions: new Datastore({ filename: __dirname + '/actions_db' })
}
db.actions.loadDatabase();
//todo:find valid way of checking auth and handle redirection seamlessly
module.exports.insertFunction = (req, res) => {
	try {
		var tmp_action = req.body;
		console.log("insert", tmp_action)
		tmp_action.user_id = req.user._id;
		insertAction(tmp_action, (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(201);
			res.end();
		})
	}
	catch (err) { return tmp_err(res, err); }
};
//action update(badly implemented), use PATCH http verb
module.exports.updateAction = (req, res) => {
	try {
		updateAction({user_id: req.user._id, _id: req.params.id}, formToDoc(req.body), (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(204);
			res.end();
		})
	}
	catch (err) { tmp_err(res, err); }
};
module.exports.removeAction = (req, res) =>{
	try {
		removeAction({id: req.user._id, _id: req.params.id}, (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(202);
			res.end();
		});
	}
	catch (err) { tmp_err(res, err); }
};
module.exports.getUserActions = (req, res) =>{
	try {
		db.actions.find({ user_id: req.user._id}, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(docs));
		});
	}
	catch (err) { tmp_err(res, err); }
};
module.exports.getRecommendations = (req, res) => {
	try {
		db.actions.find({ user_id: id }, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(habitReminder(docs)));
		});
	}
	catch (err) { tmp_err(res, err); }
};
function habitReminder(actions, hours)
{
	actions = JSON.parse(JSON.stringify(actions))
	var tmp = actions.filter(h => h.min <= hours && h.max >= hours && h.progress < h.duration);
	tmp.sort((a, b) => a.priority > b.priority);
	tmp = tmp.filter(x => x.priority == tmp[0].priority);
	tmp.sort((a, b) => ((a.split < (a.duration - a.progress)) ? a.split : (a.duration - a.progress)) - ((b.split < (b.duration - b.progress)) ? b.split : (b.duration - b.progress)));
	return (tmp);
}
function formToDoc(body)
{
	console.log(body)
	return (body);
}
function tmp_err(res, err)
{
	console.log("api err", err)
	res.status(520)
	res.end('error');
}
function insertAction(data, callback)
{
	console.log('Creating action...', data);
	db.actions.insert(data, callback);
}
function updateAction(ids, data, callback)
{
	console.log('Updating action...', data);
	db.actions.update(ids, data, callback);
}
function removeAction(ids, callback)
{
	console.log('Removing action...', data);
	db.actions.remove(ids, {}, callback);
}
