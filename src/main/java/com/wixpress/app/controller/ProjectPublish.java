package com.wixpress.app.controller;

/**
 * A container class for the request body
 */
public class ProjectPublish {

    private String instanceId;
    private String compId;
    private String projectId;
    private String mode; //Request mode

    public String getCompId() {
        return this.compId;
    }

    public void setCompId(String compId) {
        this.compId = compId;
    }

    public String getMode() {
        return this.mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(String instanceId) {
        this.instanceId = instanceId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
