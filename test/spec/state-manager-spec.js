describe('factory: stateManager', function() {
	var editing, creating, addingComments, editingDescription, assigning, states;
	
	beforeEach(module('stateManager'));
	
	beforeEach(inject(function(_stateManager_) {
		stateManager = _stateManager_;
	}));
	
	beforeEach(function() {
		editing = {
			name: 'editing'
		};
		
		creating = {
			name: 'creating'
		};
		
		addingComments = {
			name: 'addingComments',
			auxillary: {
				remove: function(subject) {
					subject.set('comments','');	
				}
			}
		};
		
		editingDescription = {
			name: 'editingDescription'
		};
		
		assigning = {
			name: 'assigning'
		};
		
		states = new stateManager.StateGroup(editing,creating,addingComments,editingDescription,assigning);	
		
//		var editingState = states('editing');
//		var creatingState = states('creating');
//		var addingCommentsState = states('addingComments');
//		var editingDescriptionState = states('editingDescription');
//		var assigningState = states('assigning');
//		console.log(editingState,creatingState,addingCommentsState,editingDescriptionState,assigningState);
	});
	
	it('should return a named state', function() {
		var editingState = states('editing');
		var addingCommentsState = states('addingComments');
		
		expect(editingState.$name).toBe('editing');
		expect(addingCommentsState.$name).toBe('addingComments');
	});
	
	it('should return a function when instantiated', function() {
		expect(states.constructor).toBe(Function);
	});
	
	it('should define an array of exclusive states', function() {
		var editingState = states('editing');
		var creatingState = states('creating');
		var addingCommentsState = states('addingComments');
		var editingDescriptionState = states('editingDescription');
		var assigningState = states('assigning');
		
		states().exclusive('editing','creating');
		states().exclusive('addingComments','editingDescription','assigning');
		
		expect(editingState.$exclusiveOf.length).toBe(1);
		expect(editingState.$exclusiveOf[0].$name).toBe('creating');
		
		expect(creatingState.$exclusiveOf.length).toBe(1);
		expect(creatingState.$exclusiveOf[0].$name).toBe('editing');
		
		expect(addingCommentsState.$exclusiveOf.length).toBe(2);
		expect(addingCommentsState.$exclusiveOf).not.toContain(addingCommentsState);
		expect(addingCommentsState.$exclusiveOf).toContain(editingDescriptionState);
		expect(addingCommentsState.$exclusiveOf).toContain(assigningState);
	});
	
	it('should make exclusive states inactive when it becomes active',function() {
		var addingCommentsState = states('addingComments');
		var editingDescriptionState = states('editingDescription');
		var assigningState = states('assigning');
		
		states().exclusive('addingComments','editingDescription','assigning');
		
		addingCommentsState.start();
		editingDescriptionState.start();
		
		expect(addingCommentsState.isActive()).toBe(false);
		expect(editingDescriptionState.isActive()).toBe(true);
	});
	
	it('should make each state have the same scope as the state group', function() {
		var editingState = states('editing');
		var creatingState = states('creating');
		
		states().scope({
			name: 'testScope'
		});
		
		expect(editingState.$scope).toBe(states().$scope);
		expect(creatingState.$scope).toBe(states().$scope);
	});
	
	it('should make sure a state\'s $model is always a string', function() {
		var editingState = states('editing');
		var creatingState = states('creating');
		
		// vm
		states().scope({
			name: 'testScope',
			models: {
				helloWorld: function() {
					return 'hello world!';	
				}
			}
		});
		
		editingState.start({model: 'vm.models.helloWorld'});
		expect(typeof editingState.$model).toBe('string');
		editingState.stop();
		expect(typeof editingState.$model).toBe('string');
		
		
	});
	
	it('should not run .model() unless there is a $model string, valid $scope, and a valid $scope model object',function() {
		var editingState = states('editing');
		
		editingState.start();
		expect(editingState.model('')).toBe(false);
		
		editingState.start({model: 'vm.models.helloWorld'});
		expect(editingState.model('')).toBe(false);
		
		states().scope({
			name: 'testScope'
		});
		
		editingState.start({model: 'vm.models.helloWorld'});
		expect(editingState.model('')).toBe(false);
		
		states().scope({
			name: 'testScope',
			models: {
				helloWorld: function() {
					return 'hello world!';	
				}
			}			
		});
		
		editingState.start({model: 'vm.models.helloWorld'});
		expect(editingState.model('')).not.toBe(false);
	});
	
	it('should stop a state and reset the state\'s model before the state starts again',function() {
		var editingState = states('editing');
		
		states().scope({
			name: 'testScope',
			models: {
				helloWorld: function() {
					return 'hello world!';	
				}
			}			
		});
		
		editingState.start({model: 'vm.models.helloWorld'});
		editingState.start();
		
		expect(editingState.$model.constructor).toBe(Object);
	});
	
	it('should return a list of models',function() {
		var editingState = states('editing');
		var creatingState = states('creating');
		var addingCommentsState = states('addingComments');
		var editingDescriptionState = states('editingDescription');
		var assigningState = states('assigning');
		
		states().scope({
			name: 'testScope',
			models: {
				helloWorld: function() {
					return 'hello world!';
				},
				foo: 'bar',
				dude: 'where\'s my car'
			}			
		});
		editingState.start({model: 'vm.models.helloWorld'});
		creatingState.start({model: 'vm.models.foo'});
		editingDescriptionState.start({model: 'vm.models.foo'});
		assigningState.start({model: 'vm.models.dude'});
		addingCommentsState.start({model: 'vm.models.helloWorld'});
		
		expect(states().models().length).toBe(5);
		expect(states().models()).toContain('vm.models.helloWorld');
		expect(states().models()).toContain('vm.models.foo');
		expect(states().models()).toContain('vm.models.dude');
	});
	
	//if states are not exclusive, they cannot have the same model!
	
});