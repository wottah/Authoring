angular.module('modelbuilder').controller('BrowserController', function( SessionService, $scope, $location, $modal){
  $scope.projects = [];
  $scope.newProject= {text:"", description:""};
  $scope.newProjectModal;
  SessionService.getProjects().then(function(data){
    $scope.projects = data;
  });
  this.selectedProject;

  this.SelectProject = function(project){
    this.selectedProject = project;
  };

  this.loadProject = function(){
    if(this.selectedProject!=null)
    {
      SessionService.setCurrentProject(this.selectedProject).then(function(){
        $location.path('/Authoringscreen');
      });
    }
  };

  this.openNewProjectModal = function(){
    $scope.newProjectModal = $modal.open({
      animation: true,
      templateUrl: 'directives/new-project.html',
      scope: $scope,
      controller:'BrowserController as browseControl',
      size: "sm"
    });

    $scope.newProjectModal.result.then(function () {
      //do nothing
    }, function () {
      //do nothing
    });
  }

  this.newProject = function(text, desc){
    $scope.newProjectModal.close();
    SessionService.newProject(text, desc).then(function(){
      $location.path('/Authoringscreen');
    });
  };

  this.cancelNewProject = function(){
    $scope.newProjectModal.dismiss();
  };

  this.deleteProject = function(){
    if(this.selectedProject!=null){
      SessionService.deleteProject(this.selectedProject.name)
      for(var p in $scope.projects){
        if($scope.projects[p].name == this.selectedProject.name){
          $scope.projects.splice(p,1);
          this.selectedProject = null;
        }
      }
    }
  };
});
