/*
    Simulation of the Urinary Concentrating Mechanism in the Nephron (JS)
    Idea and Science: Dr Robert Wilkins, Department of Physiology, Anatomy and Genetics, University of Oxford
    Code: Dr Damion Young and Jon Mason, Medical Sciences Division Learning Technologies, University of Oxford (msdlt@medsci.ox.ac.uk)
	Project Home Page: https://github.com/jonmase/nephron
    Copyright (C) 2015 University of Oxford
	
    This file is part of Nephron

    Nephron is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Nephron is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Nephron.  If not, see <http://www.gnu.org/licenses/>.
*/

//Declare stepping/running values
var loopSteps = 3; 		//Number of steps in each loop
var currentStep = 0;		//counts current step
var totalStepCount = 0;		//Counts total number of steps that have been taken
var repeatsBeforeStop = 7;		//number of cycles for which bottom value in DLH must remain the same before process will stop running
var repeatsCount = 0;		//variable for counting the number of cycles for which bottom value of DLH has remained the same
var oldTestValue = 0;		//variables for storing values used for testing current value at bottom of DLH against previous one
var newTestValue = cellStartingValue;	
var running = false;		//Is the model running (or jogging)?
var resetting = false;		//Used to stop if submit/reset is clicked while "running"
var runTimeInterval = 300; 	//Time (in milliseconds) to wait between each jump when running
var runStepInterval = 50; 	//(Approx) Number of steps to jump at a time when running (minimum is 3). 50 works well.
//Could calculate this value, to give a set number of steps irrespective of tubeHeight
//var runStepInterval = Math.ceil(maxSteps[tubeHeight]/10);
//or, somewhere between the two options
//var runStepInterval = Math.ceil(maxSteps[tubeHeight]/(tubeHeight);

//Variables for step description text
var stepText = "";
//Text for step descriptions
var step1Text = "Active transport of Na<sup>+</sup> from ALH into interstial fluid (<img src='images/red-active-right.png' />).";
var step2Texts = new Array();
step2Texts['both'] = "Transfer of water from DLH (<img src='images/blue-arrow-right.png' />) and CD (<img src='images/blue-arrow-left.png' />) to interstitial fluid, and transfer of urea (<img src='images/green-arrow-left.png' />) from IMCD to interstitial fluid.";
step2Texts['noturea'] = "Transfer of water from DLH (<img src='images/blue-arrow-right.png' />) and CD (<img src='images/blue-arrow-left.png' />) to interstitial fluid. No transfer of urea (<img src='images/green-arrow-left-blocked.png' />) from IMCD to interstitial fluid.";
step2Texts['notwater'] = "Transfer of water from DLH (<img src='images/blue-arrow-right.png' />), but not CD (<img src='images/blue-arrow-left-blocked.png' />), to interstitial fluid, and transfer of urea (<img src='images/green-arrow-left.png' />) from IMCD to interstitial fluid.";
step2Texts['neither'] = "Transfer of water from DLH (<img src='images/blue-arrow-right.png' />), but not CD (<img src='images/blue-arrow-left-blocked.png' />), to interstitial fluid. No transfer of urea (<img src='images/green-arrow-left-blocked.png' />) from IMCD to interstitial fluid.";
var step2Text = step2Texts['both'];
var step3Text = "Tubular fluid moves along the nephron.";

//Declare cell values
var cellStartingValue = 300;	//Starting value (in mosm/l) for Na
//var cellValues = new Array();
//var naStartingFraction = 0.95;	//Percentage of starting osmolarity that is due to sodium
//var ureaStartingFraction = 0.05;	//Percentage of starting osmolarity that is due to urea
//var waterStartingVolume = 50;

//Declare form option defaults 
var tubeHeight = 10;		//Number of cells high the tube needs to be. Default value overridden by form	
var ADHPresent = 0;			//Should the model include ADH (1 = include, 0 = don't include)? This Default value is overridden by form 
var cdWaterPermeable = false;		
var cdUreaPermeable = false;	
var nkccStimulated = false;	
var loopDiuretic = false;	

