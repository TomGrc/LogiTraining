function rdAddBookmark(sActionId, sReport, sBookmarkReqIds, sBookmarkSessionIds, sCollection, sBookmarkName, sCust1, sCust2, sDescription, sDescriptionMessage, nRowNr, sBookmarkId, bIsNgpBookmark) {
    
    rdValidationRowNrFilter = nRowNr
	var sErrorMsg = rdValidateForm()
	if (sErrorMsg) {
        rdValidationRowNrFilter = undefined
		alert(sErrorMsg)
		return
	}
	
    var sDesc = sDescription
    if (sDescriptionMessage.length!=0){
        sDesc = rdParentPopupPanel.getElementsByTagName("Input")[0].value;
    } 
    
    //Get the list of request parameters.
    var sReqParams
    sReqParams = "&rdActionId=" + sActionId
    sReqParams += "&rdReport=" + sReport
    sReqParams += "&rdBookmarkReqIds=" + encodeURIComponent(sBookmarkReqIds)
    sReqParams += "&rdBookmarkSessionIds=" + encodeURIComponent(sBookmarkSessionIds)
    sReqParams += "&rdBookmarkCollection=" + encodeURIComponent(sCollection)
    sReqParams += "&rdBookmarkName=" + encodeURIComponent(sBookmarkName)
    sReqParams += "&rdBookmarkCustomColumn1=" + encodeURIComponent(sCust1)
    sReqParams += "&rdBookmarkCustomColumn2=" + encodeURIComponent(sCust2)
    sReqParams += "&rdBookmarkDescription=" + encodeURIComponent(sDesc)
    sReqParams += "&rdBookmarkID=" + encodeURIComponent(Y.Lang.isValue(sBookmarkId) ? sBookmarkId : '')
    if (bIsNgpBookmark) {
        var rdBookmarkUserName = document.getElementsByName("rdBookmarkUserName")[0];
        if(rdBookmarkUserName) {
            sReqParams += "&rdBookmarkUserName=" + rdBookmarkUserName.value;
        }
    }
	
	
	// This is added specifically for radio buttons. #23741
	var frm = document.rdForm
	if (sPrevRadioId) sPrevRadioId = "";
	for (var i=0; i < frm.elements.length; i++) {
		var ele = frm.elements[i]
	    
	    if (!ele.type) {
            continue;  //Not an input element.
	    }
		
		if (ele.type == "radio") {
			
			if (sReqParams.indexOf("&" + ele.name + "=") != -1) continue;
			
			var sInputValue =  rdGetInputValues(ele);
			if (sReqParams.indexOf(sInputValue) == -1)
	            sReqParams += sInputValue;	
		}
		else if (ele.type == "select-one" && ele.options[ele.selectedIndex]) {
		    sReqParams += "&" + ele.id + "=" + ele.options[ele.selectedIndex].value;
		}
	}
	
    var aIds = sBookmarkReqIds.split(",")
    for (var i=0; i < aIds.length; i++) {
        var sId = aIds[i]
        if (sId != "rdReport") {    //20783
            var ele = document.getElementById(sId);
            if (ele) {    //#12959.
                //Changed to rdGetInputValues (defined in rdAjax2.js)
                var sReqAdd = rdGetInputValues(ele); //RD19046, value might have already been added to the request, dont duplicate it.
                if (sReqParams.indexOf(sReqAdd) == -1) {
                    sReqParams += rdGetInputValues(ele);
                }               
            }
            else if ((sReqParams.indexOf("&" + sId + "=") == -1) && document.getElementById("rdBookmarkReqId_" + sId)) {   //20099
				sReqParams += "&" + sId + "=" + document.getElementById("rdBookmarkReqId_" + sId).innerHTML;
            }				
        }
    }	
	
    bSubmitFormAfterAjax = true
    rdValidationRowNrFilter = nRowNr  
    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=AddBookmark" + sReqParams)
    rdValidationRowNrFilter = undefined
    //19809   
    if(typeof(rdParentPopupPanel) !== "undefined"){
        ShowElement(this.id,rdParentPopupPanel.id,'Hide')
    }
}

