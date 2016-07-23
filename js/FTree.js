var debugOptions = {};

function ftreeLoad(){
    try {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            throw "Your browser does not support HTML5 File APIs"
        }
        if (!new Blob) {
            throw "Your browser does not support HTML5 Blob type"
        }
        document.getElementById("file_ftree").addEventListener("change", handleFileSelect, false)
    } catch (e) {
        alert("Error: " + e)
    }
}

function loadGameObject(gameObject){
	var scope = angular.element($('body').get(0)).scope();
	scope.$apply(function () {
		scope.setGameObject(gameObject);
	});
}

var app = angular.module('modFTree', []);

app.controller('ftreeController', function ($scope) {
	$scope.parentsLineColors = [
		{type:'All Black', 				male:'black',	female:'black'},
		{type:'By gender (blue/pink)', 	male:'blue',	female:'pink'}
	];
	$scope.grandparentsLineColors = [
		{type:'All Black', 							male:'black',	female:'black'},
		{type:'By parent\'s gender (blue/pink)', 	male:'blue',	female:'pink'}
	];
	$scope.parentsLineTypes = [
		{type:'Normal',show:true}
	];
	$scope.grandparentsLineTypes = [
		{type:'Invisible',	show:false,	style:'filled'},
		{type:'Normal',		show:true,	style:'filled'},
		{type:'Dashed',		show:true,	style:'dashed'},
		{type:'Dotted',		show:true,	style:'dotted'}
	];
	$scope.dwellersShapes = [
		{type:'Normal',		male:'rect',female:'rect'},
		{type:'By gender', 	male:'rect',female:'octagon'}
	];
	$scope.dwellersFillColors = [
		{type:'None'},
		{type:'Skin'}
	];
	$scope.dwellersBorderColors = [
		{type:'Black'},
		{type:'Hair'}
	];
	$scope.dwellersFontColors = [
		{type:'Black'},
		{type:'Hair'}
	];
	$scope.options = {};
	$scope.loaded=false;

	$scope.options.parentsLineColor = $scope.parentsLineColors[1];
	$scope.options.parentsLineType = $scope.parentsLineTypes[0];
	$scope.options.grandparentsLineColor = $scope.grandparentsLineColors[1];
	$scope.options.grandparentsLineType = $scope.grandparentsLineTypes[2];
	$scope.options.dwellersShape = $scope.dwellersShapes[1];
	$scope.options.dwellersFillColor = $scope.dwellersFillColors[1];
	$scope.options.dwellersBorderColor = $scope.dwellersBorderColors[1];
	$scope.options.dwellersFontColor = $scope.dwellersFontColors[0];

	$scope.setGameObject = function(gameObject){
		$scope.gameObject = gameObject;
		$scope.loaded = $scope.gameObject != undefined;
		if(document.getElementById('familyTreeImage'))
			document.getElementById('familyTreeImage').setAttribute('style','display:none;');
		document.getElementById('vaultBoy').setAttribute('src','fallout.png');
		document.getElementById('vaultBoy').setAttribute('style','display:block;');
	}
	$scope.generateTree = function(){
		if(!$scope.loaded){
			alert('Please load a save file first');
			return;
		}

		var dwellers = $scope.gameObject.dwellers.dwellers;
		var nodes='';
		var edges='';
		var newLine = '';
		if(debugOptions.printGraphString)
			newLine = '\n';
		for(var i = 0;i < dwellers.length;i++){
			var name = dwellers[i].name + ' ' + dwellers[i].lastName;
			var _id = dwellers[i].serializeId;
			var relations = dwellers[i].relations;
			var ascendants = '';
			for(var j = 0;j < relations.ascendants.length;j++){
				if(relations.ascendants[j] >= 0){
					var edgeStyle = undefined;
					var edgeColor = undefined;
					if(j <= 1){
						if(!$scope.options.parentsLineType.show)
							continue;
						edgeStyle = $scope.options.parentsLineType.style;
						edgeColor = (j % 2) == 0 ? $scope.options.parentsLineColor.male : $scope.options.parentsLineColor.female;
					}else{
						if(!$scope.options.grandparentsLineType.show)
							continue;
						edgeStyle = $scope.options.grandparentsLineType.style;
						edgeColor = (j % 2) == 0 ? $scope.options.grandparentsLineColor.male : $scope.options.grandparentsLineColor.female;
					}
					ascendants += relations.ascendants[j] + '->' + _id +'[style='+edgeStyle+',color='+edgeColor+'];';
				}
			}

			var nodeBorderColor = 'black';
			var nodeFillColor = 'white';
			var nodeFontColor = 'black';
			var nodeShape = $scope.options.dwellersShape.male;
			if(dwellers[i].gender == 1)
				nodeShape = $scope.options.dwellersShape.female;
			var hairColor = '"#' + dwellers[i].hairColor.toString(16).substring(2).toUpperCase() +'"';
			var skinColor = '"#' + dwellers[i].skinColor.toString(16).substring(2).toUpperCase() +'"';
			if($scope.options.dwellersFillColor.type == 'Skin')
				nodeFillColor = skinColor;
			if($scope.options.dwellersFontColor.type == 'Hair')
				nodeFontColor = hairColor;
			if($scope.options.dwellersBorderColor.type == 'Hair')
				nodeBorderColor = hairColor;
			var node = _id + '[label="['+_id+']'+name+'",style=filled';
			node += ',color='+nodeBorderColor;
			node += ',fillcolor='+nodeFillColor;
			node += ',fontcolor='+nodeFontColor;
			node += ',shape='+nodeShape;
			node += '];'+newLine;
			nodes += node;
			if(ascendants != '')
				edges += ascendants+newLine;
		}
		if(debugOptions.printGraphString)
			console.log(nodes + edges);

		var image = Viz('digraph g {'+nodes + edges+'}', { format: 'png-image-element' });
		image.id = "familyTreeImage";
		image.alt = "Click to open in a new tab";
		image.onclick = function(){
			window.open(image.src);
		};
		document.getElementById('vaultBoy').setAttribute('style','display:none;');
		document.getElementById('vaultBoy').setAttribute('src','standing.jpg');
		document.getElementById('familyTreeImage').remove();
		document.getElementById('ftreeDiv').appendChild(image);
	}
});