//Declare Na pump values
var defaultSodiumPumpGradient = 200; 	//Difference in osmolality that can be achieved by sodium pumps
var nkccOffMultiplier = 0.875; 		//Factor to multiply sodium pump strength by when NKCC is not stimulated (makes it 175)
var loopDiureticMultiplier = 0.25;		//Factor to multiply sodium pump strength by when loop diuretic is present (makes it 50)

//Variables for appearance
var highlightNewTubeCell = 0;	//Should the new cell coming into the top of the DLH be highlighted? 
var maxColourValue = 1500;		//Defines the cell value that corresponds to the darkest colour (pure red - #FF0000)

//Variables for controlling which models are used
//var ureaModel = 0;		//Which urea model to use: 0 = original (pump strength * 0.4), 1 = reduce ISF conc on flow, 2 = reduce ISF conc on transfer from CD
var model = 1;		//Which model is being used (0 = water pumped out of CD/DLH to equal ISF (original model, poor treatment of urea), 1 = DLH/CD meet interstitium part way - better treatment of urea)


//Function for stepping (if running = false) or running (if running = true) model
function start() {
	if(resetting) { return; }		//Stops the function running when user clicks submit/reset
	$(".arrow").hide();

	/**One loop of process is 3 (previously 4) steps (denoted by their currentStep values):
	 *	0 - Na+ pumped from ALH into interstitial
	 *	1 - Water transferred from DLH and CD (CD was previously the third step) to interstitial
	 *	2 - Flow tube cells on by 1 cell
	 */
	 
	//Pump Na out of ALH into interstial, so intersitial value is higher than ALH value by sodiumPumpGradient
	if(currentStep == 0) {
		for (var i = 1; i <= tubeHeight; i++) {
			//Get cell IDs
			var intiId = "i" + i;
			var intjId = "j" + i;
			var ascId = "a" + i;
			
			//Get current values
			var intiValue = getValueById(intiId);	//both interstitial parts will have same value
			var ascValue = getValueById(ascId);
			
			//Calculate new values
			var newAscValue = Math.ceil((intiValue + ascValue - sodiumPumpGradient)/2);
			var newIntiValue = newAscValue + sodiumPumpGradient;
			var newIntjValue = newIntiValue;
			
			//Set new values
			setValueById(intiId, newIntiValue);
			setValueById(intjId, newIntjValue);
			setValueById(ascId, newAscValue);

			if(!running) {
				if(i % 4 == 0) {
					$("#image_" + ascId).show();
				}
				else {
					$("#image_" + intiId).show();
				}
			}
		}				
		currentStep = 1;	//Move on to next step
		if(!running) { 
			
			stepText = step1Text; 
			updateBackgroundsByClass("td", "valueCell");	//Update cell background colours
			updateLoopInsideBackgrounds();	//Update cell background colours for inside section of loops
		}
		countTotalSteps();		//Count the total number of steps taken
		
		//if running (not stepping) go on to next step
		if(running) {
			start();
		}
	}
	
	//Transfer water from DLH and CD to interstitial, plus urea from CD to interstitial
	else if(currentStep == 1) {
		for (var i = 1; i <= tubeHeight; i++) {
			//Get cell IDs
			var descId = "d" + i;
			var collductId = "c" + i;
			var intiId = "i" + i;
			var intjId = "j" + i;

			
			//Get current value of interstitial
			var intValue = getValueById(intiId);
			
			if(model == 0) {
				//Original model, that doesn't really deal with urea
				//Set value of DLH to equal interstitial
				setValueById(descId, intValue);
			}
			else if(model == 1) {
				//Attempt at alternative DLH model
				//Both ISF and DLH values adjusted so they meet each other part way
				//Where "part way" is affects the final values for the gradient
				var descValue = getValueById(descId);
				if(cdUreaPermeable) {
					// descValue + 6*intValue)/7 gives a final value at the bottom of a long nephron of ~1200 - normal behaviour
					var newValue = Math.ceil((descValue + 6*intValue)/7);
				}
				else {
					//If CD is not urea permeable
					// descValue + 1.5*intValue)/2.5 gives a final value at the bottom of a long nephron of ~600 (seems right as urea contributes half of the interstitial concentration)
					var newValue = Math.ceil((descValue + 1.5*intValue)/2.5);
				}
				
				setValueById(descId, newValue);
				//Only remove water from CD if it is water permeable
				if(cdWaterPermeable) {
					setValueById(collductId, newValue);
				}
				setValueById(intiId, newValue);
				setValueById(intjId, newValue);
			}
			
			if(!running) {
				if(isEven(i)) {
					$("#image_" + descId).show();
					$("#image_" + intjId).show();
				}
				else {
					$("#image_" + intjId).show();
				}
				updateBackgroundsByClass("td", "valueCell");	//Update cell background colours
				updateLoopInsideBackgrounds();	//Update cell background colours for inside section of loops
			}
		}
		currentStep = 2;	//Move on to next step
		if(!running) { stepText = step2Text; }
		countTotalSteps();		//Count the total number of steps taken
		//updateBackgroundsByClass("td", "valueCell");	//Update cell background colours
		
		//if running (not stepping) go on to next step, but pause every runStepInterval steps
		if(running) {
			
			
			//TODO: improve ending conditions, e.g. stop when bottom values stay the same for 2 or 3 cycles
			//if(totalStepCount >= maxSteps[tubeHeight]) {
			var descId = "d" + tubeHeight;
			newTestValue = getValueById(descId);
			
			if(newTestValue == oldTestValue) {
				repeatsCount++;
			}
			else {
				repeatsCount = 0;
			}
			oldTestValue = newTestValue;
			
			if(repeatsCount >= repeatsBeforeStop) {
				//stop running
				$("#stepLink").attr('disabled', false);
				$("#jogLink").attr('disabled', true);
				$("#runLink").attr('disabled', true);
				$("#pauseLink").attr('disabled', true);
			}
				
			else {
				if(totalStepCount >= runStepInterval) {	//Don't pause until we've completed an interval
					var rem = totalStepCount%runStepInterval;	//Find out how many steps into this interval we are
					
					if(rem < loopSteps) {	//If this is the first time we've reached this point in this interval
						updateBackgroundsByClass("td", "valueCell");	//Update cell background colours
						updateLoopInsideBackgrounds();	//Update cell background colours for inside section of loops
					
						setTimeout ("start()", runTimeInterval );	//Pause to view results so far, then continue
					}
					else {
						start();	//Otherwise just carry on
					}
				}
				else {
					start();	//Just carry on for the first interval
				}
			}
		}
	}
	
	//Flow tube cells on by 1 cell
	else if(currentStep == 2) {
		
		//Start with collecting duct
		for (var i = tubeHeight; i > 0; i--) {	//Start with bottom cell and work up the tube
			var cdId = "c" + i;		//Get id of cell
			if(i == 1) {	
				//If at top of CD, next value is top of ALH
				var nextId = "a" + i;
			}
			else {
				//Otherwise, new value comes from the cell above in CD
				var nextId = "c" + (i - 1);
			}
			
			//Get and set new value for cell
			var nextValue = getValueById(nextId);
			setValueById(cdId, nextValue);
			
			//If last cell in CD, and cell is highlighted, new cell in DLH should be highlighted
			if(i == tubeHeight && $("#" + cdId).hasClass('highlighted')) {
				$("#" + cdId).removeClass('highlighted');
				highlightNewTubeCell = 1;
			}
			//If cell above is highlighted, unhighlight that cell and highlight this cell
			if($("#" + nextId).hasClass('highlighted')) {
				$("#" + cdId).addClass('highlighted');
				$("#" + nextId).removeClass('highlighted');
			}
		}
		
		//Now do ALH
		for (var i = 1; i <= tubeHeight; i++) {	//Start with top cell and work down the tube
			var ascId = "a" + i;	//Get id of cell
			if(i == tubeHeight) {
				//If at bottom of ALH, use bottom of DLH as new value
				var nextId = "d" + i;
			}
			else {
				//Otherwise, new value comes from the cell below in ALH
				var nextId = "a" + (i + 1);
			}
			
			//Get and set new value for cell
			var nextValue = getValueById(nextId);
			setValueById(ascId, nextValue);
			//If cell below is highlighted, unhighlight that cell and highlight this cell
			if($("#" + nextId).hasClass('highlighted')) {
				$("#" + ascId).addClass('highlighted');
				$("#" + nextId).removeClass('highlighted');
			}
		}
		
		//Now do DLH and interstitial together
		for (var i = tubeHeight; i > 0; i--) {	//Start with bottom cell and work up the tube
			//Get cells IDs
			var descId = "d" + i;
			var intiId = "i" + i;
			var intjId = "j" + i;
			
			if(i == 1) {
				//If at top of DLH, use cellStartingValue as new value
				var nextValue = cellStartingValue;
				//if highlighted cell has just dropped out of CD, highlight the new cell entering the DLH
				if(highlightNewTubeCell) {
					$("#" + descId).addClass('highlighted');
					highlightNewTubeCell = 0;
				}
			}
			else {
				//Otherwise, new value comes from the cell above in CD
				var nextId = "d" + (i - 1);
				var nextValue = getValueById(nextId);
				//If cell above is highlighted, unhighlight that cell and highlight this cell
				if($("#" + nextId).hasClass('highlighted')) {
					$("#" + descId).addClass('highlighted');
					$("#" + nextId).removeClass('highlighted');
				}
			}

			//Set new values for cells
			setValueById(descId, nextValue);
			setValueById(intiId, nextValue);
			setValueById(intjId, nextValue);
		}
		

		currentStep = 0;	//Move on to next step
		if(!running) { 
			stepText = step3Text; 
			$('#image_loop_topleft').show();
			$('#image_loop_bottomleft').show();
			$('#image_above_desc').show();
			$('#image_below_coll').show();
			updateBackgroundsByClass("td", "valueCell");	//Update cell background colours
			updateLoopInsideBackgrounds();	//Update cell background colours for inside section of loops
		}
		countTotalSteps();		//Count the total number of steps taken
		
		//if running (not stepping) go on to next step
		if(running) {
			start();
		}
	}
	
	else {
		//Shouldn't ever get here!
		alert("You have got out of step");
		return;
	}
}



