var pageIndex = 1;
var rowsPerPage = 20;
var myDataTable = new CustomDataTable();
myDataTable.container = "navDiv";
myDataTable.paginationShowTime = 1;
myDataTable.connectURL = 'webservice/CustomerDataProxy.php';
myDataTable.sortStatus = 0;
myDataTable.sortColum = "customer_name";
myDataTable.urlParams = {"tbname":"ActiveCustomers","sortBy":"customer_name","sortType":"asc"};
myDataTable.talbeConfig = {'tableContainer':'tableDiv',
	 'pgContainer':'navDiv',
	 'rowEvent': ['onClick',"openPanel",0],  //[event,function,key]
	 'headColumns':null,
	 'width':'100%',
	 'multiColumnSymbol':'&nbsp;',
	 'checkBoxColumn':{"width":"55px","bindValue":['customer_id'],"event":'onclick="setStatus(this,event)"',"display":""},
	 
	 'columns':[['customer_id','customer_id','yes','customer_id','center','no','','','no'],
				['Customer Name','customer_name','yes','customer_name','','no','251','asc'],
				['Location','Location','yes','Location','','no','355'],
				['Type','type','yes','type','center','no','181'],
				['Code Level','code_level','yes','code_level','','no','360']],
	 'diableDownload': true
	};
var pageState;
if(pageIndex!='' && rowsPerPage!=''){
	pageState = {page: pageIndex, rowsPerPage: rowsPerPage};
}
myDataTable.queryData(pageState);