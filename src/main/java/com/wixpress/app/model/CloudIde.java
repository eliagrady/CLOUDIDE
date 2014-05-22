package com.wixpress.app.model;

import com.wixpress.app.dao.DataContainer;
import org.codehaus.jackson.map.ObjectMapper;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by Elia on 17/05/2014.
 */
public class CloudIde implements DataContainer {
    public Map<String, Project> projects;
    public ArrayList<Project> projectsList;

    public Map<String, Project> getProjects() {
        return projects;
    }

    public ArrayList<Project> getProjectsList() {
        return projectsList;
    }

    public CloudIde(ObjectMapper objectMapper) {
        projects = new ConcurrentHashMap<String, Project>();
        projectsList = new ArrayList<Project>();
        //Created with default project
        Project prj = new Project("Default","Elia");
        projects.put("Default",prj); //TODO change author name
        projectsList.add(prj);
        objectMapper.writerWithType(objectMapper.constructType(CloudIde.class));
    }

    public Project getProjectById(String projectId) {
        return projects.get(projectId);
    }
}