function rdEditBookmark(sActionId, sReport, BookmarkCollection, BookmarkID, sDescription, sDescriptionMessage, nRowNr, eleUpdateId) {
    rdValidationRowNrFilter = nRowNr
	var sErrorMsg = rdValidateForm()
	if (sErrorMsg) {
        rdValidationRowNrFilter = undefined
		alert(sErrorMsg)
		return
	}

    var sDesc = sDescription
    if (sDescriptionMessage.length!=0){
        sDesc = rdParentPopupPanel.getElementsByTagName("Input")[0].value;
    }
    
    var sReqParams
    sReqParams  = "&rdActionId=" + sActionId
    sReqParams += "&rdReport=" + sReport
    sReqParams += "&rdBookmarkCollection=" + BookmarkCollection
    sReqParams += "&rdBookmarkID=" + BookmarkID
    sReqParams += "&rdBookmarkDescription=" + rdAjaxEncodeValue(sDesc)
    bSubmitFormAfterAjax = true //#12541.
    rdValidationRowNrFilter = nRowNr
    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=EditBookmark" + sReqParams)
    rdValidationRowNrFilter = undefined

   
   if(rdParentPopupPanel){        
        ShowElement(this.id,rdParentPopupPanel.id,'Hide')
    }
    
    if (eleUpdateId) {
        //Special for ReportCenter. Update the text.
        var eleUpdate = document.getElementById(eleUpdateId)
        if (eleUpdate) {
           if (eleUpdate.textContent != undefined) {
                eleUpdate.textContent = sDesc //Mozilla, Webkit
            } else {
                eleUpdate.innerText = sDesc //IE
            }
        }
    }

}

function rdCopyBookmark(sActionId, sReport, SourceBookmarkCollection, SourceBookmarkUsername, DestinationBookmarkCollection, BookmarkID, SharedBookmarkID, sAcknowledge, sCopiedDescription) {

    var sReqParams
    sReqParams = "&rdActionId=" + sActionId
    sReqParams += "&rdReport=" + sReport
    sReqParams += "&rdSourceBookmarkCollection=" + SourceBookmarkCollection
    sReqParams += "&rdSourceBookmarkUsername=" + SourceBookmarkUsername
    sReqParams += "&rdDestinationBookmarkCollection=" + DestinationBookmarkCollection
    sReqParams += "&rdBookmarkID=" + BookmarkID
    sReqParams += "&rdSharedBookmarkID=" + SharedBookmarkID
    sReqParams += "&rdCopiedBookmarkDescription=" + sCopiedDescription
    sReqParams += "&rdAcknowledgeMessage=" + rdAjaxEncodeValue(sAcknowledge)
    //bSubmitFormAfterAjax = true //#12541, #10184.

    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=CopyBookmark" + sReqParams)

}

function rdRemoveBookmark(sActionId, sReport, BookmarkCollection, sBookmarkUserName, BookmarkID, sConfirm, eleRemoveId, sReportCenterID, nRowNr) {

    if (!(Y.Lang.isValue(BookmarkCollection) && BookmarkCollection != '')) {
        return; //Do not do anything when the bookmark collection is not provided, #19472.
    }
    var sReqParams
    sReqParams  = "&rdActionId=" + sActionId
    sReqParams += "&rdReport=" + sReport
    sReqParams += "&rdBookmarkCollection=" + BookmarkCollection
    sReqParams += "&rdBookmarkUserName=" + sBookmarkUserName
    sReqParams += "&rdBookmarkID=" + BookmarkID
    bSubmitFormAfterAjax = true //#12541, #10184.

    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=RemoveBookmark" + sReqParams)
    
    if (eleRemoveId) {
         rdAjaxRequest('rdAjaxCommand=RefreshElement&rdReport=' + sReport + '&rdRefreshElementID=' + sReportCenterID) 
    }
}


