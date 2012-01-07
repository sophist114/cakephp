var ArrMenuUrl = {
	"menu_home" : "home.php",
	"menu_customer" : "pages/customer/customers.php",
	"itemCustomers" : "pages/customer/customers.php",
	"itemCases" : "pages/customer/cases.php",
	"menu_appliance" : "pages/hardware/hardware.php",
	"menu_operating" : "frameset.php",
	"menu_gpdb" : "pages/gpdb/gpdb.php",
	"menu_admin" : "pages/admin/eventList.php"
};
var getRootPath = function(){
	var scriptItems = document.getElementsByTagName("script");
	var src = "";
	var reg = /js\/common\.js$/i;
	for(var i=0; i<scriptItems.length; i++){
		if(scriptItems[i].src.match(reg)){
			src = scriptItems[i].src;
			break;
		}
	}
	/*var strFullPath = window.document.location.href;
    var strPath = window.document.location.pathname;
    var pos = strFullPath.indexOf(strPath);
    var prePath = strFullPath.substring(0, pos);*/
	var rootPath = src.replace(reg,"").toString();
	return rootPath;
};
var loadScripts = function(src, callback) {
	//check whether loaded
	var scriptItems = document.getElementsByTagName("script");
	if(scriptItems.length>0){
		for(var i=0; i<scriptItems.length; i++){
			if(scriptItems[i].src.indexOf(src)>-1){
				if(typeof(callback)=="function"){ callback(); }
				return;
			}
		}
	}
	//start loading
	if(typeof(src) != "object"){ var scripts = [src]; }
	var rootPath = getRootPath();
	var HEAD = document.getElementsByTagName("head").item(0) || document.documentElement;
	var s = new Array();
	var loaded = 0;
	var _src = "";
	for(var i=0; i<scripts.length; i++) {
		s[i] = document.createElement("script");
		s[i].setAttribute("type","text/javascript");
		_src = scripts[i];
		_src = rootPath + _src.replace(/^\/+/,"");
		s[i].setAttribute("src",_src);
		HEAD.appendChild(s[i]);
		if(!0){ //if not IE
			s[i].onload = function(){
				if(typeof(callback)=="function"){ callback(); }
			}
		}else{
			s[i].onreadystatechange = function(){
				if(s[i].readyState == 'loaded' || s[i].readyState == 'complete'){
					if(typeof(callback)=="function"){ callback(); }
				}
			}
		}
	}
};
var loginWebSite = function(userName, passWord){
	var sUrl = getRootPath()  + "webservice/LogToolProxy.php";
	var postData = "action=login&userName=" + userName + "&password=" + passWord; 
	var callback = {
		success: function(oResponse) {
			var result = oResponse.responseText;
			if(result===''){
				window.location.reload();
			}
		}
	};
	ajaxManager.request('loginWebSite', sUrl, callback, "POST", postData); 
}
var checkLoginStatus = function(){
	loadScripts("js/messager.js",function(){
		messager.popper.show({
			id : "sessionExpiredPrompt",
			title : "Login Again",
			content : '<div style="padding:5px 0;">' + messager.get(3) + '</div>'
			+ '<table border="0" cellspacing="5" cellpadding="0" width="100%">'
			+   '<tr>'
			+ 	   '<td align=right>User Name: </td>'
			+ 	   '<td><input id="msgUserName" value="" /></td>'
			+   '</tr>'
			+   '<tr>'
			+      '<td align=right>Password: </td>'
			+ 	   '<td><input id="msgPassword" value="" /></td>'
			+   '</tr>'
			+ '</table>',
			buttons : {
				"btnLogin" : {
					"lable" : "Login",
					"onclick" : function(){
						var reg = /^\s+|\s+$/;
						var userName = document.getElementById("msgUserName").value.replace(reg,'');
						var passWord = document.getElementById("msgPassword").value.replace(reg,'');
						loginWebSite(userName, passWord);
					}
				},
				"btnCancel" : {
					"lable" : "Cancel",
					"onclick" : function(){
						window.location.href = getRootPath() + "login.php?url=" + escapeString(window.location.href);
						messager.popper.close("sessionExpiredPrompt");
					}
				}
			}
		});
	});
}
/* ajax managements based on YAHOO.util.Connect */
var ajaxManager = {
    connections : {},
	defaultMethod : "GET",
	getConncetionObject : function(id){
	    var o = typeof(id)=="string"?this.connections[id]:id;
		return o;
	},
	request : function(requestId,sUrl,callback,method,postData){
	    if(typeof(YAHOO.util.Connect)=="undefined") return;
	    var cObj = this.getConncetionObject(requestId);
		if(cObj && YAHOO.util.Connect.isCallInProgress(cObj['connection'])){
		    return;
		}else{
		    method = method?method:this.defaultMethod;
			if(cObj && cObj['connection']){
			    YAHOO.util.Connect.abort(cObj['connection']);
			}
			if (sUrl.indexOf('?') > -1) {
				sUrl = sUrl + '&t=' + new Date().getTime();
			} else {
				sUrl = sUrl + '?t=' + new Date().getTime();
			}
			//reset callbak for check session
			var callback = callback || {};
			if(!callback.success){ callback.success = function(){}; }
			var successFunction = callback.success;
			callback.success = function(o){
				if(o.responseText.match(/\"session\"/)){
					var data = YAHOO.lang.JSON.parse(o.responseText);
					if(data.session === false){
						checkLoginStatus();
						ajaxManager.abortAll();
						return;
					}
				}else{
					successFunction(o);	
				}
			};
		    var connectObj = YAHOO.util.Connect.asyncRequest(method,sUrl,callback,postData);
			cObj = {
			    uri : sUrl,
				connection : connectObj
			};
		    this.connections[requestId] = cObj; 
		}
		return cObj;
	},
	isCalling : function(requestId){
	    var cObj = this.getConncetionObject(requestId);
		if(cObj){
		    return YAHOO.util.Connect.isCallInProgress(cObj['connection']);
		}else{
		    return false;
		}
	},
	abort : function(requestIds,callback,isTimeout){
		var ids = typeof(requestId)=="string"?[requestIds]:requestIds;
	    var cObj;
		for(var i=0; i<ids.length; i++){
			cObj = this.getConncetionObject(ids[i]);
			if(cObj && cObj['connection']){
				YAHOO.util.Connect.abort(cObj['connection'],callback,isTimeout);
				ajaxManager.connections[ids[i]] = null;
			}
		}
	},
    abortAll : function(){
	    for(var key in ajaxManager.connections){
		    if(typeof(ajaxManager.connections[key]['connection'].abort)=="function"){
				ajaxManager.connections[key]['connection'].abort();
			}
		}
		ajaxManager.connections = {};
	}
};

var Dropdownlist = {

	init: function(controlId, data) {
		var ctrl = document.getElementById(controlId);
		Dropdownlist.clearDropdownlist(ctrl);
		for (var cnt = 0, length = data.length; cnt < length; cnt++) {
			Dropdownlist.addOption(ctrl, data[cnt].text, data[cnt].value);
		}
	},
	
	clearDropdownlist: function(ctrl) {
		var count = ctrl.options.length;
		for (cnt = count - 1; cnt >= 0; cnt--) {
			ctrl.options[cnt] = null;
		}
	},
	
	addOption: function(ctrl, text, value) {
		var option = document.createElement("option");
		option.appendChild(document.createTextNode(text));
		option.setAttribute("value", value);
		ctrl.appendChild(option);
	},
	
	getSelectedValues: function(controlId) {
		var control = document.getElementById(controlId);
		var values = '';
		var option = null;
		for (var cnt = 0, length = control.options.length; cnt < length; cnt++) {
			option = control.options[cnt];
			if (option.selected) {
				if (values == '') {
					values = option.value.replace(' ', '');
				} else {
					values += (',' + option.value.replace(' ', ''));
				}
			}
		}
		return values;
	},
	
	getItems: function(ctrl) {
		var obj = [];
		var option = null;
		for (var cnt = 0, length = ctrl.options.length; cnt < length; cnt++) {
			option = ctrl.options[cnt];
			obj.push({"text" : option.text, "value" : option.value});
		}
		return obj;
	},
	
	getValueArray: function(ctrl) {
		var obj = [];
		var option = null;
		for (var cnt = 0, length = ctrl.options.length; cnt < length; cnt++) {
			option = ctrl.options[cnt];
			obj.push(option.value);
		}
		return obj;
	},
	
	getTextArray: function(ctrl) {
		var obj = [];
		var option = null;
		for (var cnt = 0, length = ctrl.options.length; cnt < length; cnt++) {
			option = ctrl.options[cnt];
			obj.push(option.text);
		}
		return obj;
	}
	
};
function isIE(){
	return !!(document.all && navigator.userAgent.indexOf('Opera') === -1);
	
}
String.prototype.trim = function(){   
	return this.replace(/(^\s*)|(\s*$)/g,"");   
};
String.prototype.replaceAll = function(fromStr, toStr) {
	return this.replace(new RegExp(fromStr,"gm"), toStr);
};

Array.prototype.indexOf = function(element /*, from*/) {
	var len = this.length;
	var from = Number(arguments[1]) || 0;
	from = (from < 0) ? Math.ceil(from) : Math.floor(from);
	if (from < 0) {
		from += len;
	}
	for (; from < len; from++) {
		if (from in this && this[from] === element) {
			return from;
		}
	}
	return -1;
};
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function formatSize(input) {
	var value = parseFloat(input);
	if (!value) {
		return "0 B";
	}
	if (value < 1024) {
		return parseInt(value) + " B";
	}
	value = value / 1024;
	if (value < 1024) {
		return parseInt(value) + " KB";
	}
	value = value / 1024;
	if (value < 1024) {
		return parseInt(value) + " MB";
	}
	value = value / 1024;
	if (value < 1024) {
		return parseInt(value) + " GB";
	}
	value = value / 1024;
	return parseInt(value) + " TB";
}

function showControl(controlId) {
	var ctrl = document.getElementById(controlId);
	if (ctrl != null) {
		ctrl.style.display = 'block';
	}
}

function hideControl(controlId) {
	var ctrl = document.getElementById(controlId);
	if (ctrl != null) {
		ctrl.style.display = 'none';
	}
}

function getCurrentStyle(element) {
	if (element.currentStyle) {
		return element.currentStyle;
	}
	return document.defaultView.getComputedStyle(element, null);
}

function hideShow(containId, icon) {
	var container = document.getElementById(containId);
	if (container == null) {
		return;
	}
	var display = getCurrentStyle(container).display;
	if (display == 'none') {
		display = 'block';
		//iconSrc = iconSrc.replace('close', 'open');
		icon.className="arrow_open";
	} else {
		display = 'none';
		//iconSrc = iconSrc.replace('open', 'close');
		icon.className="arrow_close";
	}
	container.style.display = display;
}

function mouseOver(obj) {
	if(obj.className != 'selected'){
		obj.setAttribute("lastClass",obj.className)
		//obj.attributes["lastClass"].nodeValue = obj.className;
		obj.className = "mouseOver";
	}
}

function mouserOut(obj) {

	var lastClass = obj.getAttribute("lastClass");
	if (obj.className != 'selected' && lastClass) {
		obj.className = lastClass;
	}
}

function setValue(objId, value) {
	var obj = document.getElementById(objId);
	if (obj && typeof(obj.value) != 'undefined') {
		obj.value = value;
	}
}

function getValue(objId) {
	var obj = document.getElementById(objId);
	if (obj && typeof(obj.value) != 'undefined') {
		return obj.value
	}
	return null;
}

function getInnerHTML(controlId) {
	return document.getElementById(controlId).innerHTML;
}

function setInnerHTML(controlId, value) {
	var obj = document.getElementById(controlId);
	if(obj) obj.innerHTML = value;
}

function setFocus(objId) {
	var obj = document.getElementById(objId);
	if (obj) {
		obj.focus();
	}
}

function changeMenu(obj,contentUrl){
	showWaiting();
	var objIframe = document.getElementById("iframe1");
	objIframe.src = contentUrl;
	objIframe.contentWindow.location.replace(contentUrl);
	switch(obj.id){
		case 'menu_home':  hideDiv('custmoerSubMenu');break;
		case 'menu_customer': showDiv('custmoerSubMenu');
							  document.getElementById('itemCustomers').className="selectedItem";
							  document.getElementById('itemCases').className="normalItem";
							  document.getElementById('itemCustomers').setAttribute("onclick","");
							  document.getElementById('itemCases').setAttribute("onclick","changeMenu(this, '"+ArrMenuUrl['itemCases']+"');");
							  break;
		case 'itemCustomers': document.getElementById('itemCustomers').className="selectedItem";
							  document.getElementById('itemCases').className="normalItem";
							  document.getElementById('itemCustomers').setAttribute("onclick","");
							  document.getElementById('itemCases').setAttribute("onclick","changeMenu(this, '"+ArrMenuUrl['itemCases']+"');");
							  break;
		case 'itemCases': 	  document.getElementById('itemCases').className="selectedItem";
							  document.getElementById('itemCustomers').className="normalItem";
							  document.getElementById('itemCases').setAttribute("onclick","");
							  document.getElementById('itemCustomers').setAttribute("onclick","changeMenu(this, '"+ArrMenuUrl['itemCustomers']+"');");
							  break;
		case 'menu_appliance': hideDiv('custmoerSubMenu');break;
		case 'menu_operating': hideDiv('custmoerSubMenu');break;
		case 'menu_gpdb': hideDiv('custmoerSubMenu');break;
		case 'menu_admin': hideDiv('custmoerSubMenu');break;
	}
	setIframeHeight();
}

function changeContent(url) {
	showWaiting();
	if (url.indexOf('?') > 0) {
		url = url + '&t=' + new Date().getTime();
	} else {
		url = url + '?t=' + new Date().getTime();
	}
	window.parent.mainFrame.document.location = url;
}

function changeMenuStyle(objMenu)
{
	var MenuList = ["menu_home","menu_customer","menu_appliance","menu_operating","menu_gpdb","menu_admin"];
	var SelectedList = ["menu_left_selected","menu_center_selected","menu_right_selected"];
	var UnselectedList = ["menu_left","menu_center","menu_right"];
	for(var cnt=0;cnt<MenuList.length;cnt++)
	{
		var menuLeft = document.getElementById(MenuList[cnt]+"_l");
		var menuCenter = document.getElementById(MenuList[cnt]+"_c");
		var menuRight = document.getElementById(MenuList[cnt]+"_r");
		var menuRow = document.getElementById(MenuList[cnt]);
		if(objMenu.id == MenuList[cnt])
		{
			if(menuLeft && menuCenter && menuRight)
			{
				menuLeft.className = SelectedList[0];
				menuCenter.className = SelectedList[1];
				menuRight.className = SelectedList[2];
			}
			objMenu.setAttribute("onclick","");
		}
		else
		{
			if(menuLeft && menuCenter && menuRight)
			{
				menuLeft.className = UnselectedList[0];
				menuCenter.className = UnselectedList[1];
				menuRight.className = UnselectedList[2];
			}
			var strUrl = ArrMenuUrl[menuRow.id];
			if(typeof(strUrl) == "undefined") {
				strUrl = "";
			}
			/*switch(menuRow.id){
				case 'menu_home':strUrl = 'home.php';break;
				case 'menu_customer':strUrl = 'pages/customer/customers.php';break;
				case 'menu_appliance':strUrl = 'pages/hardware/hardware.php';break;
				case 'menu_operating':strUrl = 'frameset.php';break;
				case 'menu_gpdb':strUrl = 'pages/gpdb/gpdb.php';break;
				case 'menu_admin':strUrl = 'pages/admin/eventList.php';break;
			}*/
			menuRow.setAttribute("onclick","changeMenu(this,'"+strUrl+"');changeMenuStyle(this);");
		}
	}
}

function showDiv(id)
{
	var div = document.getElementById(id);
	div.style.display="";
}
function hideDiv(id)
{
	var div = document.getElementById(id);
	div.style.display="none";
}

function AjaxConnector(){
	this.connectId = null;
	this.connectURL = '';
	this.urlParams = null;
	this.completedFunction = null;
	this.queryData = function() {
		if (this.connectId != null && YAHOO.util.Connect.isCallInProgress(this.connectId)) {
			return;
		}
		var url = obj.getURL();
		obj.connectId = YAHOO.util.Connect.asyncRequest(
			'GET', 
			url + '&t=' + new Date().getTime(), 
			{
				success:function(o) {
					var rt = o.responseText;
					rt = rt.replace(/<!\-(.*?)>/,'');
					var rData,data;
					try {
						rData = YAHOO.lang.JSON.parse(rt);
						if(rData){
							data = rData;
							this.completedFunction(data);
						}
					}catch(x){
						this.completedFunction(null);
					}
				},
				failure:function(o) {
					this.completedFunction(null);
				},
				argument: [pageState, obj]
			}, 
			null
		);
	}
	this.getURL = function(){
		var url = this.connectURL;
		for(key in this.urlParams)
		{
			if(url.indexOf('?')>-1)
			{
				url = url + "&" + key + '=' + this.urlParams[key];
			}
			else
			{
				url = url + "?" + key + '=' + this.urlParams[key];
			}
		}
		return url;
	}
	
}

function showWaiting(){
	var waitingImg = window.top.document.getElementById("waiting_img");
	var waitingText = window.top.document.getElementById("waiting_text");
	
	if(waitingText) waitingText.innerHTML = " Please wait... ";
    return showDialogWindow("waitingBox",false);
}
function hideWaiting(){
	return hideDialogWindow("waitingBox");
}
function showDialogWindow(obj_id,ifDrag){
	var dialogWinObj = window.top.document.getElementById(obj_id);
    if (dialogWinObj==null) return false;
    if (dialogWinObj.style.display=="none"){
		//create overlay
		coverAll(1000);
	}
	if(ifDrag){
		YAHOO.util.Event.onDOMReady(function() {
				var ddObj = new YAHOO.util.DD(obj_id); 
				ddObj.scroll = false;
				ddObj.setHandleElId("handle_"+obj_id); 
		});
	}
	dialogWinObj.style.display = "";
	var winWidth = window.top.document.documentElement.clientWidth;
	var winHeight = window.top.document.documentElement.clientHeight;
	var winScrollTop = window.top.document.documentElement.scrollTop;
	
	var top = (winHeight - dialogWinObj.offsetHeight + winScrollTop)/2;
    var left = (winWidth - dialogWinObj.offsetWidth)/2;
    top = (top<0)?0:top;
    left = (left<0)?0:left;
	dialogWinObj.style.top = top + "px";
	dialogWinObj.style.left = left + "px";
    return true;
}
function hideDialogWindow(obj_id){
	var dialogWinObj = window.top.document.getElementById(obj_id);
    if (dialogWinObj==null) {dialogWinObj = document.getElementById(obj_id);}
	if(dialogWinObj==null) return false;
	dialogWinObj.style.display = "none";
	discoverAll();
    return true;
}

//disable all
function coverAll(level){
    var coverId = "coverObject";
	var coverObj = window.top.document.createElement("div");
	var wSize = getWindowSize();
	coverObj.style.position = "absolute";
	coverObj.id = coverId;
	coverObj.style.background = "#E2EFFC";
	coverObj.style.zIndex = level;
	coverObj.style.display = "";
	coverObj.style.top = "0px";
	coverObj.style.left = "0px";
	coverObj.style.width = "100%";//wSize.page.scrollWidth + "px";
	var wheight = wSize.height > wSize.page.scrollHeight ? "100%" : wSize.page.scrollHeight + "px";
	coverObj.style.height = wheight;//wSize.page.scrollHeight + "px";
	coverObj.onclick = function(){return false};
	coverObj.style.filter = "alpha(opacity=40)";
	coverObj.style.opacity = "0.4";
	window.top.document.body.appendChild(coverObj);
}
//enable all
function discoverAll(){
    var coverObj = window.top.document.getElementById("coverObject");
	if(coverObj) window.top.document.body.removeChild(coverObj);
}

function setIframeHeight(){
	var obj = document.getElementById('iframe1');
	var header = document.getElementById('header');
	if(obj){
		obj.height = window.parent.document.documentElement.clientHeight - header.clientHeight + "px";
	}
}
 

 //notice: this function will return an array.
function getChildByTagName(oInfo,tagName,filter){
    var obj = typeof(oInfo)=="string"?document.getElementById(oInfo):oInfo;
	if(!obj || typeof(obj.getElementsByTagName)=='undefined') return [];
	var cs = obj.getElementsByTagName(tagName);
	if(typeof(filter)=='function'){
	    var getItems = [];
		for(var i=0;i<cs.length;i++){
			if(filter(cs[i])) getItems[getItems.length] = cs[i];
		}
		return getItems;
	}else{
		return cs;
	}
}

function getChild(objInfo,t){
	this.getChildNode = function(oInfo,w){
        var obj = typeof(oInfo)=="string"?document.getElementById(oInfo):oInfo;
		if(!obj) return;
		var cns = obj.childNodes;
		var children;
		if(navigator.userAgent.match(/Firefox/)){//just go for firefox.
			children = [];
			for(var i=0; i<cns.length; i++){
				if(!cns[i].tagName) continue;
				children[children.length] = cns[i];
			}
		}else{
		   children = cns;
		}
		if(w!=null){
			var n = parseInt(w);
			if(Math.abs(n)>children.length){
				n = n>0?children.length:0;
			}
			if(n<0) n = children.length + n;
			return children[n];
		}else{
			return children;
		}
	}
	if(typeof(t)=="object"){
		var aimObj = typeof(objInfo)=="string"?document.getElementById(objInfo):objInfo;
	    for(var f=0; f<t.length; f++){
			aimObj = this.getChildNode(aimObj,t[f]);
		}
		return aimObj;
	}else{
		return this.getChildNode(objInfo,t);
	}
}
function getElement(objInfo){
	var obj = typeof(objInfo)=='object'?objInfo:document.getElementById(objInfo);
	return obj;
}
function getWindowSize(){
	var pageObj = document.documentElement || document.body;
    var w = pageObj.clientWidth || pageObj.offsetWidth; 
    var h = pageObj.clientHeight || pageObj.offsetHeight;
	var sw = pageObj.scrollWidth>w?pageObj.scrollWidth:w;
	var sh = pageObj.scrollHeight>h?pageObj.scrollHeight:h;
    return {
		page : pageObj,
		width: w,
		height: h,
		scrollWidth : sw,
		scrollHeight : sh
	}; 
}
function getArea(objInfo,scrollObj){
	var obj = getElement(objInfo);
	if(!obj) return;
	var s = getWindowSize();
	var sTop = s.page.scrollTop;
	var sLeft = s.page.scrollLeft;
	var position;
	if(typeof(obj.getBoundingClientRect)=="object"){
		var area = obj.getBoundingClientRect();
		var _top = area.top + sTop;
		var _left = area.left + sLeft;
		var _right = _left + obj.offsetWidth;
		var _bottom = _top + obj.offsetHeight;
		position = {
		  object : obj,
		  top : _top,
		  left : _left,
		  right : _right,
		  bottom : _bottom,
		  getBy:"bound"
		}
	}else{
		var e = obj;
		var t = e.offsetTop;
		var l = e.offsetLeft;
		while(e=e.offsetParent){
			t += e.offsetTop;
			l += e.offsetLeft;
		}
		var p = obj.parentNode;
		while(p&&p.tagName!='BODY'&&p.tagName!='HTML'){
		    t -= p.scrollTop;
		    l -= p.scrollLeft;
			p = (p.parentNode||null);
		}
		var r = l + obj.offsetWidth;
		var b = t + obj.offsetHeight;
		position = {object:obj,left:l,top:t,right:r,bottom:b,getBy:"area"};
	}
	return position;
}
function overArea(positionInfo,aimObj){
	var areaObj;
	if(typeof(positionInfo)=="string"){
		areaObj = getArea(positionInfo);
	}else{
		areaObj = positionInfo;
	}
	if(!areaObj || !aimObj) return;
	var s = getWindowSize();
	var _x = aimObj.clientX + s.page.scrollLeft;
	var _y = aimObj.clientY + s.page.scrollTop;
    if(_x<areaObj.left || _x>areaObj.right || _y<areaObj.top || _y>areaObj.bottom){
		return false;
	}else{
		return true;
	}
}
function getNearByPosition(sourceObj,popObj,areaObj){
    var ps = getArea(sourceObj);
	var pW = popObj.offsetWidth;
	var pH = popObj.offsetHeight;
	var area;
	if(areaObj){
	    area = getArea(areaObj);
		area.scrollTop = areaObj.scrollTop;
		area.scrollLeft = areaObj.scrollLeft;
	}else{
	    var windowSize = getWindowSize();
	    area = {
		   top : windowSize.page.scrollTop,
		   left : 0,
		   right : windowSize.width + windowSize.page.scrollLeft,
		   bottom : windowSize.height,
		   scrollTop : windowSize.page.scrollTop,
		   scrollLeft : windowSize.page.scrollLeft
		};
	}
	var _l = ps.left - Math.floor(pW/2);
	var _t = ps.top - pH;
	var pRight = _l + pW;
	if(pRight>area.right){
		_l = _l - parseInt(pRight - area.right) - 10;
	}
	if(_l<area.left){
		_l = area.left + 10;
	}
	if(_t<area.top){
		_t = area.top + 10;
	}
	if(_l<0){_l = 10;}
	if(_t<0){_t = 10;}
	var position = {
	    top : _t,
		left : _l
	};
	return position;
}
function addEvent(oTarget,sEventType,funName){
    if(oTarget.addEventListener){
        oTarget.addEventListener(sEventType, funName, false);
    }else if(oTarget.attachEvent){
        oTarget.attachEvent("on" + sEventType, funName);
    }else{
        oTarget["on" + sEventType] = funName;
    }
};
function removeEvent(oTarget,sEventType,funName){
    if(oTarget.removeEventListener){
        oTarget.removeEventListener(sEventType, funName, false);
    }else if(oTarget.detachEvent){
        oTarget.detachEvent("on" + sEventType, funName);
    }else{
        oTarget["on" + sEventType] = null;
    }
};
/* drag drop */
var dragger = {
	_w : 0,
	_h : 0,
	proxy : null,
	fish : null,
	config : {},
	seize : function(objInfo,config){
		var obj = getElement(objInfo);
		if(!obj) return;
		obj.style.position = 'absolute';
		var cfObj = config?config:{};
		var dragBar = cfObj.dragBar?getElement(cfObj.dragBar):obj;
		dragBar.style.cursor = 'move';
		addEvent(dragBar,'mousedown',function(e){dragger.hook(e,obj,cfObj);});
	},
	hook : function (e,objInfo,config){
		var config = typeof(config)=='object'?config:{};
		dragger.config = config;
		var e = e || window.event;
		var obj = objInfo?objInfo:(e.target||e.srcElement);
		dragger.fish = obj;
		var areaBox = typeof(config.area)!='undefined'?config.area:null;
		var ps = getArea(obj,areaBox);
		dragger._w = e.clientX - ps.left;
		dragger._h = e.clientY - ps.top;
		this.createProxy = function(){
		    var _px = document.createElement("div");
		    _px.style.position = "absolute";
		    _px.style.display = "none";
		    document.body.appendChild(_px);
		    return _px;
		}
		if(typeof(config.hasProxy)!='undefined'&&config.hasProxy){
			var pc = this.createProxy();
			var code = typeof(config.fishnet)!='undefined'?config.fishnet.replace('#fish#',obj.innerHTML):obj.innerHTML;
			pc.innerHTML = "<div id='dragContent'>" + code + "</div>";
			pc.style.top = ps.top + "px";
			pc.style.left = ps.left + "px";
			pc.style.width = obj.offsetWidth + "px";
			pc.style.height = obj.offsetHeight + "px";
			pc.style.zIndex = 1111;
			pc.className = typeof(config.proxyClass)!='undefined'?config.proxyClass:"dragProxy";
			dragger.proxy = pc;
		}
		addEvent(document,'mousemove',dragger.going);
		addEvent(document,'mouseup',dragger.stopDrag);
	},
	going : function(e){
		var e = e || window.event;
		var obj = dragger.proxy?dragger.proxy:dragger.fish;
		obj.style.display = "";
		obj.style.top = (e.clientY - dragger._h) + "px";
		obj.style.left = (e.clientX - dragger._w) + "px";
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
		if(typeof(dragger.config.onDragging)=="function") dragger.config.onDragging(e);
	},
	stopDrag : function (e){
		var e = e || window.event;
		removeEvent(document,'mousemove',dragger.going);
		removeEvent(document,'mouseup',dragger.stopDrag);
		if(dragger.proxy){
			document.body.removeChild(dragger.proxy);
			dragger.proxy = null;
		}
		if(typeof(dragger.config.onStopDrag)=="function"){
			dragger.config.onStopDrag(e);
		}
	}
}
function getDefaultRowsPerPage(defaultCount) {
	var url = document.location.href;
	var strQuery = (url.indexOf('=') > -1 ) ? unescapeString(url.substr(url.indexOf('=') + 1)) : '';
	var rowsPerPageNum = (strQuery != '') ? getQueryData(strQuery, 'results') : defaultCount;
	return rowsPerPageNum;
}

function createYuiButton(buttonId, func, prms) {
	if (typeof(func) != 'function') {
		func = null;
	}
	var yuiButton = new YAHOO.widget.Button(buttonId);
	yuiButton.on('click', func);
	// set other attributes
	if (prms != undefined) {
		if (prms.enabled != undefined) {
			setYuiButtonStatus(yuiButton, prms.enabled);
		}
		if (prms.display != undefined) {
			display(buttonId, prms.display?1:0);
		}
		if (prms.width != undefined) {
			YAHOO.util.Dom.setStyle(buttonId, 'width', prms.width);
		}
	}
	
	return yuiButton;
}

function setYuiButtonStatus(yuiButton, enabled) {
	var removeClassName = !enabled ? 'yui-button yui-push-button' : 'yui-button-disabled yui-push-button-disabled';
	var addClassName = enabled ? 'yui-button yui-push-button' : 'yui-button yui-push-button yui-button-disabled yui-push-button-disabled yui-button yui-push-button';
	yuiButton.removeClass(removeClassName);
	yuiButton.addClass(addClassName);
	yuiButton.disabled = !enabled;
	yuiButton._button.disabled = !enabled;
	yuiButton.set("disabled", !enabled);
}
function displayOptions(obj, type, eObj) {
	eventObj = eObj;
	former.dropdown.changeOptionValue = 1;
    if (obj.tagName!="DIV") {
        obj = getChild(obj, 0);
    }
    if (eventObj && typeof(eventObj) == "function") {
        former.dropdown.show(obj, type, "dropDownItems", eventObj);
    } else {
        former.dropdown.show(obj, type, "dropDownItems");
    }
}

function changeRowPerPage(num,lastnum,objId) {
	var dataTable = CustomDataTable.prototype.Hash[objId.replace("_PerPageNum","")];
    dataTable.pagination.setRowsPerPage(num);
}

function addOption(ctrl, text, value) {
	var option = document.createElement("option");
	option.appendChild(document.createTextNode(text));
	option.setAttribute("value", value);
	ctrl.appendChild(option);
}
function escapeString(str,times){
	if(!str) return str;
	var str = encodeURIComponent(str);
	str = str.replace(/\!/g,'%21');
	str = str.replace(/\'/g,'%27');
	str = str.replace(/\(/g,'%28');
	str = str.replace(/\)/g,'%29');
	str = str.replace(/\*/g,'%2a');
	if(times){
		for(var i=1;i<times;i++){
			str = encodeURIComponent(str);
		}
	}
	return str;
}
function unescapeString(str){
	if(!str) return str;
	var str = decodeURIComponent(str);
	return str;
}
function getSavedSearchCondition(name) {
	var arr = document.cookie.match(new RegExp("(^| )"+name+"=([^;]*)(;|$)"));
	if (arr != null) {
		return unescapeString(arr[2]);
	}
	return '';
}
function setSavedSearchCondition(name, value) {
	document.cookie = name + "=" + escapeString(value);
}

function insertAfter(newEl, targetEl)
{
	var parentEl = targetEl.parentNode;
	
	if(parentEl.lastChild == targetEl){
		parentEl.appendChild(newEl);
	}else{
		parentEl.insertBefore(newEl,targetEl.nextSibling);
	}            
}

function changeButtonClass(obj, className) {
    obj.className = className;
}

function getValue(controlId) {
	if (controlId == null || controlId == '') {
		return;
	}
    var ctrl = window.top.document.getElementById(controlId);
	if (ctrl != null) {
		return ctrl.value;
	}
	return '';
}
function getSelectedValue(control_id) {
	var control = document.getElementById(control_id);
	var index=control.selectedIndex; 
	var val = control.options[index].value;
	return val;
}

function getOneCheckBoxValue(key,itemName){
	var items = document.getElementsByName(itemName);
	for(var i=0;i<items.length;i++){
		if(items[i].checked){
			return items[i].attributes[key].value;
		}
	}
}

function getCheckBoxValues(key,itemName){
	var returnValue = '';
	var items = document.getElementsByName(itemName);
	for(var i=0;i<items.length;i++){
		if(items[i].checked){
			if(returnValue){
				returnValue += ",";
			}
			returnValue +=items[i].attributes[key].value;
		}
	}
	
	return  returnValue;
}

function getCheckBoxItem(itemName){
	var items = document.getElementsByName(itemName);
	for(var i=0;i<items.length;i++){
		if(items[i].checked){
			return items[i];
		}
	}
}

function setSelectedValue(control_id,value){
	var control = document.getElementById(control_id);
	control.value = value; 
}

function setControlDisabled(controlId,disabled){
	var control = document.getElementById(controlId);
	control.disabled = disabled;

}

/*validation Start*/
function checkNumber(e){
	var key = window.event ? e.keyCode : e.which;
	if(key==8){
		return true;
	}
	var keychar = String.fromCharCode(key); 
	var reg = /^\d+$/;
	return reg.test(keychar);
}

function checkDouble(e){
	var key = window.event ? e.keyCode : e.which;
	if(key==8){
		return true;
	}
	var keychar = String.fromCharCode(key); 
	if(key==46){
		return true;
	}

	var reg = /^\d+$/;
	return reg.test(keychar);
}

function clearNoNum_Double(value)
{
	var strReturn = value;
	strReturn = strReturn.replace(/[^\d.]/g,"");  
	strReturn = strReturn.replace(/^\./g,"");  
	strReturn = strReturn.replace(/\.{2,}/g,"."); 
	strReturn = strReturn.replace(".","$#$").replace(/\./g,"").replace("$#$",".");  
	return strReturn;
}

function clearNoNum_Number(value)
{
	var strReturn = value;
	strReturn = strReturn.replace(/[^\d]/g,"");
	return strReturn;
}
/*validation End*/

function HTMLEnCode(str)   
{   
	 var s = "";   
	 if(str.length == 0) return "";   
	 //s = str.replace(/&/g , "&amp;");   
	 s = str.replace(/</g , "&lt;");   
	 s = s.replace(/>/g , "&gt;");   
	 s = s.replace(/ /g,  "&nbsp;");   
	 s = s.replace(/\'/g, "'");   
	 s = s.replace(/\"/g, "&quot;");   
	 s = s.replace(/\n/g, "<br>");   
	 return    s;   
} 
   
function HTMLDeCode(str)   
{   
	 var s = "";   
	 if(str.length == 0) return "";   
	 //s = str.replace(/&amp;/g , "&");   
	 s = str.replace(/&lt;/g , "<");   
	 s = s.replace(/&gt;/g , ">");   
	 s = s.replace(/&nbsp;/g , " ");   
	 s = s.replace(/'/g , "\'");   
	 s = s.replace(/&quot;/g , "\"");   
	 s = s.replace(/<br>/g , "\n");   
	 return    s;   
}

function collapse(obj, container, onCollapse) {
	if (obj.className == 'section_icon_open') {
		obj.className = 'section_icon_close';
		hideControl(container);
	} else {
		obj.className = 'section_icon_open';
		showControl(container);
	}
	if(typeof(onCollapse)=="function") onCollapse();
}

Date.parseFormattedString = function(string) {
arr = string.split(" ");
arrDate = arr[0].split("-");
arrTime = arr[1].split(":");
arrYear = arrDate[0];
arrMonth = arrDate[1]-1;
arrDay = arrDate[2];
arrHour = arrTime[0];
arrMinute = arrTime[1];
arrSecond = arrTime[2];
return new Date(arrYear, arrMonth, arrDay, arrHour, arrMinute, arrSecond);
}

function createCalendar(datetime, target_element, options){
	var time = "";
	if(datetime == "currentTime"){
		time = new Date();
	}else{
		var filledTime = target_element.children[0].value;
		if(filledTime != ""){
			time = filledTime;
		}else{
			if (datetime == "startTime"){
				if(YuiTables[tableName].dataTable.getRecord(0) != null){
					time = Date.parseFormattedString(YuiTables[tableName].dataTable.getRecord(0).getData("logtime").substring(0,19));
				}else{time = new Date();}	
			}else if(datetime == "endTime"){
				if(document.getElementById("txtStartTime").value != ""){
					time =  Date.parseFormattedString(document.getElementById("txtStartTime").value);
				}else if(YuiTables[tableName].dataTable.getRecord(0) != null){
					time = Date.parseFormattedString(YuiTables[tableName].dataTable.getRecord(0).getData("logtime").substring(0,19));
				}else{time = new Date();}
			}
		}
	}
	new CalendarDateSelect(time, target_element, options);
}
function getStyle(objInfo,attribute){
	var obj = typeof(objInfo)=="object"?objInfo:document.getElementById(objInfo);
	var v = null;
	if(obj.currentStyle){
		v = obj.currentStyle[attribute];
	}else{
		v = window.getComputedStyle(obj, null).getPropertyValue(attribute);
	}
	return v;
}
/*
 * formatDate('2011-05-21', 'M d, y'); //2011-05-21 to May 21, 2011
 * formatDate('May 21, 2011', 'y-m-d'); //May 21, 2011 to 2011-05-21
 */
function formatDate(str, format)
{
	var months = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun",
	                "07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"}
	var y,m,d,m_s;
	//get y m d info
	var arr = str.match(/^(\d{4})\-(\d{2})\-*(\d{2})*\s*((\d{2}):(\d{2}):(\d{2}))*$/);//support 2011-05-21
	if(!arr){
		arr = str.match(/^([a-zA-Z]+)\s+(\d{2})\,\s*(\d{4})$/);//support May 21, 2011
		y = arr[3];
		d = arr[2];
		m_s = arr[1];
		format = format?format:'y-m-d';
		for(var k in months){
			if(months[k]==arr[1]){
				m = k;
				break;
			}
		}
	}else{
		y = arr[1];
		m = arr[2];
		m_s = months[m];
		d = arr[3];
		format = format?format:'M d, y';
	}
	//format date
	date = format.replace(/y|Y/, y);
	date = date.replace(/m/, m);
	date = date.replace(/M/, m_s);
	date = date.replace(/d|D/, d);
	return date;
}

function checkText(v){
	v = v.replace(/\r\n/g, '<br>');
	return v;
}