var fs = require('fs');
var Mustache = require('mustache');
var mysql = require('mysql');
var csv = require('csv-parse');


var structure = require('./structure.json');
var test_data = require('./test.json');


var db = mysql.createConnection({
	host : 'localhost',
	user: 'root',
	password: '8RVlcBZE*f&u',
	database: 'cdtm'
});



fs.readFile('./template.html', function (err, data) {
  if (err) throw err;
  structure.body = "{{body}}";
  var template = data.toString();
  // var student_data = csv.parse();


	db.connect();
	for (var i = 0; i < test_data.students.length; i++) {
		var student = test_data.students[i];
		var student_page = render_entry(template, structure, student);
		save_site_to_db(student.team_id, student_page)
	}
	db.end();
});

/**
* Saves content to the site identified by the wp_team_id (http://cdtm.de/?team=WP_TEAM_ID)
*/
function save_site_to_db(wp_team_id, content) {
	db.query('UPDATE wp_posts SET post_content = ? WHERE post_type = ? AND post_name = ?;', 
		[content, "team", wp_team_id],
		function (err, results) {
			if (err) {
				console.log(wp_team_id + ": DB wrinting error");
				console.log(err);
			} else {
				console.log(wp_team_id + ": online");
			}
	});
}

function render_entry(template, structure, profile_data) {
	var items = structure.items;
	// iterate over menu points and to the data matching
	for (var i = 0; i < items.length; i++) {
		var item_id = items[i].item_id;
		items[i].body = profile_data[item_id+"_content"]
	}
	profile_data.items = items;
	
	var out = Mustache.render(template, profile_data);
	return out;
}