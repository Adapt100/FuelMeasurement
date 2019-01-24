sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/iot/elements/IoTEventsOnChartElement"
], function (Controller, IoTEventsOnChart) {
	"use strict";
	return Controller.extend("Vivo.controller.AnalysisPage", {

		onInit: function () {
			this.bRenderChart = true;
			this.bNavMp = false;
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("analysispage").attachMatched(this._onRouteMatched, this);
			var oModel = new sap.ui.model.json.JSONModel();
			this.byId("idChart").setModel(oModel, "chartModel");
		},

		_onRouteMatched: function (oEvent) {
			//Close the Busy Indicator and retrieve the arguments passed while routing
			sap.ui.getCore().byId("idBusy").close();
			this.sThingId = oEvent.getParameter("arguments").thingId;
			var sHeaderTitle = oEvent.getParameter("arguments").headerTitle;
			var sSubHeaderTitle = oEvent.getParameter("arguments").subHeaderTitle;
			this.bNavMp = false;
			var oChart = this.byId("idChart");
			oChart.setHeaderTitle(sHeaderTitle);
			oChart.setSubheaderTitle(sSubHeaderTitle);
			var sNavFrom = oEvent.getParameter("arguments").navFrom;
			this.eventsContext = sap.ui.getCore().getModel("eventsModel") && sap.ui.getCore().getModel("eventsModel").getData().eventsData;
			if (sNavFrom === "events" && this.eventsContext) {
				oChart.bNavFromEventList = true;
				oChart.bNavFromMeasuredValue = false;
				this._renderEventsOnChart(oChart, this.eventsContext);
			} else if (sNavFrom === "measuredValues") {
				this.bNavMp = true;
				oChart.setHeaderTitle("");
				oChart.setSubheaderTitle("");
				this.aPath = oEvent.getParameter("arguments").mpPath.split(".");
				oChart.addDefaultPST(this.aPath[0], this.aPath[1]);
				oChart.bChartInit = true;
				oChart.bReload = false;
				oChart.bNavFromMeasuredValue = true;
				oChart.bNavFromEventList = false;
				this._renderChart(oChart, this.sThingId);
			} else {
				oChart.bNavFromMeasuredValue = false;
				oChart.bNavFromEventList = false;
				this._renderChart(oChart, this.sThingId);
			}
		},

		/** Render the events on Chart with the respective Measuring Point as the default PST **/
		_renderEventsOnChart: function (oChart, eventsContext) {
			oChart.setEventsVisible(true);
			var eventsArr = [];
			if (eventsContext && eventsContext.getPath) {
				var oData = eventsContext.getModel().getProperty(eventsContext.getPath()); //Set this to the this context so that it can be accessible everywhere
				eventsArr.push(oData);
				oChart.getModel("chartModel").setData(eventsArr);
				var aMPPath = oData.Property.split("/");
				oChart.addDefaultPST(aMPPath[1], aMPPath[2]);
				var oTemplate = new IoTEventsOnChart({
					businessTimeStamp: "{chartModel>BusinessTimestamp}",
					severity: "{chartModel>Severity}",
					eventId: "{chartModel>EventId}",
					eventDescription: "{chartModel>Description}",
					eventProperty: "{chartModel>Property}",
					eventStatus: "{chartModel>Status}"
				});
				oChart.bindAggregation("events", "chartModel>/", oTemplate);
			}
			if (!this.bRenderChart) {
				oChart.setAssetId(this.sThingId);
			}

		},

		_renderChart: function (oChart, sThingId) {
			// Workaround as of now because onAfterRendering does not get called for the second time
			if (!this.bRenderChart) {
				oChart.setEventsVisible(false);
				oChart.setAssetId(sThingId);
			}
		},

		onAfterRendering: function () {
			if (this.bRenderChart) {
				var oChart = this.byId("idChart");
				this.bRenderChart = false;
				if (this.eventsContext) {
					oChart.setEventsVisible(true);
				} else {
					oChart.setEventsVisible(false);
				}
				oChart.setAssetId(this.sThingId);
			}
		},
		
		_onDipReadings: function() {
			//alert("load Dip Readings app");	
			window.location.replace("https://webidetesting3166535-e11413268.dispatcher.eu2.hana.ondemand.com/test-resources/sap/ushell/shells/sandbox/fioriSandbox.html?hc_orionpath=%2FDI_webide_di_workspacetbyyamdgpjn4eypq%2FDipReadings&neo-di-affinity=BIGipServerdisapwebide.eu2.hana.ondemand.com+%21EPnem41lp74mU3btuWrYiXgVZCiDIjnsx%2B7YG21JbXHl43tF4Cv9nc2g7Pze651rcekVCvlfw0jEFrU%3D&sap-ui-xx-componentPreload=off&sap-ui-appCacheBuster=..%2F..%2F..%2F..%2F..%2F&sap-ushell-test-url-url=..%2F..%2F..%2F..%2F..%2Fwebapp&sap-ushell-test-url-additionalInformation=SAPUI5.Component%3Dcom.sap.build.e11413268-eu_2.dipReadings#Test-url");
		},

		handleNavBackPress: function () {
			window.history.back();
			if (this.getOwnerComponent().isTimedOut) {
				this.getOwnerComponent().showTimeoutMessage();
			}
		}
	});
});