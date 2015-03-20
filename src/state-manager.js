/*
	state-manager
	
	(c) 2015 Joshua Beam
	
	github.com/joshbeam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
(function(dependencies) {
	'use strict';

	var StateGroup = dependencies.StateGroup;

	function stateManager() {
		var groups = [];
		
		var exports = {
				group: group,
				getAllGroups: getAllGroups
			};

		return exports;	
		
		function group(name) {
			var newGroup = new StateGroup(name);

			groups.push(newGroup);

			return newGroup;
		}
		
		function getAllGroups() {
			return this.groups;	
		}
	}

	dependencies.stateManager = stateManager;
})(stateManagerDependencies);