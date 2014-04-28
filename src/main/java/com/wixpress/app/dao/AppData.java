package com.wixpress.app.dao;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.annotate.JsonTypeName;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;
/**
 * App data container
 @author Elia
 */

@JsonTypeName("AppData")
public class AppData implements DataContainer {

    private @Nullable String command;
    private @Nullable JsonNode appData;
    private @Nullable JsonNode document;

    public AppData() {}

    public AppData(ObjectMapper objectMapper) {
        appData = objectMapper.createObjectNode();
        //document = objectMapper.createObjectNode();
    }

    public <T> T nvl(T value, T fallback) {
        return (value != null)?value:fallback;
    }

    @Nullable
    public JsonNode getAppData() {
        return appData;
    }

    public void setAppData(@Nullable JsonNode appData) {
        this.appData = appData;
    }

    @Nullable
    public String getCommand() {
        return command;
    }

    public void setCommand(@Nullable String command) {
        this.command = command;
    }

    @Nullable
    public JsonNode getDocument() {
        return document;
    }

    public void setDocument(@Nullable JsonNode document) {
        this.document = document;
    }
}
