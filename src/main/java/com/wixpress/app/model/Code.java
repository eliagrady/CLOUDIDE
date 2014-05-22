package com.wixpress.app.model;

import org.apache.commons.codec.binary.Base64;

import javax.annotation.Nullable;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

/**
 * Created by Elia on 17/05/2014.
 */
public class Code {
    public @Nullable String payload; //TODO should use byte[] ?

     public Code() {
         this.payload = "";
     }

    public static class Codec {
        private static void encode(String code) {
            //Encoding is done on client side.
        }
        public static String decode(String code) {
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
    public String getCode() {
        return Codec.decode(payload);
    }
}
