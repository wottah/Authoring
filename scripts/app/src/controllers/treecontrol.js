	//Controls list hierarchy and navigation
		angular.module('modelbuilder').controller('FormController', function(GamService, SessionService, ConceptService, $modal, $scope, $compile){
			if(!SessionService.isAuthorised())
			{
				$location.path('/');
			}
			$scope.items = ConceptService.getConcepts();
			$scope.name = SessionService.getCurrentproject().name;
			$scope.description = SessionService.getCurrentproject().description;
			$scope.deleteModal;
			this.currentparentid= 0;
			this.overviewEnabled = false;
			this.crumblepath = [];
			//Switches view from step-by-step to overview.
			this.switchview = function(){
				this.overviewEnabled = !this.overviewEnabled;
			};

			//Switches the settings view on or off.
			this.settings = function(item){
				$scope.settingsItem = item;
				var modalInstance = $modal.open({
					animation: true,
					templateUrl: 'directives/settings.html',
					scope: $scope,
					controller:'SettingsController as setControl',
					size: "lg"
				});

				modalInstance.result.then(function () {
		      //SAVESOMETHING
		    }, function () {
		      //SAVESOMETHING
		    });
			};

			//Step by step view moves down the hierarchy.
			this.next = function(concept){
				this.currentparentid = concept.id;
				dots = "..";
				if(concept.text.length<=5){
					dots="";
				}
				this.crumblepath.push({text:concept.text.substring(0,5) + dots + "\\",id:concept.id, parent:concept.parent});
			};

			//Adds a new item to the hierarchy.
			this.saveItem = function(parentId, addText, conceptType){
				ConceptService.addConcept(parentId, addText, conceptType);
				SessionService.saveProject();
			};

			//removes an item and its children from the tree
			this.deleteItem = function(id){
				$scope.deleteModal = $modal.open({
					animation: true,
					templateUrl: 'directives/delete-confirm.html',
					scope: $scope,
					controller:'FormController as control',
					size: "sm"
				});

				$scope.deleteModal.result.then(function () {
					ConceptService.removeConcept(id);
					SessionService.saveProject();
				}, function () {
					//Do nothing.
				});
			};

			 this.confirmDelete = function(){
				 $scope.deleteModal.close();
			 }

			 this.doNotDelete = function(){
				 $scope.deleteModal.dismiss();
			 }

			//switches the 'selected' checkbox and property on or off for item and all its children.
			this.includeswitch = function(item){
				item.selected = !item.selected;
				for(var i in $scope.items)
				{
					if($scope.items[i].parent == item.id)
					{
						this.includeswitch($scope.items[i]);
					}
				}
			};

			//moves a level back up the tree hierarchy.
			this.back = function() {
				this.newparentid = 0;
				for(var i in $scope.items)
				{
					if($scope.items[i].id ==this.currentparentid)
					{
						this.newparentid = $scope.items[i].parent;
					}
				}
				this.currentparentid = this.newparentid;
				this.crumblepath.pop();
			};

			//an item in the crumblepath has been clicked.
			this.crumbleClick = function(crumble)
			{

				this.currentparentid = crumble.parent;
				while(this.crumblepath.length>0 && this.crumblepath[this.crumblepath.length-1].id!=crumble.parent)
				{
					this.crumblepath.pop();
				}
			};

			//handles the drop down menu used in the overview. note: ugly solution, but it works.
			this.dropdowncontrol = function(event, parentId){
				var element = event.srcElement ? event.srcElement : event.target;
				listelement = angular.element(element).parent().parent().parent();
				if(angular.element(listelement).hasClass("collapsed"))
				{

					var compilednewitem = $compile(angular.element("<ol><li ng-repeat='item in  items|idFilter:"+parentId+"' class='collapsed'>"+
						"<div class='row'>"+
							"<div class='col-lg-1'>"+
								"<span class='glyphicon glyphicon-triangle-right collapseIcon' ng-click='control.dropdowncontrol($event, item.id)' aria-hidden='true'> </span>"+
								"<input type='checkbox' ng-checked='item.selected' ng-click='control.includeswitch(item)'/>"+
							"</div>"+
							"<p class='col-lg-2' >{{item.text}}</p>"+
							"<div class='btn-group-sm col-lg-2'>"+
							"	<button ng-click='control.deleteItem(item.id)' class='btn btn-primary'>"+
										"<span class='glyphicon glyphicon-remove' aria-hidden='true'> </span>"+
								"</button>"+
								"<button ng-click='control.settings(item)' class='btn btn-primary'>"+
										"<span class='glyphicon glyphicon-option-horizontal' aria-hidden='true'> </span>"+
								"</button>"+
							"</div>"+
						"</span class='col-lg-7'>"+
						"</div>"+
					"</li>"+
					"<div class='row'>"+
					"	<li class='col-lg-3'><add-items controller='control' parent='"+parentId+"' ></add-items>"+
							"<span class='col-lg-9'> </span>"+
						"</li>"+
					"</div>"));
					var newitem = compilednewitem($scope);
					angular.element(listelement).append(newitem);
				}
				else if(angular.element(listelement)){
					angular.element(listelement).find("ol").remove();
				}
				angular.element(listelement).toggleClass("collapsed expanded");
				angular.element(element).toggleClass("glyphicon-triangle-right glyphicon-triangle-bottom");
			};

			//Tells the GamService to generate and export the project to GALE.
			this.generateGAM = function(){
				GamService.generateGAM();
			}
		});