function reset() {
	if (loopDiuretic) {
		sodiumPumpGradient = defaultSodiumPumpGradient * loopDiureticMultiplier;
	}
	else if(!nkccStimulated) {
		sodiumPumpGradient = defaultSodiumPumpGradient * nkccOffMultiplier;
	}
	else {
		sodiumPumpGradient = defaultSodiumPumpGradient;
	}
	
	if(!cdUreaPermeable && !cdWaterPermeable) {
		step2Text = step2Texts['neither'];
	}
	else if(!cdUreaPermeable && cdWaterPermeable) {
		step2Text = step2Texts['noturea']
	}
	else if(cdUreaPermeable && !cdWaterPermeable) {
		step2Text = step2Texts['notwater']
	}
	else {
		step2Text = step2Texts['both']
	}
	
	var redArrowLeft = true;	//Whether the next red arrow should point left (or right)
	$("#stepLink").attr('disabled', false);
	$("#jogLink").attr('disabled', false);
	$("#runLink").attr('disabled', false);
	$("#pauseLink").attr('disabled', true);
	
	//Empty #model div
	$("#model").html("<table class='nephron'><tbody id='model_tbody'><tr><td>&nbsp;</td></tr></tbody></table>");

	//Create top loop, connecting ALH to CD
	$("#model_tbody").html("<tr style='height: 63px'><td class='blank' id='above_desc'>&nbsp;</td><td class='blank'>&nbsp;</td> <td class='blank' id='loop_topleft'>&nbsp;</td> <td class='blank' id='loop_topmid'>&nbsp;</td> <td class='blank'>&nbsp;</td></tr>");
	
	//Add row for each level of tubeHeight
	for (var i = 1; i <= tubeHeight; i++) {
		$("#model_tbody").append("<tr id='row" + i + "'>");
		
		//Add DLH cell
		var descId = "d" + i;
		$("#row" + i).append("<td id='" + descId + "' class='valueCell' onclick='highlightToggle(\"" + descId + "\")'>" + cellStartingValue + "</td>");
		$("#" + descId).addClass("nephron");
		$("#" + descId).addClass("descending");

		//Add left interstitial cell
		var intiId = "i" + i;
		$("#row" + i).append("<td id=" + intiId + " class='valueCell'>" + cellStartingValue + "</td>");
		$("#" + intiId).addClass("nephron");
		$("#" + intiId).addClass("interstitial");

		//Add ALH cell
		var ascId = "a" + i;
		$("#row" + i).append("<td id=" + ascId + " class='valueCell' onclick='highlightToggle(\"" + ascId + "\")'>" + cellStartingValue + "</td>");
		$("#" + ascId).addClass("nephron");
		$("#" + ascId).addClass("ascending");
		if(nkccStimulated && !loopDiuretic) {
			$("#" + ascId).addClass("stimulated");
		}
		else {
			$("#" + ascId).addClass("unstimulated");
		}
		
		//Add right interstitial cell
		var intjId = "j" + i;
		$("#row" + i).append("<td id=" + intjId + " class='valueCell'>" + cellStartingValue + "</td>");
		$("#" + intjId).addClass("nephron");
		$("#" + intjId).addClass("interstitial");

		//Add collecting duct (CD) cell
		var collductId = "c" + i;
		$("#row" + i).append("<td id=" + collductId + " class='valueCell' onclick='highlightToggle(\"" + collductId + "\")'>" + cellStartingValue + "</td>");
		$("#" + collductId).addClass("nephron");
		$("#" + collductId).addClass("collecting");
		if(cdWaterPermeable) {
			$("#" + collductId).addClass("water");				
		}
		if(cdUreaPermeable && i > Math.ceil(tubeHeight/2)) {
			$("#" + collductId).addClass("urea");
		}
		
		if(isEven(i)) {
			addArrow(descId, "blue-arrow-right.png", -10, 0, 54);
			if(cdWaterPermeable) {
				addArrow(intjId, "blue-arrow-left.png", -10, 0, 54);
			}
			else {
				addArrow(intjId, "blue-arrow-left-blocked.png", -10, 0, 54);
			}
			
			if(redArrowLeft) {
				addArrow(intiId, "red-active-left.png", -10, 0, 54);
				redArrowLeft = false;
			}
			else {
				addArrow(ascId, "red-active-right.png", -10, 0, 54);
				redArrowLeft = true;
			}
			
		
		}
		else {
			//If below half way down, add urea arrow to intj
			if(cdUreaPermeable && i > Math.ceil(tubeHeight/2)) {
				addArrow(intjId, "green-arrow-left.png", -10, 0, 54);
			}
			else if(!cdUreaPermeable && i > Math.ceil(tubeHeight/2)) {
				addArrow(intjId, "green-arrow-left-blocked.png", -10, 0, 54);
			}
			
		}
	
	}
	
	//Create bottom loop, connecting DLH to ALH
	$("#model_tbody").append("<tr style='height: 63px'><td class='blank' id='loop_bottomleft'>&nbsp;</td> <td class='blank' id='loop_bottommid'>&nbsp;</td> <td class='blank'>&nbsp;</td><td class='blank'>&nbsp;</td><td class='blank' id='below_coll'>&nbsp;</td></tr>");

	$("#model").append("<div id='loop_bottom_image'><img src='images/loop-bottom.png' width='168px' /></div>");
	var cellPos = $("#loop_bottomleft").position();
	var cellTop = cellPos.top;
	var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	if(navigator.appName == "Microsoft Internet Explorer") {
		var cellLeft = cellPos.left;
	}
	else if (is_firefox) {
		var cellLeft = cellPos.left - 2;	
	}
	else {
		var cellLeft = cellPos.left - 1;			
	}
	$("#loop_bottom_image").css("position", "absolute");
	$("#loop_bottom_image").css("top", cellTop);
	$("#loop_bottom_image").css("left", cellLeft);
	
	$("#model").append("<div id='loop_top_image'><img src='images/loop-top.png' width='168px' /></div>");
	var cellPos = $("#loop_topleft").position();
	var cellHeight = $("#loop_topleft").height();
	var cellTop = cellPos.top;
	if(is_firefox) {
		var cellLeft = cellPos.left - 2;
	}
	else {
		var cellLeft = cellPos.left - 1;
	}
	$("#loop_top_image").css("position", "absolute");
	$("#loop_top_image").css("top", cellTop);
	$("#loop_top_image").css("left", cellLeft);
	
	addArrow('loop_topleft', "black-arrow-curved-down.png", 25, 0, 112);
	addArrow('loop_bottomleft', "black-arrow-curved-up.png", 2, 0, 112);
	addArrow('above_desc', "black-arrow-down.png", 25, -10, 20);
	addArrow('below_coll', "black-arrow-down.png", 3, -10, 20);
	
	updateBackgroundsByClass("td", "valueCell");	//Update background colours
	updateLoopInsideBackgrounds();	//Update cell background colours for inside section of loops
	
	//Reset counters
	currentStep = 0;
	totalStepCount = 0;
	stepText  = "";
	$("#thisStep").html(stepText);		
	$("#stepCount").html(totalStepCount + " steps");
	redArrowLeft = true;
	
	callAutoHeight();
}

