(function($){
 	$.fn.extend({ 
 		//plugin name - buildDCA
 		buildDCA: function(options) {
             var dcaData = dcaDiagramData;
             var defaults = {
                 navPreviousWrapper: '#left',
                 navNextWrapper: '#right',
                 itemVisible: 3,
                 listWrapper: '.rack_wrap ul',
                 itemOffset: 210.5, //distance in pixel between the left-hand side of an item and the following one
                 slideSpeedSlow: 600, //speed of the items when sliding slowly
                 slideSpeedFast: 200, //speed of the items when sliding fast
                 infiniteScroll: 0, //scroll infinitely through items (deactivated by default)
                 scrollOver: 0, //scroll on rollover
                 debug: 0,
                 numDCA:0,
                 customerName: "Greenplum",
                 rackId: "DCA1001",
                 rackImage: "img/emc-greenplum-appliance.png",
                 dcaType:"Full",
                 dataCenterName: "Atrium",
                 rackLocation: "RowA-211",
                 servicesTag: "DCA45FR",
                 healthCheckStatus: "Green",
                 masterServer: 2,
                 segmentServer: 16,
                 totalCPU: 192,
                 totalMemory: "768 GB",
                 uncompressedCap: "36 TB",
                 compressedCap: "144 TB",
                 maxExpansion: 12,
                 dcaSoftwareVersion:"3.0",
                 gpdbVersion:"4.1"
             };

             $('#rackdiv').empty();
             var rackContent = getData(options, dcaData);
			 if (rackContent['numDCA'] == 0) {
				$("#rackdiv").append('<div style="padding:10px;"> No Data Found </div>');
				$('#rackdiv').show();
				return;
			 }
			 
             $('#rackdiv').show();
             rackContent = $.extend(defaults, rackContent);
             var numRack = rackContent.numDCA;
             buildLayout(rackContent);
			 $('#rackwrap ul').css('width',300*rackContent.racks.length);
             rackContent.totalItem = $(rackContent.listWrapper).find('li').length; //total number of items
             rackContent.navPreviousWrapper = $(this).find(rackContent.navPreviousWrapper);
             rackContent.navNextWrapper = $(this).find(rackContent.navNextWrapper);
             rackContent.listWrapper = $(this).find(rackContent.listWrapper);
             rackContent.itemOffsetMax;
             rackContent.listMarginLeft;
             rackContent.slideSpeed;
             rackContent.easing;
             rackContent.locked = false;
             rackContent.scrollOn = false;
             rackContent.scrollTimer = 0;
             rackContent.navTimer;


             $(".rotate-swap").hide();
             $('.inner, .back').hide();
             $('.trigger').hide();
             buildCustomerDCA(rackContent);

             if (rackContent.totalItem > rackContent.itemVisible) {
                 //do pagination here!
                 updateListMargin(rackContent);
                 rackContent.itemOffsetMax = parseInt(rackContent.racks.length) * rackContent.itemOffset - (rackContent.itemVisible * rackContent.itemOffset);
                 rackContent.itemOffsetMax = -parseInt(rackContent.itemOffsetMax) - 240;

                 // --- Init interactions
                 //click
                 $(rackContent.navPreviousWrapper).click(function () {

                     return false;
                 });

                 $(rackContent.navNextWrapper).click(function () {
                     return false;
                 });
                 //mouse down
                 $(rackContent.navPreviousWrapper).mousedown(function () {
                     window.clearTimeout(rackContent.navTimer);
                     rackContent.scrollOn = true;
                     rackContent.slideSpeed = rackContent.slideSpeedFast;
                     rackContent.easing = "swing";
                     slideListPrevious(rackContent);
                 });

                 $(rackContent.navNextWrapper).mousedown(function () {
                     window.clearTimeout(rackContent.navTimer);
                     rackContent.scrollOn = true;
                     rackContent.slideSpeed = rackContent.slideSpeedFast;
                     rackContent.easing = "swing";
                     slideListNext(rackContent);
                 });

                 //mouse up
                 $(rackContent.navPreviousWrapper).mouseup(function () {
                     rackContent.scrollOn = false;
                 });

                 $(rackContent.navNextWrapper).mouseup(function () {
                     rackContent.scrollOn = false;
                 });

                 if (rackContent.scrollOver == 1) {
                     //mouse over (rollover)
                     $(rackContent.navPreviousWrapper).mouseover(function () {
                         //if the nav isn't already scrolling
                         if (!rackContent.scrollOn) {
                             rackContent.scrollOn = true;
                             rackContent.slideSpeed = rackContent.slideSpeedSlow;
                             rackContent.easing = "linear";

                             var functionCall = function () {
                                 slideListPrevious(rackContent);
                             };
                             rackContent.navTimer = window.setTimeout(functionCall, rackContent.scrollTimer);
                         }
                     });

                     $(rackContent.navNextWrapper).mouseover(function () {
                         //if the nav isn't already scrolling
                         if (!rackContent.scrollOn) {
                             rackContent.scrollOn = true;
                             rackContent.slideSpeed = rackContent.slideSpeedSlow;
                             rackContent.easing = "linear";

                             var functionCall = function () {
                                 slideListNext(rackContent);
                             };
                             rackContent.navTimer = window.setTimeout(functionCall, rackContent.scrollTimer);
                         }
                     });

                     //mouse out (rollout)
                     $(rackContent.navPreviousWrapper).mouseout(function () {
                         rackContent.scrollOn = false;
                     });

                     $(rackContent.navNextWrapper).mouseout(function () {
                         rackContent.scrollOn = false;
                     });
                 }
             }
             handleRackImgClick(rackContent);

             $(".img-swap").click(function(e) {
                 var flip = 0;
                 e.preventDefault();
                 var rackIndex = this.parentNode.parentNode.parentNode.id;
                 $("#info_panel").empty().hide("fast");
                 $('.trigger').removeClass("active").hide();
                 $('.selected').toggleClass('selected');

                 rackIndex = parseInt(rackIndex.split('rack')[1]);
                 //console.log(rackIndex);
                 if ($(this).attr("class") == "img-swap") {
                     this.src = this.src.replace("openrack.png", "closerack.png");
                     this.title = this.title.replace("Open DCA", "Close DCA");
                     $('#front' + rackIndex).toggleClass("show").css('display', 'none');
                     $('#inner' + rackIndex).toggleClass("show").css('display', 'block');
                     $(this).next().show();
                 } else {
                     this.src = this.src.replace("closerack.png", "openrack.png");
                     this.title = this.title.replace("Close DCA", "Open DCA");
                     $('#front' + rackIndex).toggleClass("show").css('display', 'block');
                     $('#inner' + rackIndex).toggleClass("show").css('display', 'none');
                     $(this).next().hide();
                 }
                 $(this).toggleClass("on");
             });

             $(".rotate-swap").click(function(e) {
                 e.preventDefault();
                 var rack_Name = this.parentNode.parentNode.parentNode.id;
                 $('#' + rack_Name + ' li img.rackImg').toggle();
             });

             $("li img.R510,li img.R610, li img.brocadeSwitch, li img.adminSwitch ").click(function(event) {
                 // record u location in json data
                 event.preventDefault();
                 var uLocation;
                 var componentInfo;
                 var pos;
                 var rack_number;
                 var tableContent;
                 rack_number = event.currentTarget.parentNode.parentNode.parentNode.parentNode.parentNode.id;
                 //console.log(rack_number);
                 var rack_loc = parseInt(rack_number.split('inner')[1]);
                 rack_loc = rack_loc - 1;
                 $(".rackinfo").hide();
                 uLocation = $(this).attr('alt');
                 if (uLocation != null) {
                     $('.dca_thumbs li img').removeClass('selected');
                     $(this).toggleClass('selected');
                     $(event.currentTarget.parentNode).next().find('img').toggleClass('selected');
                     componentInfo = rackContent.racks[rack_loc].rack.rackComponents[uLocation];
                     //console.log(componentInfo.toSource());
                     pos = $(event.currentTarget).offset();

                     $("#info_panel").empty().hide("fast");
                     $("#CompInfotemp").tmpl(componentInfo)
                         .appendTo("#info_panel");

                     //alert(componentInfo.diskInfos.toSource());
                     if (componentInfo.diskInfos) {
                         $('#list-table').empty();
                         tableContent = '';
                         tableContent = '<tr><th> Partition </th><th> Size </th><th> Free Space </th></tr>';
                         $.each(componentInfo.diskInfos, function(index, item) {
                             //console.log(componentInfo.diskInfos[index].Partition);
                             tableContent += '<tr><td>' + item.Partition + '</td><td>' + item.Size + '</td><td>' + item.freeSpace + '</td></tr>';
                         });
                         $('#list-table').html(tableContent);
                         //console.log(tableContent.toSource());
                     }
                 }
                 $("#info_panel").show("fast");
                 $(".trigger").show().addClass('active');
             });

             $(".trigger").click(function(e) {
                 $("#info_panel").toggle("fast");
                 $(this).toggleClass("active");
                 e.preventDefault();
                 return false;

             });


             return this;
         }
	});
    var slideListPrevious = function (rackContent) {
        if (!rackContent.locked && rackContent.scrollOn && ((parseInt(rackContent.listMarginLeft) + parseInt(rackContent.itemOffset) <= 0) || rackContent.infiniteScroll == 1)) {
            rackContent.locked = true;

            if (rackContent.infiniteScroll == 1) {
                updateListFromBeginning(rackContent, function () {
                    slideListPreviousAction(rackContent);
                });
            } else {
                slideListPreviousAction(rackContent);
            }
        }
    };

    var slideListPreviousAction = function (rackContent) {
        var offsetUpdate = parseInt(rackContent.listMarginLeft) + parseInt(rackContent.itemOffset);

        /* DEBUG */
        if (rackContent.debug == 1) {
            console.log('offsetUpdate: ' + offsetUpdate);
        }

        $(rackContent.listWrapper).animate({
            marginLeft: offsetUpdate
        }, rackContent.slideSpeed, rackContent.easing, function () {
            if (rackContent.infiniteScroll == 0) {
                updateListMargin(rackContent);
            }
            rackContent.locked = false;

            if (rackContent.scrollOn) {
                rackContent.easing = "linear";
                slideListPrevious(rackContent);
            }
        });
    };

    //slide the list to the right
    var slideListNext = function (rackContent) {
        if (!rackContent.locked && rackContent.scrollOn && (((parseInt(rackContent.listMarginLeft) - parseInt(rackContent.itemOffset)) >= rackContent.itemOffsetMax) || rackContent.infiniteScroll == 1)) {
            rackContent.locked = true;

			var itemWith = parseInt(rackContent.itemOffset);
            var offsetUpdate = rackContent.listMarginLeft - itemWith;
            /*if (rackContent.racks.length * itemWith) {
				
			}*/

            /* DEBUG */
            if (rackContent.debug == 1) {
                console.log('offsetUpdate: ' + offsetUpdate);
            }

            $(rackContent.listWrapper).animate({
                marginLeft: offsetUpdate
            }, rackContent.slideSpeed, rackContent.easing, function () {
                if (rackContent.infiniteScroll == 0) {
                    updateListMargin(rackContent);
                } else {
                    updateListFromEnd(rackContent, null);
                }
                rackContent.locked = false;

                if (rackContent.scrollOn) {
                    rackContent.easing = "linear";
                    slideListNext(rackContent);
                }
            });
        }
    };

    var initListItems = function (rackContent) {
        for (var i = 0; i < rackContent.totalItem; i++) {
            var pos = parseInt($(rackContent.listWrapper).find('li').length - 1) - parseInt(i);
            $(rackContent.listWrapper).find('li:eq(' + pos + ')').clone().insertBefore($(rackContent.listWrapper).find('li:first-child')).addClass('thslide_copy');
        }
        resetListMargin(rackContent);
    };

    var updateListFromBeginning = function (rackContent, callback) {
        var itemToMove = $(rackContent.listWrapper).find('li:last-child');
        $(rackContent.listWrapper).find('li:first-child').before(itemToMove);
        $(rackContent.listWrapper).css('marginLeft', -parseInt(rackContent.itemOffset));
        updateListMargin(rackContent);

        if (typeof callback == 'function') {
            return callback();
        }
    };

    var updateListFromEnd = function (rackContent, callback) {
        var itemToMove = $(rackContent.listWrapper).find('li:first-child');
        $(rackContent.listWrapper).find('li:last-child').after(itemToMove);
        $(rackContent.listWrapper).css('marginLeft', 0);
        updateListMargin(rackContent);

        if (typeof callback == 'function') {
            return callback();
        }
    };

    //update the left margin of the items list for scrolling effect
    var updateListMargin = function (rackContent) {
        rackContent.listMarginLeft = $(rackContent.listWrapper).css('marginLeft').split('px')[0];
    };

    //reset the left margin of the items list for infinite scrolling
    var resetListMargin = function (rackContent) {
        //$(rackContent.listWrapper).css('marginLeft', - parseInt(rackContent.itemOffset) * rackContent.totalItem);
        $(rackContent.listWrapper).css('marginLeft', -parseInt(rackContent.itemOffset));
        updateListMargin(rackContent);
    };

    var getData = function(options, dcaData){
        // ajax call to get json data from server
        // ajax call should return json data of entire rack
       /* $.ajax({
				url: '../getDCArack.php', // link to php to get json data
				success: function(data)
				{
					var obj = $.parseJSON(data);

					return obj;
				},
				error: function(data)
				{
					$('#alertMsg').html("Oops, error with varietals");
   				}

 			}); */
        if(dcaData!=null){
            return dcaData;
        }else{
            alert('dcaData is null!!');
        }
    };
    var buildLayout = function(rackContent){
        var nRack =rackContent.numDCA;
        var layout = null;
                layout = '<h3 class="title">'+rackContent.customerName+' : '+rackContent.numDCA+' Rack(s)</h3>'
                    +'<div class="summary">'
                    +'<ul><li class="parent_ls"><h3>Hardware Summary</h3>'
                    +'<ul class="ls_child"><li><span class="header">Cluster Name :</span><span class="sum_data">'+rackContent.dataCenterName+'</span></li>'
                    +'<li><span class="header">Master/Standby Servers :</span><span class="sum_data">'+rackContent.masterServer+'</span></li>'
                    +'<li><span class="header">Segment Servers :</span><span class="sum_data">'+rackContent.segmentServer+'</span></li>'
                    +'<li><span class="header">Total CPU Core :</span><span class="sum_data">'+rackContent.totalCPU+'</span></li>'
                    +'<li><span class="header">Total Memory :</span><span class="sum_data">'+rackContent.totalMemory+'</span></li>'
                    +'<li><span class="header">Uncompressed Capacity :</span><span class="sum_data">'+rackContent.uncompressedCap+'</span></li>'
                    +'<li><span class="header">Maximum Expansion :</span><span class="sum_data">'+rackContent.maxExpansion+'</span></li>'
                    +'</ul></li>'
                    +'<li class="parent_ls"><h3>Software Summary</h3>'
                    +'<ul class="ls_child"><li><span class="header">GPDB Version :</span><span class="sum_data">'+rackContent.gpdbVersion+'</span></li>'
                    +'<li><span class="header">DCA Software Version :</span><span class="sum_data">'+rackContent.dcaSoftwareVersion+'</span></li>'
                    +'<li><span class="header">Primary per Server :</span><span class="sum_data">'+rackContent.primaryPerServer+'</span></li>'
                    +'<li><span class="header">Mirror per Server :</span><span class="sum_data">'+rackContent.mirrorPerServer+'</span></li>'
                    +'</ul></li>'
                    +'</ul>'
                    +'</div>'

                        +'<div id="rack" class="rack"><div class="rack_div"><div id="rackwrap" class="rack_wrap">'
                        +'<ul id="rackul">';
                $.each(rackContent.racks, function(index, item){
                layout = layout + '<li id="rack'+(index+1)+'" class="dca">'
                        + '<div class="dcawrap">'
                        + '<span><img id="front'+(index+1)+'" class="dcaImg front" src="'+rackContent.rackImage+'" title="Click to view inside..." /></span>'
                        + '<span id="inner'+(index+1)+'" class="dcaImg inner"></span>'
                        + '<span id="back'+(index+1)+'" class="dcaImg back"></span>'
                        + '<div class="wrap"><div class="rackname">DCA '+(index+1)+'</div><br /><img class="img-swap" title="Open DCA" src="img/openrack.png" /> <img class="rotate-swap" title="Rotate" src="img/rotate.png" /></div></div></li>';
                });
                layout = layout +'</ul></div></div>'
                        +'</div>'
                        +'<div id="racknavi"><div>'
                        +'<span class="direction" id="left"></span>'
                        +'<span class="direction" id="right"></span>'
                        +'</div></div>'
                        +'<div id="info_panel"><div style="clear:both;"></div></div>'
                        +'<a class="trigger" href="#"></a>';
            $("#rackdiv").append(layout);

    };
    var buildCustomerDCA = function(rackContent){

        $.each(rackContent.racks, function(index, item){
         //console.log(item.rack.racktype);
             buildDca(item.rack, 'rack'+(index+1));
        });
    };
    var handleRackImgClick = function(rackContent){

        $('.dcaImg.front').click({rackDt:rackContent},function(e) {
                // do
            e.preventDefault();
            var rackname;
            var rackContent =e.data.rackDt;

                // img clicked
            rackname=e.currentTarget.parentNode.parentNode.parentNode.id;

            var rackNum = parseInt(rackname.split('rack')[1]);

            showRack(rackContent, rackNum, e);
            $('#'+rackname).find(".inner").show();
            $('#'+rackname).find(".img-swap").attr('src', 'img/closerack.png').toggleClass("on");
            $('#'+rackname).find(".rotate-swap").show();
        });

    };
    var showRack = function (rackContent, rackNum, e){
        var rack_id = rackNum - 0;
        var target_Rack; var dcaData;

        $( "#dcadetails" ).hide().empty();

        $(e.currentTarget).css('display','none');
        target_Rack = (rack_id - 1);

        dcaData = rackContent.racks[target_Rack].rack;
        buildDca(dcaData, rack_id);

    };
    var buildDca = function (data, id){
        //console.log(id);
        var dca = '<div class="rackImg"><div class="server_wrap '+data.racktype+'"><ul class="dca_thumbs"></ul></div></div>';
        var racklist = "";

        $.each(data.rackComponents, function(index, item){
            racklist += '<li><img class="'+item.chassis+' c_front rackImg" alt="'+index+'" src="'+item.serverImg+'" /></li>'
                + '<li><img class="'+item.chassis+' c_back rackImg" alt="'+index+'" src="'+item.backImg+'" /></li>';
        });

        $('#'+id).find(".inner").prepend(dca).find(".dca_thumbs").html(racklist);
    };

})(jQuery);