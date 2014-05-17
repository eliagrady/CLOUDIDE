package com.wixpress.app.dao;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.annotate.JsonTypeName;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;

/**
 * Created by : doron
 * Since: 7/1/12
 * Edited by: Elia
 * Since: 20/3/14
 */

@JsonTypeName("AppSettings")
public class AppSettings implements DataContainer {

    private @Nullable String title;
    private @Nullable JsonNode appSettings;
    private @Nullable JsonNode appData;


    public AppSettings() {}

    public AppSettings(ObjectMapper objectMapper) {
        appSettings = objectMapper.createObjectNode();
    }

    public <T> T nvl(T value, T fallback) {
        return (value != null)?value:fallback;
    }

    @Nullable
    public JsonNode getAppSettings() {
        return appSettings;
    }

    public void setAppSettings(@Nullable JsonNode appSettings) {
        this.appSettings = appSettings;
    }


    @Nullable
    public JsonNode getAppData() {
        return appData;
    }

    public void setAppData(@Nullable JsonNode appData) {
        this.appData = appData;
    }


    @Nullable
    public String getTitle() {
        return title;
    }

    public void setTitle(@Nullable String title) {
        this.title = title;
    }


}
