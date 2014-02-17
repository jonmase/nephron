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

URL parameters can be used to only show certain setup options. The options will be shown for all parameters that are set to a value (value can be anything, including 0, false, but not empty). The parameters are as follows:

* l - show the length options
* a - show the ADH options
* o - show the NKCC stimulation, CD water permeability and IMCD urea permeability options
* d - show the Loop Diuretic option

For example ../index.html?l=1&d=1 will show the length and loop diuretic options only.

###iFrame Auto Height

Note that the model uses the iframe auto height JQuery plugin. This means that if the model is loaded in an iframe, it will automatically modify the height of the iframe to fit the size of the model, e.g. when the length option is changed. To disable this, remove the `callAutoHeight();` line in the reset function in model.js.

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
