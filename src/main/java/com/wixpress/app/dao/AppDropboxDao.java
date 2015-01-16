//package com.wixpress.app.dao;
//
//import com.dropbox.core.*;
//import java.io.*;
//import java.util.Locale;
//
///**
// * Created by Elia on 09/11/2014.
// */
//public class AppDropboxDao {
//
//
//    // Get your app key and secret from the Dropbox developers website.
//    final String APP_KEY = "k7zutaeosmdloqz";
//    final String APP_SECRET = "z92jl4zleythz6n";
//
//    DbxAppInfo appInfo = new DbxAppInfo(APP_KEY, APP_SECRET);
//
//    DbxRequestConfig config = new DbxRequestConfig(
//            "JavaTutorial/1.0", Locale.getDefault().toString());
//    DbxWebAuthNoRedirect webAuth = new DbxWebAuthNoRedirect(config, appInfo);
//
//
//    // Have the user sign in and authorize your app.
//    String authorizeUrl = webAuth.start();
//    System.out.println("1. Go to: " + authorizeUrl);
//    System.out.println("2. Click \"Allow\" (you might have to log in first)");
//    System.out.println("3. Copy the authorization code.");
//    String code = new BufferedReader(new InputStreamReader(System.in)).readLine().trim();
///*
//With the authorization URL in hand, we can now ask the user to authorize your app.
//To avoid the hassle of setting up a web server in this tutorial,
//we're just printing the URL and asking the user to press the Enter key to confirm that they've authorized your app.
// However, in real-world apps, you'll want to automatically send the user to the authorization URL and pass in
// a callback URL so that the user is seamlessly redirected back to your app after pressing a button.
// */
//    DbxAuthFinish authFinish = webAuth.finish(code);
//    String accessToken = authFinish.accessToken;
//    /*
//    The access token is all you'll need to make API requests on behalf of this user,
//     so you should store it away for safe-keeping (even though we don't for this tutorial).
//     By storing the access token, you won't need to go through these steps again
//      unless the user reinstalls your app or revokes access via the Dropbox website.
//     */
//
//    DbxClient client = new DbxClient(config, accessToken);
//    System.out.println("Linked account: " + client.getAccountInfo().displayName);
//}
