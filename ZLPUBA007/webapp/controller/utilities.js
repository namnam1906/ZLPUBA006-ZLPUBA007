sap.ui.define([
	"./utilities",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/ui/comp/valuehelpdialog/ValueHelpDialog"
], function(Util, MessageBox, Dialog, ValueHelpDialog) {
	"use strict";

	// class providing static utility methods to retrieve entity default values.

	return {

		ValueHelpDialog: {
			Show: function(oParams) {


				var that = this;
				var oValueHelpDialogParams = jQuery.extend(true, {}, {
					compactUi: true,
					basicSearchText: null,
					title: null,
					stretch: sap.ui.Device.system.phone,
					supportMultiselect: false,
					supportRanges: false,
					supportRangesOnly: false,
					fullOperationKey: false,
					filterMode: false,
					ok: function(oControlEvent) {
						try {
							oParams.callbackFunction.ok(oControlEvent);
						} catch (e) {}

						oValueHelpDialog.close();
					},

					cancel: function(oControlEvent) {
						try {
							oParams.callbackFunction.cancel(oControlEvent);
						} catch (e) {}

						oValueHelpDialog.close();
					},

					afterClose: function() {
						try {
							oParams.callbackFunction.afterClose();
						} catch (e) {}

						oValueHelpDialog.destroy();
					}
				}, oParams);

				var oValueHelpDialog = new ValueHelpDialog(oValueHelpDialogParams);

				var oTable = null;
				if (oParams.supportRangesOnly === false && oParams.datas) {
					oTable = oValueHelpDialog.getTable();
				}

				if (oTable && oParams.columns && oParams.columns.length > 0) {
					var oColModel = new sap.ui.model.json.JSONModel();
					oColModel.setData({
						cols: oParams.columns
					});
					oTable.setModel(oColModel, "columns");
				}

				var fnSetTokens = function(oValueHelpDialog, aTokens) {
					if (oValueHelpDialog && aTokens && aTokens.length > 0) {
						oValueHelpDialog.setTokens(aTokens);
						oValueHelpDialog.update();
					}
				}

				if (oParams.datas instanceof Array) {
					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(oParams.datas);

					if (oTable) {
						oTable.setModel(oRowsModel);
						if (oTable.bindRows) {
							oTable.bindRows("/");
							var loBinding = oTable.getBinding("rows");
							if (oParams.datas.filters && oParams.datas.filters instanceof Array) {
								loBinding.filter(oParams.datas.filters);
							}
						}
					}
					fnSetTokens(oValueHelpDialog, oParams.basicTokens);
				} else {
					if (oTable) {
						if (oParams.datas.odataModel === undefined) return;
						if (oParams.datas.entitySet === undefined) return;

						var oODataModel = jQuery.extend(true, {}, oParams.datas.odataModel);

						oTable.setModel(oODataModel);
						if (oTable.bindRows) {
							oTable.bindRows(oParams.datas.entitySet);
							var oBinding = null;
							if (sap.ui.Device.system.phone) {
								oBinding = oTable.getBinding("items");
							} else {
								oBinding = oTable.getBinding("rows");
							}
							if (oParams.datas.filters && oParams.datas.filters instanceof Array) {
								oBinding.filter(oParams.datas.filters);
							}

							oODataModel.attachRequestCompleted(function() {
								if (arguments[0].getParameter("url").indexOf("$count") < 0)
									fnSetTokens(oValueHelpDialog, oParams.basicTokens);
							});
						}
					} else {
						fnSetTokens(oValueHelpDialog, oParams.basicTokens);
					}
				}

				if (oTable && oTable.bindItems && oParams.columns && oParams.columns.length > 0) {
					oTable.bindAggregation("items", oParams.datas.entitySet, function(sId, oContext) {
						var aCols = oTable.getModel("columns").getData().cols;

						return new sap.m.ColumnListItem({
							cells: aCols.map(function(column) {
								var colname = column.template;
								return new sap.m.Label({
									text: "{" + colname + "}"
								});
							})
						});
					});
				}

				if (oParams.rangesKeyFields && oParams.rangesKeyFields.length > 0) {
					oValueHelpDialog.setRangeKeyFields(oParams.rangesKeyFields);
				}

				var oFilterBarOptions = {
					advancedMode: true,
					filterBarExpanded: true,
					searchEnabled: true,
					showGoOnFB: !sap.ui.Device.system.phone,
					search: function() {
						if (oTable) {
							var oBinding = null;
							if (sap.ui.Device.system.phone)
								oBinding = oTable.getBinding("items");
							else
								oBinding = oTable.getBinding("rows");

							// apply filters to binding
							var aFilters = [];
							jQuery.each(arguments[0].mParameters.selectionSet, function(i, oItem) {
								var sPath = oParams.filterGroupItems[i].name;
								if (sPath === "CreateDate" || sPath === "PostingDate" || sPath==="BADAT") {

									if (oItem.getDateValue()) {

										var sOperator = sap.ui.model.FilterOperator.BT;
										var sValue1 = oItem.getDateValue();
										sValue1 = new Date(sValue1.getTime() - (new Date().getTimezoneOffset() * 60 * 1000));

										var sValue2 = oItem.getDateValue();
										if (oItem.getSecondDateValue()) {
											sValue2 = oItem.getSecondDateValue();
										}
										sValue2 = new Date(sValue2.getTime() - (new Date().getTimezoneOffset() * 60 * 1000));

										var oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1, sValue2);
										// oFilter = Util.Converter.adjustDateTimeDataToSend(oFilter);
										aFilters.push(oFilter);
									}
								} else {
									if (oItem.getValue()) {

										var sOperator = oParams.filterGroupItems[i].operation || sap.ui.model.FilterOperator.Contains;
										var sValue1 = oItem.getValue();
										var oFilter = new sap.ui.model.Filter(sPath, sOperator, sValue1, null);
										aFilters.push(oFilter);
									}
								}
							});


							oBinding.filter(aFilters);
						}
					}
				};

				if (oParams.filterGroupItems) {
					oFilterBarOptions.filterGroupItems = [];
					jQuery.each(oParams.filterGroupItems, function(i, oItem) {
						oFilterBarOptions.filterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem(oItem));
					});
				}

				var oFilterBar = new sap.ui.comp.filterbar.FilterBar(oFilterBarOptions);

				oValueHelpDialog.setFilterBar(oFilterBar);

				if (oParams.compactUi) { // check if the Token field runs in Compact mode
					oValueHelpDialog.addStyleClass("sapUiSizeCompact");
				} else {
					oValueHelpDialog.addStyleClass("sapUiSizeCozy");
				}

				if (oParams.fullOperationKey) {
					oValueHelpDialog.setIncludeRangeOperations([
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LT,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LE,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GT,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GE,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EndsWith,
						sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith
					]);
				}
				oValueHelpDialog.open();
				oValueHelpDialog.update();
			}
		},

		RetrieveToken: function(pKey, paTokens) {
			var laLocalTokens = [];
			for (var lvInd in paTokens) {
				var lvKey = null;
				if (paTokens[lvInd].getCustomData() && paTokens[lvInd].getCustomData().length > 0) {
					lvKey = paTokens[lvInd].getCustomData()[0].getKey();
				} else {
					lvKey = paTokens[lvInd].getKey();
				}
				var lvText = null,
					loValue = null;
				if (lvKey === "range") {
					lvText = paTokens[lvInd].getText();
					loValue = paTokens[lvInd].getCustomData()[0].getValue();
				} else {
					lvText = "=" + paTokens[lvInd].getKey();
					loValue = {
						"exclude": false,
						"operation": sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ,
						"keyField": pKey,
						"value1": paTokens[lvInd].getKey(),
						"value2": null
					};
				}
				var loToken = new sap.m.Token({
					key: "range_" + lvInd,
					text: lvText
				}).data("range", loValue);
				laLocalTokens.push(loToken);
			}
			return laLocalTokens;
		},
		
		convertErrorMsg: function(oError) {

			try {
				// Try to parse as a JSON string
				return JSON.parse(oError);
			} catch (err) {
				try {
					// Whoops - not JSON, check if this is XML
					switch (typeof oError) {
						case "string": // XML or simple text
							if (oError.indexOf("<?xml") === 0) {
								var oXML = jQuery.parseXML(oError);
								var oXMLMsg = oXML.querySelector("message");
								if (oXMLMsg) {
									return oXMLMsg.textContent;
								}
							} else {
								// Nope just return the string
								return oError;
							}
							break;
						case "object": // Exception
							return oError.toString();
					}
				} catch (err) {
					return "An unknown error occurred";
				}
			}

		},

		CallActivateSession: function(pModel) {
			pModel.read("/ActivateSessionSet('X')");
		},

		ConvertDate2StringWithFormatter: function(pDate, pFormat) {
			try {
				return moment(pDate.toJSON()).format("HH:mm:ss.SSS");
			} catch (e) {
				return null;
			}
		},

		convertErrorFormat: function(arrErrors) {
			for (var i in arrErrors) {
				arrErrors[i].MESSAGE = arrErrors[i].message;
			}
		},

		isNullOrBlank: function(e) {
			return "boolean" != typeof e && (!e || null == e || "" == e);
		},

		CONVERT_TO_INT: function(oValue) {

			if (oValue == undefined)
				return "";

			if (typeof oValue != 'string' && !(oValue instanceof String))
				return "";

			return parseInt(oValue);
		},

		deleteDuplicateRecords: function(arrErrors) {

			var errorList = [];
			var lvDuplicated;

			for (var i = 0; i < arrErrors.length; i++) {

				lvDuplicated = false;
				for (var j = 0; j < errorList.length; j++) {
					// Check duplicated message
					if (arrErrors[i]["MESSAGE"] == errorList[j]["MESSAGE"]) {
						lvDuplicated = true;
						break;
					}
				}

				if (!lvDuplicated) {
					errorList.push(arrErrors[i]);
				}

			}

			return errorList;

		},

		isHasData: function(input) {
			if (this.isNullOrBlank(input)) {
				return false;
			} else {
				return true;
			}
		},

		MessageDialog: {

			create: function(title, state, contents, fnCallBack) {

				var dialogState = "None";
				var dialogContent = [];
				switch (state) {
					case "S":
					case "s":
					case "Success":
						dialogState = "Success";
						break;

					case "W":
					case "w":
					case "Warning":
						dialogState = "Warning";
						break;

					case "E":
					case "e":
					case "Error":
						dialogState = "Error";
						break;

					case "N":
					case "n":
					case "None":
					default:
						dialogState = "None";

				}

				if (typeof contents === "string") {

					dialogContent.push(new sap.m.Text({
						text: contents
					}));

				}

				var dialog = new sap.m.Dialog({
					title: title,
					type: "Message",
					content: dialogContent,
					state: dialogState,

					buttons: [

						new sap.m.Button({
							text: "{i18n>btOK}",
							press: function() {
								dialog.close();
								dialog.destroy();

								if (fnCallBack) {
									fnCallBack();
								}
							}

						})

					]
				});

				return dialog;
			}

		},

		ConfirmDialog: {

			create: function(title, message, fnOK, fnCancel) {

				var dialogTitle = "Confirm";
				var dialogMessage = "Are you sure you want to do action?";

				if (typeof title === "string") {
					dialogTitle = title;
				}

				if (typeof message === "string") {
					dialogMessage = message;
				}

				var dialog = new sap.m.Dialog({
					title: dialogTitle,
					type: 'Message',
					content: new sap.m.Text({
						text: dialogMessage
					}),
					beginButton: new sap.m.Button({
						text: '{i18n>btOK}',
						press: function() {

							dialog.close();
							if (fnOK) {
								fnOK();
							}
						}
					}),
					endButton: new sap.m.Button({
						text: '{i18n>btCancel}',
						press: function() {
							dialog.close();
							if (fnCancel) {
								fnCancel();
							}
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				return dialog;

			}

		},

		StrFormat: {

			padLeftZero: function(number, size) {
				var s = number + "";
				while (s.length < size) {
					s = "0" + s;
				}
				return s;
			}

		},

		Converter: {

			C_TIME_ZONE_OFFSET: new Date().getTimezoneOffset() * 60 * 1000,

			convertDateTimeToEdmTime: function(date) {

				try {

					if (date != null) {

						var h = date.getHours();
						var m = date.getMinutes();
						var s = date.getSeconds();

						h = h.length == 1 ? "0" + h : h;
						m = m.length == 1 ? "0" + m : m;
						s = s.length == 1 ? "0" + s : s;

						return "PT" + h + "H" + m + "M" + s + "S";

					} else {
						return "PT00H00M00S";
					}

				} catch (e) {
					return "PT00H00M00S";
				}

			},

			convertEdmTimeToDateTime: function(edmTime) {

				try {
					return new Date(edmTime.ms + this.C_TIME_ZONE_OFFSET);
				} catch (e) {
					return new Date(0 + this.C_TIME_ZONE_OFFSET);
				}

			},

			adjustDateTimeDataToScreen: function(obj) {

				for (var att in obj) {

					if (!obj[att] || /^_.*/.test(att)) {
						continue;
					}

					if (obj[att] instanceof Array) {

						for (var i = 0; i < obj[att].length; i++) {
							obj[att][i] = this.adjustDateTimeDataToScreen(obj[att][i]);
						}

					} else if (obj[att] instanceof Date) {

						console.log(obj[att]);

					} else if (typeof obj[att] === "object") {

						if (obj[att].__edmType === "Edm.Time") { // object EDM TIME

							obj[att] = new Date(obj[att].ms + this.C_TIME_ZONE_OFFSET);

						} else { // other object
							obj[att][i] = this.adjustDateTimeDataToScreen(obj[att]);
						}

					}

				}

				return obj;
			},

			adjustDateTimeDataToSend: function(obj) {

				for (var att in obj) {

					if (!obj[att] || /^_.*/.test(att)) {
						continue;
					}

					if (obj[att] instanceof Array) {

						for (var i = 0; i < obj[att].length; i++) {
							obj[att][i] = this.adjustDateTimeDataToScreen(obj[att][i]);
						}

					} else if (obj[att] instanceof Date) {

						obj[att] = new Date(obj[att].getTime() - this.C_TIME_ZONE_OFFSET);

					}

				}

				return obj;
			}

		}

	};
});