function addArrow(id, src, topOffset, leftOffset, width) {
	var cellPos = $("#"+id).position();
	var imageId = "image_" + id;
	var cellTop = cellPos.top;
	var arrowTop = cellTop + topOffset;
	var cellLeft = cellPos.left + leftOffset;
	var arrowLeft = cellLeft + $("#"+id).outerWidth()/2;
	
	$("#model").append("<div id='" + imageId + "' class='arrow'><img src='images/" + src + "' width=" + width + " /></div>");
	$("#" + imageId).hide();
	$("#" + imageId).css("position", "absolute");
	$("#" + imageId).css("top", arrowTop);
	$("#" + imageId).css("left", arrowLeft);
}

//Function for obtaining the value of a specified cell
function getValueById(id) {
	//Evaluate html of element as number
	var returnValue = eval($("#" + id).html());
	return returnValue;
}

//Function for setting the value of a specified cell
function setValueById(id, value) {
	$("#" + id).html(value);
}

//Function for updating the background colours based on the cell values
function updateBackgroundsByClass(elementType, className) {	//Pass parameters to generalise the process
	$(elementType).each(function() {	//Do this for every element with the specified elementType...
		if($(this).hasClass(className)){	//...and the specified class
			var cellValue = $("#" + this.id).html();		//Get cell value
			hexColour = valueToHexColour(cellValue);				
			//Set background-color
			$(this).css("background-color",hexColour);
		}
	});
}

