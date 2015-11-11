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

  // closes an alert message given by entering invalid credentials
  this.closeAlert = function(index)
  {
    $scope.alerts.splice(index,1);
  };

  //A new account will be registered at the database, using the given credentials.
  this.register = function(credentials)
  {
    if(credentials.name=="" || credentials.pass==""){
      $scope.alerts.push({type:'danger',msg: "Username/Password not filled in."});
      return;
    }
    var registered = SessionService.register(credentials).then(function(data){
      if(data == 1){
        credentials.name = "";
        credentials.pass = "";
        $scope.alerts.push({type:'success',msg: 'Registration succesful!'});
        this.ToggleRegisterMenu();
      }
      if(data == 0){
        credentials.name = "";
        credentials.pass = "";
        $scope.alerts.push({type:'danger',msg: 'Something went wrong! username might be used or connection might be broken.'});
      }
    });
  };

  //method used to toggle from login controls to register controls and back.
  this.ToggleRegisterMenu = function()
  {
    this.credentials.name="";
    this.credentials.pass="";
    this.showLogin= !this.showLogin;
    this.showRegister= !this.showRegister;
  };

});
