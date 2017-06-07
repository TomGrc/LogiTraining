YUI.add('analysis-grid', function(Y) {

	Y.namespace('LogiInfo').AnalysisGrid = Y.Base.create('AnalysisGrid', Y.Base, [], {
	
		initializer : function() {
		
			//Show the selected tab (if the menu is not hidden) -- Dont show menu if we just added a crosstab or chart 24511
		    if (!Y.Lang.isValue(Y.one('hideAgMenu'))
			&& Y.Lang.isValue(document.getElementById('rdAgCurrentOpenPanel'))) {
		        if (location.href.indexOf("AcChartAdd") > -1 || location.href.indexOf("AxAdd") > -1) {
		            //Don't show an open tab.
		            this.rdAgShowMenuTab("", true);
		        } else {
		            this.rdAgShowMenuTab(document.getElementById('rdAgCurrentOpenPanel').value, true);
		        }
		    }

		    //Show the selected tab (if the menu is not hidden)
			if (!Y.Lang.isValue(Y.one('hideAgMenu'))
			&& Y.Lang.isValue(document.getElementById('rdAgCurrentOpenTablePanel')))
			    this.rdAgShowTableMenuTab(document.getElementById('rdAgCurrentOpenTablePanel').value, true);
			
			//Open the correct chart panel if there is an error
			var chartError = Y.one('#rdChartError');
			if (Y.Lang.isValue(chartError))
				this.rdAgShowChartAdd(chartError.get('value'));
		
			//Initialize draggable panels if not disabled
			if (Y.Lang.isValue(Y.one('#rdAgDraggablePanels')))
			    this.rdInitDraggableAgPanels();

			if (document.getElementById('rdAgCurrentOpenTablePanel') && document.getElementById('rdAgCurrentOpenTablePanel').value == "")
			    this.rdAgShowTableMenuTab("Layout");

			if (document.getElementById('rdAllowCrosstabBasedOnCurrentColumns') && document.getElementById('rdAllowCrosstabBasedOnCurrentColumns').value == "False")
			    this.rdSetPanelDisabledClass('Crosstab');

			rdSetUndoRedoVisibility();
		},
		
		/* -----Analysis Grid Methods----- */

		rdAgShowMenuTab: function (sTabName, bCheckForReset, sSelectedColumn, bKeepOpen) {
		    var bNoData = false;
		    var eleStartTableDropdown = document.getElementById('rdStartTable');

		    var eleAgDataColumnDetails = document.getElementById('rdAgDataColumnDetails');
		    if (eleAgDataColumnDetails.value == '') {
		        //No table selected in QB. Show the QB.
		        sTabName = "QueryBuilder"
		        bNoData = true
		    }
            
		    var bOpen = true;

			if (sTabName.length==0){
				bOpen=false;
			}else{
				var eleSelectedTab = document.getElementById('col' + sTabName);
				var eleSelectedRow = document.getElementById('row' + sTabName);

                //24368
				if (eleSelectedTab && eleSelectedTab.className.indexOf('rdAgSelectedTab') != -1) {
				    if (eleSelectedTab.selectionInitialized)
				        bOpen = false;
				}
				if (bCheckForReset){
					if (location.href.indexOf("rdAgLoadSaved")!=-1){
						bOpen = false;
					}
				}
			}
			if (bNoData) {
			    bOpen = true;  //When no data, that tab must always remain open.
			}

			if (bKeepOpen && bKeepOpen == true) {
			    bOpen = true;  //Coming from the ag column menu so we dont want to toggle
			}

			var bAlreadyOpen = false;
			if (document.getElementById('rdAgCurrentOpenPanel').value == sTabName)
			    bAlreadyOpen = true;

			document.getElementById('rdAgCurrentOpenPanel').value = '';

			if (document.getElementById('colQueryBuilder')) {
			    if (!bOpen || sTabName != "QueryBuilder") {
			        this.rdSetClassNameById('colQueryBuilder', 'rdAgUnselectedTab');
			        this.rdSetDisplayById('rowQueryBuilder', 'none');
			    }
			    document.getElementById('colQueryBuilder').selectionInitialized = true;
			}

			if (document.getElementById('colCalc')) {
			    if (!bOpen || sTabName != "Calc") {
			        this.rdSetClassNameById('colCalc', 'rdAgUnselectedTab');
			        this.rdSetDisplayById('rowCalc', 'none');
			    }
			    document.getElementById('colCalc').selectionInitialized = true;
			}

			if (document.getElementById('colFilter')) {
			    if (!bOpen || sTabName != "Filter") {
			        this.rdSetClassNameById('colFilter', 'rdAgUnselectedTab');
			        this.rdSetDisplayById('rowFilter', 'none');
			    }
			    document.getElementById('colFilter').selectionInitialized = true;
			}

			if (bOpen) {
			    
			    document.getElementById('rdAgCurrentOpenPanel').value = sTabName;
                if(eleSelectedTab)
			        eleSelectedTab.className = 'rdAgSelectedTab';

                if(eleSelectedRow)
                    eleSelectedRow.style.display = '';

			    //Dont fade the tab if it is already open
                if (!bCheckForReset && eleSelectedRow && eleSelectedRow.firstChild && !bAlreadyOpen)   // Avoid flicker/fading effect when Paged/Sorted/Postbacks.
                {             
                    rdFadeElementIn(eleSelectedRow.firstChild, 400);    //#11723, #17294 tr does not handle transition well.
                }
			}
			
			this.rdSetMenuClasses(bNoData);

			var iQb = 0;
			var iclQbValue = "";
            //Disable menu's if no data is selected (intially or subsequent joins)
		    while (document.getElementById("iclQbColumns" + iQb) != null) {
		        var Qbval = rdGetInputValues(document.getElementById("iclQbColumns" + iQb))
		        Qbval = decodeURIComponent(Qbval.substring(Qbval.lastIndexOf("=") + 1))
		        iclQbValue += Qbval;
		        iQb += 1;
		    }
		    if ((iclQbValue == "") && (iQb > 0)) {
		        this.rdSetMenuClasses(true);
		    }

			if (typeof window.rdRepositionSliders != 'undefined') {
				//Move CellColorSliders, if there are any.
				rdRepositionSliders();
			}


            //Set column and scroll into view if this came from the table menu
			if (sTabName == "Filter") {
			    if (typeof sSelectedColumn != 'undefined') {
                    //Select the right column
			        Y.one("#rdAfFilterColumnID_rdAgAnalysisFilter").get("options").each(function () {
			            var value = this.get('value');
			            if (value == sSelectedColumn)
			                this.set('selected', true);
			            //this.rdAgShowFilterOptions();
			        });
			        if (document.getElementById('rdAfMode_rdAgAnalysisFilter').value == "Design") {
			            rdAfUpdateEditControls('rdAgAnalysisFilter')
			        } else {
			            //Switch to design mode.
			            document.getElementById('rdAfMode_rdAgAnalysisFilter').value = "Design"
			            rdAfUpdateUi(true, 'rdAgAnalysisFilter', 'Design');
			        }

			        Y.one('#rowsAnalysisGrid').scrollIntoView();
			    }
			}
			
		},

		rdSetMenuClasses: function (bNoData) {
		    this.rdSetPanelModifiedClass('QueryBuilder');
		    this.rdSetPanelModifiedClass('Calc');
		    this.rdSetPanelModifiedClass('Filter');
		    this.rdSetPanelModifiedClass('TableEdit');
		    if (bNoData) {
		        this.rdSetPanelDisabledClass('Calc');
		        this.rdSetPanelDisabledClass('Filter');
		        this.rdSetPanelDisabledClass('TableEdit');
		        this.rdSetPanelDisabledClass('Chart');
		        this.rdSetPanelDisabledClass('Crosstab');
		    }
		},
        

		rdAgToggleTablePanel: function (initializing) {

		    var expandedState = rdGetCookie('rdPanelExpanded_Table');
		    //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdPanelExpanded_Table', "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdPanelExpanded_Table', "False");
		        }
		    }
		    
		    if (expandedState != "False") {
		        var divClosed = document.getElementById('divPanelClosed_Table');
		        if (divClosed)
		            divClosed.style.display = 'none';
		        var divOpen = document.getElementById('divPanelOpen_Table');
		        if (divOpen)
		            divOpen.style.display = '';
		        var rowContent = document.getElementById('rowContentTable');
		        if (rowContent)
		            rowContent.style.display = '';
		        var rowMenuOptions = document.getElementById('rowsTableMenuOptions');
		        if (rowMenuOptions)
		            rowMenuOptions.style.display = '';
		        var rowControls = document.getElementById('rowTableControls');
		        if (rowControls)
		            rowControls.style.display = '';
		        var colAddToDashboard = document.getElementById('colAddToDashboardDataTable');
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = '';
		        var rowTableMenu = document.getElementById('colTableMenu');
		        if (rowTableMenu)
		            rowTableMenu.style.display = '';
		        var colTableExport = document.getElementById('colTableExportControls');
		        if (colTableExport)
		            colTableExport.style.display = '';

		        var colTableExport = document.getElementById('colAddToDashboardDataTable');
		        if (colTableExport)
		            colTableExport.style.display = '';

            }
		    else {
		        var divClosed = document.getElementById('divPanelClosed_Table');
		        if (divClosed)
		            divClosed.style.display = '';
		        var divOpen = document.getElementById('divPanelOpen_Table');
		        if (divOpen)
		            divOpen.style.display = 'none';
		        var rowContent = document.getElementById('rowContentTable');
		        if (rowContent)
		            rowContent.style.display = 'none';
		        var rowMenuOptions = document.getElementById('rowsTableMenuOptions');
		        if (rowMenuOptions)
		            rowMenuOptions.style.display = 'none';
		        var rowControls = document.getElementById('rowTableControls');
		        if (rowControls)
		            rowControls.style.display = 'none';
		        var colAddToDashboard = document.getElementById('colAddToDashboardDataTable');
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = 'none';
		        var colTableMenu = document.getElementById('colTableMenu');
		        if (colTableMenu)
		            colTableMenu.style.display = 'none';
		        var colTableExport = document.getElementById('colTableExportControls');
		        if (colTableExport)
		            colTableExport.style.display = 'none';
		    }

		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }

		    if (!initializing) {
		        this.rdSavePanelState("Table", expandedState)
		    }

		},

		rdAgToggleCrosstabPanel: function (sID, initializing) {
		    var expandedState = rdGetCookie('rdPanelExpanded_' + sID);
		    //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdPanelExpanded_' + sID, "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdPanelExpanded_' + sID, "False");
		        }
		    }

		    if (expandedState == "True") {
		        var divClosed = document.getElementById('divPanelClosed_' + sID);
		        if (divClosed)
		            divClosed.style.display = 'none';
		        var divOpen = document.getElementById('divPanelOpen_' + sID);
		        if (divOpen)
		            divOpen.style.display = '';
		        var rowContent = document.getElementById('rowContentAnalCrosstab_' + sID);
		        if (rowContent)
		            rowContent.style.display = '';
		        var colAddToDashboard = document.getElementById('colAnalCrosstabAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = '';
		        var colExportLinks = document.getElementById('colCrosstabExportControls_' + sID);
		        if (colExportLinks)
		            colExportLinks.style.display = '';
		        var colEdit = document.getElementById('colAxEdit_' + sID);
		        if (colEdit)
		            colEdit.style.display = '';
            }
		    else {
		        var divClosed = document.getElementById('divPanelClosed_' + sID);
		        if (divClosed)
		            divClosed.style.display = '';
		        var divOpen = document.getElementById('divPanelOpen_' + sID);
		        if (divOpen)
		            divOpen.style.display = 'none';
		        var rowContent = document.getElementById('rowContentAnalCrosstab_' + sID);
		        if (rowContent)
		            rowContent.style.display = 'none';
		        var colAddToDashboard = document.getElementById('colAnalCrosstabAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = 'none';
		        var colExportLinks = document.getElementById('colCrosstabExportControls_' + sID);
		        if (colExportLinks)
		            colExportLinks.style.display = 'none';
		        var colEdit = document.getElementById('colAxEdit_' + sID);
		        if (colEdit)
		            colEdit.style.display = 'none';
		    }
		    if (!document.getElementById("cellAxCrosstab_" + sID)) {  //Is crosstab table present yet?
		        var colAddToDashboard = document.getElementById('colAnalCrosstabAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = 'none';
		        var colExportLinks = document.getElementById('colCrosstabExportControls_' + sID);
		        if (colExportLinks)
		            colExportLinks.style.display = 'none';
            }
		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }

		    if (!initializing) {
		        this.rdSavePanelState(sID, expandedState)
		    }

		},


	    /* ---This function gets a list of AG columns for the datatype specified --- */
		rdAgGetColumnList: function (array, arrayLabel, sDataType, aAggrGroupLabel, aAggrGroupLabelClass, includeGroupAggr) {
		    var eleAgDataColumnDetails = document.getElementById('rdAgDataColumnDetails');
		    if (eleAgDataColumnDetails.value != '') {
		        var sDataColumnDetails = eleAgDataColumnDetails.value;
		        var aDataColumnDetails = sDataColumnDetails.split(',')
		        if (aDataColumnDetails.length > 0) {
		            var i; var j = 0;
		            var sColumnVal = '';
		            for (i = 0; i < aDataColumnDetails.length; i++) {
		                var sDataColumnDetail = aDataColumnDetails[i];
		                if (includeGroupAggr == false && sDataColumnDetail.indexOf('^') > -1) {
		                    sDataColumnDetail = '';
		                }
		                if (sDataColumnDetail.length > 1 && sDataColumnDetail.indexOf(':') > -1) {
		                    var sDataColumnType = sDataColumnDetail.split(':')[1].split("|")[0];
		                    if (sDataType == '') {
		                        sColumnVal = sDataColumnDetail.split(':')[0];
		                        array[i] = sColumnVal.split(';')[0];
		                        arrayLabel[i] = sColumnVal.split(';')[1];
		                        /* 21211 - Non IE browsers need a blank value defined for empty array entries */
		                        if (i == 1) {
		                            array[0] = '';
		                            arrayLabel[0] = '';
		                        }
		                        if (sDataColumnDetail.indexOf("|") > -1) {
		                            aAggrGroupLabel[i] = sDataColumnDetail.split('|')[1].split('-')[0];
		                            if (sDataColumnDetail.indexOf("^") > -1) {
		                                aAggrGroupLabelClass[i] = sDataColumnDetail.split('-')[1].split('^')[0];
		                            }
		                            else {
		                                aAggrGroupLabelClass[i] = sDataColumnDetail.split('|')[1].split('-')[1];
		                            }
		                        }
		                        else {
		                            aAggrGroupLabel[i] = '';
		                            aAggrGroupLabelClass[i] = '';
		                        }
		                    }
		                    else if (sDataType == 'number' && sDataColumnType == 'Number') {
		                        sColumnVal = sDataColumnDetail.split(':')[0];
		                        array[j] = sColumnVal.split(';')[0];
		                        arrayLabel[j] = sColumnVal.split(';')[1];
		                        j++;
		                        if (sDataColumnDetail.indexOf("|") > -1) {
		                            aAggrGroupLabel[j] = sDataColumnDetail.split('|')[1].split('-')[0];
		                            aAggrGroupLabelClass[j] = sDataColumnDetail.split('|')[1].split('-')[1];
		                        }
		                        else {
		                            aAggrGroupLabel[j] = '';
		                            aAggrGroupLabelClass[j] = '';
		                        }
		                    }
		                }
		            }
		            if (sDataType == 'number') {
		                array.unshift('');
		                arrayLabel.unshift('');
		            }
		        }
		    }
		},

		rdAgGetColumnDataType: function (sColumn) {
		    var eleAgDataColumnDetails = document.getElementById('rdAgDataColumnDetails');
		    if (eleAgDataColumnDetails.value != '') {
		        var sDataColumnDetails = eleAgDataColumnDetails.value;
		        var aDataColumnDetails = sDataColumnDetails.split(',')
		        if (aDataColumnDetails.length > 0) {
		            var i;
		            for (i = 0; i < aDataColumnDetails.length; i++) {
		                var sDataColumnDetail = aDataColumnDetails[i];
		                if (sDataColumnDetail.length > 1 && sDataColumnDetail.indexOf(':') > -1) {
		                    var sDataColumn = sDataColumnDetail.split(':')[0];
		                    sDataColumn = sDataColumn.split(';')[0];
		                    if (sDataColumn == sColumn) {
		                        //22397
		                        return sDataColumnDetail.split(':')[1].split("|")[0];
		                    }
		                }
		            }
		        }
		    }
		},


		rdAgToggleChartPanel: function (sID, initializing) {

		    var expandedState = rdGetCookie('rdPanelExpanded_' + sID);
		    //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdPanelExpanded_' + sID, "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdPanelExpanded_' + sID, "False");
		        }
		    }

		    if (expandedState == "True") {
		        var divClosed = document.getElementById('divPanelClosed_' + sID);
		        if (divClosed)
		            divClosed.style.display = 'none';
		        var divOpen = document.getElementById('divPanelOpen_' + sID);
		        if(divOpen)
		            divOpen.style.display = '';
		        var rowContent = document.getElementById('rowContentAnalChart_' + sID);
		        if (rowContent)
		            rowContent.style.display = '';
		        var colAddToDashboard = document.getElementById('colAnalChartAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = '';
		        var colEdit = document.getElementById('colAcEdit_' + sID);
		        if (colEdit)
		            colEdit.style.display = '';
		    }
		    else {
		        var divClosed = document.getElementById('divPanelClosed_' + sID);
		        if (divClosed)
		            divClosed.style.display = '';
		        var divOpen = document.getElementById('divPanelOpen_' + sID);
		        if (divOpen)
		            divOpen.style.display = 'none';
		        var rowContent = document.getElementById('rowContentAnalChart_' + sID);
		        if (rowContent)
		            rowContent.style.display = 'none';
		        var colAddToDashboard = document.getElementById('colAnalChartAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = 'none';
		        var colEdit = document.getElementById('colAcEdit_' + sID);
		        if (colEdit)
		            colEdit.style.display = 'none';
		    }
		    if (!document.getElementById("rdAcChart_" + sID)) {
		        var colAddToDashboard = document.getElementById('colAnalChartAddDashboard_' + sID);
		        if (colAddToDashboard)
		            colAddToDashboard.style.display = 'none';
		    }
		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }


		    if (!initializing) {
		        this.rdSavePanelState(sID, expandedState)
		    }

		},

		rdSavePanelState: function (sPanelID, sExpanded) {
		    //Save the panel state in the SaveFile/bookmark.
		    var rdPanelParams = "&rdReport=" + document.getElementById("rdAgReportId").value;
		    rdPanelParams += "&rdAgPanelID=" + sPanelID;
		    rdPanelParams += "&rdAgId=" + document.getElementById('rdAgId').value;
		    rdPanelParams += "&rdAgPanelEpanded=" + sExpanded;
		    rdAjaxRequestWithFormVars('rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=UpdateAgPanelState' + rdPanelParams);
		},

		rdChangeAggregateOptions: function(){
		    var aAggrList = []; var aAggrListLabel = []; var aAggrGroupLabel = []; var aAggrGroupLabelClass = [];

		    this.rdAgGetColumnList(aAggrList, aAggrListLabel, '', aAggrGroupLabel, aAggrGroupLabelClass, false);
	
		    var rdColList = document.getElementById('rdAgAggrColumn');
		    var sVal = rdColList.options[rdColList.selectedIndex].value;

		    var dataType = this.rdAgGetColumnDataType(sVal);
            // for the blank default option, set datatype to a random value instead of undefined, so that all the aggregate options are repopulated.26028
		    if ( sVal == '' )
		        dataType = 'all';
		    rdchangeList('rdAgAggrFunction', aAggrList, aAggrListLabel, dataType, '', '');
		},

		rdAgTableTogglePanelMenu: function (initializing) {

		    var expandedState = rdGetCookie('rdTablePanelMenuExpanded');
		    //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdTablePanelMenuExpanded', "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdTablePanelMenuExpanded', "False");
		        }
		    }

		    if (expandedState == "False") {
		        var menu = document.getElementById('rowTableMenu');
		        if (menu)
		            menu.style.display = 'none';
		    }
		    else {
		        var menu = document.getElementById('rowTableMenu');
		        if (menu)
		            menu.style.display = '';
		    }
		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }

		},

		rdAgChartTogglePanelMenu: function (sID, initializing) {
  
		    var expandedState = rdGetCookie('rdChartPanelMenuExpanded_' + sID);
		    //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdChartPanelMenuExpanded_' + sID, "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdChartPanelMenuExpanded_' + sID, "False");
		        }
		    }
		    if (expandedState == "False") {
		        var types = document.getElementById('divAcChartTypes_' + sID);
		        if (types)
		            types.style.display = 'none';
		        var lists = document.getElementById('divChartLists_' + sID);
		        if (lists)
		            lists.style.display = 'none';
		        var controls = document.getElementById('divAcControls_' + sID);
		        if (controls)
		            controls.style.display = 'none';
		    }
		    else {
		        var types = document.getElementById('divAcChartTypes_' + sID);
		        if (types)
		            types.style.display = '';
		        var lists = document.getElementById('divChartLists_' + sID);
		        if (lists)
		            lists.style.display = '';
		        var controls = document.getElementById('divAcControls_' + sID);
		        if (controls)
		            controls.style.display = '';
		    }
		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }

		},
    
		rdAgCrosstabTogglePanelMenu: function (sID, initializing) {

		    var expandedState = rdGetCookie('rdCrosstabPanelMenuExpanded_' + sID);
            //We do not want to toggle if we are intializing the AG
		    if (!initializing) {
		        if (expandedState != "True") {
		            expandedState = "True";
		            rdSetCookie('rdCrosstabPanelMenuExpanded_' + sID, "True");
		        }
		        else {
		            expandedState = "False";
		            rdSetCookie('rdCrosstabPanelMenuExpanded_' + sID, "False");
		        }
		    }

		    if (expandedState == "False") {
		        var controls = document.getElementById('divAxControls_' + sID);
		        if(controls)
		            controls.style.display = 'none';
		    }
		    else {
		        var controls = document.getElementById('divAxControls_' + sID);
		        if (controls)
		            controls.style.display = '';
		        var selected = document.getElementById('divAxEditSelected_' + sID);
		        if (selected)
		            selected.style.display = '';
		        var unselected = document.getElementById('divAxEditUnselected_' + sID);
		        if (unselected)
		            unselected.style.display = 'none';
		    }
		    if (typeof window.rdRepositionSliders != 'undefined') {
		        //Move CellColorSliders, if there are any.
		        rdRepositionSliders();
		    }

		},

		rdAgShowTableMenuTab: function (sTabName, bCheckForReset, sSelectedColumn) {

		    var bNoData = false;
		    var bOpen = true;

		    //sTabName may have a ,
		    sTabName = sTabName.replace(/,/g, "")

		    if (sTabName.length == 0) {
		        bOpen = false;
		    } else {
		        var eleSelectedTab = document.getElementById('lblHeading' + sTabName);
		        var eleSelectedRow = document.getElementById('row' + sTabName);

		        //24368
                if (eleSelectedTab && eleSelectedTab.className.indexOf('rdAgCommandHighlight') != -1) {
		            bOpen = false;
		        }
		        if (bCheckForReset) {
		            if (location.href.indexOf("rdAgLoadSaved") != -1) {
		                bOpen = false;
		            }
		        }
		    }
		    if (bNoData) {
		        bOpen = true;  //When no data, that tab must always remain open.
		    }

		    document.getElementById('rdAgCurrentOpenTablePanel').value = '';

		    this.rdSetClassNameById('lblHeadingGroup', 'rdAgCommandIdle');
		    this.rdSetClassNameById('lblHeadingAggr', 'rdAgCommandIdle');
		    this.rdSetClassNameById('lblHeadingPaging', 'rdAgCommandIdle');
		    this.rdSetClassNameById('lblHeadingSortOrder', 'rdAgCommandIdle');
		    this.rdSetClassNameById('lblHeadingLayout', 'rdAgCommandIdle');

		    this.rdSetDisplayById('rowLayout', 'none');
		    this.rdSetDisplayById('rowSortOrder', 'none');
		    this.rdSetDisplayById('rowGroup', 'none');
		    this.rdSetDisplayById('rowAggr', 'none');
		    this.rdSetDisplayById('rowPaging', 'none');


		    if (bOpen && eleSelectedTab) {
		        document.getElementById('rdAgCurrentOpenTablePanel').value = sTabName;
		        eleSelectedTab.className = 'rdAgCommandHighlight';

		        if (eleSelectedRow)
		            eleSelectedRow.style.display = '';
		        if (!bCheckForReset && eleSelectedRow && eleSelectedRow.firstChild)   // Avoid flicker/fading effect when Paged/Sorted/Postbacks.
		            rdFadeElementIn(eleSelectedRow.firstChild, 400);    //#11723, #17294 tr does not handle transition well.
		    }

		    if (sTabName == "Group") {
		        this.rdAgGetGroupByDateOperatorDiv();
		    }
		},

		rdSetClassNameById: function (sId, sClassName) {
			var ele = document.getElementById(sId);
			if(ele) {
				ele.className = sClassName;
			}
		},
		rdSetDisplayById : function(sId, sDisplay) {
			var ele = document.getElementById(sId);
			if(ele) {
				ele.style.display = sDisplay;
			}
		},
		rdSetPanelModifiedClass: function (sPanel) {
		    var nodeButton = Y.one("#col" + sPanel);
		    if (Y.Lang.isValue(nodeButton) && nodeButton.one('table').hasClass('rdHighlightOn')) {
		        nodeButton._node.style.fontWeight = 'bold';
		    }
		},
		rdSetPanelDisabledClass: function (sPanel) {
		    var nodeButton = Y.one("#col" + sPanel);
		    if (nodeButton != null) {
		        nodeButton.addClass("rdAgDisabledTab");
		    }
		},
		rdAgGetGroupByDateOperatorDiv : function(){
			// Function used by the Grouping division for hiding/unhiding the GroupByOperator Div.
			if((document.rdForm.rdAgPickDateColumnsForGrouping.value.indexOf(document.rdForm.rdAgGroupColumn.value + ",")!=-1) && (document.rdForm.rdAgGroupColumn.value.length != 0)){
				if(Y.Lang.isValue(Y.one('#divGroupByDateOperator')))
					ShowElement(this.id,'divGroupByDateOperator','Show');
			}
			else{
				if(Y.Lang.isValue(Y.one('#divGroupByDateOperator'))){
					ShowElement(this.id,'divGroupByDateOperator','Hide');
					document.rdForm.rdAgDateGroupBy.value='';
				}
			}
		},
	
	
		/* -----Draggable Panels----- */
		rdInitDraggableAgPanels : function(){
			var bDraggableAgPanels = false;
			var eleDraggableAgPanels = document.getElementById('rdAgDraggablePanels');
			if (eleDraggableAgPanels!= null) bDraggableAgPanels = true;  
		  			
			var aDraggableAgPanels = this.rdGetDraggableAgPanels();
		    //Destroy the registered drag/drop nodes if any.
			for (i = 0; i < aDraggableAgPanels.length; i++) {
			    Y.DD.DDM.getNode(aDraggableAgPanels[i]).destroy();
			}
			if (aDraggableAgPanels.length > 1) {
			    for (var i = 0; i < aDraggableAgPanels.length; i++) {
			        var eleAgPanel = aDraggableAgPanels[i];
			        if (bDraggableAgPanels) {

			            var pnlNode = Y.one('#' + eleAgPanel.id);
			            var pnlDD = new Y.DD.Drag({
			                node: pnlNode
			            });
			            var pnlDrop = pnlNode.plug(Y.Plugin.Drop);
                        //25557
			            pnlNode.addClass('dragHandleOnly');

			            var pnlDragged = null;
			            var originalPanelPosition = [0, 0];
			            var bDoNothingMore = false;

			            pnlDD.on('drag:start', this.Panel_onDragStart, this);
			            pnlDD.on('drag:drag', this.Panel_onDrag, this);
			            pnlDD.on('drag:over', this.Panel_onDragOver, this);
			            pnlDD.on('drag:drophit', this.Panel_onDropHit, this);
			            pnlDD.on('drag:end', this.Panel_onDragEnd, this);

			            var elePanelHeaderId = (Y.Selector.query('table.rdAgContentHeadingRow', eleAgPanel).length == 0 ?
                                                Y.Selector.query('td.rdAgContentHeading', eleAgPanel)[0].id :
                                                Y.Selector.query('table.rdAgContentHeadingRow', eleAgPanel)[0].id);

			            var pnlTitleNode = Y.one('#' + elePanelHeaderId);
			            pnlDD.addHandle('#' + elePanelHeaderId).plug(Y.Plugin.DDWinScroll, { horizontal: false, vertical: true, scrollDelay: 100, windowScroll: true });
			            pnlTitleNode.setStyle('cursor', 'move');
			        }
			    }
			}
		},
			
		/* -----Events----- */
		
		Panel_onDragStart : function(e) {
			pnlDragged = e.target.get('dragNode').getDOMNode();
			this.rdSetDraggableAgPanelsZIndex(pnlDragged, e.target.panels);
			Y.DOM.setStyle(pnlDragged, "opacity", '.65');
			originalPanelPosition = Y.DOM.getXY(pnlDragged);
			bDoNothingMore = false;
			this.set('targetPanel', null);
		},
		
		Panel_onDragOver : function(e) {
			this.set('targetPanel', e.drop.get('node').getDOMNode());
			
			var eleTargetPanel = this.get('targetPanel');
			pnlDragged = e.target.get('dragNode').getDOMNode();
			
			if(eleTargetPanel.id.match('rdDivAgPanelWrap_')) {
					var regionDraggedPanel = Y.DOM.region(pnlDragged);
					var regionTargetPanel = Y.DOM.region(eleTargetPanel);
					var nTargetPanelHeight = regionTargetPanel.height; 
					eleTargetPanelHandle = eleTargetPanel.nextSibling;
					if(originalPanelPosition[1] < regionDraggedPanel.top){
						if(regionDraggedPanel.top > (regionTargetPanel.top + Math.round(nTargetPanelHeight/2))){
							 eleTargetPanel.nextSibling.firstChild.firstChild.firstChild.className = 'rdAgDropZoneActive';
						}else{
							 eleTargetPanel.previousSibling.firstChild.firstChild.firstChild.className = 'rdAgDropZoneActive';
						}
					}else{
						 if(regionDraggedPanel.top < (regionTargetPanel.top + Math.round(nTargetPanelHeight/2))){
							eleTargetPanel.previousSibling.firstChild.firstChild.firstChild.className = 'rdAgDropZoneActive';                             
						}else{
							eleTargetPanel.nextSibling.firstChild.firstChild.firstChild.className = 'rdAgDropZoneActive';  
						}
					}
				} 
		},
		
		Panel_onDrag : function(e) {
			this.rdNeutralizeDropZoneColor();   
			
			var eleTargetPanel = this.get('targetPanel');
			
			if(!Y.Lang.isValue(eleTargetPanel)){							
				pnlDragged.previousSibling.firstChild.firstChild.firstChild.className = 'rdAgDropZoneActive';
			}
		},
		
		Panel_onDropHit : function(e) {
			this.rdMoveAgPanels(pnlDragged, this.get('targetPanel'), originalPanelPosition, bDoNothingMore);		    
			pnlDragged.style.cssText = '';
			Y.DOM.setStyle(pnlDragged, "opacity", '1');
			bDoNothingMore = true;
		},
		
		Panel_onDragEnd : function(e) {
			var context = this;
			this.rdMoveAgPanels(pnlDragged, this.get('targetPanel'), originalPanelPosition, bDoNothingMore);
			pnlDragged.style.cssText = '';
			Y.DOM.setStyle(pnlDragged, "opacity", '1');
			if(LogiXML.features['touch']) 
				setTimeout(function(){context.rdResetAGPanelAfterDDScroll(pnlDragged)}, 1000);  // Do this for the Tablet only, #15364.
		},
		
		/* -----Draggable Panel Methods----- */
		
		rdMoveAgPanels : function(eleDraggedPanel, eleTargetPanel, originalPanelPosition, bDoNothing) {
			
			if(!bDoNothing){
			
				var regionDraggedPanel = Y.DOM.region(eleDraggedPanel);						
				var eleDraggedPanelHandle = eleDraggedPanel.nextSibling;
					
				if(eleTargetPanel){						
					
					var regionTargetPanel = Y.DOM.region(eleTargetPanel);	
					var nTargetPanelHeight = regionTargetPanel.height;
					var eleTargetPanelHandle = eleTargetPanel.nextSibling;							
					
					if(eleTargetPanel.id.match('rdDivAgPanelWrap_')) {
						
						if(originalPanelPosition[1] < regionDraggedPanel.top){
							if(regionDraggedPanel.top > (regionTargetPanel.top + Math.round(nTargetPanelHeight/2))){
								 if(eleTargetPanelHandle.nextSibling){
									eleTargetPanel.parentNode.insertBefore(eleDraggedPanel, eleTargetPanelHandle.nextSibling);
									eleTargetPanel.parentNode.insertBefore(eleDraggedPanelHandle, eleTargetPanelHandle.nextSibling.nextSibling);                                
								}else{
									 eleTargetPanel.parentNode.appendChild(eleDraggedPanel);
									 eleTargetPanel.parentNode.appendChild(eleDraggedPanelHandle);
								}
							}else{
								eleTargetPanel.parentNode.insertBefore(eleDraggedPanel, eleTargetPanel);
								eleTargetPanel.parentNode.insertBefore(eleDraggedPanelHandle, eleTargetPanel);
							}
							this.rdSaveDraggableAgPanelPositions();
						}else{
							 if(regionDraggedPanel.top < (regionTargetPanel.top + Math.round(nTargetPanelHeight/2))){
								eleTargetPanel.parentNode.insertBefore(eleDraggedPanel, eleTargetPanel);
								eleTargetPanel.parentNode.insertBefore(eleDraggedPanelHandle, eleTargetPanel);                          
							}else{
								if(eleTargetPanelHandle.nextSibling){
									eleTargetPanel.parentNode.insertBefore(eleDraggedPanel, eleTargetPanelHandle.nextSibling);
									eleTargetPanel.parentNode.insertBefore(eleDraggedPanelHandle, eleTargetPanelHandle.nextSibling.nextSibling);
								}else{
									eleTargetPanel.parentNode.appendChild(eleDraggedPanel);
									eleTargetPanel.parentNode.appendChild(eleDraggedPanelHandle);
								}
							} 
							this.rdSaveDraggableAgPanelPositions();
						}
					}
				}
				else{
					var aDraggableAgPanels = this.rdGetDraggableAgPanels();
					var regionDraggedPanel = Y.DOM.region(eleDraggedPanel);
					if(originalPanelPosition[1] < regionDraggedPanel.top){
						if(eleDraggedPanel.id != aDraggableAgPanels[aDraggableAgPanels.length-1].id){
							if(regionDraggedPanel.top > Y.DOM.region(aDraggableAgPanels[aDraggableAgPanels.length-1]).bottom){
								aDraggableAgPanels[0].parentNode.appendChild(eleDraggedPanel);
								aDraggableAgPanels[0].parentNode.appendChild(eleDraggedPanelHandle);
								this.rdSaveDraggableAgPanelPositions();
							}
						}
					}else{
						if(eleDraggedPanel.id != aDraggableAgPanels[0].id){
							if(regionDraggedPanel.top < Y.DOM.region(aDraggableAgPanels[0]).top){
								aDraggableAgPanels[0].parentNode.insertBefore(eleDraggedPanel, aDraggableAgPanels[0]);
								aDraggableAgPanels[0].parentNode.insertBefore(eleDraggedPanelHandle, aDraggableAgPanels[0]);
								this.rdSaveDraggableAgPanelPositions();
							}
						}
					}
				}
				this.rdNeutralizeDropZoneColor();
				eleDraggedPanel.style.top = '0px';   
				eleDraggedPanel.style.left = '0px';
			}
			
		},
		
		rdSaveDraggableAgPanelPositions : function(){
			var rdPanelParams = "&rdReport=" + document.getElementById("rdAgReportId").value;
			rdPanelParams += "&rdAgPanelOrder="; 
			var aDraggableAgPanels = this.rdGetDraggableAgPanels();
			for (var i=0; i < aDraggableAgPanels.length; i++){
			    var eleAgPnl = aDraggableAgPanels[i];
			    if(rdPanelParams.indexOf(eleAgPnl.id.replace('rdDivAgPanelWrap_', '') + ',') < 0)
				    rdPanelParams += eleAgPnl.id.replace('rdDivAgPanelWrap_', '') + ',';
			}
			rdPanelParams += "&rdAgId=" + document.getElementById('rdAgId').value;

			window.status = "Saving dashboard panel positions.";
			rdAjaxRequestWithFormVars('rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=UpdateAgPanelOrder' + rdPanelParams);
		},

		rdGetDraggableAgPanels : function(){
				var aDraggableAgPanels = new Array();
				var eleDivAgPanels = document.getElementById('rdDivAgPanels');
				if(eleDivAgPanels == null) return aDraggableAgPanels; //#16596.
				var aDraggableAgDivs = eleDivAgPanels.getElementsByTagName("div")
				for(i=0;i<aDraggableAgDivs.length;i++){
					var eleDraggableAgDiv = aDraggableAgDivs[i];
					if (eleDraggableAgDiv.id && eleDraggableAgDiv.id.indexOf('rowMenu') < 0 && eleDraggableAgDiv.id.indexOf('rowTitle') < 0) {
						if((eleDraggableAgDiv.id.indexOf('rdDivAgPanelWrap_row') > -1)) {
						    if(Y.Lang.isValue(eleDraggableAgDiv.firstChild.firstChild)){
						        if(eleDraggableAgDiv.firstChild.firstChild.firstChild.style.display != 'none'){
						            aDraggableAgPanels.push(eleDraggableAgDiv);
						        }
						    }else{
                                //Defensive way of avoiding the empty panel issues.
						        var eleEmptyPanel = Y.one(eleDraggableAgDiv).getDOMNode();
						        var eleEmptyPanelDropZone = eleEmptyPanel.previousSibling;
						        eleEmptyPanel.parentNode.removeChild(eleEmptyPanel);
						        eleEmptyPanelDropZone.parentNode.removeChild(eleEmptyPanelDropZone);
						        eleDraggableAgDiv = Y.one('#' + eleDraggableAgDiv.id).getDOMNode();
						        aDraggableAgPanels.push(eleDraggableAgDiv);
						    }
						}
					}
				}
				return aDraggableAgPanels;
		},
		
		rdSetDraggableAgPanelsZIndex : function(eleAgPanel, aDraggableAgPanels){
			
			aDraggableAgPanels = this.rdGetDraggableAgPanels()
			for (var i=0; i < aDraggableAgPanels.length; i++){
				var eleAgPnl = aDraggableAgPanels[i];
				if(eleAgPnl.id == eleAgPanel.id){
					 Y.DOM.setStyle(eleAgPnl, "zIndex", 1000);
				}else{
					Y.DOM.setStyle(eleAgPnl, "zIndex", 0);
				}           
			}    
		},
					
		rdResetAGPanelAfterDDScroll : function(elePnlDragged){

			var pnlDragged = Y.one(elePnlDragged);
			pnlDragged.setStyles({
				left:0,
				top:0        
			});    
		},
		
		rdNeutralizeDropZoneColor : function(){

			var aDropZoneTDs = Y.Selector.query('td.rdAgDropZoneActive', Y.DOM.byId('rdDivAgPanels'));
			for (var i=0; i < aDropZoneTDs.length; i++){
				var eleDropZoneTD = aDropZoneTDs[i];
				eleDropZoneTD.className = 'rdAgDropZone';
			}
		}
		
	},{
		// Y.AnalysisGrid properties		
		/**
		 * The identity of the widget.
		 *
		 * @property AnalysisGrid.NAME
		 * @type String
		 * @default 'AnalysisGrid'
		 * @readOnly
		 * @protected
		 * @static
		 */
		NAME : 'analysisgrid',
		
		/**
		 * Static property used to define the default attribute configuration of
		 * the Widget.
		 *
		 * @property AnalysisGrid.ATTRS
		 * @type {Object}
		 * @protected
		 * @static
		 */
		ATTRS : {
		
			targetPanel : {
				value: null
			}
		
			/*rdFilterOldComparisonOptionsArray: {
				value: new Array()
			},
			rdFilterNewComparisonOptionsArray: {
				value: new Array()
			}*/			
		},

        rdSaveColumnWidths: function () {
            if (!LogiXML || !LogiXML.ResizableColumns || !LogiXML.ResizableColumns.getWidths || !document.rdForm)
                return;

            var hidden = document.getElementsByName("rdColumnWidths");

            if (hidden && hidden.length > 0)
                hidden = hidden[0];
            else
            {
                hidden = document.createElement("input");
                hidden.type = "hidden";
                hidden.name = "rdColumnWidths";
                document.rdForm.appendChild(hidden);
            }

            var widths = LogiXML.ResizableColumns.getWidths();

            hidden.value = JSON.stringify(widths);
        }
	});

}, '1.0.0', {requires: ['dd-drop-plugin', 'dd-plugin', 'dd-scroll', 'dd-constrain']});


