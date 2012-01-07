/*
 * FileName: former.js
 * Description: Form tools.
 * Author: William Wei (October 14, 2009)
 */
var former = {
	filter : null,
    setFilter : function(filter){
		this.filter = filter?filter:null;
	},
	addEvent : function(objId,type,listener,useCapture){
		var capture = useCapture || false;
		var obj = this.getObject(objId);
		type = type.replace(/^on/,'');
		if(obj.attachEvent){
			obj.attachEvent("on" + type,listener);
		}else if(obj.addEventListener){
			obj.addEventListener(type,listener,capture);
		}
	},
	getObject : function(info){
		if(typeof(info)=="object") return info;
		var obj = document.getElementById(info);
		if(!obj){
			obj = document.getElementsByName(info);
			obj = obj[0]?obj[0]:null;
		}
		return obj;
	},
	formToPage : function(actionUrl, parameters, config){
		//in iframe
		var doc = document;
		if(config && config['hidden']===true){
			var iId = "_form_iframe";
			var iframe = document.getElementById(iId);
			if(!iframe){
				iframe = document.createElement("iframe");
				iframe.id = iId;
				iframe.style.display = "none";
				document.body.appendChild(iframe);
			}
			doc = iframe.contentWindow.document;
			if(!doc.body){
				doc.appendChild(document.createElement("body"));
			}
		}
	    var formObj = doc.createElement("form");
		formObj.style.display = "none";
		//set form attribute
		var config = {};
		config['method'] = config['method']?config['method']:'post';
		for(var key in config){
			formObj[key] = config[key];
		}
		//pass the head column
		var headcolumn = '';
		var firstRecord = parameters[0];
		for(var i in firstRecord){
			headcolumn += i +'\t';
		}
		var el = doc.createElement("textArea");
		 el.name = 'headcolumn';
		 el.value = headcolumn;
		 formObj.appendChild(el);
		 //pass the columns to php
		var numrecords = parameters.length;
		var el = doc.createElement("textArea");
		 el.name = 'numrecords';
		 el.value = numrecords;
		 formObj.appendChild(el);
		var el = doc.createElement("textArea");
		//set form elements
		if (parameters){
			var count = 0;
			for(var name in parameters){
				if(typeof(parameters[name])=='object'){
					var elvalue = '';
					for(var j in parameters[name]){
						elvalue += parameters[name][j]+'\t';
					}
					 var el = doc.createElement("textArea");
					 el.name = count;
					 el.value = elvalue;
					 formObj.appendChild(el);
				}else{
					 var el = doc.createElement("textArea");
					 el.name = name+count;
					 el.value = parameters[name];
					 formObj.appendChild(el);
				}
				count++;
			}
		}
		formObj.setAttribute("action",actionUrl);
		doc.body.appendChild(formObj);
		formObj.submit();
	},
	setState : function(id,enable){
		var obj = this.getObject(id);
		if(!obj) return;
		var state = enable?true:false;
		if(!state && obj.type=="checkbox") obj.checked = false;
		obj.disabled = !state;
	},
	onPressEnterKey : function(e,func){
	    var e = e || window.event;
	    var k = e.keyCode || e.which;
	    var eSrc = e.target || e.srcElement;
		if(k==13 && typeof(func)=="function"){
			func(eSrc);
		}
	},
	check : {
		isEmpty : function(s){
			s = former.input.trim(s);
			return ((s == null) || (s.length === 0));
		},
		isNumber : function(s){
			s = former.input.trim(s);
			return s.match(/(^\.+)|([^\d\.]+)|(\.{2})|(\.+$)/)?false:true;
		},
		isInteger : function(s){
		    var s = former.input.trim(s);
			return s.match(/(^0+)|([^\d]+)/)?false:true;
		},
		/*
		 * Description: for check form
		 * Parameter: [formObj] form id
		 * Format: {id:'inputId',text:'Text Info',type:'empty[,number]....',focusOn:true,customText:true} allows disorder the propertys.
		 * Example: var checkInfo = [
		 *   		{id:'userName',text:'User Name',type:'empty',focusOn:true,customText:false},
		 *  		{id:'passWord',text:'Pass Word',type:'empty,number',focusOn:true,customText:false},
		 *  		];
		 *          former.check.start('manageform',checkInfo);
		 * (Require:id)
		 * (Default:text=id,type='empty',focuseOn=true,customText=false)
		 * (Type:'empty','number','email',....)
		 *  Return: Boolean
		 */
		start : function(formId,checkInfo){
			if(!checkInfo || checkInfo.length<1 || formId=='') return false;
			var formObj = document.getElementById(formId) || document[formId];
			if(!formObj) return false;
			var checkType = "";
			var itemValue = "";
			var itemObj = null;
			var textInfo = "";
			var ifFocus;
			//check form mesage first
			var formMsgs = document.getElementsByTagName("formMsg");
			if(formMsgs.length){
				alert(formMsgs[0].innerHTML);
				var objId = formMsgs[0].id.replace("_formMsg","");
				var aimObj = (document.getElementById(objId) || document.getElementsByName(objId)[0]);
				if(aimObj) aimObj.focus();
				return false;
			}
			//one by one to check all items
			for(var i=0;i<checkInfo.length;i++){
				//ready info
				if(!checkInfo[i]) continue;
				if(!checkInfo[i].id) continue;
				textInfo = checkInfo[i].text?checkInfo[i].text:checkInfo[i].id;
				ifFocus = typeof(checkInfo[i].focusOn)=='undefined'||checkInfo[i].focusOn?true:false;
				checkType = checkInfo[i].type?checkInfo[i].type:'empty';
				checkType = "," + checkType + ",";
				itemObj = formObj[checkInfo[i].id];
				if(!itemObj) continue;
				itemValue = itemObj.value;
				if(typeof(itemValue)=='undefined') continue;
				//use 'checkType' to check item, may be there are a lot types.
				//check whether empty
				if(checkType.match(/\,empty\,/) && this.isEmpty(itemValue)){
					if(checkInfo[i].customText == true){
						alert(textInfo);
					}else{
						alert("'" + textInfo + "' can't be empty!");
					}
					if(ifFocus && !itemObj.disabled) itemObj.focus();
					return false;
				//check whether number
				}else if(checkType.match(/\,number\,/) && !this.isNumber(itemValue)){
					if(checkInfo[i].customText == true){
						alert(textInfo);
					}else{
						alert("'" + textInfo + "' should be number!");
					}
					if(ifFocus && !itemObj.disabled) itemObj.focus();
					return false;
				}
				//.....
			}
			//past
			return true;
		}
	},
	inputTip : {
		className : "inputTip",
		tips : {},
		register : function(tips){
			if(tips) this.tips = tips;
			var _uid,_a,_blurEvent;
			for(var i in this.tips){
				_a = former.getObject(i);
				_a.onfocus = new Function("former.inputTip.onFocus(this);");
				_a.onblur = new Function("former.inputTip.onBlur(this);");
			    former.inputTip.onBlur(_a,true);
			}
		},
		onFocus : function(_a,noTrigger){
			if(!_a) return;
			var c = _a.className;
			var cn = former.inputTip.className;
			var k = _a.id||_a.name;
			var tipObj = former.inputTip.tips[k];
			if(!noTrigger && typeof(tipObj.onfocus)=="function") tipObj.onfocus(_a);
			if(_a.getAttribute("inputSate")=='tip'){
				_a.value = "";
				_a.setAttribute("inputSate","");
			}
			if(c.indexOf(cn)>-1){
			   _a.className = c.replace(" " + cn,'');
			}
		},
		onBlur : function(_a,noTrigger){
			if(!_a) return;
			var k = _a.id||_a.name;
			var tipObj = former.inputTip.tips[k];
			var tip;
			if(typeof(tipObj)=="object"){
				tip = tipObj['tip'];
				if(!noTrigger && typeof(tipObj.onblur)=="function") tipObj.onblur(_a);
			}else{
			    tip = tipObj;
			}
			var c = _a.className;
			var cn = former.inputTip.className;
			if(_a.value===''||_a.value==tip){
				_a.className = c?c+" "+cn:" "+cn;
				_a.value = tip;
				_a.setAttribute("inputSate","tip");
			}
		}
	},
	message : {
		show : function(obj,msg,position,className,isFloat){
			var msgId = (typeof(obj)=="string"?obj:(obj.name || obj.id)) + "_formMsg";
			var msgObj;
			msgObj = former.getObject(msgId);
			if(!msgObj){
			    msgObj = document.createElement("formMsg");
			    msgObj.id = msgId;
			    if(isFloat){
			        var objPs,top,left;
			        objPs = getArea(obj);
			        if(position=="right"){
					   top = objPs.top;
					   left = objPs.right;
				    }else if(position=="bottom"){
					   top = objPs.bottom;
					   left = objPs.left;
				    }
				    msgObj.style.position = "absolute";
				    msgObj.style.top = top + "px";
				    msgObj.style.left = left + "px";
			        obj.parentNode.appendChild(msgObj);
			    }else{
			        if(position=="right"){
			            appendNodeAfter(msgObj,obj);
				    }else if(position=="bottom"){
						msgObj.style.display = "block";
						msgObj.style.marginTop = "3px";
			            appendNodeAfter(msgObj,obj);
				    }
			    }
			}
			if(typeof(className)!='undefined') msgObj.className = className;
			msgObj.innerHTML = msg;
		},
		remove : function(obj){
			var msgId = (typeof(obj)=="string"?obj:(obj.name || obj.id)) + "_formMsg";
			var msgObj = former.getObject(msgId);
			if(msgObj) msgObj.parentNode.removeChild(msgObj);
		}
	},
	input : {
	    setValue : function(id,value){
			if(!value) value = '';
			former.getObject(id).value = value;
		},
		getValue : function(id,filter,noTrim){
			var obj = former.getObject(id);
			if(!obj) return "";
			if(obj.getAttribute("inputSate")=="tip") return "";
			var v = !noTrim?this.trim(obj.value):obj.value;
			if(typeof(filter)=="function"){
				v = filter(v);
			}
			return v;
		},
		trim : function(v){
			v = v.replace(/(^\s+)|(\s+$)/g,'');
			return v;
		}
	},
	checkbox : {
		checkAllId : "",
		clearAll : function(name){
			var items = document.getElementsByName(name);
			for(var i=0;i<items.length;i++){
				items[i].checked = false;
			}
		},
		cycleAll : function(name,fun){
			var items = document.getElementsByName(name);
			if(!items.length || typeof(fun)!='function') return;
			for(var i=0;i<items.length;i++){
				if(fun(items[i],i)=="break") break;
			}
		},
		getProperty : function(name,attName,getObj){
			if(!name) return;
			var items = document.getElementsByName(name);
			var values = "";
			var checkedObjs = [];
			var n = 0;
			for(var i=0;i<items.length;i++){
				if(this.filter && !this.filter(items[i])) continue;
				if(items[i].checked){
					values += items[i].getAttribute(attName) + ",";
					checkedObjs[n] = items[i];
					n++;
				}
			}
			values = values.replace(/\,$/,"");
			if(getObj){
				var checkBoxObj = {
				"objects": checkedObjs,
				"values" : values };
				return checkBoxObj;
			}else{
				return values;
			}
		},
		getValues : function(name,getObj){
			return this.getProperty(name,"value",getObj);
		},
		checkAll : function(obj,itemName,fun,filter){
			var checkboxes = document.getElementsByName(itemName);
			if(!obj.id) obj.id = itemName + "_checkAllBox";
			this.checkAllId = obj.id;
			if(checkboxes.length>0){
				for(var i=0; i<checkboxes.length; i++){
					if(typeof(filter)=="function" && !filter(checkboxes[i])) continue;
                    if (!checkboxes[i].disabled)
                        checkboxes[i].checked = obj.checked;
					former.addEvent(checkboxes[i],"click",former.checkbox.checkCheckAllBox);
					if(typeof(fun)=="function") fun(checkboxes[i]);
				}
			}
		},
		checkCheckAllBox : function(id,name,filter){
			var id = typeof(id)=="string"?id:former.checkbox.checkAllId;
			var checkAllBox = document.getElementById(id);
			if(!checkAllBox) return;
			var name = name?name:(this.name?this.name:event.srcElement.name);
			var state = former.checkbox.checkAllStatus(name,filter);
			if(state==-1){
			    checkAllBox.disabled = true;
			    checkAllBox.checked = false;	
			}else{
			    checkAllBox.disabled = false;
			    checkAllBox.checked = state;
			};
		},
		checkAllStatus : function(checkboxName,filter){
			var name = checkboxName?checkboxName:(this.name?this.name:event.srcElement.name);
			var checkedStatus = -1;
            var isAllDisabled = true;
			var checkboxes = document.getElementsByName(name);   
			for(var i=0;i<checkboxes.length;i++){
				if (checkboxes[i].disabled==null || checkboxes[i].disabled==false){
                    isAllDisabled = false;
                }
			}
			if(checkboxes.length>0 && !isAllDisabled){
				checkedStatus = 1;
				for(var i=0; i<checkboxes.length; i++){
					if(typeof(filter)=="function" && !filter(checkboxes[i])){
						continue;
					}
					if(!checkboxes[i].checked){
						checkedStatus = 0;
						break;
					}
				}
			}else{
				checkedStatus = -1
			}
			return checkedStatus;
		},
		checkItem : function(name,values){
			this.cycleAll(name,function(o){
				if((","+values+",").indexOf(","+o.value+",")>-1){
					o.checked = true;
				}else{
					o.checked = false;
				}
			});
		},
		enableItem : function(name,values){
			this.cycleAll(name,function(o){
				if((","+values+",").indexOf(","+o.value+",")>-1){
					o.checked = false;
					o.disabled = false;
				}
			});
		},
		disableItem : function(name,values){
			this.cycleAll(name,function(o){
				if((","+values+",").indexOf(","+o.value+",")>-1){
					o.checked = false;
					o.disabled = true;
					return o;
				}
			});
		},
		getItems : function(name){
		    return document.getElementsByName(name);	
		}
	},
	selection : {
		addOptions : function(objId, data, nameOption){
			if(!objId || !data || typeof(data.length)=='number') return;
			obj = typeof(objId)=="obj"?objId:(document.getElementById(objId)||document.getElementsByName(objId)[0]);
			if (typeof(nameOption) != 'undefined') {
				obj.options.add(new Option(nameOption, ''));
			}
			for(var key in data){
				obj.options.add(new Option(key,data[key]));
			}
		},
		removeOptions : function(objId,from,to){
			if(!objId) return;
			obj = typeof(objId)=="obj"?objId:(document.getElementById(objId)||document.getElementsByName(objId)[0]);
			var to = to?to:obj.options.length;
			if(from&&to){
				for(var i = to; i>=from; i--){
					obj.options[i] = null;
				}
			}else{//remove all
				obj.options.length = 0;
			}
		},
		resetOptions : function(objId, data, nameOption){
			obj = typeof(objId)=="obj"?objId:(document.getElementById(objId)||document.getElementsByName(objId)[0]);
			obj.options.length = 0;
			if(!data || typeof(data.length)=='number') return;
			former.selection.addOptions(objId,data,nameOption);
		}
	},
	dropdown : {
		optionData : {},
		showOptionsNum : 10, //if real number bigger than default, show scroll bar
		optionStyle : "dropDownItems",
		changeOptionValue : 1,
		currentDropDown : null,
		currentOptionObj : null,
		currentOption : null,
		dropDownEvent : null,
		currentDPType : "",
        lastSelectOption : null,
        objects : {},
		onResizeEvents : {},
		optionNum : 0,
		addOptions : function(optionsArr){
			if(!optionsArr) return;
			for(var key in optionsArr){
				this.optionData[key] = optionsArr[key];
			}
		},
        addGreyOptions : function(optionsArr){
			if(!optionsArr) return;
            var options = this.currentOptionObj;
            for(var key in optionsArr){
                for(var opt in options){
                    if (opt.value == key){
                        opt.disable = true;
                    }
                }
            }
		},
        create : function(box,type,value,onChangeFilterHandler,dropdownId,className){ //value can be string or integer
            var obj = former.getObject(box);
            var defaultText = '';
            var defaultValue = '';
			var cn = className ? " " + className : "";
			if(!obj) return;
            if (value!=null){
                if (typeof(value)=='string'){
                    if(this.optionData[type].length){
                        var arr = this.optionData[type];
                        for (var i=0;i<arr.length;i++){
                            if (typeof(arr[i])!='string' && arr[i]["value"] == value){
                                defaultText = arr[i]["name"];
                                defaultValue = arr[i]["value"];
                                break;
                            }
                        }
                    }
                }else{
                    if(this.optionData[type].length > value){
                        var arr = this.optionData[type];
                        if (typeof(arr[value])!='string'){
                            defaultText = arr[value]["name"];
                            defaultValue = arr[value]["value"];
                        }else{
                            defaultValue = defaultText = arr[value];
                        }
                    }
                }
            }else{
                if(this.optionData[type].length){
                    var arr = this.optionData[type];
                    if (typeof(arr[0])!='string'){
                        defaultText = arr[0]["name"];
                        defaultValue = arr[0]["value"];
                    }else{
                        defaultValue = defaultText = arr[0];
                    }
                }
            }
			var dBox = document.createElement("div");
			var dText = document.createElement("div");
			var dArrow = document.createElement("div");
			dBox.className = "dropDown" + cn;
			dText.className = "dText";
			dArrow.className = "dArrow";
			dBox.onclick = new Function("former.dropdown.show(this,'"+type+"',null,"+onChangeFilterHandler+")");
			dBox.appendChild(dText);
			dBox.appendChild(dArrow);
			obj.appendChild(dBox);
			if(dropdownId) dBox.id = dropdownId;
			dText.innerHTML = defaultText;
			dBox.style.width = dText.clientWidth + dArrow.clientWidth + 6 + "px";
            this.getOptions(dBox,type);
			this.setSelectedOption(dBox,defaultText);
			this.setValue(dBox,defaultText);
			return dBox;
		},
		createOptions : function(type,className,position,selectedValue){
			this.currentDPType = type;
			var optionItems = this.currentOptionObj;
			if(!optionItems) return;
			var dArea = position?position:getArea(this.currentDropDown);
			var obj = document.getElementById(type+"_items");
			if(this.currentOption) this.currentOption.style.display = "none";
			if(!obj){
				obj = document.createElement("div");
				obj.id = type + "_items";
				obj.className = className?className:this.optionStyle;
				obj.style.position = "absolute";
				obj.style.overFlow = "hidden";
				document.body.appendChild(obj);
			}
			obj.innerHTML = "";
			var itemDiv;
			for(var i=0; i<optionItems.length; i++){
				if(!optionItems[i] || optionItems[i].value==selectedValue) continue;
				itemDiv = document.createElement("div");
                itemDiv.setAttribute("value",optionItems[i].value);
				itemDiv.innerHTML = optionItems[i].name;
                if (optionItems[i].disable){
                    itemDiv.className = "dropDown_disbleOption";
                }else{
                    itemDiv.onmouseover = new Function("former.dropdown.changeItem(this,'over')");
                    itemDiv.onmouseout = new Function("former.dropdown.changeItem(this,'out')");
                    itemDiv.onmousedown = new Function("former.dropdown.changeItem(this,'down')");
                    itemDiv.onclick = new Function("former.dropdown.changeItem(this,'click')");
                }
				obj.appendChild(itemDiv);
			}
			obj.style.top = dArea.bottom + "px";
			obj.style.left = dArea.left + "px";
			obj.style.display = "";
			var pWidth = dArea.right - dArea.left;
			var aimWidth = obj.offsetWidth>pWidth?obj.offsetWidth:pWidth;
			obj.style.width = aimWidth - 2 + "px";
            if (optionItems.length > this.showOptionsNum){
			   obj.style.height = this.showOptionsNum*20 + "px";
			}else{
			   obj.style.height = "auto";
			}
			this.currentOption = obj;
			if(!document.onclick) document.onclick = former.dropdown.judgeOptions;
		},
		show : function(obj,type,className,onchangeEvent,greyItem){
			if(obj.className.indexOf("dropDown_disabled")>-1) return;
			if(obj==this.currentDropDown && this.currentOption.style.display==""){
				this.hideOptions();
				return;
			}
            var selectedValue = "";//TODO
            //Add unique id for each dropdown            
            var unique_id  = this.getUniqueId(obj);
            
			if(typeof(onchangeEvent)=="function"){
                this.dropDownEvent = onchangeEvent;
            }else{
                this.dropDownEvent = null;
            }
			this.currentDropDown = obj;
            this.currentOptionObj = this.getOptions(obj,type);
			var dArea = getArea(this.currentDropDown);
            if (greyItem){this.addGreyOptions(greyItem);}
			this.createOptions(type,className,dArea,selectedValue);
		},
		showIframeDropdown : function(iframeId,objId,type,className,onChangeEvent){
			var fm = document.getElementById(iframeId);
			var obj = fm.contentWindow.document.getElementById(objId);
			if(typeof(onchangeEvent)=="function") this.dropDownEvent = onchangeEvent;
			if(obj==this.currentDropDown && this.currentOption.style && this.currentOption.style.display==""){
				this.hideOptions();
				return;
			}
			this.currentDropDown = obj;
            this.currentOptionObj = this.getOptions(obj,type);
			var dArea = getIframeObjArea(iframeId,this.currentDropDown);
			this.createOptions(type,className,dArea);
		},
        getUniqueId : function(obj){            
            var unique_id = "";
            if (obj.getAttribute("ddid")==null) {
                unique_id = parseInt(Math.random()*1000000);
                obj.setAttribute("ddid",unique_id);
                this.objects[unique_id] = {};
            }else{
                unique_id = obj.getAttribute("ddid");
            }
            return unique_id;
        },
        getOptions : function(obj,type){
            var unique_id  = this.getUniqueId(obj);
            if (this.objects[unique_id]["options"]==null){
                var optionItems = this.optionData[type];
				if(!optionItems) return;
                this.objects[unique_id]["options"] = [];
                for (var i=0; i<optionItems.length; i++){
                    this.objects[unique_id]["options"][i] = this.createNewOption();
                    if (typeof(optionItems[i])=="string"||typeof(optionItems[i])=="number"){
                        this.objects[unique_id]["options"][i].name= optionItems[i];
                        this.objects[unique_id]["options"][i].value= optionItems[i];
                    }else{
                        this.objects[unique_id]["options"][i].name= (optionItems[i]["name"]!=null)?optionItems[i]["name"]:"";
                        this.objects[unique_id]["options"][i].value= (optionItems[i]["value"]!=null)?optionItems[i]["value"]:"";
                        this.objects[unique_id]["options"][i].disable= (optionItems[i]["disable"]!=null)?optionItems[i]["disable"]:false;
                        this.objects[unique_id]["options"][i].selected= (optionItems[i]["selected"]!=null)?optionItems[i]["selected"]:false;
                    }
                }
            }
            return this.objects[unique_id]["options"];
        },
		resetOptions : function(obj,type,optionData){
            var unique_id  = this.getUniqueId(obj);
            this.objects[unique_id]["options"] = null;
			this.optionData[type] = optionData;
            this.getOptions(obj,type);
        },
        createNewOption : function(){
            var option = new FormOption();
            return option;
        },
        addOption : function(obj,type,newOption,index){
            var optionItems = this.getOptions(obj,type);
            
            if (index==null) index = optionItems.length-1;
            var temp_opt,last_opt;
            for (var i=0; i<optionItems.length; i++){
                if (index==i){
                    temp_opt = optionItems[index];
                    optionItems[index] = newOption;
                    optionItems[index] = newOption;
                }
                if (i>index){
                    temp_opt = optionItems[i];
                    optionItems[i] = last_opt;
                }
                last_opt = temp_opt;
            }
            optionItems[optionItems.length] = last_opt;
            return optionItems;
        },
        removeOption : function(obj,type,removeOption){
            var optionItems = this.getOptions(obj,type);
            var temp_opt,last_opt;
            for (var i=0; i<optionItems.length; i++){
                if (optionItems[i].value==removeOption.value && i+1<optionItems.length){ 
                    optionItems[i] = optionItems[i+1];
                }
            }
            return optionItems.pop();
        },
		hideOptions : function(){
            if (this.currentOption) this.currentOption.style.display = "none";
		},
		changeItem : function(obj,type){
			if(type=="over"){
				obj.className = "optionOver";
			}else if(type=="out"){
				obj.className = "";
			}else if(type=="down"){
				obj.className = "optionDown";
			}else if(type=="click"){
				var value,name;
                if (typeof(obj)=="string"){
                    value = obj;
                    name = obj;
                }else{
                    value = obj.getAttribute("value");
                    name = obj.innerHTML;
                }
				var d = getChild(this.currentDropDown,0);
				this.currentOption.style.display = "none";
				if(this.changeOptionValue && d.innerHTML!==name){
					var lastValue = d.innerHTML;
                    this.setSelectedOption(this.currentDropDown,d.innerHTML);
                    this.lastSelectOption = this.getSelectedOption(this.currentDropDown);
					var dId = this.currentDropDown.id;
					var _p = d.parentNode;
					var _pOld = parseInt(_p.getAttribute("_oldWidth"));
					if(!_pOld){
					    _pOld = _p.offsetWidth
					    _p.setAttribute("_oldWidth",_pOld);
					}
					d.innerHTML = name;
					var cs = getChild(_p);
					var _pNew = parseInt(cs[0].offsetWidth + cs[1].offsetWidth + 8);
					if(_pNew > _pOld){
						_p.style.width = _pNew + "px";
					}else if(_pNew < _pOld){
						_p.style.width = _pOld + "px";
					}
					if(_pNew!=_pOld && dId && typeof(this.onResizeEvents[dId])=="function"){
						this.onResizeEvents[dId](this.currentDropDown);
					}
                    this.setSelectedOption(this.currentDropDown,name);
					//auto adject text container's width
					var dBox = this.currentDropDown;
					if (dBox) {
						dBox.style.width = dBox.children[0].clientWidth + dBox.children[1].clientWidth + 6 + "px";
					}
				    if(this.dropDownEvent) this.dropDownEvent(name,lastValue,this.currentDropDown.childNodes[0].id);
				}
				if(!this.changeOptionValue && this.dropDownEvent){
					this.dropDownEvent(name);
				}
			}
		},
        setSelectedOption : function(obj,value){
            obj.setAttribute("d_value",value);
            var unique_id  = this.getUniqueId(obj);
            var optionItems = this.objects[unique_id]["options"];
            for (var i in optionItems){
                var opt = optionItems[i];
                if (opt.name == value){
                    opt.selected = true;
                }else{                            
                    opt.selected = false;
                }
            }    
        },
        getSelectedOption : function(obj){
            var unique_id  = this.getUniqueId(obj);
            var optionItems = this.objects[unique_id]["options"];
            for (var i in optionItems){
                var opt = optionItems[i];
                if (opt.selected){
                    return opt;
                }
            }    
            return null;
        },
		judgeOptions : function(e){
			var e = e||window.event;
			var dObj = getArea(former.dropdown.currentDropDown);
			var oObj = getArea(former.dropdown.currentOption);
			if(!overArea(dObj,e) && !overArea(oObj,e)){
				if(former.dropdown.currentOption) former.dropdown.currentOption.style.display = "none";
				document.onclick = null;
				former.dropdown.currentDropDown = null;
				former.dropdown.currentOption = null;
			}
		},
		setValue : function(id,value,fireOnChange){
			var d,v;
			var d = former.getObject(id);
			if(!d) return;
			v = d.getElementsByTagName("div");
			if(v[0]) v[0].innerHTML = value;
			//fire onchange function
			if(fireOnChange){
				if(typeof(fireOnChange)=="function"){
				    fireOnChange(value);	
				}else if(this.dropDownEvent){
					this.dropDownEvent(value);
				}
			}
		},
		getValue : function(id){
		    var cs = getChild(id);
			if(!cs || !cs.length) return '';
			var value = "";
			for(var i=0; i<cs.length; i++){
			    if(cs[i].className=="dText"){
				    value = cs[i].innerHTML;
					break;
				}
			}
			return value;
		},
		setState : function(id,enable){
			var d = document.getElementById(id);
			if(enable && d.className.match(/dropDown\_disabled/)){
				d.className = d.className.replace(/dropDown_disabled/,'dropDown');
			}
			if(!enable && !d.className.match(/dropDown\_disabled/)){
				d.className = d.className.replace(/dropDown/,'dropDown_disabled');
			}
		}
	}
}
var FormOption = function(){
    this.name = "";
    this.value = "";
    this.disable = false;
    this.selected = false;
}