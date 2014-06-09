package com.wixpress.app.dao;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.annotate.JsonTypeName;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;

/**
 * Created by Elia on 18/05/2014.
 */
@JsonTypeName("AppProject")
public class AppProject implements DataContainer {
    public String projectId;
    public @Nullable
    JsonNode code;

    public AppProject() {}

    public AppProject(ObjectMapper objectMapper) {
        code = objectMapper.createObjectNode();
    }

    public <T> T nvl(T value, T fallback) {
        return (value != null)?value:fallback;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    @Nullable
    public JsonNode getCode() {
        return code;
    }

    public void setCode(@Nullable JsonNode code) {
        this.code = code;
    }
}