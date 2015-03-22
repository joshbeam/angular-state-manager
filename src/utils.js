/*
	utils for angular-state-manager
	
	(c) 2015 Joshua Beam

	github.com/joshbeam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(dependencies) {
	'use strict';

	var utils = {
		getStringModelToModel: getStringModelToModel,
		setStringModelToModel: setStringModelToModel,
		forEach: forEach,
		constants: {
			errors: {
				syntax: {
					ILLEGAL_MODEL_STRING: 'A model should be prefixed with [scope].models',
					ILLEGAL_FUNCTION: 'A Function is required',
					ILLEGAL_ARRAY: 'An Array is required'
				},
				type: {
					ILLEGAL_SUBJECT: 'A subject should be of type "object"'	,
					ILLEGAL_CONFIG_BOOL: 'must contain a boolean value'
				}
			}
		}
	};

	function getStringModelToModel(scope, string) {
		var model = false, keys;
		
		if(typeof string === 'string') {
			keys = string.split('.');
			// remove ControllerAs prefix, because we don't need it
			// the user still uses it though in the string declaration, because it creates a namespace
			keys.shift();

			forEach(keys,function(key) {
				if(!!model) {
					model = model[key];	
				} else {
					model = scope[key];	
				}
			}.bind(this));
		}
		
		//m will end up being undefined, false, or an object
		//if it is undefined or false, keep it false
		//otherwise, return m
		return !!model ? model : false;	
	}

	function setStringModelToModel(scope, string, val) {
		var model = scope, keys, prevObject;
		
		// has to start with $scope.models, or vm.models, or whatever
		
		if(typeof string === 'string') {
			keys = string.split('.');
			/*
				Remove ControllerAs prefix, because we don't need it
				The user still uses it though in the string declaration, because it creates a namespace
				e.g. 'vm.models.someModel' ==> ['models','someModel'];
			*/

			keys.shift();

			if(keys.length <2) {
				throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_MODEL_STRING);	
			}

			/*
				This rebuilds the scope objects

				Example:
					Using this array: ['models','someModel']
					And this value: 'hello world' (which was passed in as val to this setStringModelToModel)

					It builds this:
						// inside our scope object
						models: {
							someModel: 'hello world'
						}

				#potential-bug
					This will reset the entire 'models' object inside our scope EVERY SINGLE TIME
					Potential conflicts?
			*/

			function build(o,k,v) {
				var temp;

				if(k.length > 1) {
					temp = o[k.shift()] = {};
					build(temp,k,v);
				} if (k.length === 1) {
					o[k.shift()] = v;
				}
			}

			build(model,keys,val);
		} else {
			throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_MODEL_STRING);
		}
	}

	function forEach(arr,fn) {
		var i = 0, len;
		if(!!arr && arr.constructor === Array) {
			if(!!fn && fn.constructor === Function) {
				len = arr.length;

				for(;i<len;i++) {
					fn.call(arr,arr[i],i);
				}
			} else {
				throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_FUNCTION);
			}
		} else {
			throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_ARRAY);
		}
	}

	dependencies.utils = utils;
})(stateManagerDependencies);