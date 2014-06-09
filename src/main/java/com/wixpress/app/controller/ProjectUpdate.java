package com.wixpress.app.controller;

import com.wixpress.app.dao.AppProject;

/**
 * A container class for the request body
 */
public class ProjectUpdate {

    private String userId;
    private AppProject project;
    private String mode; //Request mode

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public AppProject getProject() {
        return this.project;
    }

    public void setProject(AppProject project) {
        this.project = project;
    }

    public String getMode() {
        return this.mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }
}
