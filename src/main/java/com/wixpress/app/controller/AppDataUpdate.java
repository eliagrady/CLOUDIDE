package com.wixpress.app.controller;

import com.wixpress.app.dao.AppData;

/**
 * A container class for the request body
 * @author Elia 27/04/2014
 */
public class AppDataUpdate {
    private String mode;
    private String compId;
    private AppData appData;

    public String getMode() { return mode; }

    public String getCompId() {
        return compId;
    }

    public void setCompId(String compId) {
        this.compId = compId;
    }

    public AppData getAppData() {
        return appData;
    }

    public void setAppData(AppData appData) {
        this.appData = appData;
    }
}
