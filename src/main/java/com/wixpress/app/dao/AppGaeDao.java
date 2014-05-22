package com.wixpress.app.dao;

import com.google.appengine.api.datastore.*;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;

import javax.annotation.Nullable;
import javax.annotation.Resource;
import java.io.IOException;
import java.util.Map;

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
     *
     * @param instanceId  - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId      - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appSettings - The settings of the app that configure the widget
     */
    public void saveAppSettings(String instanceId, String compId, AppSettings appSettings) {
        //TODO remove
//        Entity entity = new Entity(APP_INSTANCE, key(instanceId, compId));
//        try {
//            entity.setProperty(BAGGAGE, objectMapper.writeValueAsString(appSettings));
//        } catch (IOException e) {
//            throw new AppDaoException("failed to serialize settings", e);
//        }
//
//        Transaction transaction = dataStore.beginTransaction();
//        try {
//            dataStore.put(entity);
//            transaction.commit();
//        } finally {
//            if (transaction.isActive()) {
//                transaction.rollback();
//            }
//        }
        saveToDataStore(instanceId,compId,SETTINGS,appSettings);
    }

    /**
     * Get app settings from the DB
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId     - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @return
     */
    public
    @Nullable
    AppSettings getAppSettings(String instanceId, String compId) {
        if (instanceId == null)
            return null;
        else {
            final Key key = KeyFactory.createKey(APP_INSTANCE, key(instanceId, compId));
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

//    @Override
//    public AppData getAppData(String instanceId, String compId) {
//        if (instanceId == null)
//            return null;
//        else {
//            final Key key = KeyFactory.createKey(APP_INSTANCE, key(instanceId, compId));
//            try {
//                final Text object = (Text) dataStore.get(key).getProperty(DATA);
//                final String str = ((Text) dataStore.get(key).getProperty(DATA)).toString();
//                final String asText = object.getValue();
//                final boolean eq = str.equals(asText);
//                final AppData appData = objectMapper.readValue(asText, AppData.class);
//                final AppData appDataTree = objectMapper.reader(AppData.class).readValue(asText);
//                final String prop = dataStore.get(key).getProperty(DATA).toString();
//                return objectMapper.readValue(asText, AppData.class);
//            } catch (EntityNotFoundException e) {
//                // we ignore the setting reading exception and return a new default settings object
//                return new AppData(objectMapper);
//            } catch (IOException e) {
//                // we ignore the setting reading exception and return a new default settings object
//                return new AppData(objectMapper);
//            }
//        }
//    }

//    /**
//     * Get global instance shared code (for retrieving global code entities)
//     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
//     * @return
//     */
//    @Override
//    public AppData getAppData(String instanceId) {
//        if (instanceId == null) {
//            return null;
//        }
//        else {
//            //TODO change from null?
//            final Key key = KeyFactory.createKey(APP_INSTANCE, key(instanceId , "null"));
//            try {
//                final String prop = dataStore.get(key).getProperty(DATA).toString();
//                return objectMapper.readValue(prop, AppData.class);
//            } catch (EntityNotFoundException e) {
//                // we ignore the setting reading exception and return a new default settings object
//                return new AppData(objectMapper);
//            } catch (IOException e) {
//                // we ignore the setting reading exception and return a new default settings object
//                return new AppData(objectMapper);
//            }
//        }
//    }

    /**
     * Create a unique key to each entry in the DB that is composed from the instanceId and compID
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId     - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @return
     */
    public String key(String instanceId, String compId) {
        return String.format("%s.%s", instanceId, compId);
    }

    /**
     * Update app settings in the DB
     *
     * @param instanceId  - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId      - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appSettings - The settings of the app that configure the widget
     */
    public void updateAppSettings(String instanceId, String compId, AppSettings appSettings) {
        saveToDataStore(instanceId, compId, SETTINGS, appSettings);
    }


    /**
     * Save data to the datastore
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId - - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param propertyName - property name of the data ('column' in SQL)
     * @param data - the data to save, saved as as string.
     */
    private void saveToDataStore(String instanceId,@Nullable String compId, String propertyName , DataContainer data) {
        //TODO make revision support here and more logic
        //TODO make use of new instances mapping in future ('APP_INSTANCE')
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(instanceId , compId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(instanceId, compId));
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
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId - - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param propertyName - property name of the data ('column' in SQL)
     * @param jsonNode - the data to save, saved as as string.
     */
    private void saveToDataStore(String instanceId,@Nullable String compId, String propertyName , JsonNode jsonNode) {
        //TODO make revision support here and more logic
        //TODO make use of new instances mapping in future ('APP_INSTANCE')
        Entity entity;
        try {
            entity = dataStore.get(KeyFactory.createKey(APP_INSTANCE, key(instanceId , compId)));
        }
        catch (EntityNotFoundException e){
            entity = new Entity(APP_INSTANCE, key(instanceId, compId));
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

    /**
     * Get global instance shared code (for retrieving global code entities)
     *
     * @param propertyName
     * @return
     */
    private DataContainer getData(Query query, String propertyName) {

        if (query == null) {
            return null;
        }
        else {
            QueryResultIterable<Entity> entities = dataStore.prepare(query).asQueryResultIterable();
            QueryResultIterator<Entity> iterator = entities.iterator();
            if(iterator.hasNext()) {
                Entity next = iterator.next();
                Map<String, Object> properties = next.getProperties();
                for(Entity entity: entities) {

                }
            }

            //final Key key = KeyFactory.createKey(APP_INSTANCE, key(instanceId , instanceId));
            Key key = null;
            try {
                final String prop = dataStore.get(key).getProperty(propertyName).toString();
                return objectMapper.readValue(prop, DataContainer.class);
            } catch (EntityNotFoundException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppData(objectMapper);
            } catch (IOException e) {
                // we ignore the setting reading exception and return a new default settings object
                return new AppData(objectMapper);
            }
        }
    }
}

