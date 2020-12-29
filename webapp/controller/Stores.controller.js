sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function (
        Controller,
        Filter,
        FilterOperator
    ) {
        "use strict";
        return Controller.extend("sap.ui.SearchStores.controller.Stores", {
            /**
             * Controller's "init" lifecycle method.
             */
            onInit: function () {
                // Register the view with the message manager
                sap.ui
                    .getCore()
                    .getMessageManager()
                    .registerObject(this.getView(), true);
            },

            /**
             *  This method navigates to store details.
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            onPressListItem: function (oEvent) {
                var oSelectedListItem = oEvent.getSource();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oCtx = oSelectedListItem
                    .getBindingContext("odata")
                    .getPath()
                    .substr(1);

                var storeId = window.encodeURIComponent(oCtx);

                oRouter.navTo("details", { storeId: storeId });
            },

            /**
             * "Search" event handler of the "SearchField".
             *
             * @param {sap.ui.base.Event} oEvent event object.
             */
            onStoreSearch: function (oEvent) {
                var oStoresList = this.byId("StoreList");
                var oItemsBinding = oStoresList.getBinding("items");
                var sQuery = oEvent.getParameter("query");

                var aFilter = new Filter({
                    filters: [
                        new Filter("Name", FilterOperator.Contains, sQuery),
                        new Filter("Address", FilterOperator.Contains, sQuery),
                        // for checking on other db
                        // new Filter("FloorArea", FilterOperator.EQ, sQuery)
                    ],
                    and: false
                });

                // execute filtering (passing the filter object)
                oItemsBinding.filter(aFilter);
            },

            /**
             * "Open Store Form" button press event handler.
             */
            onOpenStoreFormCreator: function () {
                var oView = this.getView();
                var oODataModel = oView.getModel("odata");

                if (!this.oDialog) {
                    this.oDialog = sap.ui.xmlfragment(
                        oView.getId(),
                        "sap.ui.SearchStores.view.fragments.Store-creator-form",
                        this
                    );

                    oView.addDependent(this.oDialog);
                }

                // call "createEntry" method to
                // 1. create a context based on the entity type
                // 2. add the "create" request to the request queue
                var oEntryCtx = oODataModel.createEntry("/Stores", {
                    properties: {
                        // Established: new Date,
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
             *  This method create a store
             */
            onDialogCreateStorePress: function () {
                var oODataModel = this.getView().getModel("odata");

                // call the method to "release" the changes from queue
                oODataModel.submitChanges();

                var oCtx = this.oDialog.getBindingContext();
                // delete the entry from requests queue
                oODataModel.deleteCreatedEntry(oCtx);

                this.oDialog.close();
            },

            /**
             * "Cancel" button press event handler (in the dialog).
             */
            onCancelCreateStorePress: function () {
                this.oDialog.close();
            },
        });
    }
);
