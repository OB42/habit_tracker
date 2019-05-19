var Datastore = require('nedb');
var db = {
	actions: new Datastore({ filename: __dirname + '/actions_db' })
}
db.actions.loadDatabase();
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
	return ({
		name: body.name,
		time_goal: parseFloat(body.duration),
		priority: parseFloat(body.priority),
		minimum_duration: parseFloat(body.split),
		availability: {
			//this is garbage
			min: parseInt(body.min.split(":")[0]) + body.min.split(":")[1] / 60,
			max: parseInt(body.max.split(":")[0]) + body.max.split(":")[1] / 60,
			week: [!!body['Monday'], !!body['Tuesday'], !!body['Wednesday'], !!body['Thursday'], !!body['Friday'], !!body['Saturday'], !!body['Sunday']]
		}
	})
}
function tmp_err(res, err)
{
	console.error("ERROR", err)
	res.status(520);
	res.end()
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

module.exports.insertFunction = (req, res) => {
	try {
		console.log(req)
		var tmp_action = formToDoc(req.body);
		console.log(req.user, req.body)
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
			res.status(201);
			res.end();
		})
	}
	catch (err) { return tmp_err(res, err); }
};
module.exports.removeAction = (req, res) =>{
	try {
		removeAction({id: req.user._id, _id: req.params.id}, (err, newDoc) => {
			if (err) return tmp_err(res, err);
			res.status(200);
			res.end();
		});
	}
	catch (err) { return tmp_err(res, err); }
};
module.exports.getUserActions = (req, res) =>{
	try {
		db.actions.find({ user_id: req.user._id}, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(docs));
		});
	}
	catch (err) { return tmp_err(res, err); }
};
module.exports.getRecommendations = (req, res) => {
	try {
		var id = TMP_ID;//TODO:replace with authentified user id
		db.actions.find({ user_id: id }, function (err, docs) {
			if (err) return tmp_err(res, err);
			res.send(JSON.stringify(habitReminder(docs)));
		});
	}
	catch (err) { return tmp_err(res, err); }
};
