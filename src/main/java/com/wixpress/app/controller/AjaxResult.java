package com.wixpress.app.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import javax.annotation.Nullable;

/**
 * General result object for Ajax operations
 */

public class AjaxResult
{
    private boolean isOk;
    private @Nullable String error;
    private @Nullable String stackTrace;
    private @Nullable String retData;

    public AjaxResult(boolean isOk) {
        this.isOk = isOk;
        this.error = getError();
        this.stackTrace = getStackTrace();
        this.retData = getRetData();
    }

    public AjaxResult(boolean ok, String error, String stackTrace) {
        this.isOk = ok;
        this.error = error;
        this.stackTrace = stackTrace;
        this.retData = getRetData();
    }

    public AjaxResult(boolean ok, String data) {
        this.isOk = ok;
        this.retData = data;
    }

    public boolean isOk() {
        return isOk;
    }

    public void setOk(boolean ok) {
        isOk = ok;
    }

    public @Nullable String getError() {
        return error;
    }

    public void setError(@Nullable String error) {
        this.error = error;
    }

    public @Nullable String getStackTrace() {
        return stackTrace;
    }

    public void setStackTrace(@Nullable String stackTrace) {
        this.stackTrace = stackTrace;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("AjaxResult");
        sb.append("{isOk=").append(isOk);
        sb.append('}');
        return sb.toString();
    }

    public static ResponseEntity<AjaxResult> ok() {
        return new ResponseEntity<AjaxResult>(new AjaxResult(true), HttpStatus.OK);
    }

    public static ResponseEntity<AjaxResult> res(String data) {
        return new ResponseEntity<AjaxResult>(new AjaxResult(true,data),HttpStatus.OK);
    }

    public static ResponseEntity<AjaxResult> internalServerError(Exception e) {
        StringBuilder stackTrace = new StringBuilder();
        renderStackTrace(e, stackTrace);
        return new ResponseEntity<AjaxResult>(new AjaxResult(false, e.getMessage(), stackTrace.toString()), HttpStatus.INTERNAL_SERVER_ERROR); //TODO check HTTP status on client to retry
    }

    public static ResponseEntity<AjaxResult> entityLookupError(Exception e) {
        StringBuilder stackTrace = new StringBuilder();
        renderStackTrace(e, stackTrace);
        return new ResponseEntity<AjaxResult>(new AjaxResult(false, e.getMessage(), stackTrace.toString()), HttpStatus.NOT_FOUND); //TODO check HTTP status on client to retry
    }

    public static void renderStackTrace(Throwable e, StringBuilder stackTrace) {
        for (StackTraceElement stackTraceElement: e.getStackTrace()) {
            stackTrace.append(stackTraceElement.toString()).append("\n");
        }
        if (e.getCause() != null && e.getCause() != e) {
            stackTrace.append("caused by ").append(e.getCause().getClass()).append(" - ").append(e.getCause().getMessage()).append("\n");
            renderStackTrace(e.getCause(), stackTrace);
        }
    }

    @Nullable
    public String getRetData() {
        return retData;
    }

    public static ResponseEntity<AjaxResult> notOk() {
//        StringBuilder stackTrace = new StringBuilder();
//        renderStackTrace(e, stackTrace);
        return new ResponseEntity<AjaxResult>(new AjaxResult(false), HttpStatus.OK);
    }
}