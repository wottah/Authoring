angular.module('modelbuilder').config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/Authoringscreen', {
        templateUrl: 'authoringscreen.html',
        controller: 'FormController',
        controllerAs: 'control'
      })
      .when('/Login', {
        templateUrl: 'loginscreen.html',
        controller: 'LoginController',
        controllerAs: 'control'
      })
      .when('/', {
        templateUrl: 'loginscreen.html',
        controller: 'LoginController',
        controllerAs: 'control'
      })
      .when('/Browse', {
        templateUrl: 'projectbrowser.html',
        controller: 'BrowserController',
        controllerAs: 'control'
      });

    $locationProvider.html5Mode(true);
});
