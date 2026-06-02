sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"iam/bc/utilities/Utilities",
	"sap/ui/core/routing/History",
	"iam/bc/utilities/ValueHelpCollection",
	"iam/bc/utilities/CommonVHDialog",
	"./utilities",
	"sap/m/MessageToast",
	"../utilities/Formatter",
], function (BaseController, MessageBox, Utilities, History, ValueHelpCollection, CommonVHDialog, PRVHUtilities, MessageToast, Formatter) {
	"use strict";
	return BaseController.extend("com.cu.s4hana.zlpuba006.controller.PrintPr", {
		formatter: Formatter,
		_isFromPRManage: false,
		_selectedPODocType: null,
		handleRouteMatched: function (oEvent) {
			//initial vh
			if (!this.oVHCollection) this.oVHCollection = new ValueHelpCollection(this.getView().getModel());
			if (oEvent.mParameters.data.context) {
				var bBase64 = Utilities.isBase64(oEvent.mParameters.data.context);
				if (bBase64) {
					// set controller context as b64
					this.sContext = atob(oEvent.mParameters.data.context);
				} else {
					// set controller context as normal text
					// this.sContext = btoa(oEvent.mParameters.data.context);
					this.sContext = oEvent.mParameters.data.context;
				}
				// ## trigger change on pr
				var oPRInput = this.getView().byId("PrNoInput");
				var oToken = Utilities.CreateToken(false, "BANFN", "EQ", this.sContext);
				oPRInput.setTokens([oToken]);
				this._isFromPRManage = true;
				oPRInput.fireChange({
					value: this.sContext
				});
			}
			this.setInitialModel();
			// this.getPRDetail();
			// this.getApproveDetail();
			this.setPRListModel();
			this.seti18n();
			this.setDefaultApproveFlag();
		},
		setDefaultApproveFlag: function () {
			var oComponent = this.getOwnerComponent();
			var mPRDetail = oComponent.getModel("mPRDetail");
			mPRDetail.setProperty("/APVRPT_FLAG", false);
		},
		seti18n: function () {
			this.i18n = this.getView().getModel("i18n");
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
			oFilter = new sap.ui.model.Filter("BADAT",
				sap.ui.model.FilterOperator.BT,
				this.shCreateDateFrom,
				this.shCreateDateTo);
			aFilters.push(oFilter);
			this.shPurchaseOrderFilter = aFilters;
		},
		onVHEmployee: function (oEvent) {
			var loControl = oEvent.getSource();
			var laTokens = null;
			// get first pr no
			var vPrno = this.byId("PrNoInput").getTokens()[0].data().value.value1;
			debugger;

			this.oVHCollection.callF4Employee(
				loControl,
				false, //multiselect
				false, //range
				laTokens,
				"", // Range Filter Param (TEXT,NUMERIC)
				vPrno,
				function (pControlEvent, pTokens, pDataSet, pSelected) {
					loControl.fireChange({
						newValue: pTokens
					});
					// loControl.setValue(pTokens);
					// var oComponent = this.getOwnerComponent();
					// var mPRDetail = oComponent.getModel("mPRDetail");
					// var sApproveNo = loControl.data("ApproveRole");
					// mPRDetail.setProperty("/GE_POS" + sApproveNo, pSelected.GE_POS);
					// mPRDetail.setProperty("/KW_POS" + sApproveNo, pSelected.KW_POS);
					// mPRDetail.setProperty("/NAME" + sApproveNo, pSelected.VORNA);
					// mPRDetail.setProperty("/LASTNAME" + sApproveNo, pSelected.NACHN);
					// set input to disable after use search help
					this.disableEmployeeRow(loControl, false);
				}.bind(this)
			);
		},
		disableEmployeeRow: function (oControl, bEnabled) {
			console.log(oControl);
			var aFieldList = oControl.getParent().getFields();
			aFieldList.forEach(function (loInput, lvIndex) {
				if (lvIndex === 0 || lvIndex === 4) {
					return;
				}
				loInput.setEditable(bEnabled);
			}.bind(this))
		},
		onEmployeeChange: function (oEvent) {
			var oSource = oEvent.getSource();
			// var sValue = oSource.getValue();
			var sValue = oEvent.getParameter("newValue");
			if (sValue === "") {
				this.disableEmployeeRow(oSource, true);
				return;
			}
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			var sPath = "/F4EmployeeSet";
			var oFilter = [new sap.ui.model.Filter("PERNR", "EQ", sValue)];
			this.getView().setBusy(true);
			oModel.read(sPath, {
				filters: oFilter,
				success: function (oReturns) {
					this.getView().setBusy(false);
					if (oReturns.results.length === 0) {
						MessageBox.error(this.i18n.getProperty("Msg.NoEmployee"));
						oSource.setValue("");
						this.disableEmployeeRow(oSource, true);
						return;
					}
					var oData = oReturns.results[0];
					// set employee detail
					oSource.setValue(oData.PERNR);
					var mPRDetail = oComponent.getModel("mPRDetail");
					var sApproveNo = oSource.data("ApproveRole");
					mPRDetail.setProperty("/GE_POS" + sApproveNo, oData.GE_POS);
					mPRDetail.setProperty("/KW_POS" + sApproveNo, oData.KW_POS);
					mPRDetail.setProperty("/NAME" + sApproveNo, oData.VORNA);
					mPRDetail.setProperty("/LASTNAME" + sApproveNo, oData.NACHN);
					this.disableEmployeeRow(oSource, false);
				}.bind(this),
				error: function (oError) {
					this.getView().setBusy(false);
					this.errorHandler(oError)
				}.bind(this)
			});
		},
		_onVHRPurchaseOrder: function (oEvent) {
			var that = this;
			var oInputControl = oEvent.getSource();
			// var aTokens = [];
			// var aTokens = oEvent.getTokens();
			var mService = that.getOwnerComponent().getModel();
			var oVHRParams = {
				compactUi: true,
				basicSearchText: "",
				title: "Purchase Order",
				key: "Po",
				supportMultiselect: true,
				supportRanges: true,
				supportRangesOnly: false,
				rangesKeyFields: [{
					key: "Po",
					label: "Purchase Order"
				}],
				callbackFunction: {
					ok: function (oControlEvent) {
						var oToken = oControlEvent.getParameter("tokens")[0];
						oInputControl.setValue(oToken.getProperty("key"));
						that._onSearchPurchaseOrder(true);
					},
					cancel: null,
					afterClose: null
				},
				columns: [{
					label: this.i18n.getProperty("PRNo"),
					template: "BANFN",
					demandPopin: true
				}, {
					label: this.i18n.getProperty("PRDoctype"),
					template: "BSART_NAME",
					demandPopin: true
				}, {
					label: this.i18n.getProperty("PRPurGroup"),
					template: "EKGRP_NAME",
					demandPopin: true
				}, {
					label: this.i18n.getProperty("PRMatGroup"),
					template: "MATKL_NAME",
					demandPopin: true
				}, {
					label: this.i18n.getProperty("PRCreateDate"),
					template: "BADAT",
					demandPopin: true
				}, {
					label: this.i18n.getProperty("PRStatus"),
					template: "STATUS_NAME",
					demandPopin: true
				}],
				datas: {
					odataModel: mService,
					entitySet: "/F4PRSet",
					filters: that.shPurchaseOrderFilter
				},
				basicTokens: [],
				filterMode: false,
				filterGroupItems: [{
						groupTitle: "",
						groupName: "group1",
						name: "BANFN",
						label: this.i18n.getProperty("PRNo"),
						control: new sap.m.Input(),
						operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.NE
					}, {
						groupTitle: "",
						groupName: "group1",
						name: "BSART_NAME",
						label: this.i18n.getProperty("PRDoctype"),
						control: new sap.m.Input(),
						operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.NE
					}, {
						groupTitle: "",
						groupName: "group1",
						name: "EKGRP_NAME",
						label: this.i18n.getProperty("PRPurGroup"),
						control: new sap.m.Input(),
						operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.NE
					}, {
						groupTitle: "",
						groupName: "group1",
						name: "MATKL_NAME",
						label: this.i18n.getProperty("PRMatGroup"),
						control: new sap.m.Input(),
						operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.NE
					}, {
						groupTitle: "",
						groupName: "group1",
						name: "BADAT",
						label: this.i18n.getProperty("PRCreateDate"),
						control: new sap.m.DateRangeSelection({
							displayFormat: "dd.MM.yyyy",
							dateValue: that.shCreateDateFrom,
							secondDateValue: that.shCreateDateTo
						}),
						operation: "BT"
					}, {
						groupTitle: "",
						groupName: "group1",
						name: "STATUS_NAME",
						label: this.i18n.getProperty("PRStatus"),
						control: new sap.m.Input(),
						operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.NE
					},
					//     {
					//     groupTitle: "",
					//     groupName: "group1",
					//     name: "Material",
					//     label: this.i18n.getProperty("PR") + "Material No. (*)",
					//     control: new sap.m.Input(),
					//     operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains
					// }, {
					//     groupTitle: "",
					//     groupName: "group1",
					//     name: "PurchasingGroup",
					//     label: this.i18n.getProperty("PR") + "Purchasing Group (A*)",
					//     control: new sap.m.Input(),
					//     operation: sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith
					// }
				]
			};
			PRVHUtilities.ValueHelpDialog.Show(oVHRParams);
		},
		onVHReason: function (oEvent) {
			var loControl = oEvent.getSource();
			var laTokens = null;
			this.oVHCollection.callF4Reason(
				loControl,
				false, //multiselect
				false, //range
				laTokens,
				"", // Range Filter Param (TEXT,NUMERIC)
				this._selectedPODocType,
				function (pControlEvent, pTokens, pDataSet, pSelected) {
					// TODO set value to model
					var oToken = Utilities.CreateToken(false, "PAY_STAT", "EQ", pSelected.ZDATA);
					// loControl.setTokens([oToken]);
					this.getLongReason(pSelected.ZTEXTID);
					loControl.setValue(pSelected.ZDATA);
				}.bind(this)
			);
		},
		setPrintAble: function (bPrintAble) {
			var oComponent = this.getOwnerComponent();
			var mVisibleControl = oComponent.getModel("mVisibleControl");
			mVisibleControl.setProperty("/print/enabled", bPrintAble);
		},
		onPRInputChange: function (oEvent) {
			setTimeout(
				function () {
					// check new token that update in input
					// this.getPRDocList();
					console.log(oEvent);
					var oPrNoInput = this.getView().byId("PrNoInput");
					var oTokens = oPrNoInput.getTokens();
					// fix if input space not generate token by exit function
					if (oTokens.length === 0) {
						return;
					}
					this.getView().setBusy(true);

					if (oTokens.length === 1 || this._isFromPRManage === true) {
						this._isFromPRManage = false;
						// this.getPRDetail();
						// this.getApproveDetail();
						// this.getPRDocList();
						Promise.all(
							[this.getPRDetail(),
								this.getApproveDetail(),
								this.getPRDocList()
							]
						).then(function () {
							this.getView().setBusy(false);
						}.bind(this));
						return;
					}
					// check all token that can be print together
					var oModel = this.getOwnerComponent().getModel();
					var sPath = "/PRDocListSet";
					var aFilter = [];
					var oLastTokens = oTokens[oTokens.length - 1];
					// build or filter for pr doc
					oTokens.forEach(function (loToken) {
						var loTokenData = loToken.data().value;
						var loTmpFilter = new sap.ui.model.Filter(loTokenData.keyField, loTokenData.operation, loTokenData.value1, loTokenData.value2);
						aFilter.push(loTmpFilter)
					}.bind(this))
					return new Promise(function (fnResovle) {
						oModel.read(sPath, {
							filters: aFilter,
							success: function (oResults) {
								fnResovle();
								this.getView().setBusy(false);
								this.getPRDocList();
							}.bind(this),
							error: function (oErrors) {
								oPrNoInput.removeToken(oLastTokens);
								this.errorHandler(oErrors);
								this.getView().setBusy(false);
							}.bind(this)
						});
					}.bind(this))
				}.bind(this), 500);
		},
		setPRSingleToken: function (oResults) {
			var aTokens = [];
			oResults.forEach(function (loRow) {
				aTokens.push(Utilities.CreateToken(false, "BANFN", "EQ", loRow.BANFN))
			}.bind(this))
			return aTokens;
		},
		errorHandler: function (oReturn) {
			try {
				var oError = JSON.parse(oReturn.responseText);
				var sErrMsg = oError.error.message.value;
				var laErrorDetail = oError.error.innererror.errordetails;
				if (laErrorDetail.length > 0) {
					var lsErrorMsg = "";
					laErrorDetail.forEach(function (loErrorRow) {
						if (loErrorRow.code.indexOf("IWBEP") === -1) {
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
		getFormattedAmount: function (oEvent) {
			var oSource = oEvent.getSource();
			var lvAmount = oEvent.getParameter("newValue");
			var lvFormattedAmount = Utilities.formatAmount(lvAmount);
			oSource.setValue(lvFormattedAmount);
			// var result = 0;
			// if (lvAmount == 0 && lvFormattedAmount == 0) {
			//     result = true;
			// }
			return lvFormattedAmount;
		},
		onTokenUpdate: function (oEvent) {
			if (oEvent.getParameter("type") !== "removed") return;
			var vTokenLength = oEvent.getSource().getTokens().length;
			var vTokenRemoveLength = oEvent.getParameter("removedTokens").length;
			if (vTokenRemoveLength >= vTokenLength) {
				this.clearInputData();
			}
		},
		getPRDocList: function () {
			var oComponent = this.getOwnerComponent();
			var sPath = "/PRDocListSet";
			var oModel = oComponent.getModel();
			var oFilter = this.getPRFilter();
			var oView = this.getView();
			oView.setBusy(true);
			return new Promise(function (fnResovle) {
				oModel.read(sPath, {
					filters: oFilter,
					success: function (oResults) {
						oView.setBusy(false);
						this.setPrintAble(true);
						var mPRDocList = oComponent.getModel("mPRDocList");
						if (oResults.results.length > 0) {
							mPRDocList.setData(oResults.results);
							this.getPRDetail(oResults.results[0].BANFN);
						}
						fnResovle();
						var oTokens = this.setPRSingleToken(oResults.results);
						this.getView().byId("PrNoInput").setTokens(oTokens);
					}.bind(this),
					error: function (oErrors) {
						oView.setBusy(false);
						this.errorHandler(oErrors);
						this.clearInputData();
						// clear pr input
						this.getView().byId("PrNoInput").setTokens([]);
					}.bind(this)
				});
			}.bind(this))
		},
		getLongReason: function (vZLDESC) {
			var sPath = "/GetLongReasonSet(ZLDESC='" + vZLDESC + "')";
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			new Promise(function (fnResovle) {
				oModel.read(sPath, {
					success: function (oResults) {
						var mPRDetail = oComponent.getModel("mPRDetail");
						mPRDetail.setProperty("/ZREASON", oResults.ZREASON);
						// mPRDetail.setData(oResults);
						// this.setPRTypeRadioButton(oResults.PR_TYPE);
						fnResovle()
					}.bind(this)
				});
			}.bind(this))
		},
		onVHPrintPr: function (oEvent) {
			var loControl = oEvent.getSource();
			var laTokens = loControl.getTokens();
			this.oVHCollection.callF4PrintPr(
				loControl,
				true, //multiselect
				true, //range
				laTokens,
				"", // Range Filter Param (TEXT,NUMERIC)
				this.shPurchaseOrderFilter,
				function (pControlEvent, pTokens, pDataSet, pSelected) {
					loControl.setTokens(pTokens);
					this.getPRDocList();
					// this.getApproveDetail();
					// loControl.setValue(pTokens);
				}.bind(this)
			);
		},
		setInitialModel: function () {
			var oComponent = this.getOwnerComponent();
			var mApproval = new sap.ui.model.json.JSONModel({});
			oComponent.setModel(mApproval, "mPRDetail");
			var mApproveDetail = new sap.ui.model.json.JSONModel([]);
			oComponent.setModel(mApproveDetail, "mApproveDetail");
			var mDate = new sap.ui.model.json.JSONModel(new Date());
			oComponent.setModel(mDate, "mDate");
			var mPRDocList = new sap.ui.model.json.JSONModel([]);
			oComponent.setModel(mPRDocList, "mPRDocList");
			var mVisibleControl = new sap.ui.model.json.JSONModel({
				name: {
					enabled: false
				},
				position: {
					enabled: true
				},
				print: {
					enabled: false
				}
			});
			oComponent.setModel(mVisibleControl, "mVisibleControl");
		},
		getPRDetail: function (vPONo) {
			// var sPONo = "1010000418";
			// vPONo = "1010000418";
			var sPath = "/PRDetailSet(BANFN='" + vPONo + "')";
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			new Promise(function (fnResovle) {
				oModel.read(sPath, {
					success: function (oResults) {
						var mPRDetail = oComponent.getModel("mPRDetail");
						mPRDetail.setData(oResults);
						this.setPRTypeRadioButton(oResults.PR_TYPE);
						this.setVisibleControl(oResults);
						this._selectedPODocType = oResults.BSART;
						fnResovle()
					}.bind(this)
				});
			}.bind(this))
		},
		setPRListModel: function () {
			var oComponent = this.getOwnerComponent();
			var mPRList = new sap.ui.model.json.JSONModel(["1010000418"]);
			oComponent.setModel(mPRList, "mPRList");
		},
		getPRFilter: function () {
			// get token and add filter
			var oTokens = this.getView().byId("PrNoInput").getTokens();
			if (!oTokens) return [];
			var aFilter = [];
			oTokens.forEach(function (loToken) {
				var oValue = loToken.data().value;
				var loFilter = new sap.ui.model.Filter(oValue.keyField, oValue.operation, oValue.value1, oValue.value2);
				aFilter.push(loFilter)
			}.bind(this));
			return aFilter;
		},
		onApproveResultSelect: function (oEvent) {
			// update approve detail data
			if (oEvent.getParameter("selected")) {
				this.getApproveDetail();
			}
		},
		getApproveDetail: function () {
			// var sPRNo = ["1010000418"];
			var sPath = "/ApproveDetailSet";
			var oFilter = this.getPRFilter();
			if (!oFilter.length) return;
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			return new Promise(function () {
				oModel.read(sPath, {
					filters: oFilter,
					success: function (oReturns) {
						var mApproveDetail = new sap.ui.model.json.JSONModel(oReturns.results);
						oComponent.setModel(mApproveDetail, "mApproveDetail");

					}.bind(this),
				})
			}.bind(this))
		},
		onDelRowPress: function (oEvent) {
			var sBindingContextPath = oEvent.getParameter("listItem").getBindingContextPath();
			// check have at least 1 row
			MessageBox.confirm(this.i18n.getProperty("Msg.DeleteRow"), {
				onClose: function (oEvent) {
					if (oEvent !== "OK") {
						return;
					}
					this.handelDelRow(sBindingContextPath);
				}.bind(this)
			});
		},
		onPrintPress: function (oEvent) {

			if (!this.validateApproveItem()) {
				return;
			}
			this.getView().setBusy(true);
			this.handleSave().then(
				function () {
					this.getPRForm().then(function () {
						this.getView().setBusy(false);
					}.bind(this));
				}.bind(this),
				function (oError) {
					this.errorHandler(oError);
					this.getView().setBusy(false);
				}.bind(this)
			);
			// MessageBox.confirm(this.i18n.getProperty("Msg.Print"), {
			//     onClose: function (oEvent) {
			//         if (oEvent !== "OK") {
			//             return;
			//         }
			//         this.handleSave().then(
			//             function () {
			//                 this.getPRForm();
			//             }.bind(this),
			//             function (oError) {
			//                 this.errorHandler(oError);
			//             }.bind(this)
			//         );
			//         // this.handlePrint();/**/
			//     }.bind(this)
			// });
		},
		formatPRDetail: function (oData) {
			var inputPrintDate = this.getView().byId("inputPrintDate");
			var printDate = this.getOwnerComponent()._printDate || inputPrintDate.getDateValue();
			oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(printDate);
			return oData
		},
		onPrintDateChange: function (oEvent) {
			var bValid = oEvent.getParameter("valid") && oEvent.getParameter("value") !== "";
			if (!bValid) {
				oEvent.getSource().setDateValue(new Date());
				sap.m.MessageToast.show(this.i18n.getProperty("Msg.InvalidPrintDate"));
				return;
			}
		},
		validateApproveItem: function () {
			var oComponent = this.getOwnerComponent();
			var aPRDocList = oComponent.getModel("mPRDocList").getData();
			var aApproveDetail = oComponent.getModel("mApproveDetail").getData();
			var bIsValidated = true;
			var oListItem = {};
			// ## collect doc item row
			aApproveDetail.forEach(function (loRowData) {
				try {
					oListItem[loRowData.BANFN].push(loRowData);
				} catch (e) {
					oListItem[loRowData.BANFN] = [loRowData];
				}
			}.bind(this));
			// ## check line item have at least 1 record
			// ## check with line item count
			var bItemMoreThanLineItem = false;
			aPRDocList.forEach(function (loRowData) {
				if ($.isArray(oListItem[loRowData.BANFN])) {
					if (oListItem[loRowData.BANFN].length > loRowData.ITEM_COUNT) {
						bIsValidated = false;
						bItemMoreThanLineItem = true;
						if (bItemMoreThanLineItem === false) {
							MessageBox.error(this.i18n.getProperty("Msg.ItemMoreThanLineItem"));
							bItemMoreThanLineItem = true;
						}
					}
				}
			}.bind(this))
			return bIsValidated;
		},
		onApproveDetailSavePress: function () {
			if (!this.validateApproveItem()) {
				MessageBox.error(this.i18n.getProperty("Msg.ItemMoreThanLineItem"));
				return;
			}
			this.getView().setBusy(true);
			this.handleSave().then(
				function () {
					MessageBox.success(this.i18n.getProperty("Msg.SaveSuccess"));
					this.getView().setBusy(false);
				}.bind(this),
				function (oErrors) {
					this.errorHandler(oErrors);
					this.getView().setBusy(false);
				}.bind(this)
			);
		},
		formatUpdatePRAprv: function (oData) {
			oData.forEach(function (loRow) {
				loRow.AMT = loRow.AMT.toString();
			}.bind(this));
			return oData;
		},
		handleSave: function () {
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			var oData = this.formatPRDetail(oComponent.getModel("mPRDetail").getData());
			oData.UpdatePRAprv = this.formatUpdatePRAprv(oComponent.getModel("mApproveDetail").getData());
			// oData.PR_TYPE = this.getPRType();
			if (!oData.EDATE_FLAG) {
				// oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue()); //DEL BY CH01
				oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(new Date()); //++CH01
			}
			//<BOI CH01
			else {
				if (oComponent.getModel("mPRDetail").getProperty("/APVRPT_FLAG")) {
					oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue());
				} else {
					oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(new Date());
				}
			}
			//>EOI CH01
			var sPath = "/PRDetailSet";
			return new Promise(function (fnresolve, fnreject) {
				//## check apprve detail check box value
				if (!oData.APVRPT_FLAG) {
					fnresolve();
				} else {
					oModel.create(sPath, oData, {
						success: function (oReturns) {
							fnresolve();
						}.bind(this),
						error: function (oErrors) {
							fnreject(oErrors);
						}.bind(this),
					});
				}
			}.bind(this))
		},
		handlePrint: function () {
			// send approve data to save
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			var oData = this.formatPRDetail(oComponent.getModel("mPRDetail").getData());
			oData.UpdatePRAprv = this.formatUpdatePRAprv(oComponent.getModel("mApproveDetail").getData());
			oData.PR_TYPE = this.getPRType();
			if (!oData.EDATE_FLAG) {
				// oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue()); DEL BY CH01
            	oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(new Date());  //++CH01
			} 
			//<BOI CH01
            else{
            	if(oComponent.getModel("mPRDetail").getProperty("/APVRPT_FLAG")){
            		oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue());
            	}else{
            		oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(new Date()); 
            	}
            }
            //>EOI CH01
			var sPath = "/PRDetailSet";
			oModel.create(sPath, oData, {
				success: function (oReturns) {
					this.getPRForm();
				}.bind(this),
				error: function (oErrors) {}.bind(this),
			});
		},
		getPRType: function () {
			var oRadioButtonGroup = this.getView().byId("PRTypeRadioButton");
			var sPRType = oRadioButtonGroup.getSelectedButton().data("value");
			return sPRType;
		},
		getPRForm: function () {
			var aKeys = ["PR_TYPE", "REASON", "ZREASON", "ZTO", "ATTACH_FLAG", "APVRPT_FLAG", "CPRICE_FLAG", "PERNR_1", "KW_POS_1", "GE_POS_1",
				"NAME_1", "LASTNAME_1", "ESIGN_1", "PERNR_2", "KW_POS_2", "GE_POS_2", "NAME_2", "LASTNAME_2", "ESIGN_2", "PERNR_3", "KW_POS_3",
				"GE_POS_3", "NAME_3", "LASTNAME_3", "ESIGN_3", "PERNR_4", "KW_POS_4", "GE_POS_4", "NAME_4", "LASTNAME_4", "ESIGN_4", "ATTACHED",
				"EDATE_FLAG", "PRINT_DATE"
			];
			var oComponent = this.getOwnerComponent();
			var oModel = oComponent.getModel();
			var oPRDetail = oComponent.getModel("mPRDetail").getData();
			var sPath = "/SavePRSet";
			var sPRString = this.getPRJSONString();
			var oData = {};
			// format flag from boolean to Y or N
			aKeys.forEach(function (lvKey) {
				var lvValue = oPRDetail[lvKey];
				if (lvKey.indexOf("FLAG") !== -1 && lvKey !== "EDATE_FLAG") {
					lvValue = lvValue ? "Y" : "N";
				}
				oData[lvKey] = lvValue;
			}.bind(this));
			oData.KEY_VALUE = sPRString;
			if (!oData.EDATE_FLAG) {
				// oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue()); //DEL BY CH01
				oData.PRINT_DATE = null; //++CH01
			}
			//<BOI CH01
			else {
				if (oComponent.getModel("mPRDetail").getProperty("/APVRPT_FLAG")) {
					oData.PRINT_DATE = Utilities.AdjustDateTimeDataToSend(this.getView().byId("inputPrintDate").getDateValue());
				} else {
					oData.PRINT_DATE = null;
				}
			}
			//>EOI CH01
			return new Promise(function (fnresolve) {
				oModel.create(sPath, oData, {
					success: function (oReturns) {
						this.getPDF(oReturns.PRINT_NO); 
						if (oPRDetail.ATTACHED === "X") {
							// this.showAttachmentDialog(oReturns.PRINT_NO);DEL BY CH01
							this.showAttachmentDialog(oReturns.PRINT_NO,oData.PRINT_DATE); //++CH01
						}
						fnresolve();
					}.bind(this),
					error: function (oErrors) {
						this.errorHandler(oErrors);
						fnresolve();
					}.bind(this),
				})
			}.bind(this))
		},
		showAttachmentDialog: function (vPRINT_NO) { 
			MessageBox.confirm(this.i18n.getProperty("Msg.AttachToDoc"), {
				onClose: function (oEvent) {
					var bIsAttached = oEvent === "OK" ? "Y" : "N";
					var oComponent = this.getOwnerComponent();
					var oModel = oComponent.getModel();
					var sParam = "(PRINT_NO='" + vPRINT_NO + "',ATTACHED='" + bIsAttached + "')"; 
					var sPath = "/PopUpAttachSet" + sParam;
					this.getView().setBusy(true);
					oModel.remove(sPath, {
						success: function (oReturns) {
							this.getView().setBusy(false);
							if (bIsAttached === "Y") {
								MessageToast.show(this.i18n.getProperty("Msg.AttachSuccess"));
							}
						}.bind(this),
						error: function (oErrors) {
							this.getView().setBusy(false);
						}.bind(this)
					});
				}.bind(this)
			});
		},
		getPDF: function (sPrintNo) { 
			var sPath = "/sap/opu/odata/sap/ZLPUBA006_srv/PRFormSet(PRINT_NO='" + sPrintNo + "')/$value?sap-language=TH";
			window.open(sPath, "_blank");
		},
		getPRJSONString: function () {
			var oMultiInput = this.getView().byId("PrNoInput");
			var oTokens = oMultiInput.getTokens();
			var aPR = [];
			oTokens.forEach(function (loToken) {
				var loFilterParam = loToken.data("value");
				var loObj = null;
				var sSign = loFilterParam.exclude ? "E" : "I";
				if (typeof (loFilterParam.value2) === "undefined") {
					loObj = {
						"sign": sSign,
						"option": loFilterParam.operation,
						"low": loFilterParam.value1
					};
				} else {
					loObj = {
						"sign": sSign,
						"option": loFilterParam.operation,
						"low": loFilterParam.value1,
						"high": loFilterParam.value2
					};
				}
				aPR.push(loObj);
			}.bind(this));
			return JSON.stringify(aPR);
		},
		setPRTypeRadioButton(sPR_Type) {
			var oControl = this.getView().byId("PRTypeRadioButton");
			var oComponent = this.getOwnerComponent();
			var mPRDetail = oComponent.getModel("mPRDetail");
			oControl.getButtons().forEach(function (loRadioButton) {
				if (loRadioButton.data("value") == sPR_Type) {
					loRadioButton.setSelected(true);
					mPRDetail.setProperty("/PR_TYPE", sPR_Type);
				}
			}.bind(this));
		},
		onRadioButtonGroupSelect: function (oEvent) {
			var iSelectedIndex = oEvent.getParameter("selectedIndex");
			var oSelectedButton = oEvent.getSource().getButtons()[iSelectedIndex];
			var vRadioValue = oSelectedButton.data("value");
			var oComponent = this.getOwnerComponent();
			var mPRDetail = oComponent.getModel("mPRDetail");
			mPRDetail.setProperty("/PR_TYPE", vRadioValue);
		},
		onApproveDetailAddRowPress: function (oEvent) {
			var oComponent = this.getOwnerComponent();
			var mApproveDetail = oComponent.getModel("mApproveDetail");
			mApproveDetail.getData().push({
				AMT: 0
			});
			mApproveDetail.updateBindings();
		},
		clearInputData: function () {
			var oComponent = this.getOwnerComponent();
			var mApproveDetail = oComponent.getModel("mApproveDetail");
			var mPRDetail = oComponent.getModel("mPRDetail");
			mApproveDetail.setData([]);
			mApproveDetail.updateBindings();
			mPRDetail.setData({});
			mPRDetail.updateBindings();
			this.setDefaultApproveFlag();
			this.setPrintAble(false);
		},
		validateApprveDetail1Item: function (oEvent) {
			var oComponent = this.getOwnerComponent();
			var mPRDocList = oComponent.getModel("mPRDocList");
			var oData = mPRDocList.getData();
			var lPODocList = {};
			var oTable = oEvent.getSource().getParent().getParent();
			var mApproveDetail = oComponent.getModel("mApproveDetail");
			var sBindingContext = oTable.getSelectedItems()[0].getBindingContextPath();
			var oSelectedItem = mApproveDetail.getProperty(sBindingContext);
			var vSelectedPODoc = oSelectedItem.BANFN;
			// set list obj
			oData.forEach(function (loRow) {
					// lPODocList.push(loRow.BANFN);
					lPODocList[loRow.BANFN] = 0;
				}.bind(this))
				// loop check with appdetail model
			var bIsHave1Detail = true;
			mApproveDetail.getData().forEach(function (loRow) {
				if (vSelectedPODoc == loRow.BANFN) {
					lPODocList[loRow.BANFN]++;
				}
			}.bind(this));
			if (lPODocList[vSelectedPODoc] === 1) {
				bIsHave1Detail = false;
			}
			// if (!bIsHave1Detail) {
			//     MessageBox.error(this.i18n.getProperty("Msg.AtleastOneLineItem"));
			// }
			return bIsHave1Detail;
		},
		onApproveDetailDelRowPress: function (oEvent) {
			if (!this.validateApprveDetail1Item(oEvent)) {
				MessageBox.error(this.i18n.getProperty("Msg.AtleastOneLineItem"));
				return;
			};
			var oTable = oEvent.getSource().getParent().getParent();
			oTable.getSelectedItems().forEach(function (loSelectedRow) {
				var sBindingPath = loSelectedRow.getBindingContextPath();
				// sBindingPath = sBindingPath.replace("/", "");
				this.handelDelRow(sBindingPath);
				loSelectedRow.setSelected(false);
				// oData.splice(sBindingPath, 1);
			}.bind(this));
			// mApproveDetail.updateBindings();
		},
		handelDelRow: function (sBindingContextPath) {
			var oComponent = this.getOwnerComponent();
			var mApproveDetail = oComponent.getModel("mApproveDetail");
			var oData = mApproveDetail.getData();
			var sBindingPath = sBindingContextPath;
			sBindingPath = sBindingPath.replace("/", "");
			oData.splice(sBindingPath, 1);
			mApproveDetail.updateBindings();
		},
		// F4Employee
		// handleRadioButtonGroupsSelectedIndex: function() {
		// 	var that = this;
		// 	this.aRadioButtonGroupIds.forEach(function(sRadioButtonGroupId) {
		// 		var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
		// 		var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
		// 		if (oButtonsBinding) {
		// 			var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
		// 			var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
		// 			oButtonsBinding.attachEventOnce("change", function() {
		// 				if (oSelectedIndexBinding) {
		// 					oSelectedIndexBinding.refresh(true);
		// 				} else {
		// 					oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
		// 				}
		// 			});
		// 		}
		// 	});
		//
		// },
		// convertTextToIndexFormatter: function(sTextValue) {
		// 	var oRadioButtonGroup = this.byId("sap_uxap_ObjectPageLayout_0-sections-sap_uxap_ObjectPageSection-1-subSections-sap_uxap_ObjectPageSubSection-1-blocks-build_simple_form_Form-1563155392459-formContainers-build_simple_form_FormContainer-1-formElements-build_simple_form_FormElement-2-fields-sap_m_RadioButtonGroup-1");
		// 	var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
		// 	if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
		// 		// look up index in bound context
		// 		var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
		// 		return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function(oButtonContext) {
		// 			return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
		// 		});
		// 	} else {
		// 		// look up index in static items
		// 		return oRadioButtonGroup.getButtons().findIndex(function(oButton) {
		// 			return oButton.getText() === sTextValue;
		// 		});
		// 	}
		//
		// },
		// _onRadioButtonGroupSelect: function() {
		//
		// },
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("PrintPr").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			this.settingScreenCriteria();
			Utilities.addValidator(this._criterias);
			this.initPRDefaultForSearchHelp();
		},
		setVisibleControl: function (oResult) {
			var oComponent = this.getOwnerComponent();
			var mVisibleControl = oComponent.getModel("mVisibleControl");
			mVisibleControl.setProperty("/CL_PERSN", !oResult.CL_PERSN);
			mVisibleControl.setProperty("/CL_APVRPT", !oResult.CL_APVRPT);
			// mVisibleControl.setProperty("/position/enabled", oParams.position);
			// mVisibleControl.setProperty("/name/enabled", oParams.name);
		},
		_criterias: [{
			id: "PrNoInput",
			keyfield: "BANFN",
			type: "MultiInput",
			control: true,
		}],
		settingScreenCriteria: function () {
			for (var lvFname in this._criterias) {
				this._criterias[lvFname].control = this.getView().byId(this._criterias[lvFname].id);
			}
		},
		onTextBoxLiveChange: function (oEvent) {
			Utilities.formatTextArea(oEvent, 120);
		}
	});
}, /* bExport= */ true);