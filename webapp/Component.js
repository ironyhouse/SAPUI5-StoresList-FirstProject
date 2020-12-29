sap.ui.define(
    [
        "sap/ui/core/UIComponent",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/model/odata/v2/ODataModel",
    ],
    function (UIComponent, ResourceModel, ODataModel) {
        "use strict";
        return UIComponent.extend("sap.ui.SearchStores.Component", {
            metadata: {
                manifest: "json",
            },
            /**
             * Controller's "init" lifecycle method.
             */
            init: function () {
                UIComponent.prototype.init.apply(this, arguments);

                this.getRouter().initialize();
            },
        });
    }
);
