var habit = {duration: 1, name: "reading", min:0, max:24, split:1}
function Habit(duration, name, min, max, split, priority)
{
	return ({duration, name, min, max, split, priority, progress: 0});
}
function lockTime(g, a, b)
{
	for(var i = a; i < b; i++)
	{
		g.locked[i] = 1;
	}
}
var g = {habits: [], locked: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}
g.habits.push(Habit(1, "reading", 0, 24, 0.5, 1));
g.habits.push(Habit(1.5, "gym", 7, 19, 0, 1));
g.habits.push(Habit(1.5, "fast.ai", 0, 24, 0.5, 1));
g.habits.push(Habit(1, "math", 0, 24, 0.5, 2));
console.log(g)
function habitReminder(g)
{
	habits = JSON.parse(JSON.stringify(g.habits))
	var tmp = habits.filter(h => h.min <= new Date().getHours() && h.max >= new Date().getHours() && h.progress < h.duration);
	tmp.sort((a, b) => a.priority > b.priority);
	tmp = tmp.filter(x => x.priority == tmp[0].priority);
	tmp.sort((a, b) => ((a.split < (a.duration - a.progress)) ? a.split : (a.duration - a.progress)) - ((b.split < (b.duration - b.progress)) ? b.split : (b.duration - b.progress)));
 //   console.log(tmp)
}
console.log(JSON.stringify({"login1": g}))
// habitReminder(g)
