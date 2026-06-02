sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "iam/bc/utilities/Utilities",
    "sap/ui/core/routing/History",
    "iam/bc/utilities/ValueHelpCollection",
    "iam/bc/utilities/CommonVHDialog",
    "./utilities",
    "../utilities/Formatter",
], function (BaseController, MessageBox, Utilities, History, ValueHelpCollection, CommonVHDialog, PRVHUtilities, Formatter) {
    "use strict";
    return BaseController.extend("com.cu.s4hana.zlpuba007.controller.PrintPo", {
    	
    	formatter: Formatter,
    	
    	_criterias: [
        {
            id: "idPoNo",
            keyfield: "EBELN",
            type: "MultiInput",
            control: true,
        }],
            
    	onInit: function () {
            this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.oRouter.getTarget("PrintPo").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
            this.settingScreenCriteria();
            Utilities.addValidator(this._criterias);
            this.initPRDefaultForSearchHelp();
        },
        
        onAfterRendering: function(){
	    	var oInput = this.getView().byId("idPoNo");
	    	if(oInput.getValue() === ""){
		        jQuery.sap.delayedCall(500, this, function() {
				    oInput.focus();
				});
	    	}
	    },
        
        settingScreenCriteria: function () {
            for (var lvFname in this._criterias) {
                this._criterias[lvFname].control = this.getView().byId(this._criterias[lvFname].id);
            }
        },
        
        initPRDefaultForSearchHelp: function () {
            var currentDate = new Date();
            var diff = currentDate.getMonth() - 1;
            var dateFrom = new Date();
            dateFrom.setMonth(diff);
            this.shCreateDateFrom = dateFrom;
            this.shCreateDateTo = currentDate;
            var aFilters = [];
            var oFilter;
            //Create Date
            oFilter = new sap.ui.model.Filter("BEDAT",
                sap.ui.model.FilterOperator.BT,
                this.shCreateDateFrom,
                this.shCreateDateTo);
            aFilters.push(oFilter);
            this.shPurchaseOrderFilter = aFilters;
        },
        
        handleRouteMatched: function (oEvent) {
            if (!this.oVHCollection) this.oVHCollection = new ValueHelpCollection(this.getView().getModel());
            this.setInitialModel();
            
            if (oEvent.getParameters().data) {
				var pr = oEvent.getParameters().data.context;
				if(pr){
					var loToken = Utilities.CreateToken(false, "EBELN", "EQ", pr);
					this.getView().byId("idPoNo").addToken(loToken);
					this.getPoDocList();
				}
			}
			
        },
        
        setInitialModel: function () {
            
        },
        
        onVHPo: function (oEvent) {
            var loControl = oEvent.getSource();
            var laTokens = loControl.getTokens();
            this.oVHCollection.callF4PrintPo(
                loControl,
                true, //multiselect
                true, //range
                laTokens,
                "",
                // "",
                this.shPurchaseOrderFilter,
                function (pControlEvent, pTokens, pDataSet, pSelected) {
                    loControl.setTokens(pTokens);
                    this.getPoDocList();
                }.bind(this)
            );
        },
        
        onChangePoNo: function(oEvent){
        	
        	var that = this;
        	var control = oEvent.getSource();
        	var inputPoNo = control.getValue();
        	var srvModel = that.getView().getModel();
        	
        	if(inputPoNo === ""){
        		return;
        	}
        	
        	// if(inputPoNo.indexOf("*") > -1){
        	// 	return;
        	// }
        	
        	if(!control.getBusy()){
        		control.setBusyIndicatorDelay(0);
        		control.setBusy(true);
        	}
        	
			srvModel.read("/F4PoSet('" + inputPoNo + "')", {
				success: function (s) {
					that.getPoDocList();
					if(control.getBusy()){
		        		control.setBusy(false);
		        	}
				},
				error: function (e) {
					// that.getPoDocList();
					if(control.getBusy()){
		        		control.setBusy(false);
		        	}
					
					var msg = that.getView().getModel("i18n").getProperty("Message.NoDataFound");
					sap.m.MessageToast.show(msg, {
						duration: 2000
					});
			
					var tokens = control.getTokens();
					var index = -1;
					for(var i=0;i<tokens.length;i++){
						if(inputPoNo === tokens[i].getText().substr(1)){
							index = i;
						} 
					}
					if(index > -1){
						control.removeToken(index);
					}
				}
			});
        	
        },
        
        getPoFilter: function () {
            // get token and add filter
            var oTokens = this.getView().byId("idPoNo").getTokens();
            if (!oTokens) return [];
            var aFilter = [];
            oTokens.forEach(function (loToken) {
                var oValue = loToken.data().value;
                var loFilter = new sap.ui.model.Filter(oValue.keyField, oValue.operation, oValue.value1, oValue.value2);
                aFilter.push(loFilter)
            }.bind(this));
            return aFilter;
        },
        
        getPoDocList: function (vZLDESC) {
            var oComponent = this.getOwnerComponent();
            var sPath = "/PoFormSet";
            var oModel = oComponent.getModel();
            var oFilter = this.getPoFilter();
            var oView = this.getView();
            
            this.handleClearPoList();
            oView.byId("idBtnPrint").setEnabled(false);
            
            if(!oView.getBusy()){
            	oView.setBusyIndicatorDelay();
            	oView.setBusy(true);
            }
            
            return new Promise(function (fnResovle) {
                oModel.read(sPath, {
                    filters: oFilter,
                    success: function (oResults) {
                        oView.setBusy(false);
                        this.preparePoTokens(oResults.results);
                        oView.byId("idBtnPrint").setEnabled(true);
                        
                        if(oResults.results[0].PO_TYPE === "1"){
                        	oView.byId("idPoType1").setSelected(true);
                        	oView.byId("idPoType2").setSelected(false);
                        }else{
                        	oView.byId("idPoType1").setSelected(false);
                        	oView.byId("idPoType2").setSelected(true);
                        }
                        
                        fnResovle();
                    }.bind(this),
                    error: function (oErrors) {
                        this.resetData();
                        oView.setBusy(false);
                        this.errorHandler(oErrors);
                    }.bind(this)
                });
            }.bind(this));
        },
        
        errorHandler: function (oReturn) {
            try {
                var oError = JSON.parse(oReturn.responseText);
                var sErrMsg = oError.error.message.value;
                var laErrorDetail = oError.error.innererror.errordetails;
                if (laErrorDetail.length > 0) {
                    var lsErrorMsg = "";
                    laErrorDetail.forEach(function (loErrorRow) {
                    	if(loErrorRow.code !== "/IWBEP/CX_SD_GEN_DPC_BUSINS"){
                        	lsErrorMsg = lsErrorMsg + loErrorRow.code + " " + loErrorRow.message + "\n";
                    	}
                    }.bind(this));
                    MessageBox.error(lsErrorMsg);
                } else {
                    MessageBox.error(sErrMsg);
                }
            } catch (e) {
                MessageBox.error(oReturn.message);
            }
        },
        
        preparePoTokens: function(po){
        	var control = this.getView().byId("idPoNo");
        	control.removeAllTokens();
        	for(var i=0;i<po.length;i++){
        		var loToken = Utilities.CreateToken(false, "EBELN", "EQ", po[i].EBELN);
        		control.addToken(loToken);
        	}
        	this.poDocType = po[0].BSART;
        },
        
        handleClearPoList: function(){
        	this.getView().byId("idPoNo").removeAllTokens();
        },
        
        resetData: function(){
        	this.getView().byId("idPoNo").removeAllTokens();	
        	this.getView().byId("idPoType1").setSelected(true);
        	this.getView().byId("idPoType2").setSelected(false);
        	this.getView().byId("idNoDisplayEmployeeName").setSelected(false); 
        	this.getView().byId("idNoDisplayBankAcc").setSelected(false); //CH02: Insert
        	this.getView().byId("idBtnPrint").setEnabled(false);
        	this.poDocType = "";
        },

        handlePrintPress: function(oEvent) {
        	
        	var that = this;
        	var srvModel = this.getView().getModel();
        	var tokens = this.getView().byId("idPoNo").getTokens();
        	if(tokens.length === 0){
        		var bCompact = !!that.getView().$().closest(".sapUiSizeCompact").length;
				MessageBox.error( that.getView().getModel("i18n").getProperty("Message.SelectAtleastPo"),
					{ styleClass: bCompact ? "sapUiSizeCompact" : "" }
				);
				return;
        	}
        	
			var lvPoList = "";
			var lvPoType = this.getView().byId("idPoType1").getSelected() ? "1" : "2";
			var lvNoDisplay = this.getView().byId("idNoDisplayEmployeeName").getSelected();
			var lvNoBankAcc = this.getView().byId("idNoDisplayBankAcc").getSelected();	//CH02: Insert
			
			for(var i=0;i<tokens.length;i++){
				if(lvPoList === ""){
					lvPoList = tokens[i].getText().substr(1);
					continue;
				}
				lvPoList = lvPoList + ":" + tokens[i].getText().substr(1);
			}
            
            var sPath = "/sap/opu/odata/sap/ZLPUBA007_SRV/PoPdfSet(PO_LIST='" + lvPoList + "',PO_TYPE='" + lvPoType + "',NO_DISPLAY=" + lvNoDisplay + ",NO_BANKACC=" + lvNoBankAcc + ")/$value?sap-language=TH";
            window.open(sPath, "_blank");
            if (this.poDocType === "3001") {
                this.showAttachmentDialog(lvPoList);
            }
            
        },
        
        showAttachmentDialog: function (lvPoList) {
            MessageBox.confirm(this.getView().getModel("i18n").getProperty("Message.AttachToDoc"), {
            	title: this.getView().getModel("i18n").getProperty("Message.AttachToDocTitle"),
                onClose: function (oEvent) {
                    var bIsAttached = oEvent === "OK" ? "Y" : "N";
                    if(bIsAttached === "Y") {
                    	this.doAttachFile(lvPoList);
                    }else{
                    	this.getView().setBusy(false);
                    }
                }.bind(this)
            });
        },
        
        doAttachFile: function(lvPoList){
        	var oComponent = this.getOwnerComponent();
        	var lvPoType = this.getView().byId("idPoType1").getSelected() ? "1" : "2";  //++CH01
        	var lvNoBankAcc = this.getView().byId("idNoDisplayBankAcc").getSelected();  //CH02: Insert
            var oModel = oComponent.getModel();
            // var sParam = encodeURIComponent("(PO_LIST='" + lvPoList + "',PO_TYPE='-',NO_DISPLAY=false)");//++DEL BY CH01
			var sParam = encodeURIComponent("(PO_LIST='" + lvPoList + "',PO_TYPE='" + lvPoType + "',NO_DISPLAY=false" + ",NO_BANKACC=" + lvNoBankAcc + ")" );//++CH01,CH02: add no_bankacc
            var sPath = "/PoPdfSet" + sParam;
            var dataForUpdate = {
            	PO_LIST: lvPoList,
            	PO_TYPE: "-",
            	NO_DISPLAY: false,
            	NO_BANKACC: lvNoBankAcc			//CH02: Insert
            };
            this.getView().setBusy(true);
            oModel.update(sPath, dataForUpdate, {
                    success: function (oReturns) {
                        this.getView().setBusy(false);
                         sap.m.MessageToast.show(this.getView().getModel("i18n").getProperty("Message.AttachSuccess"));
                    }.bind(this),
                    error: function (oErrors) {
                        this.getView().setBusy(false);
                        sap.m.MessageBox.error(this.getView().getModel("i18n").getProperty("Message.AttachFail"));
                    }.bind(this)
                }
            );
        }
        
    });
}, /* bExport= */ true);
