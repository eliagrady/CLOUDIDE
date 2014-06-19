package com.wixpress.app.controller;

import com.wixpress.app.dao.AppProject;
import com.wixpress.app.dao.AppSettings;
import org.codehaus.jackson.JsonNode;

import javax.annotation.Nullable;

/**
 * A container class for the request body for updating a project
 */
public class ProjectUpdate {

    private String userId;
    private @Nullable String instanceId;
    private @Nullable String compId;
    private @Nullable String projectId;
    private @Nullable AppSettings settings;
    private @Nullable AppProject project;
    private @Nullable JsonNode projects;
    private String mode; //Request mode

    public ProjectUpdate() {};

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

    @Nullable
    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(@Nullable String projectId) {
        this.projectId = projectId;
    }

    @Nullable
    public String getCompId() {
        return compId;
    }

    public void setCompId(@Nullable String compId) {
        this.compId = compId;
    }

    @Nullable
    public String getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(@Nullable String instanceId) {
        this.instanceId = instanceId;
    }

    @Nullable
    public AppSettings getSettings() {
        return settings;
    }

    public void setSettings(@Nullable AppSettings settings) {
        this.settings = settings;
    }

    @Nullable
    public JsonNode getProjects() {
        return projects;
    }

    public void setProjects(@Nullable JsonNode projects) {
        this.projects = projects;
    }
}
