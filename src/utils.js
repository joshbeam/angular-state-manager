/*
	'utils' for angular-state-manager
	
	(C) 2015 Joshua Beam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(win) {
	'use strict';

	var utils = {
		getStringModelToModel: getStringModelToModel,
		setStringModelToModel: setStringModelToModel,
		constants: {
			errors: {
				syntax: {
					ILLEGAL_MODEL_STRING: 'A model should be prefixed with [scope].models'
				},
				type: {
					ILLEGAL_SUBJECT: 'A subject should be of type "object"'	,
					ILLEGAL_CONFIG_BOOL: 'must contain a boolean value'
				}
			}
		}
	};

	function getStringModelToModel(thisArg, scope, string) {
		var m = false, keys;
		
		if(typeof string === 'string') {
			keys = string.split('.');
			// remove ControllerAs prefix, because we don't need it
			// the user still uses it though in the string declaration, because it creates a namespace
			keys.shift();

			angular.forEach(keys,function(key) {
				if(!!m) {
					m = m[key];	
				} else {
					m = scope[key];	
				}
			}.bind(thisArg));
		}
		
		//m will end up being undefined, false, or an object
		//if it is undefined or false, keep it false
		//otherwise, return m
		return !!m ? m : false;	
	}

	function setStringModelToModel(scope, string, val) {
		var m = scope, keys, prevObject;
		
		// has to start with $scope.models, or vm.models, or whatever
		
		if(typeof string === 'string') {
			keys = string.split('.');
			// remove ControllerAs prefix, because we don't need it
			// the user still uses it though in the string declaration, because it creates a namespace
			keys.shift();
			if(keys.length <2) {
				throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_MODEL_STRING);	
			}

			for(var i = 0; i<keys.length; i++) {
				if(i === 0) {
					m[keys[0]] = {};
					prevObject = m[keys[0]];
				}
				
				if(i > 0 && i < keys.length - 1) {
					prevObject[keys[i]] = {};
					prevObject = prevObject[keys[i]];
				}
				
				if(i === keys.length - 1) {
					prevObject[keys[i]] = val;
				}
			}
		}
	}

	win.utils = utils;
})(window);