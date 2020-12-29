sap.ui.define(["sap/ui/core/ComponentContainer"], function (
    ComponentContainer
) {
    "use strict";

    new ComponentContainer({
        name: "sap.ui.SearchStores",
        settings: {
            id: "SearchStores",
        },
        async: true,
    }).placeAt("content");
});
