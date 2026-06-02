sap.ui.define([
    "./Formatter"
], function () {
    "use strict";
    return {
        parsePrintDateValue: function (printDate, printFlag) {

            // set val to component
            this.getOwnerComponent()._printDate = printDate;
			//<DEL BY CH01
            // if (printFlag) {
            //     return null;
            // }
            //>DEL BY CH01

            return printDate;
        }
    };
});