function rdAgSwapFilterMode() {
    if (document.getElementById('rdAfMode_rdAgAnalysisFilter').value == "Design") {
        rdAfSetMode('rdAgAnalysisFilter', 'Simple')
    }else{
        rdAfSetMode('rdAgAnalysisFilter', 'Design')
    }
}


var sColorPicker = '1';

function GetColorPicker(sColorPickerValue, obj){
    sColorPicker = sColorPickerValue;    
}

function PickGaugeGoalColor(colColor){
    var sColor = Y.Color.toHex(Y.one('#' + colColor.id).getComputedStyle('backgroundColor'));
    var eleColorHolder = document.getElementById('rdAgGaugeGoalsColor' + sColorPicker);
    eleColorHolder.value = sColor;
    var elePickedColorIndicator = document.getElementById('rectColor' + sColorPicker);
    elePickedColorIndicator.style.backgroundColor = sColor;
    ShowElement(this.id,'ppColors','Hide');
}

/* --- Helper functions to change drop down lists for AG aggregate as well as y-axis columns.--- */
function rdchangeList(rdEleId, aNewAggrList, aLabel, sDataColumnType, aAggrGroupLabel, aAggrGroupLabelClass) {
    var rdAggrList = document.getElementById(rdEleId);
    var sSelectedValue
    if (rdAggrList.selectedIndex != -1) {
        sSelectedValue = rdAggrList.options[rdAggrList.selectedIndex].text;
    }
    rdemptyList(rdEleId);    
    rdfillList(rdEleId, aNewAggrList, aLabel, sDataColumnType, sSelectedValue, aAggrGroupLabel, aAggrGroupLabelClass);
}

