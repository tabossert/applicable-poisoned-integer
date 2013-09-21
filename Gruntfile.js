var fs = require('fs'),
	sys = require('sys'),
	exec = require('child_process').exec;

module.exports = function (grunt) {
	
	grunt.initConfig({
		deployments: {
			options: {
				'backup_dir': ''
			},
    		local: {
			  'title': 'Local', 
			  'database': 'fitstew',        
			  'user': 'fitstewAPI',
			  'pass': '"F1tn3ss is WHERE! its @"',
			  'host': '127.0.0.1'
    		},
    		development: {
		      'title': 'Development', 
		      'database': 'fitstew',        
		      'user': 'fitstewAPI',
		      'pass': '"F1tn3ss is WHERE! its @"',
		      'host': 'localhost',  
		      'ssh_host': 'applicable@dev.fitstew.com' 
    		}
    	},
    });

	grunt.loadNpmTasks('grunt-deployments');

    //grunt.registerTask('default', ['db_push']);
};