//Function for updating the background colours based on the cell values
function updateLoopInsideBackgrounds() {	//Pass parameters to generalise the process
	//Get value of bottom inti cell
	var intId = "i" + tubeHeight;
	var intValue = getValueById(intId);
	
	var hexColour = valueToHexColour(intValue);
	//Set background-color
	$("#loop_bottommid").css("background-color",hexColour);
	
	//Get value of top intj cell
	intId = "j" + 1;
	intValue = getValueById(intId);
	
	hexColour = valueToHexColour(intValue);		
	
	//Set background-color
	$("#loop_topmid").css("background-color",hexColour);
}

function valueToHexColour(cellValue) {
	//Find "decimal" value of Green part of colour (based on range of 0-2500 mosm/L)
	var decColourMod = 256 - (256/maxColourValue*cellValue);
	//Round up and convert to hex
	var hexColourMod = d2h(Math.ceil(decColourMod));
	//Create complete hex colour value
	var hexColour = "FF" + hexColourMod + "00";	
	return hexColour;
}

function highlightToggle(cellId) {
	if($("#" + cellId).hasClass('highlighted')) {
		$("#" + cellId).removeClass('highlighted');
	}
	else {
		$("#" + cellId).addClass('highlighted');
	}
}

//Function for converting a decimal value to a hex value
function d2h(d) {return d.toString(16);}

