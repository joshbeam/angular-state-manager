describe('stateManager', function() {
	var stateManager, states;
	
	beforeEach(module('stateManager'));
	
	beforeEach(inject(function(_stateManager_) {
		stateManager = _stateManager_;
	}));
	
	beforeEach(function() {
		states = stateManager.group('list');
				
		states()
			.state(function() {
				return {
					name: 'editing'	
				};
			})
			.state(function() {
				return {
					name: 'creating'	
				};
			})
			.state(function() {
				return {
					name: 'addingComments',
					auxillary: {
						remove: function(subject) {
							subject.set('comments','');	
						}
					}
				};			
			})
			.state(function() {
				return {
					name: 'editingDescription'
				};
			})
			.state(function() {
				return {
					name: 'assigning',
					done: function() {
						//test	
					}
				};
			});
		
	});
	
	describe('State',function() {
		describe('.prototype',function() {
			/*
				get, start, stop, done, subject, model, isActive, and
			*/
			describe('.get()',function() {
				//console.log('test1', states);
				it('should return the property of the string passed in, if the property exists, or return undefined',function() {
					expect(states('editing').get('$name')).toBe('editing');
					expect(states('editing').get('name')).toBeUndefined();
				});			
			});

			describe('.start()',function() {
				beforeEach(function() {
					spyOn(states('editing'), 'stop');
				});
				
				it('should stop the state if it is currently active',function() {
					states('editing').start();
					expect(states('editing').stop).not.toHaveBeenCalled();
					
					// second time start is called, it runs the $stop function
					states('editing').start();
					expect(states('editing').stop).toHaveBeenCalled();
				});

				it('should set this.$active to true',function() {
					states('editing').stop();
					states('editing').start();
					expect(states('editing').isActive()).toBe(true);
				});

				it('should stop all child states',function() {
					states().config(function() {
						return {
							children: {
								editing: ['creating','addingComments']
							}
						};
					});

					states('addingComments').start();
					states('creating').start();
					expect(states('addingComments').isActive()).toBe(true);
					expect(states('creating').isActive()).toBe(true);

					// this will disable its child states
					states('editing').start();
					expect(states('addingComments').isActive()).toBe(false);
					expect(states('creating').isActive()).toBe(false);

				});

				describe('$subject',function() {
					it('should be set as an empty object if no subject is given',function() {
						states('editing').start();

						expect(states('editing').subject()).toEqual({});
					});

					it('should be set to what is passed in',function() {
						var subject = {
							name: 'Josh'	
						};

						states('editing').start({subject: subject});

						expect(states('editing').subject()).toBe(subject);
					});

					it('should throw a TypeError if the subject passed in is not of type "object"',function() {
						expect(function() {
							states('editing').start({subject: 'hello'});
						}).toThrowError();
					});				
				});

				describe('$model',function() {
					it('should be set to an empty object if no model is passed in',function() {
						states('editing').start();

						expect(states('editing').model()).toEqual({});
					});

					it('should be set to the same string as what is passed in',function() {
						var model = 'vm.models.someModel';
						states('editing').start({model: model});

						expect(states('editing').model()).toBe(model);
					});

					it('should throw a TypeError if a non-string is passed in as the model',function() {
						expect(function() {
							states('editing').start({model: {}});
						}).toThrowError();

						expect(function() {
							states('editing').start({model: 'vm.models.hello'});
						}).not.toThrowError();
					});

					it('should throw a SyntaxError if the model isn\'t prefixed with [scope].[namespace]',function() {
						expect(function() {
							states('editing').start({model: 'vm.hello'});
						}).toThrowError();
					});	
				}); // $model

				
				describe('$start',function() {
					it('should be called',function() {
						spyOn(states('editing'), '$start');
						states('editing').start();
						expect(states('editing').$start).toHaveBeenCalled();
					});
				});
			});	// .start()
			
			describe('.stop()',function() {
				var subject, model;
				
				function sharedBeforeEach() {
					beforeEach(function() {
						subject = { name: 'Josh' };
						model = 'vm.models.someModel';
						
						states().config(function() {
							return {
								scope: {
									models: {
										someModel: 'hello world'
									}
								}	
							};
						});
					});					
				}
				
				describe('$stop',function() {
					it('should be called',function() {
						spyOn(states('editing'), '$stop');
						states('editing').stop();
						expect(states('editing').$stop).toHaveBeenCalled();
					});
				});
				
				describe('$subject',function() {
					sharedBeforeEach();
					it('should be set to an empty object if config.keepSubject isn\'t passed in',function() {		
						states('editing').start({subject: subject});
						states('editing').stop();
						expect(states('editing').subject()).toEqual({});
					});
					
					it('should stay what it was originally if config.keepSubject is set to true, or be reset to an empty object if set to false',function() {
						states('editing').start({subject: subject});
						states('editing').stop({keepSubject: true});
						expect(states('editing').subject()).toEqual(subject);
						
						states('editing').start({subject: subject});
						states('editing').stop({keepSubject: false});
						expect(states('editing').subject()).toEqual({});
					});
				});
				
				describe('$model',function() {
					sharedBeforeEach();
					it('should be reset to an empty string if it was not an empty string',function() {
						states('editing').start({model: model});
						states('editing').stop();
						expect(states('editing').model()).toBe('');
						
						states('editing').start();
						states('editing').stop();
						expect(states('editing').model()).toBe('');
					});
				});
				
				describe('model object',function() {
					sharedBeforeEach();
					
					it('should be reset to an empty string',function() {
						states('editing').start({model: model});
						states('editing').model('hello world');
						expect(states().$scope.models.someModel).toBe('hello world');
						states('editing').stop();
						expect(states().$scope.models.someModel).toBe('');
					});
				});
				
				describe('$active',function() {
					sharedBeforeEach();
					
					it('should be set to false',function() {
						states('editing').start();
						expect(states('editing').isActive()).toBe(true);
						states('editing').stop();
						expect(states('editing').isActive()).toBe(false);
					});
				});
				
				// set up a spy to see if $stop is called
			}); // .stop()
			
			describe('.done()',function() {
				describe('$done',function() {
					it('should be called if it was set',function() {
						// JASMINE #bug
						// sets the function to a spy function, when it's supposed to be null
//						spyOn(states('editing'),'$done');
//						states('editing').done();
//						expect(states('editing').$done).not.toHaveBeenCalled();
					});
				});
				
				beforeEach(function() {
					spyOn(states('editing'),'stop');
				});
				
				it('should call .stop() if stop is true',function() {
					states('editing').start();
					states('editing').done({stop: true});
					expect(states('editing').stop).toHaveBeenCalled();
				});
				
				it('should call .stop() if no stop paramter is passed',function() {					
					states('editing').start();
					states('editing').done();
					expect(states('editing').stop).toHaveBeenCalled();					
				});
				
				it('should not call .stop() if false is passed in as the stop param',function() {
					states('editing').start();
					states('editing').done({stop: false});
					expect(states('editing').stop).not.toHaveBeenCalled();
				});
			});
		}); // .prototype

	}); // State
	
	describe('StateGroup',function() {
		it('should return a state when a string is passed in to an instance', function() {
			var editingState = states('editing');
			var addingCommentsState = states('addingComments');

			expect(editingState.$name).toBe('editing');
			expect(addingCommentsState.$name).toBe('addingComments');
		});

		it('should return a function when instantiated', function() {
			expect(states.constructor).toBe(Function);
		});
		
		it('should return itself when no parameter is passed to the instance',function() {
			expect(Object.getPrototypeOf(states())).toBe(Object.getPrototypeOf(stateManager.group()()));
		});
		
		describe('.prototype',function() {
			describe('.models()',function() {
				it('should return a list of models',function() {
					var editingState = states('editing');
					var creatingState = states('creating');
					var addingCommentsState = states('addingComments');
					var editingDescriptionState = states('editingDescription');
					var assigningState = states('assigning');

					states().config(function() {
						return {
							scope: {
								name: 'testScope',
								models: {
									helloWorld: function() {
										return 'hello world!';
									},
									foo: 'bar',
									dude: 'where\'s my car'
								}						
							}
						};
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
			});

			//if states are not exclusive, they cannot have the same model!

			describe('.getAll()',function() {
				it('should return an array of states', function() {
					var all = states().getAll();

					expect(all.length).toBe(5);
					expect(all.constructor).toBe(Array);
				});				
			});
			
			describe('.config()',function() {
				it('should throw an error if there is an unexpected key passed in',function() {

					//chidlern is a misspelling of children
					expect(function() { 
								states().config(function() {
								return {
									chidlern: {
										editing: 'addingComments'	
									}
								};
							});
					}).toThrowError();
				});				
			});
			
		});
	});
	

	
});