function rdShareBookmarkOrFolder(sActionId, sReport, BookmarkCollection, BookmarkID, FolderID, sharedWith, refreshDTID, bFromInput) {   
	
	var isSpanNode = false;
	var sRowId = "";

	var sReqParams = "";
	sReqParams += "&rdActionId=" + sActionId;
	sReqParams += "&rdReport=" + sReport;
	sReqParams += "&rdBookmarkCollection=" + BookmarkCollection;
	sReqParams += "&rdBookmarkID=" + BookmarkID;
	sReqParams += "&rdFolderID=" + FolderID;
	sReqParams += "&rdRefreshDTID=" + refreshDTID;
	

	if (bFromInput == "False") {

	    sReqParams += "&rdSharedCollection=" + sharedWith;

	} else {

        var sSharedWith = "&rdSharedCollection=";
	    var sharedNode = Y.one("#" + sharedWith);
	    if (!Y.Lang.isNull(sharedNode)) {
	        sSharedWith  += sharedNode.get('value');
	        if (sharedNode._node.tagName == 'SPAN') {
	            sSharedWith += sharedNode._node.innerHTML;
	            isSpanNode = true;
	            var n = sharedWith.lastIndexOf("_");
	            sRowId = "actShareBookmarkFromDataLayer_" + sharedWith.substring(n + 1);
	        }
	    }

	    //exit if sharedWith is undefined or an empty string. 24839
	    if (sSharedWith == "&rdSharedCollection=")
	        return;
        else
	        sReqParams += sSharedWith;
	}
	sReqParams += "&rdSharedFromInput=" + bFromInput;
	
	bSubmitFormAfterAjax = true;

	//BookmarkID or FolderID ?
	if (BookmarkID != ''){
	    rdAjaxRequestWithFormVars("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=ShareBookmark" + sReqParams, null, null, null, null, null, ['', '', ''], null)
	} else {
	    rdAjaxRequestWithFormVars("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=ShareBookmarkFolder" + sReqParams, null, null, null, null, null, ['', '', ''], null)
	}

	//Clear out the input text box	
	document.getElementById("InpUser").value = "";

	if ( isSpanNode == true) {
		var sharedTextNode = document.createElement("span");
		sharedTextNode.textContent = "Shared!"		
		var sharedButton = document.getElementById(sRowId).parentNode;
		sharedButton.parentNode.replaceChild(sharedTextNode,sharedButton);
	}	
		
	var sRefreshParams = "";
	sRefreshParams += "&rdReport=" + sReport;
	sRefreshParams += "&rdBookmarkCollection=" + BookmarkCollection;
	sRefreshParams += "&rdBookmarkID=" + BookmarkID;
	sRefreshParams += "&rdFolderID=" + FolderID;
	
	rdAjaxRequestWithFormVars("rdAjaxCommand=RefreshElement&rdRefreshElementID=rowBookmarkSharedWith" + sRefreshParams, null, null, null, null, null, ['', '', ''], null);


}

function rdUnShareBookmarkOrFolder(sActionId, sReport, BookmarkCollection, BookmarkID, FolderID, unSharedWith, refreshDTID) {   
		
    var sReqParams = "&rdActionId=" + sActionId;
    sReqParams += "&rdReport=" + sReport;
    sReqParams += "&rdBookmarkCollection=" + BookmarkCollection;
    sReqParams += "&rdBookmarkID=" + BookmarkID;
    sReqParams += "&rdFolderID=" + FolderID;
    sReqParams += "&rdRefreshDTID=" + refreshDTID;
    sReqParams += "&rdRemoveCollections=";
	var sharedNode = Y.one("#" + unSharedWith);
	if (!Y.Lang.isNull(sharedNode)) {
		sReqParams += sharedNode.get('value');
		if (sharedNode._node.tagName == 'SPAN') {
			sReqParams += sharedNode._node.innerHTML;
		}
	}
	bSubmitFormAfterAjax = true;
	
	//BookmarkID or FolderID
	if (BookmarkID != ''){
	    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=UnShareBookmark" + sReqParams, null, null, null, null, ['', '', ''], null);
	} else {
	    rdAjaxRequest("rdAjaxCommand=rdAjaxNotify&rdNotifyCommand=UnShareBookmarkFolder" + sReqParams, null, null, null, null, ['', '', ''], null);
	} 
	
	var sRefreshParams = "";
	sRefreshParams += "&rdReport=" + sReport;
	sRefreshParams += "&rdBookmarkCollection=" + BookmarkCollection;
	sRefreshParams += "&rdBookmarkID=" + BookmarkID;
	sRefreshParams += "&rdFolderID=" + FolderID;

	rdAjaxRequestWithFormVars("rdAjaxCommand=RefreshElement&rdRefreshElementID=rowBookmarkSharedWith" + sRefreshParams, null, null, null, null, null, ['','',''], null);	
}

function rdAddBookmarkNgpSave(sActionId, sReport, sBookmarkReqIds, sBookmarkSessionIds, sCollection, sBookmarkName, sCust1, sCust2, sDescription, sDescriptionMessage, nRowNr, sBookmarkId){
    var rdSaveASNewHiddenInput = Y.one('#rdSaveASNew');

    if (rdSaveASNewHiddenInput) {
        rdSaveASNewHiddenInput.set('value', 'saveAsNew');
    }
    
    rdAddBookmark(sActionId, sReport, sBookmarkReqIds, sBookmarkSessionIds, sCollection, sBookmarkName, sCust1, sCust2, sDescription, sDescriptionMessage, nRowNr, sBookmarkId, true);

}