function isEven(number) {
	return (number%2 == 0) ? true : false;
}

//Function for counting the total number of steps
function countTotalSteps() {
	totalStepCount++;	//Add 1 to count
	$("#stepCount").html(totalStepCount + " steps");	//Update count display
	$("#thisStep").html(stepText);	//Update step text
}

function getData(input) {
	//Stop the model from running and tell it that it is resetting
	running = false;
	resetting = true;
	
	//Get current values of all of the checkboxes - shouldn't really need to get them all, only the ones that change, but this is safest.
	tubeHeight = parseInt($('input:radio[name=tubeHeight]:checked').val());		
	ADHPresent = parseInt($('input:radio[name=ADH]:checked').val());
	cdWaterPermeable = $('#cdwater').attr('checked');
	cdUreaPermeable = $('#cdurea').attr('checked');
	nkccStimulated = $('#nkcc').attr('checked');
	loopDiuretic = $('#loopdiuretic').attr('checked');
	
	//If input is ADH
	if(input == 'ADH'){
		if(ADHPresent) {
			//if ADH is not present, Urea is not reabsorbed into the interstitium from the collecting duct, which has the same effect as a low urea concentration in the filtrate
			nkccStimulated = true;
			cdWaterPermeable = true;
			cdUreaPermeable = true;
			$('#cdwater').attr('checked', true);
			$('#cdurea').attr('checked', true);
			$('#nkcc').attr('checked', true);
		}
		else {
			//if ADH is not present, Urea is not reabsorbed into the interstitium from the collecting duct, which has the same effect as a low urea concentration in the filtrate
			nkccStimulated = false;
			cdWaterPermeable = false;
			cdUreaPermeable = false;
			$('#cdwater').removeAttr('checked');
			$('#cdurea').removeAttr('checked');
			$('#nkcc').removeAttr('checked');
		}
	}
	//If input is one of the factors that are associated with ADH (cdwater, cdurea or nkcc)
	else if(input == 'cdwater' || input == 'cdurea' || input == 'nkcc') {
		if(nkccStimulated && cdWaterPermeable && cdUreaPermeable) {
			//if all 3 of the above are on, ADH should be set to present
			$('input:radio[name=ADH]:eq(0)').attr('checked', true);
			ADHPresent = 1;
		}
		else if(!nkccStimulated && !cdWaterPermeable && !cdUreaPermeable) {
			//if all 3 of the above are off, ADH should be set to absent			
			$('input:radio[name=ADH]:eq(1)').attr('checked', true);
			ADHPresent = 0;
		}
		else {
			//ADH dependent options are not all the same, so clear checks on ADH radios and set ADH present to null
			$('input:radio[name=ADH]').attr('checked', false);
			ADHPresent = 0;
		}
	}
	
	reset();
}

