package com.wixpress.app.dao;

import com.google.appengine.api.datastore.*;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;
import javax.annotation.Resource;
import java.io.IOException;
import java.util.Date;

/**
 * The DB wrapper of the app, for Google App Engine Datastore - noSQL schema
 * It implements methods for getting and setting appProject in the DB as specified in the AppDao interface
 */

/*
 * TODO Add support for fetching from cache, utilizing the GAE memcache option:
 * https://developers.google.com/appengine/docs/java/memcache/
 */

public class AppGaeDao implements AppDao {

    protected final static String APP_INSTANCE = "CloudIdeAppInstance";
    protected final static String SETTINGS = "settings";
    protected final static String COMPID = "compId";
    protected final static String APP_PROJECT = "appProject";
    protected static final String CLOUDIDE = "cldInstance";
    protected static final String PROJECT = "project";
    protected static final String CODEJSON = "codeJson";
    protected static final String REVISION = "revision";
    protected static final String PROJECT_ID = "projectId";
    protected static final String MODIFIED = "modified";

    @Resource
    private ObjectMapper objectMapper;
    @Resource
    private DatastoreService dataStore;

    //Javascript
    //@Resource
    //private static ScriptEngine scriptEngine = (new ScriptEngineManager()).getEngineByName("JavaScript");

    /**
     * Save app settings in the DB
     * @param userId - the Wix userid (UUID)
     * @param appSettings - The settings of the app that configure the widget
     */
    public Boolean saveAppSettings(String userId, AppSettings appSettings) {
        return saveAppSettingsToDataStore(userId, SETTINGS, appSettings);
    }

    @Override
    public AppProject getAppProject(String instanceId, String compId) {
        if (instanceId == null || compId == null)
            return null;
        else {
            final Key key = KeyFactory.createKey(APP_INSTANCE, key(instanceId, compId));
            try {
//                final String prop = dataStore.get(key).getProperty(SETTINGS).toString();
//                return objectMapper.readValue(prop, AppSettings.class);
                final String projectid = (String) dataStore.get(key).getProperty(PROJECT_ID);
                final Key projectKey = KeyFactory.createKey(APP_INSTANCE, key(projectid));
                final Text object = (Text) dataStore.get(projectKey).getProperty(CODEJSON);
                final String asText = object.getValue();
                return objectMapper.readValue(asText, AppProject.class);
            } catch (EntityNotFoundException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppProject(objectMapper);
            } catch (IOException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppProject(objectMapper);
            }
        }
    }

    @Override
    public Boolean saveAppProject(String projectId, String userId, AppProject appProject) {
        return saveAppProjectToDataStore(projectId, userId, appProject);
    }

    @Override
    public Boolean publishProject(String instanceId, String compId, String projectId) {
        return saveProjectCorrelationToDataStore(instanceId, compId, projectId);
    }


    /**
     * Get app settings from the DB
     * @param userId - the Wix userid (UUID)
     * @return
     */
    public
    @Nullable
    AppSettings getAppSettings(String userId) {
        if (userId == null)
            return null;
        else {
            final Key key = KeyFactory.createKey(APP_INSTANCE, key(userId));
            try {
//                final String prop = dataStore.get(key).getProperty(SETTINGS).toString();
//                return objectMapper.readValue(prop, AppSettings.class);
                final Text object = (Text) dataStore.get(key).getProperty(SETTINGS);
                final String asText = object.getValue();
                //final AppSettings appSettings = objectMapper.readValue(asText, AppSettings.class);
                final AppSettings appSettingsTree = objectMapper.reader(AppSettings.class).readValue(asText);
                final String prop = dataStore.get(key).getProperty(SETTINGS).toString();
                return objectMapper.readValue(asText, AppSettings.class);

            } catch (EntityNotFoundException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppSettings(objectMapper);
            } catch (IOException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppSettings(objectMapper);
            }
        }
    }

    /**
     * Create a unique key to each entry in the DB that is composed from the instanceId and compID
     * @param userId - the Wix userid (UUID)
     * @return a key for saving and loading from GAE datastore
     */
    public String key(String userId) {
        return userId;
        //return String.format("%s.%s", instanceId, compId);
    }

    /**
     * Create a unique key to each entry in the DB that is composed from the instanceId and compID
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @return
     */
    public String key(String instanceId, String compId) {
        return String.format("%s.%s", instanceId, compId);
    }


    /**
     * Save appProject to the datastore
     * @param userId - the Wix userid (UUID)
     * @param propertyName - property name of the appProject ('column' in SQL)
     * @param data - the appProject to save, saved as as string.
     * @return true if the save action has been successfully performed
     */
    private Boolean saveAppSettingsToDataStore(String userId, String propertyName, DataContainer data) {
        Boolean isSuccessful = false;
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(userId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(userId));
        }
        try {
            Text textObj = new Text(objectMapper.writeValueAsString(data));
            //Should fix 500 char limit on properties
            entity.setProperty(propertyName,textObj);
        } catch (IOException e) {
            throw new AppDaoException("failed to serialize settings", e);
        }

        Transaction transaction = dataStore.beginTransaction();
        try {
            dataStore.put(entity);
            transaction.commit();
            isSuccessful = true;
        } finally {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return isSuccessful;
    }

    /**
     * Save appProject to the datastore
     * @param projectId - the current projectId
     * @param userId - the Wix userid (UUID)
     * @param appProject - the appProject to save, saved as as string.
     * @return true if the save action has been successfully performed
     */
    private Boolean saveAppProjectToDataStore(String projectId, String userId, AppProject appProject) {
        Boolean isSuccessful = false;
        //TODO make revision support here and more logic
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(projectId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(projectId));
        }
        try {
            Text textObj = new Text(objectMapper.writeValueAsString(appProject.getCode()));
            //Should fix 500 char limit on properties
            entity.setProperty(CODEJSON,textObj);
            Integer revisionNum;
            try {
                revisionNum = (Integer) entity.getProperty(REVISION);
                if(revisionNum == null) {
                    revisionNum = 0;
                }
                else {
                    revisionNum++;
                }
            }
            catch (Exception e) {
                e.printStackTrace();
                return false;
            }
            entity.setProperty(REVISION, revisionNum);
            entity.setProperty(MODIFIED, new Date());
        } catch (IOException e) {
            throw new AppDaoException("failed to serialize settings", e);
        }

        Transaction transaction = dataStore.beginTransaction();
        try {
            dataStore.put(entity);
            transaction.commit();
            isSuccessful = true;
        } finally {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return isSuccessful;
    }


    /**
     * Save a correlation between an app instance and a projectId to the datastore
     * @param instanceId - - Instance id of the app, It is shared by multiple Widgets of the same app within the same sitecurrent projectId
     * @param compId - - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param projectId - - the current projectId
     * @return true if the save action has been successfully performed
     */
    private Boolean saveProjectCorrelationToDataStore(String instanceId, String compId, String projectId) {
        Boolean isSuccessful = false;
        //TODO make revision support here and more logic
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(instanceId, compId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(instanceId,compId));
            entity.setProperty(PROJECT_ID,projectId);
        }
        Transaction transaction = dataStore.beginTransaction();
        try {
            dataStore.put(entity);
            transaction.commit();
            isSuccessful = true;
        } finally {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
        return isSuccessful;
    }
}

