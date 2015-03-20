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
			resolvedModel = utils.getStringModelToModel(this, this.$scope, model);
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
		var resolvedModel = utils.getStringModelToModel(this, this.$scope, this.$model);
		
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