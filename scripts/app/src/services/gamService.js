//This controller is all about generating the GAM code based on the current model.
angular.module('modelbuilder').service('GamService', function($window, $http, RuleService, ConceptService, SupportService, ExportJsonFactory, SessionService) {
    defaultTemplateAttRules = [];

    this.generateGAM = function(){
        coursemodel = ConceptService.getConcepts();
        defaultTypes = ConceptService.getConceptTypes();
        usedTypes = [];
        for(var c in coursemodel){
          if(SupportService.contains(coursemodel[c].type,"",usedTypes)==-1){
            usedTypes.push(coursemodel[c].type);
          }
        }
        //First Print the templated concepts of which other concepts will inherit behaviour
        var output = '$options { default.properties "event;strict"} \n \n';
        for(var i in defaultTypes){
          if(SupportService.contains(defaultTypes[i].name,"",usedTypes)!=-1){
            output += this.addTemplateConcept(defaultTypes[i]);
          }
        }
        //Output all concepts extending the basic types
        for(var i in coursemodel)
        {
          if(coursemodel[i].selected==true)
          {

            //find parent relation.
            if(coursemodel[i].parent>0){
              for(var j in coursemodel)
              {
                if (coursemodel[j].id == coursemodel[i].parent)
                {
                    output += this.addConceptCode(coursemodel[i],coursemodel[j].text);
                }
              }
            }
            else{
              output += this.addConceptCode(coursemodel[i],null);
            }
          }
        }
        //To just view the file use:
        //window.open('data:text,' + encodeURIComponent(output));
        //To actually deploy:
        ExportJsonFactory.deploy(SessionService.getCurrentproject().name,output)
    };

    //returns template concept GAM code.
    this.addTemplateConcept = function(concept){
      var gam = "";
      defaultAttributes = ConceptService.getDefaultAtts();
      gam += concept.name.replace(/\s|'|"|`/g, '') + "{\n";
      //print parameters
      for(var p in concept.default_parameters){
          gam+="\t#["+ concept.default_parameters[p].name +"]:"+concept.default_parameters[p].type+" `"+concept.default_parameters[p].value + "`\n";
      }
      //print rules
      attrList = [];
      for(var r in concept.default_rules){
        rule = RuleService.getRule(concept.default_rules[r]);
        if(rule.properties!=null){
          if(rule.type=="unary"){
              gam += "\t" + rule.code + "\n";
          }
        }
        //if attribute rule
        if(rule.target!=null){
          //get target attribute
          for(var index in defaultAttributes){
            if(defaultAttributes[index].name == rule.target){
              ruleIndex = SupportService.contains(defaultAttributes[index],"name",attrList);
              //no rules on this attributes have been defined yet
              if(ruleIndex == -1){
                if(defaultAttributes[index].type != "Boolean"){
                  attrList.push({name:defaultAttributes[index].name, type:defaultAttributes[index].type, rulecode:[rule.code]});
                }
                else{
                  attrList.push({name:defaultAttributes[index].name, type:defaultAttributes[index].type, rulecode:[{code:rule.code, operator:rule.operator}]});
                }
              }
              //a rule has already been defined on this attribute
              else{
                if(defaultAttributes[index].type != "Boolean"){
                  attrList[ruleIndex].rulecode.push(rule.code);
                }
                else{
                  attrList[ruleIndex].rulecode.push({code:rule.code, operator:rule.operator});
                }
              }
            }
          }
        }
      }
      //add all attribute code to concept correctly depending on type.
      for(var d in defaultAttributes){
        var index = SupportService.contains(defaultAttributes[d],"name",attrList);
        //if no additional rules apply, print default.
        if(index == -1){
          gam += "\t#"+defaultAttributes[d].name+":"+defaultAttributes[d].type+" =`"+defaultAttributes[d].value+"`\n";
        }
        //if one rule applies, just print that rule.
        if(index > -1 && attrList[index].rulecode.length == 1){
          if(attrList[index].type =="Boolean"){
            code = attrList[index].rulecode[0].code;
          }
          else{
            code = attrList[index].rulecode[0];
          }
          gam += "\t#"+defaultAttributes[d].name+":"+defaultAttributes[d].type+" =`"+code +"`\n";
          defaultTemplateAttRules.push({id:concept.name + defaultAttributes[d].name, type: defaultAttributes[d].type, rulecode:code});
        }
        //if multiple rules apply,make sure right settings are applied.
        if(index > -1 && attrList[index].rulecode.length > 1){
          code = "";
          if(attrList[index].type =="Boolean"){
            andRules="true";
            orRules=" && ( false ";
            hasOrRules = false;
            for(var c in attrList[index].rulecode){
              if(attrList[index].rulecode[c].operator=="or"){
                hasOrRules = true;
                orRules +=this.addBoolAttrCode(attrList[index].rulecode[c].operator,attrList[index].rulecode[c].code);
              }
              if(attrList[index].rulecode[c].operator=="and"){
                andRules +=this.addBoolAttrCode(attrList[index].rulecode[c].operator,attrList[index].rulecode[c].code);
              }
            }
            code = andRules;
            if(hasOrRules){
              code += orRules +")";
            }
          }
          if(attrList[index].type == "Integer" || attrList[index].type == "Double"){
            code = this.addNumeralAttrCode(defaultAttributes[d].operator, attrList[index].rulecode);
          }
          if(attrList[index].type == "String"){
            code = this.addStringAttrCode(attrList[index].rulecode);
          }
          gam += "\t#"+defaultAttributes[d].name+":"+defaultAttributes[d].type+" =`"+ code + "`\n";
          defaultTemplateAttRules.push({id:concept.name + defaultAttributes[d].name, type: defaultAttributes[d].type, rulecode:attrList[index].rulecode});
        }
      }
        gam += "}\n\n";
        return gam;
    };

    this.addConceptCode = function(concept,parent){
      var gam = "";
      defaultAttributes = ConceptService.getDefaultAtts();
      //concept declaration + standard properties.
      gam += concept.text.replace(/\s|'|"|`/g, '') + "{\n";
      gam += "\t->(extends)"+ concept.type.replace(/\s+/g, '') + "\n";
      gam += "\ttitle `" + concept.text + "`\n";
      if(parent!=null){
        gam += "\t->(parent)"+parent.replace(/\s+/g, '')+"\n";
      }
      for(var p in concept.parameters){
        if(concept.parameters[p].defval == null | concept.parameters[p].value != concept.parameters[p].defval && concept.parameters[p].defval!=""){
          gam +="\t#["+ concept.parameters[p].name +"]:"+concept.parameters[p].type+" `"+concept.parameters[p].value + "`\n";
        }
      }
      //add display information.
      resource = "placeholder.xhtml";
      if(concept.resource!=""){
        resource = concept.resource;
      }
      gam += '\t#content:String =`~ return "[[='+resource +']]";`\n';
      gam += '\t#resource =`~ return "[[=layout.xhtml]]";`\n';
      //start adding all rules.
      itemRules = RuleService.getItemRules(concept.id);
      attrList = [];
      for(var r in itemRules){
        if(itemRules[r].source.id == concept.id && itemRules[r].defaultRule==false){
          rule = RuleService.getRule(itemRules[r].name);
          var code = "";
          if(rule.type == "unary"){
            code= rule.code;
          }
          if(rule.type == "binary"){
            var rulecode = rule.code;
            code = rulecode.replace("%target%",itemRules[r].target.text.replace(/\s|'|"|`/g, ''));
          }
          if(rule.target==null){
            if(rule.type == "relation"){
              gam +="\t->("+rule.name+")"+ itemRules[r].target.text.replace(/\s|'|"|`/g, '')+"\n";
            }
            else{
              gam+= "\t"+code+"\n";
            }
          }
          if(rule.target!=null)
          {
            newatt = true;
            for(var a in attrList){
              if(attrList[a].name == rule.target){
                newatt = false;
                if(attrList[a].type !="Boolean"){
                  attrList[a].rulecode.push(code);
                }
                else{
                  attrList[a].rulecode.push({code:code,operator:rule.operator});
                }
              }
            }
            if(newatt){
              for(var a in defaultAttributes){
                if(defaultAttributes[a].name == rule.target){
                  if(defaultAttributes[a].type=="Double" || defaultAttributes[a].type=="Integer"){
                    attrList.push({name:defaultAttributes[a].name,type:defaultAttributes[a].type,rulecode:[code],operator:defaultAttributes[a].operator});
                  }
                  if(defaultAttributes[a].type == "String"){
                    attrList.push({name:defaultAttributes[a].name,type:defaultAttributes[a].type,rulecode:[code]});
                  }
                  if(defaultAttributes[a].type == "Boolean"){
                    attrList.push({name:defaultAttributes[a].name , type:defaultAttributes[a].type , rulecode:[{operator:rule.operator , code:code}]});
                  }
                }
              }
            }
          }
        }
      }
      //add all attribute rules!
      for(var a in attrList){
        for(var d in defaultTemplateAttRules ){
          //if template code is already present, add code to template code in order to keep templated behaviour.
          if(defaultTemplateAttRules[d].id == concept.type + attrList[a].name){
            attrList[a].rulecode = attrList[a].rulecode.concat(defaultTemplateAttRules[d].rulecode);
          }
        }
        code = "";
        if(attrList[a].type =="Boolean"){
          andRules="true";
          orRules=" && ( false ";
          hasOrRules = false;
          for(var c in attrList[a].rulecode){
            if(attrList[a].rulecode[c].operator=="or"){
              hasOrRules = true;
              orRules +=this.addBoolAttrCode(attrList[a].rulecode[c].operator,attrList[a].rulecode[c].code);
            }
            if(attrList[a].rulecode[c].operator=="and"){
              andRules +=this.addBoolAttrCode(attrList[a].rulecode[c].operator,attrList[a].rulecode[c].code);
            }
          }
          code = andRules;
          if(hasOrRules){
            code += orRules +")";
          }
        }
        if(attrList[a].type == "Integer" || attrList[a].type == "Double"){
          code = this.addNumeralAttrCode(attrList[a].operator, attrList[a].rulecode);
        }
        if(attrList[a].type == "String"){
          code = this.addStringAttrCode(attrList[index].rulecode);
        }
        gam += "\t#"+attrList[a].name+":"+attrList[a].type+" =`"+ code + "`\n";
      }
      gam += "}\n\n";
      return gam;
    };

    //add a boolean clause based on rule operator.
    this.addBoolAttrCode = function(operator, ruleCode){
        if(operator == "and"){
          return " && "+ ruleCode;
        }
        if(operator == "or"){
          return " | "+ ruleCode;
        }
    };

    //returns either Double or Integer definition based on attribute operator
    this.addNumeralAttrCode = function(operator, ruleCode){
      code = "";
      if(operator == "SUM"){
        code="";
        for(var r in ruleCode){
          if(code==""){code += ruleCode[r];}
          else{code += " + "+ruleCode[r];}
        }
      }
      if(operator == "AVG"){
        //'avg(new Object[] {${<=(parent)#knowledge}, ${#own-knowledge}})'
        code = "avg(new Object[] { ";
        for(var r in ruleCode){
          if(code=="avg(new Object[] { "){code += ruleCode[r];}
          else{code += " , "+ruleCode[r];}
        }
        code+="})";
      }
      if(operator == "MAX"){
        code="max(new Object[] {"
        for(var r in ruleCode){
          if(code=="max(new Object[] {"){code += ruleCode[r];}
          else{code += " , "+ruleCode[r];}
        }
        code+="})"
      }
      if(operator == "MIN"){
        code="min(new Object[] {";
        for(var r in ruleCode){
          if(code=="min(new Object[] {"){code += ruleCode[r];}
          else{code += " , "+ruleCode[r];}
        }
        code+="})"
      }
      return code;
    };

    //returns concatenated string code to current rule definition.
    this.addStringAttrCode = function(ruleCode){
      code="";
      for(var c in ruleCode){
        code+= " + "+ruleCode[c];
      }
      return code;
    };
});
