Urinary Concentrating Mechanism Model
=======

This is a simulation of the urinary concentrating mechanism, demonstrating the process by which the concentration gradient in the medulla is created.

Launching
-------

Open index.html to launch the model. The css, images and js subdirectories must be in the same directory as index.html.

Opening index.html with no url parameters will show all the possible setup options:

* Length - Short, Medium or Long
* Antidiuretic Hormone (ADH) - Present or Absent
* NKCC (Na-K-Cl cotransporter) stimulated - on or off
* CD is water permeable - on or off
* IMCD is urea permeable - on or off
* Loop Diuretic - on or off

URL parameters can be used to only show certain setup options. The options will be shown for all parameters that are set to a value other than 0, false or no. 's' is a special case that needs to be given a value of either "none" or "all". If no parameters are provided then all of the options will be shown. If at least 1 parameter is provided then the options relating to any parameters that are not provided will not be shown. The parameters are as follows:

* l - show the length options
* a - show the ADH options
* o - show the NKCC stimulation, CD water permeability and IMCD urea permeability options
* d - show the Loop Diuretic option
* s - set this to "none" or "all" to override all the other setup visibility options and show none/all of the options

For example:
../index.html?l=1&d=1 will show the length and loop diuretic options only. 
../index.html?l=true&d=yes&a=0&o=false will also show the length and loop diuretic options only. 
../index.html will show everything
../index.html?l=1&d=true&a=yes&o=on will also show everything
../index.html?s=all will also show everything
../index.html?l=0&d=0&a=0&o=0&s=all will also show everything

One further parameter, b, defines whether ADH is present (default is absent). Similar to above, ADH will be present if this value is set, and set to anything other than 0, false or no. This can be set whether or not the ADH setup option is visible or not. 

###iFrame Auto Height

Note that the model uses the iframe auto height JQuery plugin. This means that if the model is loaded in an iframe, it will automatically modify the height of the iframe to fit the size of the model, e.g. when the length option is changed. To disable this, remove the `callAutoHeight();` function in index.html (lines 10-12).

Instructions
-------

The model shows, from left to right, the descending limb of the Loop of Henle (DLH), the ascending limb of the Loop of Henle (ALH) and the collecting duct (CD). The collecting duct is split into two sections: the outer medullary collecting duct (OMCD), which is permeable to water in the presence of antidiuretic hormone (ADH); and the inner medullary collecting duct (IMCD), which is permeable to water and urea in the presence of ADH. Interstitial fluid separates the three tubes.

Use "Step" to see the sequence of events that underlie the countercurrent multiplication mechanism, one step at a time. 

Use "Jog" to move automatically through the sequence and "Run" to move rapidly to the equilibrium state. 

Click on a tube value to highlight the value and watch it progress through the tube. Click on the value again to unhighlight it. 

Contributors
-------

**Idea and Science:** Dr Robert Wilkins, Department of Physiology, Anatomy and Genetics, University of Oxford

**Code:** Dr Damion Young and Jon Mason, Medical Sciences Division Learning Technologies, University of Oxford
