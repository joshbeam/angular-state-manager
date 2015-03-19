/*
	angular-state-manager

	(C) 2015 Joshua Beam

	v0.7.1
	Changes:	1. Major syntax change
					e.g.	vm.states = stateManager.group('groupName');
					e.g.	vm.states().state(function() {
								return {
									// state properties
								};
							});
				2. Added stateManager.getAllGroups
				3. Added array to hold all groups
				4. Removed State and StateGroup from exports
				5. Separated into modules
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(angular,StateGroup,win) {
	'use strict';
	
	angular.module('stateManager')
		.factory('stateManager',stateManager);

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
})(angular,window.StateGroup,window);