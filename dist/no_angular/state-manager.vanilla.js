/*
	dependencies for angular-state-manager
	
	(c) 2015 Joshua Beam
	
	github.com/joshbeam

	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(win) {
	'use strict';

	var dependencies = {};

	win.stateManagerDependencies = dependencies;
})(window);
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
/*
	State for angular-state-manager
	
	(c) 2015 Joshua Beam

	github.com/joshbeam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(dependencies) {
	'use strict';

	var utils = dependencies.utils;

	State.prototype = {
		get: stateGet,
		start: start,
		stop: stop,
		done: done,
		subject: subject,
		model: model,
		isActive: isActive,
		and: and
	};

	function State(config) {
		this.$name = config.name;
		this.$start = config.start || null;
		this.$stop = config.stop || null;
		this.$done = config.done || null;
		// pass by reference is magic
		this.$subject = config.subject || {};
		this.$active = false;
		this.$model = '';
		this.$exclusiveOf = [];
		this.$children = [];
		this.$and = config.and || null;
		this.$scope = {};
	}

	function stateGet(prop) {
		/*jshint validthis: true */
		if(prop in this) return this[prop];
	}

	function start(_config_) {
		/*jshint validthis: true */
		/*
			event is also passed in, just in case
			something like e.stopPropagation() needs to happen
		*/
		var config = {}, subject = {}, model = {}, event = {};
		if(!!_config_) {
			config = _config_;
			
			if('subject' in config) {
				if(typeof config.subject === 'object') {
					subject = config.subject;
				} else {
					throw new TypeError(utils.constants.errors.type.ILLEGAL_SUBJECT);
				}
			}
			
			if('model' in config) {
				if(typeof config.model === 'string') {
					if(config.model.split('.').length < 3) {
						throw new SyntaxError(utils.constants.errors.syntax.ILLEGAL_MODEL_STRING);
					} else {
						model = config.model;
					}
				} else {
					throw new TypeError('$model must be of type "string"');	
				}
			}
			
			if('event' in config) {
				event = config.event;	
			}
		}
		
		if(this.isActive()) {
			this.model({});
			this.stop();
		}
		
		var resolvedModel = null;
		this.$active = true;
		// pass by reference!
		this.$subject = subject;
		// initialize the model to contain the string version of the model
		// e.g. vm.models.descriptionOfItemBeingEdited
		this.$model = model;

		if(model.constructor !== Object && typeof model === 'string') {
			resolvedModel = utils.getStringModelToModel.call(this, this.$scope, model);
		}
		
		// stop all states that are exclusive of this state
		utils.forEach(this.$exclusiveOf,function(state) {
			if(state.isActive()) {
				state.stop();
			}
		});
		
		// 'reset' (stop) all children states
		utils.forEach(this.$children,function(childState) {
			if(childState.isActive()) {
				childState.stop();
			}
		});
		
		if(this.$start !== null) {
			return this.$start(this.$subject,resolvedModel,event);
		}
	}

	function stop(config) {
		/*jshint validthis: true */
		/*
			config: 
			
				{
					keepSubject: {true} | {false} [default: false]
					event: EventObject [default: undefined]
				}
		*/
		// config is always passed in by default (from the .done() method)
		// still use error checking just in case
		var event;
		
		if(!!config) {
			if('keepSubject' in config) {
				this.$subject = config.keepSubject === true ? this.$subject : {};
			}
			
			if('event' in config) {
				event = config.event;	
			}
		} else {
			// reset the subject by default
			this.$subject = {};	
		}
		
		// reset the model, only if there was one to begin with
		// #question
		// should I rename $model to $modelString? Makes more syntactical sense
		if(this.$model !== '') {
			// #question
			// should i reset the model to '' or {}?
			// in start, it resets the model to {}
			this.model('');
			this.$model = '';
		}
		
		// might as well check... .stop() can be called from controllers,
		// and if the state isn't active, it doesn't need to run this.$active = false
		if(this.$active === true) {
			this.$active = false;
		}
		
		if(this.$stop !== null) {
			return this.$stop(event);
		}
	}

	function done(config) {
		/*jshint validthis: true */
		/*
			config:
			
				{
					keepSubject: {true} | {false} [default: false]
					stop: {true} | {false} [default: true]
					keepModel: {true} | {false} [default: false]
					event: EventObject [default: undefined]
				}
		*/
		// #question
		// should i be able to call this if it isn't active?
		
		var keepSubject = false, keepModel = false, runStop = true, event;
		
		if(!!config) {
			if('keepSubject' in config) {
				if(typeof config.keepSubject === 'boolean') {
					keepSubject = config.keepSubject;
				} else {
					throw new TypeError('keepSubject '+utils.constants.errors.type.ILLEGAL_CONFIG_BOOL);
				}
			}
			
			if('stop' in config) {
				if(typeof config.stop === 'boolean') {
					runStop = config.stop;
				} else {
					throw new TypeError('stop '+utils.constants.errors.type.ILLEGAL_CONFIG_BOOL);	
				}
			}
			
			if('keepModel' in config) {
				if(typeof config.keepModel === 'boolean') {
					keepModel = config.keepModel;
				} else {
					throw new TypeError('keepModel '+utils.constants.errors.type.ILLEGAL_CONFIG_BOOL);	
				}
			}
			
			if('event' in config) {
				event = config.event;	
			}
		}
					
		// need to re-resolve the model to see the updates from the scope
		var resolvedModel = utils.getStringModelToModel.call(this, this.$scope, this.$model);
		
		if(this.$done !== null) {
			this.$done(this.$subject,resolvedModel,event);
		}
		
		// [default]
		// .stop() also resets the model...
		if(keepModel === false) {
			this.model('');
		}
		
		// this *has* to be called second, since it can reset the subject
		// if keepCurrentSubject is not passed in
		// [default]
		
		if(runStop === true) {
			this.stop({
				keepSubject: keepSubject,
				event: event
			});
		}
		
		return this;
	}

	function subject(val) {
		/*jshint validthis: true */
		if(!!val) {
			this.$subject = val;	
		} else if (!val) {
			return this.$subject;	
		}
	}

	function model(val) {
		/*jshint validthis: true */
		var resolvedModel;
		
		if(!!val || val === '') {
			if(typeof this.$model === 'string' && Object.keys(this.$scope).length > 0) {
				utils.setStringModelToModel(this.$scope, this.$model, val);
				return true;
			} else if (!val) {
				return false;	
			}			
		} else {
			return this.$model;
		}
	}

	function isActive() {
		/*jshint validthis: true */
		return this.$active;	
	}

	function and() {
		/*jshint validthis: true */
		/*
			usage:
			
			NOTE: must pass in 'true' to .done() if using $subject in
			the declaration of the auxillary function
			
			vm.states.get('editing').done(true).and('remove', 'sayHi');
			... .and({remove: 'param'});
			... .and({remove: ['param1','param2']}, 'sayHi');
			... .and({remove: 'param'}, {sayHi: 'param'});
		*/
		
		utils.forEach([].slice.call(arguments), function(arg) {
			if(arg.constructor !== Object) {
				if(arg in this.$and) {
					this.$and[arg].call(this,this.$subject);	
				}
			} else if (arg.constructor === Object) {
				for(var fn in arg) {
					if(arg[fn].constructor !== Array) {
						// force it to become an array
						arg[fn] = [arg[fn]];
					}
					// add subject as first param
					arg[fn].unshift(this.$subject);
					
					// call the auxillary function with subject and any additional params
					this.$and[fn].apply(this,arg[fn]);	
				}
			}
		}.bind(this));
	}

	dependencies.State = State;

})(stateManagerDependencies);
/*
	StateGroup for angular-state-manager
	
	(c) 2015 Joshua Beam

	github.com/joshbeam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(dependencies) {
	'use strict';

	var utils = dependencies.utils,
		State = dependencies.State;

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
			if(!!stateName && stateName !== '') {
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
					utils.forEach(config.exclusive,function(obj) {
						if(obj.constructor === Array) {
							type = 'array';
							countOfArrays++;	
						} else if(typeof obj === 'string') {
							type = 'string';	
						}
					}.bind(this));
					
					// if [[],[]], and all are arrays
					if(countOfArrays === config.exclusive.length && type === 'array') {
						utils.forEach(config.exclusive,function(arrayOfStateNames) {
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
				utils.forEach(this.states,function(state) {
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
			utils.forEach(stateNames, function(name) {

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
				utils.forEach(exclusiveOf, function(stateName) {
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
					utils.forEach(config.children[parentStateName],pushToChildren.bind(this));
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
		
		utils.forEach(this.states,function(state) {
			models.push(state.$model);
		});
		
		return models;
	}

	dependencies.StateGroup = StateGroup;
})(stateManagerDependencies);

/*
	state-manager
	
	(c) 2015 Joshua Beam
	
	github.com/joshbeam

	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function(dependencies) {
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