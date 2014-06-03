package com.wixpress.app.dao;

import com.google.appengine.api.datastore.*;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;
import javax.annotation.Resource;
import java.io.IOException;

/**
 * The DB wrapper of the app
 * It implements methods for getting and setting data in the DB
 */

public class AppGaeDao implements AppDao {

    protected final static String APP_INSTANCE = "CloudIdeAppInstance";
    protected final static String SETTINGS = "settings";
    protected final static String COMPID = "compId";
    protected final static String DATA = "data";
    private static final String CLOUDIDE = "cldInstance";

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
    public void saveAppSettings(String userId, AppSettings appSettings) {
        saveToDataStore(userId,SETTINGS,appSettings);
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
     * Update app settings in the DB
     * @param userId - the Wix userid (UUID)
     * @param appSettings - The settings of the app that configure the widget
     */
    public void updateAppSettings(String userId, AppSettings appSettings) {
        saveToDataStore(userId, SETTINGS, appSettings);
    }


    /**
     * Save data to the datastore
     * @param userId - the Wix userid (UUID)
     * @param propertyName - property name of the data ('column' in SQL)
     * @param data - the data to save, saved as as string.
     */
    private void saveToDataStore(String userId, String propertyName , DataContainer data) {
        //TODO make revision support here and more logic
        //TODO make use of new instances mapping in future ('APP_INSTANCE')
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
        } finally {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
    }

    /**
     * Save data to the datastore
     * @param userId - the Wix userid (UUID)
     * @param propertyName - property name of the data ('column' in SQL)
     * @param jsonNode - the data to save, saved as as string.
     */
    private void saveToDataStore(String userId, String propertyName , JsonNode jsonNode) {
        //TODO make revision support here and more logic
        //TODO make use of new instances mapping in future ('APP_INSTANCE')
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(userId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(userId));
        }
        try {
            Text textObj = new Text(objectMapper.writeValueAsString(jsonNode));
            //Should fix 500 char limit on properties
            entity.setProperty(propertyName,textObj);
        } catch (IOException e) {
            throw new AppDaoException("failed to serialize settings", e);
        }

        Transaction transaction = dataStore.beginTransaction();
        try {
            dataStore.put(entity);
            transaction.commit();
        } finally {
            if (transaction.isActive()) {
                transaction.rollback();
            }
        }
    }
}

