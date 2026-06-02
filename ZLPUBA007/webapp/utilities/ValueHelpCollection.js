sap.ui.define([
    'sap/ui/base/ManagedObject',
    'sap/ui/model/Filter',
    "iam/bc/utilities/CommonVHDialog",
    "iam/bc/utilities/Utilities"
], function (ManagedObject, Filter, CommonVHDialog, Utilities) {
// ], function (ManagedObject, Filter) {
    "use strict";

    var ValueHelpCollection = ManagedObject.extend("iam.bc.utilities.ValueHelpCollection", {
        metadata: {
            publicMethods: [
                "callF4PayClass",
                "callF4CompCode",
                "callF4CreateBy",
                "callF4EzPayStatus",
                "callF4FineStatus",
                "callF4OA",
                "callF4PayCat",
                "callF4PayType",
                "callF4PO",
                "callF4ProjectType",
                "callF4Vendor",
                "callF4FineType",
                "callF4EzPayNo",
                "callF4InvoiceNo",
                "callF4OA",
                "callF4PO",
                "replaceDataSetKey"
            ],
            properties: {
                "ServiceModel": {
                    type: "object",
                    defaultValue: null,
                    bindable: false,
                    group: "Data"
                },
                "EntitySetName": {
                    type: "object",
                    defaultValue: {
                        F4CompCode: "/F4CompCodeSet",
                        F4CreateBy: "/F4CreateBySet",
                        F4EzPayStatus: "/F4EzPayStatusSet",
                        F4FineStatus: "/F4FineStatusSet",
                        F4OA: "/F4OASet",
                        F4PayCat: "/F4PayCatSet",
                        F4PayClass: "/F4PayClassSet",
                        F4PayType: "/F4PayTypeSet",
                        F4PO: "/F4POSet",
                        F4ProjectType: "/F4ProjectTypeSet",
                        F4Vendor: "/F4VendorSet",
                        F4FineType: "/F4FineTypeSet",
                        F4CostCenter: "/F4CostCenterSet",
                        F4WFType: "/F4WFTypeSet"
                    },
                    bindable: false,
                    group: "Data"
                },
                "DefaultF4Param": {
                    type: "object",
                    defaultValue: {
                        compactUi: true,
                        supportMultiselect: false,
                        supportRanges: true,
                        supportRangesOnly: false,
                        rangesKeyFields: [],
                        fullOperationKey: true,
                        callbackFunction: {
                            ok: null,
                            cancel: null,
                            afterClose: null
                        },
                        columns: [],
                        datas: [],
                        basicTokens: [],
                        filterMode: false,
                        filterGroupItems: []
                    },
                    bindable: false,
                    group: "Data"
                }
            },
            events: {},
            specialSettings: {}
        },

        constructor: function (pServiceModel) {
            // complain if 'this' is not an instance of a subclass
            if (!(this instanceof ValueHelpCollection)) {
                throw Error("Cannot instantiate object: \"new\" is missing!");
            }

            ManagedObject.call(this);

            this.setServiceModel(pServiceModel);
        },

        callF4PayClass: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Payment Class",
                key: "PayClass",
                descriptionKey: "{PayClassDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Payment Class No",
                    template: "PayClass",
                    demandPopin: false
                }, {
                    label: "Payment Class Description",
                    template: "PayClassDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4PayClass
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "PayClass",
                    label: "Payment Class No (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.EQ
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4CompCode: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Company Code ",
                key: "EzPayComCode",
                descriptionKey: "{Butxt}",
                supportMultiselect: false,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [
                    {
                        label: "Company Code",
                        template: "EzPayComCode",
                        demandPopin: false
                    }, {
                        label: "Company Name",
                        template: "Butxt",
                        demandPopin: false
                    }
                ],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4CompCode
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "EzPayComCode",
                    label: "Company Code (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "Butxt",
                    label: "Company Name (*)",
                    control: new sap.m.Input(),
                    // operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4PayCat: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Payment Category",
                key: "PaymentCategory",
                descriptionKey: "{PayCatDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Payment Category",
                    template: "PaymentCategory",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "PayCatDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4PayCat
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "PaymentCategory",
                    label: "Payment Category (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4PayType: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Payment Type",
                key: "PayType",
                descriptionKey: "{PayTypeDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Payment Type",
                    template: "PayType",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "PayTypeDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4PayType
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "PayType",
                    label: "Payment Type (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4ProjectType: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Project Type",
                key: "ProjectTypeID",
                descriptionKey: "{ProjectTypeDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Project Type",
                    template: "ProjectTypeID",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "ProjectTypeDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4ProjectType
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "ProjectTypeID",
                    label: "Project Type (=)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.EQ
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4EzPayStatus: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Payment Status",
                key: "EzPayStatusID",
                descriptionKey: "{EzPayStatusDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Payment Status",
                    template: "EzPayStatusID",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "EzPayStatusDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4EzPayStatus
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "EzPayStatusID",
                    label: "Payment Status (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4Vendor: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Vendor",
                key: "VendorID",
                descriptionKey: "{Mcod1}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Company Code",
                    template: "Bukrs",
                    demandPopin: false
                }, {
                    label: "Vendor ID",
                    template: "VendorID",
                    demandPopin: false
                }, {
                    label: "Name",
                    template: "Mcod1",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4Vendor
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "Bukrs",
                    label: "Company Code (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "VendorID",
                    label: "Vendor ID (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "Mcod1",
                    label: "Name (*)",
                    control: new sap.m.Input()
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4CreateBy: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Created By",
                key: "CreatedByID",
                descriptionKey: "{Mcod1}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "User",
                    template: "CreatedByID",
                    demandPopin: false
                }, {
                    label: "First Name",
                    template: "NameFirst",
                    demandPopin: false
                }, {
                    label: "Last Name",
                    template: "NameLast",
                    demandPopin: false
                }, {
                    label: "Complete Name",
                    template: "NameTextc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4CreateBy
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "CreatedByID",
                    label: "User (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameFirst",
                    label: "First Name (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameLast",
                    label: "Last Name (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameTextc",
                    label: "Complete Name (*)",
                    control: new sap.m.Input()
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },
        callF4FineStatus: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Fine Status",
                key: "FineStatusID",
                descriptionKey: "{FineStatusDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Fine Status",
                    template: "FineStatusID",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "FineStatusDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4FineStatus
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "FineStatusID",
                    label: "Fine Status (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4FineType: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Fine Type",
                key: "FineTypeID",
                descriptionKey: "{FineTypeDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Fine Type",
                    template: "FineTypeID",
                    demandPopin: false
                }, {
                    label: "Description",
                    template: "FineTypeDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4FineType
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "FineTypeID",
                    label: "Fine Type (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.StartsWith
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4EzPayNo: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var lvToken = pBasicTokens;
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: lvToken,
                title: "EZ-Pay No.",
                key: "EzPayNo_S",
                descriptionKey: "{EzPayNo_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "EzPayNo_S",
                    label: "EZ-Pay No."
                }],
                fullOperationKey: true,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [],
                filterMode: false,
                filterGroupItems: []
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
            // LocalUtilities.ValueHelpDialog.Show(loVHRParams);
        },

        callF4AprNo: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var lvToken = pBasicTokens;
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: lvToken,
                title: "Approve No.",
                key: "AprNo_S",
                descriptionKey: "{AprNo_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "AprNo_S",
                    label: "Approve No."
                }],
                fullOperationKey: true,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [],
                filterMode: false,
                filterGroupItems: []
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
            // LocalUtilities.ValueHelpDialog.Show(loVHRParams);
        },

        callF4AprBy: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Created By",
                key: "CreatedByID",
                descriptionKey: "{Mcod1}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "User",
                    template: "CreatedByID",
                    demandPopin: false
                }, {
                    label: "First Name",
                    template: "NameFirst",
                    demandPopin: false
                }, {
                    label: "Last Name",
                    template: "NameLast",
                    demandPopin: false
                }, {
                    label: "Complete Name",
                    template: "NameTextc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4CreateBy
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "CreatedByID",
                    label: "User (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameFirst",
                    label: "First Name (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameLast",
                    label: "Last Name (*)",
                    control: new sap.m.Input()
                }, {
                    groupTitle: "",
                    groupName: "group1",
                    name: "NameTextc",
                    label: "Complete Name (*)",
                    control: new sap.m.Input()
                }]
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4AprDate: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var lvToken = pBasicTokens;
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: lvToken,
                title: "Approve No.",
                key: "AprNo_S",
                descriptionKey: "{AprNo_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "AprNo_S",
                    label: "Approve No."
                }],
                fullOperationKey: true,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [],
                filterMode: false,
                filterGroupItems: []
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
            // LocalUtilities.ValueHelpDialog.Show(loVHRParams);
        },

        callF4InvoiceNo: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: pBasicTokens,
                title: "Invoice No.",
                key: "InvoiceNo_S",
                descriptionKey: "{InvoiceNo_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "InvoiceNo_S",
                    label: "Invoice No."
                }],
                fullOperationKey: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4OA: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: pBasicTokens,
                title: "OA No.",
                key: "OA_S",
                descriptionKey: "{OA_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "OA_S",
                    label: "OA No."
                }],
                fullOperationKey: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4PO: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicTokens: pBasicTokens,
                title: "PO No.",
                key: "PO_S",
                descriptionKey: "{PO_S}",
                supportMultiselect: true,
                supportRanges: true,
                supportRangesOnly: true,
                rangesKeyFields: [{
                    key: "PO_S",
                    label: "PO No."
                }],
                fullOperationKey: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
            });

            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4CostCenter: function (sCompCode, pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {


            // var lsCompCode = sCompCode;

            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Cost Center",
                key: "CostCenter",
                descriptionKey: "{CostCenter}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [
                    {
                        label: "Comp Code",
                        template: "Bukrs",
                        demandPopin: false
                    }, {
                        label: "CostCenter",
                        template: "CostCenter",
                        demandPopin: false
                    }, {
                        label: "Description",
                        template: "Mctxt",
                        demandPopin: false
                    }
                ],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4CostCenter,
                    // filters: [new sap.ui.model.Filter("Bukrs", "EQ", lsCompCode)]

                },
                filterMode: false,
                filterGroupItems: [

                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "Bukrs",
                        label: "Comp Code (A*)",
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.StartsWith
                    },
                    {
                        groupTitle: "",
                        groupName: "group1",
                        name: "CostCenter",
                        label: "CostCenter (A*)",
                        control: new sap.m.Input(),
                        operation: sap.ui.model.FilterOperator.StartsWith
                    }

                ]
            });


            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        callF4WorkflowType: function (pControl, pBasicTokens, fnOk, fnCancel, fnAfterClose) {
            var mService = this.getServiceModel();
            var loVHRParams = $.extend(true, {}, this.getDefaultF4Param(), {
                basicSearchText: "",
                basicTokens: pBasicTokens,
                title: "Worklflow Type",
                key: "WFType",
                descriptionKey: "{WFTypeDesc}",
                supportMultiselect: true,
                supportRanges: false,
                callbackFunction: {
                    ok: fnOk,
                    cancel: fnCancel,
                    afterClose: fnAfterClose
                },
                columns: [{
                    label: "Workflow Type",
                    template: "WFType",
                    demandPopin: false
                }, {
                    label: "Workflow Type Description",
                    template: "WFTypeDesc",
                    demandPopin: false
                }],
                datas: {
                    odataModel: mService,
                    entitySet: this.getEntitySetName().F4WFType
                },
                filterMode: false,
                filterGroupItems: [{
                    groupTitle: "",
                    groupName: "group1",
                    name: "WFType",
                    label: "Workflow Type (A*)",
                    control: new sap.m.Input(),
                    operation: sap.ui.model.FilterOperator.EQ
                }]
            });


            var loVHDialog = new CommonVHDialog();
            loVHDialog.show(loVHRParams);
        },

        replaceTokenKey: function (pTokens, pReplaceKey) {
            if (!pTokens || !(pTokens instanceof Array)) return pTokens;
            var laDataSet = Utilities.DeserializeTokenListToDataSet(pTokens);
            laDataSet = this.replaceDataSetKey(laDataSet, pReplaceKey);
            return Utilities.SerializeDataSetToTokenList(laDataSet);
        },
        replaceDataSetKey: function (pDataSet, pReplaceKey) {
            if (!pDataSet || !(pDataSet instanceof Array)) return pDataSet;
            var laDataSet = [];
            for (var lvInd in pDataSet) {
                var loDataSet = $.extend(true, {}, pDataSet[lvInd]);

                loDataSet.key = pReplaceKey;
                loDataSet.value.keyField = pReplaceKey;

                laDataSet.push(loDataSet);
            }

            return laDataSet;
        }
    });

    return ValueHelpCollection;
});