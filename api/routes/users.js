var mongojs = require('mongojs');

module.exports = function(app, express, db) {
	var router = express.Router();
	
	router.route('/')
		.post(function (req, res, next) {

		});
};