package com.wixpress.app.model;

import com.wixpress.app.dao.DataContainer;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Created by Elia on 17/05/2014.
 */
public class CloudIde implements DataContainer {
    private Map<String,Project> projects;

    private CloudIde() {
        projects = new ConcurrentHashMap<String, Project>();
    }

    public CloudIde createCloudIde() {
        CloudIde cld = new CloudIde();
        return cld;
    }
}
