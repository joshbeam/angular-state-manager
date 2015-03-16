/*
	angular-state-manager

	v0.1.0
	
	Joshua Beam
	
	joshua.a.beam@gmail.com
	
	(MIT) License
*/
;(function() {
	'use strict';
	
	angular.module('stateManager')
		.factory('stateManager',stateManager);
		
	function stateManager() {
		var exports = {
			StateGroup: StateGroup,
			State: State
		};
		
		StateGroup.prototype = {
			get: stateGroupGet,
			exclusive: exclusive
		};
		
		State.prototype = {
			get: stateGet,
			start: start,
			stop: stop,
			done: done,
			subject: subject,
			model: model,
			isActive: isActive
		};
		
		return exports;	
		
		function StateGroup() {
			this.states = [];
						
			angular.forEach(arguments,function(state) {
				this.states.push(new State(state));
			}.bind(this));
		}
		
		function State(config) {
			this.$name = config.name;
			this.$start = config.start || null;
			this.$stop = config.stop || null;
			this.$done = config.done || null;
			// pass by reference is magic
			this.$subject = config.subject || {};
			this.$active = false;
			this.$model = !!config.model || config.model === '' ? model : {};
			this.$exclusiveOf = [];
		}
		
		function stateGroupGet(stateName) {
			if(!stateName) {
				return this.states;	
			} else {
				return this.states.filter(filter)[0];
			}
			
			function filter(state) {
				return state.$name === stateName;	
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
		
		function stateGet(prop) {
			if(prop in this) return this[prop];
		}
		
		function start(subject,model) {
			this.$active = true;
			// pass by reference!
			this.$subject = subject || {};
			this.$model = !!model || model === '' ? model : {};
									
			angular.forEach(this.$exclusiveOf,function(state) {
				state.stop();
			}.bind(this));
			
			if(this.$start !== null) {
				return this.$start(this.$subject,this.$model);
			}
		}
		
		function stop(keepCurrentSubject) {
			this.$active = false;
			this.$subject = !!keepCurrentSubject ? this.$subject : {};
			
			if(this.$stop !== null) {
				return this.$stop();
			}
		}
		
		function done(aux,keepCurrentSubject) {
			if(this.$done !== null) {
				this.$done(this.$subject,this.$model,aux);
			}
			
			// this *has* to be called second, since it can reset the subject
			// if keepCurrentSubject is not passed in
			return this.stop(keepCurrentSubject);
		}
		
		function subject(val) {
			if(!!val) {
				this.$subject = val;	
			} else if (!val) {
				return this.$subject;	
			}
		}
		
		function model(val) {
			if(!!val) {
				this.$model = val;	
			} else if (!val) {
				return this.$model;	
			}			
		}
		
		function isActive() {
			return this.$active;	
		}
	}
})();