function setup() {
	/**
	 * The url parameters control the form sections that are shown (section is shown if parameter evaluates to true), as follows:
	 * l = show loop length
	 * a = show ADH
	 * o = show ADH options
	 * d = show Loop diuretic
	 * s = "all" or "none" - overrides other settings to show all or none of the sections
	 */
	 
	//Get URL parameters for form sections to show
	var showLengthInput = processUrlParameter("l"); 
	var showADHInput = processUrlParameter("a"); 
	var showOptionsInput = processUrlParameter("o"); 
	var showDiureticInput = processUrlParameter("d"); 
	var showAllOrNone = $(document).getUrlParam("s");
	
	//If "s" is set, show all or none of the inputs
	if(showAllOrNone == "none") {
		showLengthInput = showADHInput = showOptionsInput = showDiureticInput = 0;
	}
	else if(showAllOrNone == "all" || (showLengthInput === null && showADHInput === null && showOptionsInput === null && showDiureticInput === null)) {
		showLengthInput = showADHInput = showOptionsInput = showDiureticInput = 1;
	}
	
	//Show the appropriate inputs
	if(!showLengthInput) {
		$("#lengthInput").hide();
	}
	if(!showADHInput) {
		$("#ADHInput").hide();
	}
	if(!showOptionsInput) {
		$("#optionsInput").hide();
	}
	if(!showDiureticInput) {
		$("#diureticInput").hide();
	}
	if(!showLengthInput && !showADHInput && !showOptionsInput && !showDiureticInput) {
		$("#setupFormDiv").hide();
	}
	
	/**
	 * URL parameters can also be used to modify the settings from the defaults:
	 * b = ADH present? (1 = present, 0 (or parameter not present) = absent)#
	 * TODO: Add parameters for other settings
	 */
	 
	//Get URL parameters for settings
	var ADHPresent = processUrlParameter("b"); 
	if(ADHPresent) {
		ADHPresent = 1;
		cdWaterPermeable = true;		
		cdUreaPermeable = true;	
		nkccStimulated = true;
	}
	else{
		ADHPresent = 0;
		cdWaterPermeable = false;		
		cdUreaPermeable = false;	
		nkccStimulated = false;	
	}

	//Set the form values to the defaults on page load
	$('input:radio[name=tubeHeight]').val([tubeHeight]);
	$('input:radio[name=ADH]').val([ADHPresent]);
	$('#cdwater').attr('checked', cdWaterPermeable);
	$('#cdurea').attr('checked', cdUreaPermeable);
	$('#nkcc').attr('checked', nkccStimulated);
	$('#loopdiuretic').attr('checked', loopDiuretic);

	//onClick action for reset link
	$("#resetLink").click(function() {
		resetting = true;	//If "running", tells the start function to stop
		reset();
	});
	
	//onClick action for step link
	$("#stepLink").click(function() {
		resetting = false;
		running = false;
		start();
	});
	
	//onClick action for jog link
	$("#jogLink").click(function() {
		//Pause after each cycle of the loop
		stepText="";
		resetting = false;
		running = true;
		runStepInterval = loopSteps;
		$("#stepLink").attr('disabled', true);
		$("#jogLink").attr('disabled', true);
		$("#runLink").attr('disabled', true);
		$("#pauseLink").attr('disabled', false);
		start();
	});
	
	//onClick action for run link
	$("#runLink").click(function() {
		//Pause after a set number of steps
		stepText="";
		resetting = false;
		running = true;
		runStepInterval = 50;
		$("#stepLink").attr('disabled', true);
		$("#jogLink").attr('disabled', true);
		$("#runLink").attr('disabled', true);
		$("#pauseLink").attr('disabled', false);
		start();
	});
	
	//onClick action for pause link
	$("#pauseLink").click(function() {
		stepText="";
		resetting = false;
		running = false;
		$("#stepLink").attr('disabled', false);
		$("#jogLink").attr('disabled', false);
		$("#runLink").attr('disabled', false);
		$("#pauseLink").attr('disabled', true);
	});
	
	reset();
}

function processUrlParameter(parameter) {
	var value = $(document).getUrlParam(parameter);
	
	if(value == null) {
		return null;
	}
	else if(value == 0 || value == "false" || value == "no") {
		return false;
	}
	else {
		return true;
	}
}
