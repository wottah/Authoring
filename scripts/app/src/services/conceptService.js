//Service that contains, manages and discloseas all current concepts.
angular.module('modelbuilder').service('ConceptService', function(SupportService, RuleService, DefaultPropsFac){
  var concepts = {};
  var conceptTypes = {};
  var defaultAttributes = {};
  var nextid = 1;

  DefaultPropsFac.LoadDefaults().then(function(data){
    conceptTypes = data.concepttypes;
    defaultAttributes = data.defaultattributes;
  });

  this.getDefaultAtts = function(){
    return defaultAttributes;
  };

  this.getConcepts = function(){
    return concepts;
  };

  this.getConceptTypes = function(){
    return conceptTypes;
  }

  this.setConcepts = function(conceptdata){
    concepts = conceptdata;
    for(var c in concepts)
    {
      if(nextid <= concepts[c].id)
      {
        nextid = concepts[c].id + 1;
      }
    }
  }

  this.addConcept = function(parentId, addText, descText, conceptType){
    var item = {text:addText, description:descText, id:nextid, type:conceptType.name, parent:parentId, children:[], rules:[], parameters:[], selected:true, resource:""};
    nextid++;
    concepts.push(item);
    defParams = conceptType.default_parameters.slice();
    for(var d in defParams){
        this.addParameter(item.id, defParams[d].name, defParams[d].type, defParams[d].value, defParams[d].value, false);
    }
    //add all rules.
    for(var dr in conceptType.default_rules)
    {
      defaultprops = RuleService.addRule(item,"",conceptType.default_rules[dr], true);
      for(var rp in defaultprops)
      {
        this.addParameter(item.id, defaultprops[rp].name, defaultprops[rp].type, defaultprops[rp].defval, defaultprops[rp].defval , true, conceptType.default_rules[dr]);
      }
    }

    if(parentId>0)
    {
      for(var i in concepts)
      {
        if(concepts[i].id==parentId)
        {
          concepts[i].children.push(item.id);
        }
      }
    }
  };

  this.removeConcept = function(id){
    var index;
    for(var i in concepts)
    {
      if(concepts[i].id == id)
      {
        index = i;
      }
      if(concepts[i].parent == id)
      {
        this.removeConcept(concepts[i].id);
      }
    }
    concepts.splice(index,1);
  }

  this.addParameter = function(id, name, type, value, defval, ruleparam, ruleName){
    var newprop = true;
    var target = null;
    for(var i in concepts){
      if(concepts[i].id == id){
        target = concepts[i];
        break;
      }
    }
    var newparam = {name:name, type:type, value:value, defval:defval, ruleparam:ruleparam};
    var index = SupportService.contains(newparam,["name","type"],target.parameters);
    //if the parameter already exists:
    if(index>-1)
    {
      //if this parameter is not allowed to be edited
      if(target.parameters[index].defval=="" && target.parameters[index].ruleparam==true){
        return;
      }
      //otherwise edit the target parameters accordingly.
      var editProp = {name: "", type:"", value:"", defval:"", ruleparam:true};
      editProp.name = target.parameters[index].name;
      editProp.type = target.parameters[index].type;
      editProp.value = value;
      if(ruleparam == true){
        editProp.ruleparam = newparam.ruleparam;
        editProp.defval = newparam.defval;
        if(defval == ""){
          editProp.value = "Defined by "+ruleName +".";
        }
      }
      target.parameters[index] = editProp;
      newprop = false;
    }
    //else just adds this new parameter
    if(newprop)
    {
      var addProp = {name: "", type:"", value:"", defval:"", ruleparam:true};
      addProp.name = newparam.name;
      addProp.type = newparam.type;
      addProp.ruleparam = newparam.ruleparam;
      if(defval == "" && ruleparam == true){
        addProp.defval = newparam.defval;
        if(ruleName != null){
          addProp.value = "Defined by "+ruleName +".";
        }
      }
      else {
        addProp.value = newparam.value;
        addProp.defval = newparam.defval;
      }
      target.parameters.push(addProp);
    }
  };

  //removes param from the list of parameters of the current settingsItem
  this.removeParameter = function(target, removeParam){
    if(!removeParam.ruleparam)
    {
      removeIndex = SupportService.contains(removeParam,"name",target.parameters);
      if(removeIndex>-1)
      {
        target.parameters.splice(removeIndex,1);
      }
    }
  };

  //When a rule is removed which depended on this variable, the variable is allowed to be deleted.
  this.removeRuleParamDependancy = function(itemId, varName, varType){
    for(var i in concepts){
      if(concepts[i].id == itemId){
        compObj = {name:varName, type:varType};
        index = SupportService.contains(compObj,["name","type"],concepts[i].parameters);
        if(index!= -1){
          concepts[i].parameters[index].ruleparam = false;
        }
        break;
      }
    }
  };
});
