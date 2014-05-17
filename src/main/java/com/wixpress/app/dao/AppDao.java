package com.wixpress.app.dao;

/**
 * Data store wrapper
 * It implements methods for getting and setting data in the data store
 */

public interface AppDao {

    /**
     * Save app settings in the data store
     *
     * @param instanceId  - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId      - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appSettings - The settings of the app that configure the widget
     */
    public void saveAppSettings(String instanceId, String compId, AppSettings appSettings);

    /**
     * Save app data in the data store
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId     - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appData    - The data of the app that configure the widget
     */
    public void saveAppData(String instanceId, String compId, AppSettings appData);

    /**
     * Get app settings from the data store
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId     - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @return
     */
    public AppSettings getAppSettings(String instanceId, String compId);


    /**
     * Get app data from the data store
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId     - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @return
     */
    //public AppData getAppData(String instanceId, String compId);

    /**
     * Get global app data from the data store
     *
     * @param instanceId - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @return
     */
    //public AppData getAppData(String instanceId);

    /**
     * Update app settings in the data store
     *
     * @param instanceId  - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId      - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appSettings - The settings of the app that configure the widget
     */
    public void updateAppSettings(String instanceId, String compId, AppSettings appSettings);

    /**
     * Update app data in the data store
     *
     * @param instanceId  - Instance id of the app, It is shared by multiple Widgets of the same app within the same site
     * @param compId      - The ID of the Wix component which is the host of the iFrame, it is used to distinguish between multiple instances of the same Widget in a site
     * @param appData    - The new app data of the app
     */
    //public void updateAppData(String instanceId, String compId, AppData appData);
}
