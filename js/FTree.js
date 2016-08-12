var debugOptions = {};

$("document").ready(function(){
    try {
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            throw 'Your browser does not support HTML5 File APIs'
        }
        if (!new Blob) {
            throw 'Your browser does not support HTML5 Blob type'
        }
        $('input[type="file"]').change(handleFileSelect);
		$('#linkBackToShelter').attr('href',window.location.href.replace('FamilyTree','index'))

		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(mutation.type == 'childList' && mutation.addedNodes.length > 0){
					for(var m = 0;m < mutation.addedNodes.length;m++){
						if(mutation.addedNodes[m].tagName == 'svg'){
							resizeByParent('#resultDiv svg');
						}
					}
				}
			});
		});

		var config = {
			attributes: true,
			childList: true
		};
		if ($('#resultDiv').get(0)){
			observer.observe($('#resultDiv').get(0), config);
		}
    } catch (e) {
        alert('Error: ' + e)
    }
});

function resizeByParent(selector){
	var pW = $(selector).parent().width();
	var iW = $(selector).width();
	var iH = $(selector).height();
	var pr = (iW/pW);
	if(pr > 1){
		var newW = iW/pr;
		var newH = iH/pr;
		$(selector).width(newW);
		$(selector).height(newH);
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
	$scope.engines = [
		{name:'circo'},
		{name:'dot'},
		{name:'fdp'},
		{name:'neato'},
		{name:'osage'},
		{name:'twopi'}
	];
	$scope.outputs = [
		{name:'Image (png) - Easy download', type:'png-image-element'},
		{name:'SVG', type:'svg'}
	];
	$scope.siblinghoodOptions = [
		{name:'Invisible',				show:false, styles:{primary:'filled',secondary:'filled'}},
		{name:'Filled',					show:true, styles:{primary:'filled',secondary:'filled'}},
		{name:'By siblinghood level',	show:true, styles:{primary:'dotted',secondary:'dashed'}}
	];
	$scope.rankdirs = [
		{name:'Top to bottom',type:'TB'},
		{name:'Left to right',type:'LR'},
		{name:'Bottom to top',type:'BT'},
		{name:'Right to left',type:'RL'}
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
	$scope.options.engine = $scope.engines[1];
	$scope.options.output = $scope.outputs[0];
	$scope.options.siblinghoodOption = $scope.siblinghoodOptions[2];
	$scope.options.rankdir = $scope.rankdirs[0];

	$scope.setGameObject = function(gameObject){
		$scope.gameObject = gameObject;
		$scope.loaded = $scope.gameObject != undefined;
		$('#resultDiv').html('');
		$('#vaultBoy').attr('src','fallout.png');
		$('#vaultBoy').attr('style','display:block;');
		$('#btnGenerateTree').removeClass('btn-danger');
		$('#btnGenerateCouplesGraph').removeClass('btn-danger');
		$('#btnGenerateTree').addClass('btn-primary');
		$('#btnGenerateCouplesGraph').addClass('btn-primary');
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
		var dwellersById = {};
		var fatheredBy = {};
		var motheredBy = {};
		for(var i = 0;i < dwellers.length;i++){
			var dweller = dwellers[i];
			var _id = dweller.serializeId;
			dwellersById[_id]=dweller;
			var relations = dweller.relations;
			var ascendants = '';
			$scope.setDwellerRelations(dweller);
			if(_id == debugOptions.debugDweller)
				console.log(dweller);
			if($scope.options.parentsLineType.show){
				if(dweller.fatherId && dweller.motherId){
					ascendants += dweller.fatherId + '->' + _id +'[style='+$scope.options.parentsLineType.style+',color='+$scope.options.parentsLineColor.male+'];';
					ascendants += dweller.motherId + '->' + _id +'[style='+$scope.options.parentsLineType.style+',color='+$scope.options.parentsLineColor.female+'];';
					if(!fatheredBy[dweller.fatherId])
						fatheredBy[dweller.fatherId] = [];
					fatheredBy[dweller.fatherId].push(dweller);
					if(!motheredBy[dweller.motherId])
						motheredBy[dweller.motherId] = [];
					motheredBy[dweller.motherId].push(dweller);
				}
			}
			if($scope.options.grandparentsLineType.show){
				if(dweller.gradfatherByFatherId && dweller.gradmotherByFatherId){
					ascendants += dweller.gradfatherByFatherId + '->' + _id +'[style='+$scope.options.grandparentsLineType.style+',color='+$scope.options.grandparentsLineColor.male+'];';
					ascendants += dweller.gradmotherByFatherId + '->' + _id +'[style='+$scope.options.grandparentsLineType.style+',color='+$scope.options.grandparentsLineColor.female+'];';
				}
				if(dweller.gradfatherByMotherId && dweller.gradmotherByMotherId){
					ascendants += dweller.gradfatherByMotherId + '->' + _id +'[style='+$scope.options.grandparentsLineType.style+',color='+$scope.options.grandparentsLineColor.male+'];';
					ascendants += dweller.gradmotherByMotherId + '->' + _id +'[style='+$scope.options.grandparentsLineType.style+',color='+$scope.options.grandparentsLineColor.female+'];';
				}
			}

			nodes += $scope.getDwellerNode(dweller) + newLine;
			if(ascendants != '')
				edges += ascendants+newLine;
		}
		if($scope.options.siblinghoodOption.show){
			edges += $scope.generateSiblingsEdges(fatheredBy,motheredBy);
		}
		var rankdir = 'rankdir='+$scope.options.rankdir.type+';'+newLine;
		$scope.printGraph('digraph g {'+rankdir+nodes + edges+'}');
	}

	$scope.generateSiblingsEdges = function(fatheredBy,motheredBy) {
		var edges = '';
		var siblings = {};
		for(var fatherId in fatheredBy){
			for(var i=0;i < fatheredBy[fatherId].length;i++){
				var offspring = fatheredBy[fatherId][i];
				var offId = offspring.serializeId;
				for(var j=i+1;j < fatheredBy[fatherId].length;j++){
					var sibling = fatheredBy[fatherId][j];
					var sibId = sibling.serializeId;
					if(!siblings[offId+'_'+sibId] && !siblings[sibId+'_'+offId]){
						siblings[offId+'_'+sibId] = {siblings:[offspring,sibling], byFather:true};
					}
				}
			}
		}
		for(var motherId in motheredBy){
			for(var i=0;i < motheredBy[motherId].length;i++){
				var offspring = motheredBy[motherId][i];
				var offId = offspring.serializeId;
				for(var j=i+1;j < motheredBy[motherId].length;j++){
					var sibling = motheredBy[motherId][j];
					var sibId = sibling.serializeId;
					if(!siblings[offId+'_'+sibId] && !siblings[sibId+'_'+offId]){
						siblings[offId+'_'+sibId] = {siblings:[offspring,sibling], byMother:true};
					}else{
						if(siblings[offId+'_'+sibId]){
							siblings[offId+'_'+sibId].byMother = true;
						}else if(siblings[sibId+'_'+offId]){
							siblings[sibId+'_'+offId].byMother = true;
						}
					}
				}
			}
		}
		for(var sib in siblings){
			var style = $scope.options.siblinghoodOption.styles.primary;
			if(siblings[sib].byFather && siblings[sib].byMother)
				style = $scope.options.siblinghoodOption.styles.secondary;
			var sibEdge = siblings[sib].siblings[0].serializeId;
			sibEdge += '->' + siblings[sib].siblings[1].serializeId;
			sibEdge += '[dir=both,style='+style+'];';
			edges += sibEdge;
		}
		return edges;
	}

	$scope.generateCouplesGraph = function(){
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
		var couples = {};
		var dwellersById = {};
		for(var i = 0;i < dwellers.length;i++){
			var _id = dwellers[i].serializeId;
			dwellersById[_id]=dwellers[i];
			$scope.setDwellerRelations(dwellers[i]);
			if(dwellers[i].fatherId && dwellers[i].motherId){
				var father = dwellers[i].fatherId;
				var mother = dwellers[i].motherId;
				couples[father + '_' + mother] = (couples[father + '_' + mother] || 0) + 1;
			}
		}

		for (var couple in couples){
			var father = couple.split('_')[0];
			var mother = couple.split('_')[1];
			var offspring = couples[couple];

			nodes += $scope.getDwellerNode(dwellersById[father]) + newLine;
			nodes += $scope.getDwellerNode(dwellersById[mother]) + newLine;
			edges += father + '--' + mother + '[label='+offspring+'];' + newLine;
		}

		var rankdir = 'rankdir='+$scope.options.rankdir.type+';'+newLine;
		$scope.printGraph('graph g {'+rankdir+nodes + edges+'}');
	}
	$scope.setDwellerRelations = function(dweller){
		var ascendants = dweller.relations.ascendants;
		for(var j = 0;j < ascendants.length;j++){
			if(ascendants[j] >= 0){
				switch (j){
					case 0:
						dweller.fatherId = ascendants[j];
						break;
					case 1:
						dweller.motherId = ascendants[j];
						break;
					case 2:
						dweller.gradfatherByFatherId = ascendants[j];
						break;
					case 3:
						dweller.gradmotherByFatherId = ascendants[j];
						break;
					case 4:
						dweller.gradfatherByMotherId = ascendants[j];
						break;
					case 5:
						dweller.gradmotherByMotherId = ascendants[j];
						break;
				}
			}
		}
	}

	$scope.getDwellerNode = function(dweller){
		var name = dweller.name + ' ' + dweller.lastName;
		var _id = dweller.serializeId;
		var nodeBorderColor = 'black';
		var nodeFillColor = 'white';
		var nodeFontColor = 'black';
		var nodeShape = $scope.options.dwellersShape.male;
		if(dweller.gender == 1)
			nodeShape = $scope.options.dwellersShape.female;
		var hairColor = '"#' + dweller.hairColor.toString(16).substring(2).toUpperCase() +'"';
		var skinColor = '"#' + dweller.skinColor.toString(16).substring(2).toUpperCase() +'"';
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
		node += '];';
		return node;
	}

	$scope.printGraph = function(graphString){
		if(debugOptions.printGraphString)
			console.log(graphString);

		$('#vaultBoy').attr('style','display:none;');
		$('#vaultBoy').attr('src','standing.jpg');
		$('#resultDiv').html('');
		var graphOptions = {
			engine: $scope.options.engine.name,
			format: $scope.options.output.type
		};

		var result = Viz(graphString, graphOptions);
		var resultElement = undefined;
		if($scope.options.output.type == 'svg'){
			var parser = new DOMParser();
			var svg = parser.parseFromString(result, "image/svg+xml");
			resultElement = svg.documentElement;
		}else{
			resultElement = result;
			resultElement.alt = "Click to open in a new tab";
			resultElement.onclick = function(){
				window.open(result.src);
			};
			resultElement.onload = function() {
				resizeByParent('#resultDiv img');
			}
		}
		if(resultElement){
			$(resultElement).appendTo('#resultDiv');
		}
	}

	$scope.showingGraph = function() {
		return $('#vaultBoy:visible').length == 0;
	}
});
