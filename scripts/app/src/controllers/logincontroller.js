angular.module('modelbuilder').controller('LoginController',function($window, $scope, $location, SessionService){
  this.credentials={name:"",pass:""};
  this.showLogin = true;
  this.showRegister = false;
  $scope.alerts = [];

  this.login = function(credentials){
    var authorised = SessionService.login(credentials).then(function(data){
      if(data == 1)
      {
        SessionService.authorise(credentials.name);
        $location.path('/Browse');
      }
      if(data == 0)
      {
          $scope.alerts.push({type:'danger',msg: 'Login unsuccessful!, check your username/password!'});
      }
    });
  };

  this.closeAlert = function(index)
  {
    $scope.alerts.splice(index,1);
  };

  this.register = function(credentials)
  {
    //Register :)
  };

  this.ToggleRegisterMenu = function()
  {
    this.showLogin= !this.showLogin;
    this.showRegister= !this.showRegister;
  };

});
