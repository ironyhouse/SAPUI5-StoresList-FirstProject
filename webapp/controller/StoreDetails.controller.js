sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Sorter",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    function (
        Controller,
        JSONModel,
        MessageToast,
        MessageBox,
        Sorter,
        Filter,
        FilterOperator
    ) {
        "use strict";

        // constants for sorting modes
        var SORT_NONE = "";
        var SORT_ASC = "ASC";
        var SORT_DESC = "DESC";

        return Controller.extend("sap.ui.SearchStores.controller.StoreDetails", {
            /**
             * Controller's "init" lifecycle method.
             */
            onInit: function () {
                // Register the view with the message manager
                sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);

                // Change product
                var oToggleChangeProduct = new JSONModel({
                    edit: false,
                    SearchInput: null
                });

                // model to store icon state
                var oIconStateModel = new JSONModel({
                    Name: SORT_NONE,
                    Price: SORT_NONE,
                    Specs: SORT_NONE,
                    SupplierInfo: SORT_NONE,
                    MadeIn: SORT_NONE,
                    ProductionCompanyName: SORT_NONE,
                    Rating: SORT_NONE
                });

                // Route
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter
                    .getRoute("details")
                    .attachPatternMatched(this._onObjectMatched, this);
                this.myRouter = oRouter;

                // Change product
                this.oToggleChangeProduct = oToggleChangeProduct;
                this.getView().setModel(oToggleChangeProduct, "oChangeProduct");
                // save view model to the controller's instance (for convenience)
                this.oIconStateModel = oIconStateModel;
                // set model to the view with name "appView"
                this.getView().setModel(oIconStateModel, "appView");
            },

            /**
             *  Bind context to the view.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            _onObjectMatched: function (oEvent) {
                var sStoreURL = oEvent.getParameter("arguments").storeId;

                this.getView().bindElement({
                    path: "/" + sStoreURL,
                    model: "odata",
                });

                // set filter "all" counter
                this._setFilterCounter(sStoreURL);

                this.oToggleChangeProduct.setProperty("/SearchInput", null);
            },

            /**
             *  This method navigates to store list.
             *
             */
            navBack: function () {
                this.myRouter.navTo("stores");
            },

            /**
             *  This method navigates to product details.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            navTo: function (oEvent) {
                var oSelectedListItem = oEvent.getSource();

                var productId = oSelectedListItem
                    .getBindingContext("odata")
                    .getPath()
                    .substr(1);

                this.myRouter.navTo("ProductDetails", { productId: productId });
            },

            /**
             * "Delete" product button press event handler.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDeleteProductPress: function (oEvent) {
                var oCtx = oEvent.getSource().getBindingContext("odata");
                var deleteProduct = this.onDeleteProduct.bind(this);
                var sProductMessageDelete = this.getView().getModel("i18n").getProperty("ProductMessageDelete")

                MessageBox.confirm(
                    sProductMessageDelete,
                    {
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                deleteProduct(oCtx);
                            }
                        },
                    }
                );
            },

            /**
             * Execute "delete" request of the product.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDeleteProduct: function (oCtx) {
                var oODataModel = oCtx.getModel();
                var sKey = oODataModel.createKey("/Products", oCtx.getObject());
                var sProductMessageDeleteSuccessful = this.getView().getModel("i18n").getProperty("ProductMessageDeleteSuccessful")
                var sProductMessageDeleteError = this.getView().getModel("i18n").getProperty("ProductMessageDeleteError")

                oODataModel.remove(sKey, {
                    success: function () {
                        MessageToast.show(sProductMessageDeleteSuccessful)
                    },
                    error: function () {
                        MessageBox.error(sProductMessageDeleteError);
                    }
                });
            },

            /**
             * "Delete" Store button press event handler.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDeleteStorePress: function (oEvent) {
                var oCtx = oEvent.getSource().getBindingContext("odata");
                var deleteStore = this.onDeleteStore.bind(this);
                var sStoreMessageDelete = this.getView().getModel("i18n").getProperty("StoreMessageDelete")

                MessageBox.confirm(
                    sStoreMessageDelete,
                    {
                        onClose: function (oAction) {
                            if (oAction === "OK") {
                                deleteStore(oCtx);
                            }
                        },
                    }
                );
            },

            /**
             * Execute "delete" request of the store.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onDeleteStore: function (oCtx) {
                var oODataModel = oCtx.getModel();
                var sKey = oODataModel.createKey("/Stores", oCtx.getObject());
                var sStoreMessageDeleteSuccessful = this.getView().getModel("i18n").getProperty("StoreMessageDeleteSuccessful")
                var sStoreMessageDeleteError = this.getView().getModel("i18n").getProperty("StoreMessageDeleteError")

                // execute "delete" request of the entity, specified in a key
                oODataModel.remove(sKey, {
                    success: function () {
                        MessageToast.show(sStoreMessageDeleteSuccessful)
                    },
                    error: function () {
                        MessageBox.error(sStoreMessageDeleteError);
                    }
                });

                this.myRouter.navTo("stores");
            },

            /**
             * "Open Product Form" button press event handler.
             */
            onOpenProductFormCreator: function (oEvent) {
                var oView = this.getView();
                var oODataModel = oView.getModel("odata");
                // Get store id
                var nStoreId = oEvent.getSource().getBindingContext("odata").getObject("id");

                if (!this.oDialog) {
                    this.oDialog = sap.ui.xmlfragment(
                        oView.getId(),
                        "sap.ui.SearchStores.view.fragments.Product-creator-form",
                        this
                    );

                    oView.addDependent(this.oDialog);
                }
                // call "createEntry" method to
                // 1. create a context based on the entity type
                // 2. add the "create" request to the request queue
                var oEntryCtx = oODataModel.createEntry("/Products", {
                    properties: {
                        Status: "OK",
                        StoreId: nStoreId
                    }
                });
                // set context to the dialog
                this.oDialog.setBindingContext(oEntryCtx);
                // set default model to allow relative binding without a need to specify model's name
                this.oDialog.setModel(oODataModel);
                // open the dialog
                this.oDialog.open();
            },

            /**
             *  This method create a product.
             */
            onDialogCreateProductPress: function () {
                var oODataModel = this.getView().getModel("odata");

                // call the method to "release" the changes from queue
                oODataModel.submitChanges();

                var oCtx = this.oDialog.getBindingContext();
                // delete the entry from requests queue
                oODataModel.deleteCreatedEntry(oCtx);

                // Close product form
                this.oDialog.close();
            },

            /**
             * "Cancel" button press event handler (in the dialog).
             */
            onCancelCreateProductPress: function () {
                var oODataModel = this.getView().getModel("odata");

                var oCtx = this.oDialog.getBindingContext();

                // delete the entry from requests queue
                oODataModel.deleteCreatedEntry(oCtx);

                this.oDialog.close();
            },

            /**
             * Edit button press event handler.
             */
            onEditChangesPress: function () {
                this.oToggleChangeProduct.setProperty("/edit", true);
            },

            /**
             * Save button press event handler.
             */
            onSaveChangesPress: function () {
                this.oToggleChangeProduct.setProperty("/edit", false);
                var oODataModel = this.getView().getModel("odata");

                // call the method to release the request queue
                oODataModel.submitChanges();
            },

            /**
             * Cancel button press event handler.
             */
            onCancelChangesPress: function () {
                this.oToggleChangeProduct.setProperty("/edit", false);
                var oODataModel = this.getView().getModel("odata");

                // call the method to reset the request queue
                oODataModel.resetChanges();
            },

            /**
             * "Search" event handler of the "SearchField".
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            onProductSearch: function (oEvent) {
                var oProductsTable = this.byId("ProductsTable");
                var oItemsBinding = oProductsTable.getBinding("items");
                var sQuery = oEvent.getParameter("query");

                var aFilter = new Filter({
                    filters: [
                        new Filter("Name", FilterOperator.Contains, sQuery),
                        new Filter("Specs", FilterOperator.Contains, sQuery),
                        new Filter("SupplierInfo", FilterOperator.Contains, sQuery),
                        new Filter("ProductionCompanyName", FilterOperator.Contains, sQuery),
                        new Filter("MadeIn", FilterOperator.Contains, sQuery),
                        // for checking on other db
                        // new Filter("Price", FilterOperator.EQ, sQuery),
                        // new Filter("Rating", FilterOperator.EQ, sQuery)
                    ],
                    and: false
                });

                // execute filtering (passing the filter object)
                oItemsBinding.filter(aFilter);
            },


            /**
             * "Filter" button press event handler.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onFilterSelect: function (oEvent) {
                var oProductsTable = this.byId("ProductsTable");
                var oItemsBinding = oProductsTable.getBinding("items");
                var sKey = oEvent.getParameter("key");

                if (sKey === "OK") {
                    var aFilter = new Filter({
                        filters: [
                            new Filter("Status", FilterOperator.Contains, "OK"),
                        ],
                        and: false
                    });
                }
                if (sKey === "STORAGE") {
                    var aFilter = new Filter({
                        filters: [
                            new Filter("Status", FilterOperator.Contains, "STORAGE"),
                        ],
                        and: false
                    });
                }
                if (sKey === "OUT_OF_STOCK") {
                    var aFilter = new Filter({
                        filters: [
                            new Filter("Status", FilterOperator.Contains, "OUT_OF_STOCK"),
                        ],
                        and: false
                    });
                }

                // execute filtering (passing the filter object)
                oItemsBinding.filter(aFilter);
            },

            /**
             * "Sort" button press event handler.
             *
             * @param {sap.ui.base.Event} oEvent event object
             */
            onSortButtonPress: function (oEvent) {
                // get products table control
                var oProductsTable = this.byId("ProductsTable");
                // get the "items" binding object from the products table
                var oItemsBinding = oProductsTable.getBinding("items");
                // get sorting parameter
                var sParam = oEvent
                    .getSource()
                    .getCustomData()[0]
                    .getValue();
                // get current sorting type
                var sSortType = this.oIconStateModel.getProperty("/" + sParam);

                // if Sort Type ==== ""
                if (sSortType === SORT_DESC) {
                    oItemsBinding.sort(undefined);
                    this.oIconStateModel.setProperty("/" + sParam, SORT_NONE);
                    return;
                }

                //clear selection of sorting products
                if (sSortType === SORT_NONE) {
                    var oTableSortType = this.oIconStateModel;
                    Object.keys(this.oIconStateModel.getProperty("/")).forEach(
                        function (sTableKey) {
                            if (sTableKey !== sParam) {
                                oTableSortType.setProperty(
                                    "/" + sTableKey,
                                    SORT_NONE
                                );
                            }
                        }
                    );
                }

                // switch sorting type
                sSortType = this._switchSortType(sSortType);

                // update the models' property with new sorting type
                this.oIconStateModel.setProperty("/" + sParam, sSortType);

                // create sorter object
                var bSortDesc = sSortType === SORT_DESC;

                var oSorter = new Sorter(sParam, bSortDesc);
                // perform sorting
                oItemsBinding.sort(oSorter);
            },


            /**
            * Toggles the sort type.
            *
            * @param {string} sSortType sorting type.
            *
            * @returns {string} sorting type.
            */
            _switchSortType: function (sSortType) {
                // switch sorting type
                switch (sSortType) {
                    case SORT_NONE: {
                        sSortType = SORT_ASC;
                        break;
                    }

                    case SORT_ASC: {
                        sSortType = SORT_DESC;
                        break;
                    }

                    case SORT_DESC: {
                        sSortType = SORT_NONE;
                        break;
                    }
                }
                return sSortType;
            },

            /**
             * Formatter for the icon used in a sort trigger button.
             *
             * @param {string} sSortType sorting type.
             *
             * @returns {string} icon name.
             */
            sortTypeFormatter: function (sSortType) {
                switch (sSortType) {
                    case SORT_NONE: {
                        return "sort";
                    }
                    case SORT_ASC: {
                        return "sort-ascending";
                    }
                    case SORT_DESC: {
                        return "sort-descending";
                    }
                    default: {
                        return "sort";
                    }
                }
            },

            /**
             * Update product counter.
             */
            onAfterRendering: function () {
                var oProductsTable = this.byId("ProductsTable");
                var oTableItemsBinding = oProductsTable.getBinding("items");
                // get number products
                var oNumberProducts = this.byId("numberProducts");

                // set number products
                oTableItemsBinding.attachDataReceived(function () {
                    var nProductAll = oTableItemsBinding.iLength;

                    oNumberProducts.setText("(" + nProductAll + ")");
                })
            },

            /**
             *  Set filter counters.
             *
             * @param {string} sStoreURL store path.
             */
            _setFilterCounter: function (sStoreURL) {
                var oODataModel = this.getView().getModel("odata");
                var oProductsTable = this.byId("ProductsTable");
                var oItemsBinding = oProductsTable.getBinding("items");
                var oFilterAll = this.byId("FilterAll"),
                    oFilterOk = this.byId("FilterOk"),
                    oFilterStorage = this.byId("FilterStorage"),
                    nFilterOut = this.byId("FilterOut");

                oODataModel.read(
                    "/" + sStoreURL + "/rel_Products/$count",
                    {
                        success: function (oData) {
                            oFilterAll.setCount(oData);
                        },
                        error: function (error) {
                            MessageBox.error(error);
                        }
                    }
                );

                oItemsBinding.attachDataReceived( () => {
                    var nProductOK = 0,
                        nProductStorage = 0,
                        nProductOut = 0;

                    // count the number of stores
                    oItemsBinding.aLastContextData.forEach((item) => {
                        if(item.indexOf('"Status":"OK"') !== -1) {
                            nProductOK++
                        };
                        if(item.indexOf('"Status":"STORAGE"') !== -1) {
                            nProductStorage++
                        };
                        if(item.indexOf('"Status":"OUT_OF_STOCK"') !== -1) {
                            nProductOut++
                        };
                    });

                    // set the number of stores
                    oFilterOk.setCount(nProductOK);
                    oFilterStorage.setCount(nProductStorage);
                    nFilterOut.setCount(nProductOut);
                });
            },
        });
    });