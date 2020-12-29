sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/json/JSONModel"
    ],
    function (
        Controller,
        MessageToast,
        MessageBox,
        Filter,
        FilterOperator,
        JSONModel
    ) {
        "use strict";
        return Controller.extend(
            "sap.ui.SearchStores.controller.ProductDetails",
            {
                /**
                 * Controller's "init" lifecycle method.
                 */
                onInit: function () {
                    // Route
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter
                        .getRoute("ProductDetails")
                        .attachPatternMatched(this._onObjectMatched, this);
                    this.myRouter = oRouter;

                    // model to store icon state
                    var oCreateCommentModel = new JSONModel({
                        Author: null,
                        Rating: null,
                        Message: null
                    });

                    this.oCreateCommentModel = oCreateCommentModel;
                    this.getView().setModel(oCreateCommentModel, "oCreateComment");
                },

                /**
                 *  This method navigates to store details.
                 *
                 * @param {sap.ui.base.Event} oEvent event object.
                 */
                navBack: function (oEvent) {
                    var oSelectedListItem = oEvent.getSource();

                    var nStoreId = oSelectedListItem
                        .getBindingContext("odata").getObject("StoreId");

                    this.myRouter.navTo("details", { storeId: "Stores(" + nStoreId + ")" });
                },

                /**
                 *  This method navigates to store list.
                 *
                 */
                navStart: function () {
                    this.myRouter.navTo("stores");
                },

                /**
                 *  This method creates new comment.
                 *
                 * @param {sap.ui.base.Event} oEvent event object.
                 */
                onPostPress: function (oEvent) {
                    var oDataModel = this.getView().getModel("odata");
                    // Comments
                    var sCommentAuthor = this.byId("commentAuthor").getValue();
                    var nCommentRating = this.byId("commentRating").getValue();
                    var sCommentText = oEvent.getParameter("value");
                    var sCommentMessageCreate = this.getView().getModel("i18n").getProperty("commentCreate")
                    var sCommentMessageError = this.getView().getModel("i18n").getProperty("commentError")

                    // Get store ID
                    var oSelectedListItem = oEvent.getSource();
                    var nStoreId = oSelectedListItem
                        .getBindingContext("odata").getObject("id");

                    var oNewComment = {
                        Author: sCommentAuthor,
                        Message: sCommentText,
                        Rating: nCommentRating,
                        Posted: new Date(),
                        ProductId: nStoreId
                    };

                    oDataModel.create("/ProductComments", oNewComment, {
                        success: function () {
                            MessageToast.show(
                                sCommentMessageCreate
                            );
                        },
                        error: function () {
                            MessageBox.error(sCommentMessageError);
                        },
                    });
                },

                /**
                 *  Bind context to the view.
                 *
                 * @param {sap.ui.base.Event} oEvent event object.
                 */
                _onObjectMatched: function (oEvent) {
                    // Product URL
                    var sProductId = oEvent.getParameter("arguments").productId;
                    // Product ID
                    var nProductId = parseInt(sProductId.match(/\d+/));

                    this.getView().bindElement({
                        path:
                            "/" +
                            decodeURIComponent(
                                sProductId
                            ),
                        model: "odata",
                    });
                    this._onFilterComments(nProductId);
                    this._clearCommentsForm();
                },

                /**
                 *  This method filters comment.
                 *
                 * @param {string} nProductId product ID.
                 */
                _onFilterComments: function (nProductId) {
                    var oCommentsList = this.byId("CommentsList");
                    var oCommentItemsBinding = oCommentsList.getBinding("items");

                    var oFilter = new Filter("ProductId", FilterOperator.EQ, nProductId);

                    oCommentItemsBinding.filter(oFilter);
                },

                /**
                 *  This method clear comments form.
                 *
                 */
                _clearCommentsForm: function () {
                    var oCreateComment = this.oCreateCommentModel;

                    Object.keys(oCreateComment.getData()).forEach(key => {
                        oCreateComment.setProperty("/" + key, null);
                    });
                },

                /**
                 *  This method change background color product status.
                 *
                 * @param {string} nProductId product status.
                 *
                 * @returns {string} color name.
                 */
                changeStatusColor: function (status) {
                    switch (status) {
                        case "OK": {
                            return "Indication04";
                        }
                        case "STORAGE": {
                            return "Indication03";
                        }
                        case "OUT_OF_STOCK": {
                            return "Indication02";
                        }
                    }
                },
            }
        );
    }
);
