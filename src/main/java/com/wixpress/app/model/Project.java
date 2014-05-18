package com.wixpress.app.model;

/**
 * Created by Elia on 18/05/2014.
 */
public class Project {
    private Code code;
    private String author;
    private String name;

    private Project() {
        code = new Code();
        author = "";
    }

    public Project CreateNewProject(String projectName) {
        Project prj = new Project();
        prj.name = projectName;
        return prj;
    }
}
