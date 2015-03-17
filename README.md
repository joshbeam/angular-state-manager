#angular-state-manager

**v0.5.1 pre-release**

**Download at:** *dist --> state-manager[.min].js*

**Dependencies:** AngularJS

**Browser support:** IE9+, all other modern browsers

<hr>

Creates a separate layer for managing states within a controller.

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

vm.someObject = {
	comments: '';
}

vm.states = new stateManager.StateGroup(editing,addingComments);
```

<hr>

**Last updated 16 March 2015**

The MIT License (MIT) Copyright &copy; 2015 Joshua Beam