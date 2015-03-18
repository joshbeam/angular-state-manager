#angular-state-manager

**v0.6.1 pre-release**

**Download at:** *dist --> state-manager[.min].js*

**Dependencies:** AngularJS@1.3.14 (not tested in any other version)

**Browser support:** IE9+, all other modern browsers

<hr>

Creates a separate layer for managing states within a controller.

<a href="https://github.com/joshbeam/Basket">Example app</a> using stateManager (see it <a href="http://joshbeam.github.io/Basket">live</a>)

**Tutorials coming soon...**

Basic usage:
```html
<!-- EXAMPLE 001: index.html -->
<div ng-controller="MainController as vm" ng-repeat="item in vm.items" ng-click="vm.states('editing').start({model: item})">{{item.name}}</div>

<input type="text" ng-model="vm.models.commentsForItemBeingEdited" ng-show="vm.states('editing').isActive()">
<button ng-click="vm.states('editing').done()">Save</button>
<button ng-click="vm.states('editing').stop()">Cancel</button>

<!-- EXAMPLE 002: wouldn't show any behavior; simply for demo purposes on how to bind a scope's model to the stateManager -->
<input type="text" ng-model="vm.models.commentsForItemBeingEdited" value="Hello World!" />

<!-- notice the model has to be passed in as a string, but the subject is an actual scope object -->
<button ng-click="vm.states('addingComments').start({subject: vm.someObject, model:'vm.models.commentsForItemBeingEdited'})">Start</button>

<button ng-click="vm.states('addingComments').done()">Save Comments</button>
```

```javascript
// main.controller.js
var vm = this;

var editing = {
	name: 'editing',
	start: function(subject) {
		console.log(subject); // ==> item from ng-repeat
	}
};

var addingComments = {
	name: 'addingComments',
	start: function(subject,model) {
		// from EXAMPLE 002
		console.log(subject); // ==> no subject; was never declared in the start function up top
		console.log(model); // ==> 'Hello World!'
	},
	done: function(subject,model) {
		subject.set('comments',model); // ==> vm.someObject.comments = 'Hello World!'
	}
};

/*
	stateManager's model namespace is reserved for stateManager, since it 're-builds' models
	every time .start() or .done() runs
	
	For example, if using this namespace for your stateManager models:
	vm.models.someModel // ==> 'foo'
	
	Then, DO NOT create an object in the controller like this:
	vm.models = {
		anotherModel: 'bar'
	}
	... because vm.models.anotherModel will be overwritten
	
	Instead, use a separate namespace in the controller, such as:
	vm.someNameSpace = {
		anotherModel: 'bar'
	}
	... this will NOT be overwritten by stateManager
*/

// initialize state manager
vm.states = new stateManager.StateGroup(editing,addingComments);

// object from EXAMPLE 002
vm.someObject = {
	comments: '';
}
```

<hr>

**Last updated 17 March 2015**

The MIT License (MIT) Copyright &copy; 2015 Joshua Beam