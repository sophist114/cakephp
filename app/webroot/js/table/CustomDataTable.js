/*
 * FileName: CustomDataTable.js
 * Description: Data Table tools.
 * Author: Ryan (November 19, 2010)
 * Copyright: Copyright 2010 Founder Internation! Inc. All rights reserved.
 */
function CustomDataTable()
{
	this.needPagination = true;
	this.paginationShowTime = 0;//1:always show 0: not always show. 
	this.talbeConfig = null;
	this.container = null;
	this.totalRecords = 0;
	this.tableData = null;
	this.pagination = null;
	this.connectId = null;
	this.connectURL = '';
	this.urlParams = null;
	this.completedFunction = null; //[{name:xxx,paramType:xxx},{name:xxx,paramType:xxx}]
	this.sortStatus = 2; //0:asc 1: desc 2:no sort
	this.sortColum = null;
	this.sortControlId = null;
	this.hasWaitingPanel = true;
	this.startPageIndex = 1;
	var head = document.getElementsByTagName('head');
	//document.getElementById(this.container).parentNode.appendChild(buttoncss);
	//auto set pagination as data
	this.pageOptions = {
		'paginator_normal' : [20, 30, 50, 100, 200],
		'paginator_big' : [100, 200, 300, 400, 500]
	};
	this.pageOptionName = 'paginator_normal';
	former.dropdown.addOptions(this.pageOptions);
	this.rowsPerPage = this.pageOptions[this.pageOptionName][0];
	this.autoPagination = true;
	this.divideNumber = 3000;
	this.hasSetAutoPagination = false;
	var tableConfig;
	var dataContainer;
	var downloadMark;
	this.showPagination = function()
	{	
		//var pageTemplate = '<div style="float:right;">{CurrentPageReport} {FirstPageLink} {PreviousPageLink} {NextPageLink} {LastPageLink}  Show:{RowsPerPageDropdown}</div>';
		var pageTemplate = '<table border="0" cellpadding="0" cellspacing="0" style="float:right;"><tr><td><div class="pgC">{CurrentPageReport}</div><div class="pgB">{FirstPageLink}</div><div class="pgB">{PreviousPageLink}</div><div class="pgB">{NextPageLink}</div><div class="pgB">{LastPageLink}</div><div class="pgS">Show:</div><div class="pgD"><div class="dropDown" onclick="displayOptions(this,\'' + this.pageOptionName + '\',changeRowPerPage)"><div class="dText" id="'+ this.container+'"_PerPageNum">' + this.rowsPerPage + '</div><div class="dArrow" style="float:right;"></div></div></div><div style="float:right;margin-top:-2px;" class="yui-button yui-push-button"><span id="'+ this.container +'_btnTableDownloadDiv" class="first-child"><button type="button" id="'+this.container +'_btnTableDownload">Download</button></span></div></td></tr></table>';
		this.pagination = new YAHOO.widget.Paginator({
			rowsPerPage  : this.rowsPerPage,
			totalRecords : this.totalRecords,
			rowsPerPageOptions : this.pageOptions[this.pageOptionName],
			containers   : this.container,
			template : pageTemplate,
			firstPageLinkLabel:'First',
			lastPageLinkLabel:'Last',
			previousPageLinkLabel:'&lt;Previous',
			nextPageLinkLabel:'Next&gt;',
			pageReportTemplate : '{startRecord}-{endRecord} of <span class="blueLabel">{totalRecords}</span>' 
		});
		this.pagination.subscribe('changeRequest', this.queryData); 
		this.pagination.render();
		CustomDataTable.prototype.Hash[this.container] = this;
		downloadMark = this.container;
	}
	
	
	this.getParameters = function(){
		var parameters = '';
		var i=0;
		for(var key in this.urlParams)
		{
			parameters += key + '=' + this.urlParams[key] + "&";
			i++;
		}
		return parameters;
	}
	//pageState: status from pagination
	this.queryData = function(pageState) {
		var obj = null;
		if(this._containers)
		{
			obj = CustomDataTable.prototype.Hash[this._containers[0].id];
		}
		else
		{
			obj = this;
		}
		if (obj.connectId != null && YAHOO.util.Connect.isCallInProgress(obj.connectId)) {
			return;
		}
		var pageIndex, rows;
		var pageState = pageState ? pageState : (obj.pagination ? obj.pagination.getState() : null)
		if (pageState) {
			if (obj.pagination) {
				obj.pagination.setState(pageState);
			}
			pageIndex = pageState.page - 1;
			rows = pageState.rowsPerPage;
		}else{
			pageIndex = 0;
			rows = obj.rowsPerPage;
		}
		
		var parameters = obj.getParameters();
		
		CustomDataTable.prototype.LoadTimes++;
		if(CustomDataTable.prototype.LoadTimes==1 && obj.hasWaitingPanel)
		{
			showWaiting();
		    var temp = document.getElementById('cluster_summary_content');
			  if(temp){
				  window.top.document.getElementById("coverObject").style.height ="994px";
			 }

		}
		obj.connectId = YAHOO.util.Connect.asyncRequest(
			'POST', 
			obj.connectURL + '?pageIndex=' + pageIndex + '&rowsPerPage=' + rows + '&t=' + new Date().getTime(), 
			{
				success:function(o) {
					var pageState = o.argument[0];
					var obj = o.argument[1];
					var rt = o.responseText;
					
					rt = rt.replace(/<!\-(.*?)>/g,'');
					var rData,data,total;
					
					try {
						rData = YAHOO.lang.JSON.parse(rt);
						if(rData){
							if(rData.session){
								top.location.replace('login.php');	
								return;
							}
							data = rData.records;
							total = rData.totalRecords;
							//check auto pagination
							if (obj.autoPagination && !obj.hasSetAutoPagination && total > obj.divideNumber) {
								obj.pageOptionName = 'paginator_big';
								obj.rowsPerPage = obj.pageOptions[obj.pageOptionName][0];
								obj.hasSetAutoPagination = true;
								CustomDataTable.prototype.LoadTimes--;
								/*if(CustomDataTable.prototype.LoadTimes==0 && obj.hasWaitingPanel){
									hideWaiting();
								}*/
								obj.queryData();
								return;
							}
							obj.tableData = rData.records;
							var rConfig = CustomDataTable.prototype.createTable(obj.talbeConfig,data);
							tableConfig = rConfig[1];
							dataContainer = rConfig[0];
							if(obj.needPagination){
								if(!obj.pagination){
									obj.totalRecords = total;
									obj.showPagination();
									var c = document.getElementById(downloadMark+'_btnTableDownload');
									c.style.display = tableConfig['disableDownload'] ? 'none' : '';
								}
								var b = document.getElementById(downloadMark+'_btnTableDownload');
								if(obj.completedFunction){
								obj.totalRecords = total;
								for(var i=0;i<obj.completedFunction.length;i++){
									switch(obj.completedFunction[i].paramType){
										case 'total':obj.completedFunction[i].name(total);break;
										case 'status':
											if(rData.status){
												obj.completedFunction[i].name(rData.status);
											}
											break;
										default:obj.completedFunction[i].name();break;
									}
									/*
									if(obj.completedFunction[i].paramType == "total"){
										obj.completedFunction[i].name(total);
									}else{
										obj.completedFunction[i].name();
									}*/
								}

							}
								
								if(total == 0 || total == 'No Info'){
									b.style.cursor = 'default';
									b.disabled = true;
									b.parentNode.parentNode.className += ' yui-button-disabled';
								}else{
									b.style.cursor = 'pointer';
									b.disabled = false;
									b.parentNode.parentNode.className = 'yui-button yui-push-button';
								}
								if (pageState.totalRecords != total) {
									pageState.totalRecords = total;
									obj.pagination.setState(pageState);
									var maxPage = Math.ceil(total/pageState.rowsPerPage);
									if(pageState.page > maxPage) {
										pageState.page = maxPage;
										obj.queryData(pageState);
									}
								}
								if(obj.paginationShowTime==0){
									if(total>10){
										document.getElementById(obj.container).style.display = "";
									}else{
										document.getElementById(obj.container).style.display = "none";
									}
								}else{
									document.getElementById(obj.container).style.display = "";
								}
							}
							

						}
						CustomDataTable.prototype.LoadTimes--;
						if(CustomDataTable.prototype.LoadTimes==0 && obj.hasWaitingPanel){
							hideWaiting();
						}
						
					}catch(x){
						CustomDataTable.prototype.LoadTimes--;
						if(CustomDataTable.prototype.LoadTimes==0 && obj.hasWaitingPanel){
							hideWaiting();
						}
					}finally{
						CustomDataTable.prototype.setSortStyle(obj.sortControlId,obj.sortStatus);
						
					}
				},
				failure:function(o) {
						CustomDataTable.prototype.LoadTimes--;
						if(CustomDataTable.prototype.LoadTimes==0 && obj.hasWaitingPanel){
							hideWaiting();
						}
				},
				argument: [pageState, obj]
			}, 
			parameters
		);
	}
}
CustomDataTable.prototype.LoadTimes=0;

