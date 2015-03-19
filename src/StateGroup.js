/*
	'StateGroup' for angular-state-manager
	
	(C) 2015 Joshua Beam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(angular,State,win) {
	'use strict';

	StateGroup.prototype = {
		state: state,
		getAll: getAll,
		config: config,
		models: models
	};

	function StateGroup(name) {
		this.states = [];
		// this method now makes the states array an 'array-like object'
		// follows the pattern of using methods to get properties
		// instead of declaring 'states.length', etc.
		this.states.count = function() {
			return this.length;	
		};
		this.$scope = {};
		this.$name = name;
		
		// stateManager.groups.push(this);
		
		return function(stateName) {
			if(!!stateName) {
				return this.states.filter(function(state) {
					return state.$name === stateName;
				})[0];	
			} else {
				return this;
			}
		}.bind(this);
	}

	function state(_state_) {
		var state;
					
		if(!!_state_ && _state_.constructor === Function) {
			// pass in the name and states array
			// gives the user access to check, for example, the number of current states
			// $name could be used for namespacing
			state = _state_(this.$name,this.states);	
		}
		
		this.states.push(new State(state));
		
		return this;
	}

	function getAll() {
		/*jshint validthis: true */
		return this.states;	
	}

	function config(_config_) {
		/*jshint validthis: true */
		/*
			pass in something like this:
			
			return {
				scope: someScopeObject,
				exclusive: {
					group: ['state1','state2','state3'],
					group: ['state4','stat5']
					// ...
				}
			}
		*/
		var config, countOfArrays = 0, type;
		
		if(!!_config_ && _config_.constructor === Function) {
			
			// _config_() returns an object literal
			config = _config_();
			
			for(var key in config) {
				if(key !== 'scope' && key !== 'exclusive' && key !== 'children') {
					throw new SyntaxError(key+' cannot be set in .config()');	
				}
			}
			
			if('scope' in config) {
				scope.call(this, config.scope);	
			}
			
			if('exclusive' in config) {
				if(config.exclusive.constructor === Array) {
					// [[],[]] or []
					angular.forEach(config.exclusive,function(obj) {
						if(obj.constructor === Array) {
							type = 'array';
							countOfArrays++;	
						} else if(typeof obj === 'string') {
							type = 'string';	
						}
					}.bind(this));
					
					// if [[],[]], and all are arrays
					if(countOfArrays === config.exclusive.length && type === 'array') {
						angular.forEach(config.exclusive,function(arrayOfStateNames) {
							exclusive.apply(this,arrayOfStateNames);
						}.bind(this));
						
						// if ['stateName','stateName']
					} else if(type === 'string') {
						exclusive.apply(this,config.exclusive);
					}
				}
			}
			
			if('children' in config) {
				/*
					example --
					
					children: {
						editing: ['state1', 'state2']
					}
					
					OR
					
					children: {
						editing: 'state3'
					}
				*/
				children.call(this,config.children);
			}
		} else {
			throw new TypeError('Function object must be passed into StateGroup.prototype.config');	
		}
		
		///////////
		
		function scope(scope) {
			/*jshint validthis: true */
			if(!!scope) {
				this.$scope = scope;
				angular.forEach(this.states,function(state) {
					state.$scope = scope;
				});
			} else {
				return this.$scope;	
			}
		}	
		
		function exclusive() {
			// try to make this cleaner
			var stateNames = Array.prototype.slice.call(arguments);	

			// e.g. stateNames === ['addingComments','editingDescription','assigning']
			angular.forEach(stateNames, function(name) {

				// get the currently looped State
				// e.g. 'addingComments'
				var current = this.states.filter(function(state) {
					return state.$name === name;
				})[0];

				// create a new array of names that doesn't contain the currently looped State's name
				// e.g. ['editingDescription','assigning']
				var exclusiveOf = stateNames.filter(function(stateName) {
					return stateName !== current.$name;
				});

				// in the currently looped State's $exclusiveOf array,
				// push all the other State objects
				// e.g. $exclusiveOf === [State, State]
				angular.forEach(exclusiveOf, function(stateName) {
					current.$exclusiveOf.push(this.states.filter(function(state) {
						return state.$name === stateName;
					})[0]);
				}.bind(this));

			}.bind(this));
		}
		
		function children(childrenObject) {
			var parentStateName, parentState, childState;
			
			for(parentStateName in childrenObject) {
				parentState = this.states.filter(filter)[0];

				if(config.children[parentStateName].constructor === Array) {
					angular.forEach(config.children[parentStateName],pushToChildren.bind(this));
				} else {
					pushToChildren(config.children[parentStateName]);	
				}
			}
			
			function filter(state) {
				return state.$name === parentStateName;
			}
			
			function pushToChildren(childName) {
				childState = this.states.filter(function(state) {
					return state.$name === childName;
				})[0];
				
				parentState.$children.push(childState);
			}
		}
	}

	function models() {
		/*jshint validthis: true */
		// useful for debugging to see all of the current models being used in the group
		var models = [];
		
		angular.forEach(this.states,function(state) {
			models.push(state.$model);
		});
		
		return models;
	}

	win.StateGroup = StateGroup;
})(angular,State,window);