function rdemptyList(rdEleId) {
    var rdAggrList = document.getElementById(rdEleId);
    while (rdAggrList.options.length) rdAggrList.options[0] = null;

    //Remove the option groups if they are present (they get rebuilt later)
    for (var i = 0; i < rdAggrList.childNodes.length; i++) {
        if (rdAggrList.childNodes[i].nodeName == "optgroup" || rdAggrList.childNodes[i].nodeName == "OPTGROUP") {
            rdAggrList.childNodes[i].parentNode.removeChild(rdAggrList.childNodes[i]);
            i = i - 1;
        }
    }
}

function rdfillList(rdEleId, arr, aLabel, sDataColumnType, sSelectedValue, arrGroupLabel, arrGroupLabelClass) {
    if ( !sDataColumnType || sDataColumnType == '' ) {
        return
    }

    if (sDataColumnType.toLowerCase() == "text" ||
        sDataColumnType.toLowerCase() == "date" ||
        sDataColumnType.toLowerCase() == "datetime" ||
        sDataColumnType.toLowerCase() == "boolean") {
        arr = ["COUNT", "DISTINCTCOUNT"];
        aLabel = ["Count", "Distinct Count"];
    }
    else {
        arr = ["SUM", "AVERAGE", "STDEV", "COUNT", "DISTINCTCOUNT", "MIN", "MAX"];
        aLabel = ["Sum", "Average", "Standard Deviation", "Count", "Distinct Count", "Minimum", "Maximum"];
    }


    var rdAggrList = document.getElementById(rdEleId);    
    var arrList = arr;
    var arrLabel = aLabel;
    var group = null;
    for (i = 0; i < arrList.length; i++) {
        //Option Grouping
        if (arrGroupLabel[i] != "" && arrGroupLabel[i]) {
            //create new group (either first one or the group item name has changed)
            if (group == null || group.getAttribute("Label") != arrGroupLabel[i]) {
                var group = document.createElement("optgroup");
                group.setAttribute("Label", arrGroupLabel[i]);
                group.setAttribute("Class", arrGroupLabelClass[i]);
                rdAggrList.appendChild(group);
            }
            option = new Option(arrLabel[i], arrList[i]);
            if (option.innerHTML == "")
                option.innerHTML = arrLabel[i];
            group.appendChild(option);
        }
        //Non grouped
        else {
            option = new Option(arrLabel[i], arrList[i]);
            rdAggrList.options[rdAggrList.length] = option;
        }

        // set the selected value '21254
        if (arrLabel[i] == sSelectedValue) {
            rdAggrList.selectedIndex = i;
        }
    }
}