CustomDataTable.prototype.Hash = {};

CustomDataTable.prototype.setSortStyle = function(id,type){
	if(id){
		var obj = document.getElementById(id);
		if(obj){
			var heads = obj.parentNode.parentNode.childNodes;
			for(var i=0;i<heads.length;i++){
				var objDiv = obj.parentNode.parentNode.childNodes[i].firstChild;
				if(objDiv.tagName == "DIV"){
					objDiv.className = "sort";
					obj.firstChild.title = "Click to sort ascending";
				}
			}
			obj.className = type==1?"sortDesc":"sortAsc";
			if(obj.parentNode.clientWidth < 40){
				obj.className = "sort";
			}
			obj.firstChild.title = type==1?"Click to sort ascending":"Click to sort descending";
		}
	}
}
//
CustomDataTable.prototype.sortTable = function(objControl){
	var pgContainer = objControl.parentNode.parentNode.attributes.pgName.nodeValue;
	var obj = CustomDataTable.prototype.Hash[pgContainer];
	if(obj.sortColum && obj.sortColum == objControl.attributes['sortValue'].nodeValue)
	{
		obj.sortStatus = obj.sortStatus==1?0:1;
	}
	else
	{
		obj.sortStatus = 0;
	}
	obj.sortColum = objControl.attributes['sortValue'].nodeValue;
	
	obj.sortControlId = objControl.id;
	obj.urlParams['sortBy'] = obj.sortColum;
	obj.urlParams['sortType'] = obj.sortStatus==0?"ASC":"DESC";
	
	obj.queryData();
}

