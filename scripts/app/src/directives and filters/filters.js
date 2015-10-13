(function(){
		var app = angular.module('filters',[]);

		//Filter that arranges which hierachy items are being shown on-screen.
		app.filter('idFilter',function() {
			return function(items, parentid){
				this.returnlist = [];
				for(var i in items)
				{
					if(items[i].parent == parentid)
					{
						returnlist.push(items[i]);
					}
				}
				return returnlist;
			};
		});

		//Filter returns the rules corresponding with the right Default param
		app.filter('ruleDefParamFilter', function() {
			return function(items, defParam) {
				this.returnlist = [];
				var cat = defParam.name;
				for(var i in items){
					if(items[i].category == cat){
						returnlist.push(items[i]);
					}
				}
				return returnlist;
			};
		});

		//Filter that makes sure the right rules are being returned
		app.filter('ruletypeFilter',function() {
			return function(items, rule) {
				this.returnlist = [];
				this.itemlist = [];
				if(rule.name=="All")
				{
					return items;
				}
				for(var i in items)
				{
					if(items[i].name == rule.name)
					{
						returnlist.push(items[i]);
					}
				}
				return returnlist;
			};
		});

		//Filter which makes sure the right items show up in the rules select menu (not itself + items which are already rule  targets)
		app.filter('prereqFilter',function() {
			return function(items, settingsItem, activeRule){
				if(settingsItem == null | activeRule == null)
				{
					return [];
				}
				this.returnlist = [];
				for(var i in items)
				{
					this.dupe = false;
					if(items[i].id != settingsItem.id)
					{
						for(var j in settingsItem.rules)
						{
							if(settingsItem.rules[j].targetid == items[i].id && !dupe && activeRule.type == settingsItem.rules[j].type)
							{
								dupe=true;
							}
						}
						if(!dupe)
						{
							this.returnlist.push(items[i]);
						}
					}
				}
				return this.returnlist;
			};
		});
})();
