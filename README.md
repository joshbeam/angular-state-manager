#angular-state-manager

**v0.1.0**

Creates a separate layer for managing states within a controller.

Basic usage:
```html
<!-- index.html -->
<div ng-controller="MainController as vm" ng-repeat="item in vm.items" ng-click="vm.states.get('editing').start(item)">{{item.name}}</div>

<input type="text" ng-model="vm.models.commentsForItemBeingEdited" ng-show="vm.states.get('editing').isActive()">
<button ng-click="vm.states.get('editing').done()">Save</button>
<button ng-click="vm.states.get('editing').stop()">Cancel</button>
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
	name: 'editing',
	start: function(subject) {
		vm.models.commentsForItemBeingEdited = '';
	},
	done: function(subject) {
		subject.set('comments',vm.models.commentsForItemBeingEdited);
	}
};

vm.states = new stateManager.StateGroup(editing,addingComments);

vm.models = {
	commentsForItemBeingEdited: ''
};
```

<hr>

**Last updated 16 March 2015**

The MIT License (MIT) Copyright &copy; 2014 Joshua Beam