CustomDataTable.prototype.rebuild = function(){
	if (this.pagination) {
		var currentState = this.pagination.getState();
		currentState.page = 1;
		currentState.recordOffset = 0;
		this.queryData(currentState);
	} else {
		this.queryData();
	}
}
CustomDataTable.prototype.refresh = function(){
	if (this.pagination) {
		var currentState = this.pagination.getState();
		this.queryData(currentState);
	} else {
		this.queryData();
	}
}
/*
{'tableContainer':'tableDiv',
		 'pgContainer':'navDiv',
		 'rowEvent': ['onClick',"openPanel",0,1],  //[event,function,key,type]  type:1/0  1:customer table 0: operation system table
		 'headColumns':null,
		 'width':'100%',
		 'checkBoxColumn':{"width":"15px","bindValue":['Id'],"event":'onclick="setStatus(this,event)"'},
		 'multiColumnSymbol':null; 
		 'columns':[['Customer Name','Name','yes','Name','center','no'],
					['Billing City','BillingCity','yes','BillingCity','center','no'],
					['Billing State','BillingState','yes','BillingState','center','no'],
					['Owner Id','OwnerId','yes','OwnerId','center','no'],
					['Created Date','CreatedDate','yes','CreatedDate','center','no'],
					['Created By Id','CreatedById','yes','CreatedById','center','no'],
					['Last Modified Date','LastModifiedDate','yes','LastModifiedDate','center','no'],
					['Last Activity Date','LastActivityDate','yes','LastActivityDate','center','no']]
		};
		
columns[  0: ColumnName For Head ,
		  1: ColumnName For sort,
		  2: if sort(yes/no),
		  3: ColumnName For get from database,
		  4: align(left/center/right)
		  5: if format(yes/no)
		  6: width
		  7: default sort:(asc/desc)
		  8: if display(yes/no)
		  9: function
		  10: cell attributes
		  11: if link(null/{"title":"","value":""})
		  12: color mark(use defined color to mark data{"positivenum":"red"})
		  ]
headColumns[ 0: ColumnName For Head ,
			 1: ColumnName For sort,
			 2: if sort(yes/no),
			 3: rowspan,
			 4: colspan,
			 5: width]
*/
CustomDataTable.prototype.createTable = function(tableConfig,data){
	tableConfig = tableConfig;
	
	var cName = tableConfig['tableContainer'];
	var container = document.getElementById(cName);
	var pgName = tableConfig['pgContainer'];
	var columns = tableConfig['columns'];
	var headColumns = tableConfig['headColumns'];
	var checkBoxColumn = tableConfig['checkBoxColumn'];
	var script = '<table id='+cName+'_table';
	if(tableConfig['width']){ script += ' style="width:'+ tableConfig['width'] +';"';}
	script +='>';
	var colspanNum = 0;
	if(headColumns){
		for(var i=0;i<headColumns.length;i++){
			script +='<tr class="head" pgName="'+ pgName +'">';
			if(checkBoxColumn){
				if(data && data.length>0){
					script +='<th style="width:'+ checkBoxColumn.width +';display:'+checkBoxColumn.display+'"><input type="checkbox" name="cbxAll_'+cName+'" onclick="checkAll(this);"></th>';
				}else{
					script +='<th style="width:'+ checkBoxColumn.width +';display:'+checkBoxColumn.display+'">&nbsp;</th>';
				}
			}
			for(var j=0;j<headColumns[i].length;j++){
				var rowspan =  headColumns[i][j][3];
				var colspan = headColumns[i][j][4];
				script += '<th rowspan="'+ rowspan +'" colspan="'+ colspan +'"';
				if(headColumns[i][j][5])
				{
					script += ' style="width:'+headColumns[i][j][5]+'px;"';
				}
				script += '>';
				if(headColumns[i][j][2]=="yes" && data && data.length>0){
					var sortValue = headColumns[i][j][1];
					var divName = cName + '_' + headColumns[i][j][0] + '_' + sortValue;
					script += '<div id="'+ divName +'" onClick="CustomDataTable.prototype.sortTable(this);"';
					script += 'class="sort" sortValue="'+ sortValue +'"><a title="Click to sort ascending" href="javascript:void(0,0)">' + headColumns[i][j][0] +'</a></div></th>';
				}
				else{
					script += headColumns[i][j][0] +'</th>';
				}
			}
			script += '</tr>';
		}
	}else{
		script +='<tr class="head" pgName="'+ pgName +'">';
		if(checkBoxColumn){
			if(data && data.length>0){
				script +='<th style="width:'+ checkBoxColumn.width +';display:'+checkBoxColumn.display+'"><input type="checkbox" name="cbxAll_'+cName+'" onclick="checkAll(this);"></th>';
			}else{
				script +='<th style="width:'+ checkBoxColumn.width +';display:'+checkBoxColumn.display+'">&nbsp;</th>';
			}
		}

		for(var cnt = 0;cnt < columns.length;cnt++)
		{
			if(columns[cnt][8] && columns[cnt][8]=="no") continue;
			colspanNum++;
			script += '<th';
			if(columns[cnt][6])
			{
				//set widthDef
				var widthDef;
				if (columns[cnt][6].toString().indexOf('%') > -1) {
					widthDef = ' width="'+columns[cnt][6]+'"';
				} else {
					widthDef = ' style="width:'+columns[cnt][6]+'px;"';
				}
				script += widthDef;
			}
			script +='>';
			if(columns[cnt][2]=="yes" && data && data.length>0)
			{
				var sortValue = columns[cnt][1];
				var divName = cName + '_' + columns[cnt][0] + '_' + sortValue;
				script += '<div id="'+ divName +'" onClick="CustomDataTable.prototype.sortTable(this);"';
				var sortClass = "sort";
				var sortTitle = "Click to sort ascending";
				if(columns[cnt][7]){
					var sortClass = columns[cnt][7] == "asc"?"sortAsc":"sortDesc";
					sortTitle = columns[cnt][7] == "asc"?"Click to sort descending":"Click to sort ascending";
				}
				script += 'class="'+sortClass+'" sortValue="'+ sortValue +'"><a title="'+sortTitle+'" href="javascript:void(0,0)">'+ columns[cnt][0] +'</a></div></th>';
			}
			else{
				script += columns[cnt][0] +'</th>';
			}
		}
		script +='</tr>';
	}
	var rowEvent = tableConfig['rowEvent'];
	var temp = '';
	if(data && data.length>0){
		for(var i = 0; i < data.length; i++){
			var rowId = "tbRow_" + i;
			temp += '<tr id="'+rowId+'" index="'+i+'" class="'+ ((i % 2 == 0) ? 'odd' : 'even') +'" lastClass="'+ ((i % 2 == 0) ? 'odd' : 'even') +'" onmouseover="mouseOver(this);" onmouseout="mouserOut(this);"';
			if(rowEvent){
				temp += ' style="cursor:pointer;" key="'+ data[i][columns[rowEvent[2]][3]] +'" id="'+ cName +'_tr'+ i +'" ' + rowEvent[0]+'="'+rowEvent[1]+'(this,event)"';
			}
			temp += '>';
			if(checkBoxColumn){
					temp +='<td style="width:'+ checkBoxColumn.width +';text-align:center;display:'+checkBoxColumn.display+'"><input type="checkbox" name="cbxItem_'+cName+'"' + checkBoxColumn.event;
					var bindValue = checkBoxColumn.bindValue;
					if(typeof(bindValue)=="string"){
						temp += ' value="' + data[i][bindValue] + '"';
					}else if(bindValue){
						for(var j=0;j < bindValue.length;j++){
							temp += ' value'+(j+1)+'="'+ data[i][bindValue[j]] +'"';
						}
					}
					temp +='></td>';
			}
			for(var j=0; j < columns.length; j++){
				if(columns[j][8] && columns[j][8]=="no") continue;
				
				var arrColumn = columns[j][3].split(';');
				var value = '';
				for(var k=0;k<arrColumn.length;k++)
				{
					if(value!=''){
						value += (tableConfig['multiColumnSymbol'] ? tableConfig['multiColumnSymbol'] : "/");
					}
					value += columns[j][5]=='yes'? formatSize(data[i][arrColumn[k]]):data[i][arrColumn[k]];
				}
				value = value=='null'?'&nbsp;':value;
				//custom function
				if(typeof(columns[j][9])=='function'){
					value = columns[j][9](value, columns[j][3], i);
				}else{
					value = HTMLEnCode(value);
				}
				var cellId = "tbCell_" + i + "_" + j;
				var cellAtt = "";
				if(columns[j][10]){
					cellAtt = typeof(columns[j][10])=="function"?columns[j][10](i,j):columns[j][10];
				}
				var cssClass = columns[j][4]?' class="'+columns[j][4]+'"':'';
				
				
				if(columns[j][11]){
					value = '<a title="'+columns[j][11].title+'" target="_blank" href="DownLoadFile.php?id='+ data[i]['id'] +'&type='+columns[j][11].type+'">'+  
					data[i][columns[j][11].value]+'</a>';
				}
				if(columns[j][12]){
					if(columns[j][12].positivenum) var bgcolor = (j!= 0 && value>0 && value < Math.pow(10, 20)) ? columns[j][12].positivenum : "";
					temp += '<td id="' + cellId + '" ' + cellAtt + cssClass +' style="background-color:'+ bgcolor +';word-break:break-all;word-wrap:break-word;">'+ value +'</td>';
				}else{
					temp += '<td id="' + cellId + '" ' + cellAtt + cssClass +' style="word-wrap:break-word;">'+ value +'</td>';
				}
			}
			temp += '</tr>';
		}
	}
	if(temp==''){
		if(checkBoxColumn && checkBoxColumn.display!='none'){
			colspanNum++;
		}
		temp  = "<tr><td colspan='"+colspanNum+"'>No Data.</td></tr>";	
	}

	script += temp + "</table>";
	container.innerHTML = script; 
	
	if(typeof(SelectedRow)!="undefined") SelectedRow=null;
	
	if(typeof(OpenedTr)!="undefined") OpenedTr = null;
	
	if(typeof(SelectedRows)!="undefined" && SelectedRows[cName+"_table"]) SelectedRows[cName+"_table"] = null;
	
	var temp = {};
	dataContainer = cName+'_table';
	temp[0] = dataContainer;
	temp[1] = tableConfig;
	return temp;
}