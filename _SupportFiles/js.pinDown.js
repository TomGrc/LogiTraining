var i = 0;
var demographicsList;
var demographics = new Array();

function getDemographicsList(selectedAPN, selectedDimension){
	if (selectedAPN != 'null'){
		demographics.push(selectedAPN);
		return '"demographics":{"' + selectedDimension + '":"' + demographics + '"}'	
	}
	return '"demographics":null';
}