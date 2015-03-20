/*
	angular-state-manager

	(c) 2015 Joshua Beam

	v0.7.2
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
	
	github.com/joshbeam

	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(module,stateManager) {
	'use strict';

	module.factory('stateManager',stateManager);

})(angular.module('stateManager'),stateManagerDependencies.stateManager);