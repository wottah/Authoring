(function(){
		var app = angular.module('directives',[]);

		//Custom directive which makes the add-item functionality reusable
		app.directive("addItems",function(){
			return{
				restrict: 'E',
				templateUrl: 'directives/add-items.html',
				scope: {
					parent : '=',
					controller : '='
				}
			};
		});

		//Custom directive for Topic Settings
		app.directive("settings", function(){
			return{
				restrict: 'E',
				templateUrl: 'directives/settings.html'
			};
		});

		//Custom directive for overview
		app.directive("overview", function(){
			return{
				restrict: 'E',
				templateUrl: 'directives/overview.html'
			};
		});

		//Custom directive for step by step view
		app.directive("stepByStep", function(){
			return{
				restrict: 'E',
				templateUrl: 'directives/stepbystepview.html'
			};
		});
})();
