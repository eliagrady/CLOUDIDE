package com.wixpress.app.model;

import com.google.appengine.repackaged.com.google.api.client.util.Base64;

import javax.annotation.Nullable;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * Created by Elia on 17/05/2014.
 */
public class Code {
    private @Nullable String payload; //TODO should use byte[] ?

     public Code() {
         this.payload = "";
     }

    private static class Codec {
        private static void encode(String code) {
            //Encoding is done on client side.
        }
        private static String decode(String code) {
            String s = null;
            try {
                byte[] encoded = Base64.decodeBase64(code);
                s = new String(encoded);
                s = URLDecoder.decode(s, "UTF_8");
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
            return s;
        }


    }
    private String getCode() {
        return Codec.decode(payload);
    }
}
