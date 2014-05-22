package com.wixpress.app.model;

import javax.annotation.Nullable;

/**
 * Created by Elia on 18/05/2014.
 */
public class Project {
    public Code code;
    public String author;
    public String name;

    public Project(String projectName, @Nullable String author) {
        code = new Code();
        this.name = projectName;
        this.author = author;
    }
}
