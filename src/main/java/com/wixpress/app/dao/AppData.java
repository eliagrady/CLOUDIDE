package com.wixpress.app.dao;

import org.codehaus.jackson.annotate.JsonTypeName;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;
/**
 * App data container
 @author Elia
 */

@JsonTypeName("AppData")
public class AppData implements DataContainer {
    private @Nullable String encodedText; //Base64
    //private @Nullable JsonNode document;

    public AppData() {}

    public AppData(ObjectMapper objectMapper) {
        //document = objectMapper.createObjectNode();
    }

    public <T> T nvl(T value, T fallback) {
        return (value != null)?value:fallback;
    }

    @Nullable
    public String getEncodedText() {
        return encodedText;
    }

    public void setEncodedText(@Nullable String encodedText) {
        this.encodedText = encodedText;
    }
//
//    @Nullable
//    public JsonNode getDocument() {
//        return document;
//    }
//
//    public void setDocument(@Nullable JsonNode document) {
//        this.document = document;
//    }
}
