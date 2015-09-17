//controller that handles the add item controls
angular.module('modelbuilder').controller('AddController', function($scope, ConceptService){
  this.addText = "";
  this.descText = "";
  this.selected="";
  this.showAddButton = true;
  $scope.conceptTypes = [];
  $scope.conceptTypes = ConceptService.getConceptTypes();
  $scope.selectedConceptType = $scope.conceptTypes[0];

  this.addShow = function(){
    this.showAddButton = false;
  };

  this.addHide = function(){
    this.showAddButton = true;
    this.addText = "";
    this.descText = "";
    this.selected = "";
  };
});
