/*
	angular-state-manager

	(c) 2015 Joshua Beam

	v0.8.1
	Changes:	1. .auxillary() renamed to .and() to be more consistent
				2. used recursion instead of loop in utils.setStringModeltoModel
	
	github.com/joshbeam

	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(module,stateManager) {
	'use strict';

	module.factory('stateManager',stateManager);

})(angular.module('stateManager'),stateManagerDependencies.stateManager);