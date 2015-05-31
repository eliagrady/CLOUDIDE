package com.wixpress.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wixpress.app.dao.AppDao;
import com.wixpress.app.dao.AppProject;
import com.wixpress.app.dao.AppSettings;
import com.wixpress.app.domain.AppInstance;
import com.wixpress.app.domain.AuthenticationResolver;
import com.wixpress.app.domain.InvalidSignatureException;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.StringUtils;
import org.joda.time.DateTime;
import org.mortbay.util.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Nullable;
import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Iterator;
import java.util.UUID;

/**
 * The controller of the Wix API sample application.
 * The controller implements the widget and settings endpoints of a Wix application.
 * In addition, it implements two versions of the endpoints for stand-alone testing.
 * Adding endpoint for the editor as a separate mapping endpoint, also with
 * testing and live environments mapping
 */

@Controller
@RequestMapping(value = "/app")
public class AppController {
    /**
     * Auxilery class for debug mode
     */
    private static class DEBUG {
        private static final String userId = "c0a3d7b3-8c90-4b3c-bffa-5092649ccc3a"; //cloudide userId
        private static final String MODE = "debug";
        public static final String permissions = "OWNER";
        public static String instanceId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    }
    @Resource
    private AppDao appDao;

    @Resource
    private ObjectMapper objectMapper;

    @Resource
    private AuthenticationResolver authenticationResolver;

    /**
     * VIEW - Widget Endpoint
     *
     * @param model      - Spring MVC model used by the view template widget.vm
     * @param instance   - The signed instance {@see http://dev.wix.com/display/wixdevelopersapi/The+Signed+Instance}
     * @param sectionUrl - The base URL of the application section, if present
     * @param target     - The target attribute that must be added to all href anchors within the application frame
     * @param width      - The width of the frame to render in pixels
     * @param compId     - The id of the Wix component which is the host of the IFrame
     * @param viewMode   - An indication whether the user is currently in editor / site
     * @return the template widget.vm name
     * @link http://dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-WidgetEndpoint
     */
    @RequestMapping(value = "/widget", method = RequestMethod.GET)
    public String widget(Model model,
                         @RequestParam String instance,
                         @RequestParam(value = "section-url", required = false) String sectionUrl,
                         @RequestParam(required = false) String target,
                         @RequestParam Integer width,
                         @RequestParam String compId,
                         @RequestParam String viewMode,
                         @RequestParam(required = false, defaultValue = "") String projectId,
                         @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        model.addAttribute("appInstance",appInstance);
        model.addAttribute("mode",mode);

        //RESTful
        //return viewWidgetWithProject(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode , appInstance, projectId);
        //Regular embedding
        return viewWidget(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, appInstance, projectId);

    }

    /**
     * VIEW - Widget Endpoint
     *
     * @param model      - Spring MVC model used by the view template widget.vm
     * @param instance   - The signed instance {@see http://dev.wix.com/display/wixdevelopersapi/The+Signed+Instance}
     * @param sectionUrl - The base URL of the application section, if present
     * @param target     - The target attribute that must be added to all href anchors within the application frame
     * @param width      - The width of the frame to render in pixels
     * @param compId     - The id of the Wix component which is the host of the IFrame
     * @param viewMode   - An indication whether the user is currently in editor / site
     * @return the template editor.vm name
     * @link http://dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-WidgetEndpoint
     */
    @RequestMapping(value = "/editor", method = RequestMethod.GET)
    public String editor(Model model,
                         HttpServletResponse response,
                         @RequestParam String instance,
                         @RequestParam(value = "section-url", required = false) String sectionUrl,
                         @RequestParam(required = false) String target,
                         @RequestParam(required = false)Integer width,
                         @RequestParam(required = false) String compId,
                         @RequestParam(required = false) String viewMode,
                         @RequestParam(required = false, defaultValue= "") String projectId,
                         @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        //Add Cookie:
        response.addCookie(new Cookie("instance",instance));
        //fallback to default width
        if(width == null) {
            width = 500;
        }
        model.addAttribute("mode",mode);
        return viewEditor(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, projectId, appInstance);

    }


    /**
     * VIEW - Widget Endpoint
     *
     * @param model      - Spring MVC model used by the view template widget.vm
     * @param instance   - The signed instance {@see http://dev.wix.com/display/wixdevelopersapi/The+Signed+Instance}
     * @param sectionUrl - The base URL of the application section, if present
     * @param target     - The target attribute that must be added to all href anchors within the application frame
     * @param width      - The width of the frame to render in pixels
     * @param compId     - The id of the Wix component which is the host of the IFrame
     * @param viewMode   - An indication whether the user is currently in editor / site
     * @return the template editor.vm name
     * @link http://dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-WidgetEndpoint
     */
    @RequestMapping(value = "/editordemo", method = RequestMethod.GET)
    public String editorDemo(Model model,
                         HttpServletResponse response,
                         @RequestParam(value = "section-url", required = false) String sectionUrl,
                         @RequestParam(required = false) String target,
                         @RequestParam(required = false)Integer width,
                         @RequestParam(required = false) String compId,
                         @RequestParam(required = false) String viewMode,
                         @RequestParam(required = false, defaultValue= "") String projectId,
                         @RequestParam(required = false, defaultValue = "demo") String mode) throws IOException {
        AppInstance appInstance = createTestSignedInstance(DEBUG.instanceId,DEBUG.userId,DEBUG.permissions);
        //fallback to default width
        if(width == null) {
            width = 500;
        }
        model.addAttribute("mode",mode);
        return viewEditorDemo(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, projectId, appInstance);

    }

    /**
     * VIEW - Setting Endpoint
     *
     * @param model      - Spring MVC model used by the view template setting.vm
     * @param instance   - The signed instance {@see http://dev.wix.com/display/wixdevelopersapi/The+Signed+Instance}
     * @param width      - The width of the frame to render in pixels
     * @param locale     - The language of the Wix editor
     * @param origCompId - The Wix component id of the caller widget/section
     * @param compId     - The id of the Wix component which is the host of the IFrame
     * @return the template setting.vm name
     * @link http://dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-SettingsEndpoint
     */
    @RequestMapping(value = "/settings", method = RequestMethod.GET)
    public String settings(Model model,
                           HttpServletResponse response,
                           @RequestParam String instance,
                           @RequestParam(required = false) Integer width,
                           @RequestParam String locale,
                           @RequestParam String origCompId,
                           @RequestParam String compId,
                           @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        response.addCookie(new Cookie("instance", instance));
        model.addAttribute("appInstance",appInstance);
        model.addAttribute("mode",mode);
        return viewSettings(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId, appInstance);
    }


    /**
     * Message - auxiliary Endpoint
     *
     * @param model      - Spring MVC model used by the view template setting.vm
     * @param instance   - The signed instance {@see http://dev.wix.com/display/wixdevelopersapi/The+Signed+Instance}
     * @param width      - The width of the frame to render in pixels
     * @param locale     - The language of the Wix editor
     * @param origCompId - The Wix component id of the caller widget/section
     * @param compId     - The id of the Wix component which is the host of the IFrame
     * @return the template setting.vm name
     * @link http://dev.wix.com/docs/display/DRAF/App+Endpoints#AppEndpoints-SettingsEndpoint
     */
    @RequestMapping(value = "/message", method = RequestMethod.GET)
    public JsonNode message(Model model,
                           HttpServletResponse response,
                           @RequestParam String encodedMessage,
                           @RequestParam String instance,
                           @RequestParam(required = false) Integer width,
                           @RequestParam(required = false) String locale,
                           @RequestParam(required = false) String origCompId,
                           @RequestParam String compId) throws IOException {
        //TODO Create a special endpoint for creating rich apps with backend
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        response.addCookie(new Cookie("instance", instance));
        model.addAttribute("appInstance",appInstance);
        return getAppProjectCode(encodedMessage,origCompId);
        //return viewMessage(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId, encodedMessage);
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the settings controller view operations
     * @param settingsUpdate - the new settings selected by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/settingsupdate", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> settingsUpdate(@CookieValue() String instance,
                                                     @RequestBody SettingsUpdate settingsUpdate) {
        try {
            String mode = settingsUpdate.getMode();
            if(mode != null && mode.equals(DEBUG.MODE)) {
                AppInstance appInstance = createTestSignedInstance(DEBUG.instanceId, DEBUG.userId, DEBUG.permissions);
                return AjaxResult.ok();
            }
            AppInstance appInstance = authenticationResolver.unsignInstance(instance);
            appDao.saveAppSettings(appInstance.getUid().toString(), settingsUpdate.getSettings());
            return AjaxResult.ok();
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the settings controller view operations
     * @param projectUpdate - the new settings selected by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/projectlookup", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> projectLookup(@CookieValue() String instance,
                                                     @RequestBody ProjectUpdate projectUpdate) {
        try {
            //TODO remove debugMode from production code
            String mode = projectUpdate.getMode();
            AppInstance appInstance;
            if (mode != null && mode.equals(DEBUG.MODE)) {
                String userId; //CloudIde userId
                if(instance != null && instance != "") {
                    userId = instance;
                }
                else {
                    userId = DEBUG.userId;
                }
                appInstance = createTestSignedInstance(DEBUG.instanceId, userId, DEBUG.permissions);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            return executeReverseLookup(appInstance, projectUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Helper function for saving
     */
    private ResponseEntity<AjaxResult> executeReverseLookup(AppInstance appInstance, ProjectUpdate projectUpdate) {
        try {
            String instanceId = projectUpdate.getInstanceId();
            String compId = projectUpdate.getCompId();
            String userId = appInstance.getUid().toString();
            String result = appDao.lookupProject(userId, instanceId, compId);
            return AjaxResult.res(result);
        } catch (NullPointerException npe) {
            return AjaxResult.internalServerError(npe);
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }



    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param projectUpdate - the new app data and settings edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/publish", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> appPublish(@CookieValue() String instance,
                                                 @RequestBody ProjectUpdate projectUpdate) {
        try {
            //TODO remove debugMode from production code
            String mode = projectUpdate.getMode();
            AppInstance appInstance;
            if (mode != null && mode.equals(DEBUG.MODE)) {
                String userId; //CloudIde userId
                if(instance != null && instance != "") {
                    userId = instance;
                }
                else {
                    userId = DEBUG.userId;
                }
                appInstance = createTestSignedInstance(DEBUG.instanceId, userId, DEBUG.permissions);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            return executePublish(appInstance, projectUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Helper function for saving
     */
    private ResponseEntity<AjaxResult> executePublish(AppInstance appInstance, ProjectUpdate projectUpdate) {
        try {
            String instanceId = projectUpdate.getInstanceId();
            String compId = projectUpdate.getCompId();
            String userId = appInstance.getUid().toString();
            String projectId = projectUpdate.getProjectId();
            Boolean result = appDao.publishProject(userId, instanceId, compId, projectId);
            if(result) {
                return AjaxResult.ok();
            }
            else {
                return AjaxResult.notOk();
            }
        } catch (NullPointerException npe) {
            return AjaxResult.internalServerError(npe);
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param projectUpdate - the new app data and settings edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/loadproject", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> loadProject(@CookieValue() String instance,
                                                 @RequestBody ProjectUpdate projectUpdate) {
        try {
            String mode = projectUpdate.getMode();
            AppInstance appInstance;
            if (mode != null && mode.equals(DEBUG.MODE)) {
                String userId; //CloudIde userId
                if(instance != null && instance != "") {
                    userId = instance;
                }
                else {
                    userId = DEBUG.userId;
                }
                appInstance = createTestSignedInstance(DEBUG.instanceId, userId, DEBUG.permissions);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            return executeLoadProject(appInstance, projectUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Helper function for saving
     */
    private ResponseEntity<AjaxResult> executeLoadProject(AppInstance appInstance, ProjectUpdate projectUpdate) {
        try {
            String instanceId = projectUpdate.getInstanceId();
            String compId = projectUpdate.getCompId();
            String userId = appInstance.getUid().toString();
            String projectId = projectUpdate.getProjectId();
            AppProject project = getAppProject(userId,projectId);
            if(project != null) {
                return AjaxResult.res(objectMapper.writeValueAsString(project));
            }
            else {
                return AjaxResult.notOk();
                //throw new NullPointerException("Failed fetching project from DB");
            }
        } catch (NullPointerException npe) {
            return AjaxResult.entityLookupError(npe);
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param projectUpdate - the new app data and settings edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> appSave(@CookieValue() String instance,
                                              @RequestBody ProjectUpdate projectUpdate) {
        try {
            String mode = projectUpdate.getMode();
            AppInstance appInstance;
            if (mode != null && mode.equals(DEBUG.MODE)) {
                String userId; //CloudIde userId
                if(instance != null && instance != "") {
                    userId = instance;
                }
                else {
                    userId = DEBUG.userId;
                }
                appInstance = createTestSignedInstance(DEBUG.instanceId, userId, DEBUG.permissions);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            return executeSave(appInstance, projectUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Helper function for saving
     */
    private ResponseEntity<AjaxResult> executeSave(AppInstance appInstance, ProjectUpdate projectUpdate) {
        try {
            AppProject appProject = projectUpdate.getProject();
            if(appProject == null) {
                //Save all projects
                JsonNode projectsData = projectUpdate.getProjects();
                int projectCount = projectsData.size();
                Iterator<String> iter = projectsData.fieldNames();
                AppProject[] appProjects = new AppProject[projectCount];

                int idx = 0;
                while(iter.hasNext()) {
                    String projectId =iter.next();
                    JsonNode project = projectsData.get(projectId);
                    JsonNode projectCode = project.get("code");

                    appProjects[idx++] = new AppProject(projectId,projectCode);
                }
                AppSettings appSettings = projectUpdate.getSettings();
                appDao.saveAppSettings(appInstance.getUid().toString(), appSettings);
                appDao.saveAppProjects(appInstance.getUid().toString(), null, appProjects);
            }
            else {
                //Save single project
                appDao.saveAppProject(appInstance.getUid().toString(), projectUpdate.getProjectId(), appProject);
            }
            return AjaxResult.ok();
        } catch (NullPointerException npe) {
            return AjaxResult.internalServerError(npe);
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param settingsUpdate - the new app data edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/update", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> appUpdate(@CookieValue() String instance,
                                                @RequestBody SettingsUpdate settingsUpdate) {
        try {
            //TODO remove debugMode from production code
            String mode = settingsUpdate.getMode();
            if (mode.equals("debug")) {
                return executeUpdate(createTestSignedInstance("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", null, null), settingsUpdate);
            }
            AppInstance appInstance = authenticationResolver.unsignInstance(instance);
            return executeUpdate(appInstance, settingsUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Helper function for updating
     */
    private ResponseEntity<AjaxResult> executeUpdate(AppInstance appInstance,SettingsUpdate settingsUpdate) {
        try {
            //TODO Check for the necessity of this operation
            //AppSettings appData = settingsUpdate.getAppData();
            AppSettings fetched;
            fetched = appDao.getAppSettings(appInstance.getUid().toString());
            //Can produce NullPointerException
            String res = fetched.getAppSettings().toString();
            appDao.saveAppSettings(appInstance.getUid().toString(), settingsUpdate.getSettings());
            return AjaxResult.res(res);
        } catch (NullPointerException npe) {
            return AjaxResult.internalServerError(npe);
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }

    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param settingsUpdate - the new app data edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/loadsettings", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> settingsFetch(@CookieValue() String instance,
                                                @RequestBody SettingsUpdate settingsUpdate) {
        try {
            String mode = settingsUpdate.getMode();
            AppInstance appInstance;
            AppSettings fetched;
            if (mode != null && mode.equals("debug")) {
                String userId; //CloudIde userId
                if(instance != null && instance != "") {
                    userId = instance;
                }
                else {
                    userId = "c0a3d7b3-8c90-4b3c-bffa-5092649ccc3a";
                }
                String permissions = "OWNER";
                appInstance = createTestSignedInstance("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", userId, permissions);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            fetched = appDao.getAppSettings(appInstance.getUid().toString());
            //Can produce NullPointerException
            if(fetched == null) {
                return AjaxResult.notOk();
                //throw new NullPointerException("Failed fetching settings from DB");
            }
            return AjaxResult.res(objectMapper.writeValueAsString(fetched));
        }
        catch (NullPointerException npe) {
            return AjaxResult.entityLookupError(npe);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }


    /**
     * VIEW - Editor Endpoint for testing
     * This endpoint does not implement the Wix API. It can be used directly to test the application from any browser,
     * substituting the signed instance parameter with explicit values given as URL parameters
     *
     * @param model       - model used by the view template editor.vm
     * @param instanceId  - the instanceId member of the signed instance
     * @param userId      - the uid member of the signed instance
     * @param permissions - the permissions member of the signed instance
     * @param sectionUrl  - The base URL of the application section, if present
     * @param target      - The target attribute that must be added to all href anchors within the application frame
     * @param width       - The width of the frame to render in pixels
     * @param compId      - The id of the Wix component which is the host of the IFrame
     * @param viewMode    - An indication whether the user is currently in editor / site
     * @return the template editor.vm name
     */
    @RequestMapping(value = "/editorstandalone", method = RequestMethod.GET)
    public String editorStandAlone(Model model,
                                   HttpServletResponse response,
                                   @RequestParam String instanceId,
                                   @RequestParam(required = false) String userId,
                                   @RequestParam(required = false) String permissions,
                                   @RequestParam(value = "section-url", required = false, defaultValue = "/") String sectionUrl,
                                   @RequestParam(required = false, defaultValue = "_self") String target,
                                   @RequestParam(required = false, defaultValue = "200") Integer width,
                                   @RequestParam(required = false, defaultValue = "widgetCompId") String compId,
                                   @RequestParam(required = false, defaultValue = "site") String viewMode,
                                   @RequestParam(required = false, defaultValue = "") String projectId,
                                   @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        if(userId == null) {
            userId = DEBUG.userId;
        }
        if(permissions == null) {
            permissions = DEBUG.permissions;
        }
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        //Add 'Cookie' (not a real instance, just the userId is present):
        response.addCookie(new Cookie("instance", appInstance.getUid().toString()));
        model.addAttribute("mode",mode);
        return viewEditor(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, projectId, appInstance);
    }

    /**
     * VIEW - Widget Endpoint for testing
     * This endpoint does not implement the Wix API. It can be used directly to test the application from any browser,
     * substituting the signed instance parameter with explicit values given as URL parameters
     *
     * @param model       - model used by the view template widget.vm
     * @param instanceId  - the instanceId member of the signed instance
     * @param userId      - the uid member of the signed instance
     * @param permissions - the permissions member of the signed instance
     * @param sectionUrl  - The base URL of the application section, if present
     * @param target      - The target attribute that must be added to all href anchors within the application frame
     * @param width       - The width of the frame to render in pixels
     * @param compId      - The id of the Wix component which is the host of the IFrame
     * @param viewMode    - An indication whether the user is currently in editor / site
     * @return the template widget.vm name
     */
    @RequestMapping(value = "/widgetstandalone", method = RequestMethod.GET)
    public String widgetStandAlone(Model model,
                                   HttpServletResponse response,
                                   @RequestParam String instanceId,
                                   @RequestParam(required = false) String userId,
                                   @RequestParam(required = false) String permissions,
                                   @RequestParam(value = "section-url", required = false, defaultValue = "/") String sectionUrl,
                                   @RequestParam(required = false, defaultValue = "_self") String target,
                                   @RequestParam(required = false, defaultValue = "200") Integer width,
                                   @RequestParam(required = false, defaultValue = "widgetCompId") String compId,
                                   @RequestParam(required = false, defaultValue = "site") String viewMode,
                                   @RequestParam(required = false, defaultValue = "") String projectId,
                                   @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        if(userId == null) {
            userId = DEBUG.userId;
        }
        if(permissions == null) {
            permissions = DEBUG.permissions;
        }
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        //Add 'Cookie' (not a real instance, just the userId is present):
        response.addCookie(new Cookie("instance", appInstance.getUid().toString()));
        model.addAttribute("mode",mode);
        if(mode.equalsIgnoreCase("debug")) {
            return viewWidgetWithProject(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, appInstance, projectId);
        }
        return viewWidget(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, appInstance, projectId);
    }



    /**
     * VIEW - A 'RESTful' resource loader for project data
     */
    @RequestMapping(value = "/js/{instanceId}/{compId}", method = RequestMethod.GET)
    public void resourceLoaderJs(Model model,
                                 HttpServletResponse response,
                                 @PathVariable String instanceId,
                                 @PathVariable String compId,
                                 @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        model.addAttribute("mode",mode);
        //AppProject project = new AppProject(objectMapper);
        JsonNode projectCodeJson = getAppProjectCode(instanceId, compId);
        String jsBase64 = projectCodeJson.get("code").get("js").asText();
        String parsedJavascript = decodeBase64(jsBase64);
        response.setContentType("application/javascript");
        response.getWriter().write(parsedJavascript);
        //return viewWidget2(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, appInstance, projectId);
    }

    /**
     * VIEW - A 'RESTful' resource loader for project data
     */
    @RequestMapping(value = "/css/{instanceId}/{compId}", method = RequestMethod.GET)
    public void resourceLoaderCss(Model model,
                                 HttpServletResponse response,
                                 @PathVariable String instanceId,
                                 @PathVariable String compId,
                                 @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        model.addAttribute("mode",mode);
        JsonNode projectCodeJson = getAppProjectCode(instanceId, compId);
        String cssBase64 = projectCodeJson.get("code").get("css").asText();
        String parsedCss = decodeBase64(cssBase64);
        response.setContentType("text/css");
        response.getWriter().write(parsedCss);
        //return viewWidget2(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode, appInstance, projectId);
    }

    /**
     * VIEW - Setting Endpoint for testing
     * This endpoint does not implement the Wix API. It can be used directly to test the application from any browser,
     * substituting the signed instance parameter with explicit values given as URL parameters
     *
     * @param model      - model used by the view template setting.vm
     * @param instanceId - the instance id member of the signed instance
     * @param width      - the width of the setting IFrame
     * @return the template setting.vm name
     */
    @RequestMapping(value = "/settingsstandalone", method = RequestMethod.GET)
    public String settingsStandAlone(Model model,
                                     HttpServletResponse response,
                                     @RequestParam String instanceId,
                                     @RequestParam(required = false) String userId,
                                     @RequestParam(required = false) String permissions,
                                     @RequestParam(required = false, defaultValue = "400") Integer width,
                                     @RequestParam(required = false, defaultValue = "en") String locale,
                                     @RequestParam(required = false, defaultValue = "widgetCompId") String origCompId,
                                     @RequestParam(required = false, defaultValue = "sectionCompId") String compId,
                                     @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        if(userId == null) {
            userId = "c0a3d7b3-8c90-4b3c-bffa-5092649ccc3a"; //CloudIde userId if not explicitly overridden
        }
        if(permissions == null) {
            permissions = "OWNER";
        }
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        //Add 'Cookie' (not a real instance, just the userId is present):
        response.addCookie(new Cookie("instance", appInstance.getUid().toString()));
        model.addAttribute("mode",mode);
        return viewSettings(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId, appInstance);
    }

    /**
     * generic Spring MVC error handler
     *
     * @param e - the exception
     * @return a view name
     * @link http://static.springsource.org/spring/docs/3.2.x/spring-framework-reference/html/mvc.html#mvc-ann-exceptionhandler
     */
    @ExceptionHandler(Exception.class)
    public ModelAndView exceptionHandler(Exception e) {
        if (e instanceof InvalidSignatureException) {
            return new ModelAndView("invalid-secret");
        } else {
            ModelAndView mv = new ModelAndView("error-view");
            StringBuilder stackTrace = new StringBuilder();
            renderStackTrace(e, stackTrace);
            mv.addObject("exceptionMessage", e.getMessage());
            mv.addObject("exceptionStackTrace", stackTrace.toString());
            return mv;
        }
    }

    public void renderStackTrace(Throwable e, StringBuilder stackTrace) {
        for (StackTraceElement stackTraceElement : e.getStackTrace()) {
            stackTrace.append("<div class=\"stack-trace\">").append(stackTraceElement.toString()).append("</div>");
        }
        if (e.getCause() != null && e.getCause() != e) {
            stackTrace.append("<div class=\"caused-by\">").append("caused by ").append(e.getCause().getClass()).append(" - ").append(e.getCause().getMessage()).append("</div>");
            renderStackTrace(e.getCause(), stackTrace);
        }
    }

    // Set editor.vm
    private String viewEditor(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode, String projectId, AppInstance appInstance) throws IOException {
        AppSettings appSettings = getSettings(appInstance.getUid().toString());
        model.addAttribute("cldAppSettings", objectMapper.writeValueAsString(appSettings));
        model.addAttribute("appInstance", objectMapper.writeValueAsString(appInstance.getUid().toString()));
        //Editor 'project specific' mode:
        model.addAttribute("projectId",projectId);
        return "editor";
    }
    // Set editordemo.vm
    private String viewEditorDemo(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode, String projectId, AppInstance appInstance) throws IOException {
        AppSettings appSettings = getSettings(appInstance.getUid().toString());
        model.addAttribute("appInstance", objectMapper.writeValueAsString(appInstance.getUid().toString()));
        //Editor 'project specific' mode:
        model.addAttribute("projectId",projectId);
        return "editor";
    }


    // Set widget.vm
    private String viewWidget(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode, AppInstance appInstance, String projectId) throws IOException {
        //AppProject appProject = getAppProject(instanceId, compId);
        JsonNode appProject = getAppProjectCode(instanceId, compId);
        //TODO check if there is a project to load, or an empty widget should load

        model.addAttribute("instanceId",appInstance.getInstanceId().toString());
        model.addAttribute("compId",compId);
        model.addAttribute("currentProject",objectMapper.writeValueAsString(appProject));
        return "widget";
    }
    // Set widgetWithProject.vm
    private String viewWidgetWithProject(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode, AppInstance appInstance, String projectId) throws IOException {
        //AppProject appProject = getAppProject(instanceId, compId);
        JsonNode appProject = getAppProjectCode(instanceId, compId);
        //TODO check if there is a project to load, or an empty widget should load
        try {
            String htmlBase64 = appProject.get("code").get("html").asText();
            String parsedHtml = decodeBase64(htmlBase64);
            model.addAttribute("html",parsedHtml);
            model.addAttribute("instanceId",appInstance.getInstanceId().toString());
            model.addAttribute("compId",compId);
        }
        catch (Exception e) {
            //No project loaded
            return "widgetWithoutProject";
        }

        //model.addAttribute("currentProject",objectMapper.writeValueAsString(appProject));
        return "widgetWithProject";
    }

    // Set javascriptTemplate.vm
    private String viewWidget2(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode, AppInstance appInstance, String projectId) throws IOException {
        //TODO test another widget viewing scheme: base64 decoding on server (can impact performance), views.js and css as file imports
        //AppProject appProject = getAppProject(instanceId, compId);
        //JsonNode appProject = getAppProjectCode(instanceId, compId);
        //model.addAttribute("data",objectMapper.writeValueAsString(appProject));
        return "widget2";
    }



    // Set setting.vm
    private String viewSettings(Model model, Integer width, String instanceId, String locale, String origCompId, String compId, AppInstance appInstance) throws IOException {
        AppSettings appSettings = getSettings(appInstance.getUid().toString());
        model.addAttribute("cldAppSettings", objectMapper.writeValueAsString(appSettings));
        return "settings";
    }

    // Set message.vm
    private String viewMessage(Model model, Integer width, String instanceId, String locale, String origCompId, String compId, String encodedMessage) throws IOException {
        //AppSettings appSettings = getProject(instanceId, compId);
        //AppData cloudIdeData = getAppData(instanceId, compId);
        model.addAttribute("message", objectMapper.writeValueAsString(URI.decodePath(encodedMessage)));
        return "message";
    }

    /**
     * Get settings from the DB if exists, otherwise return empty settings
     * @param userId - the Wix unique user id
     * @return the app settings
     */
    private AppSettings getSettings(String userId) {
        AppSettings appSettings = appDao.getAppSettings(userId);
        return appSettings;
    }

    /**
     * Get AppProject from the DB if exists, otherwise return empty settings
     * @param userId - the uid member of the signed instance
     * @param projectId - the project's id
     * @return the app project
     */
    private AppProject getAppProject(String userId, String projectId) {
        AppProject appProject = appDao.getAppProject(userId, projectId);
        return appProject;
    }

    /**
     * Get settings from the DB if exists, otherwise return empty settings
     * @param instanceId - - the instance id member of the signed instance
     * @param compId - - The id of the Wix component which is the host of the IFrame
     * @return the app project
     */
    private JsonNode getAppProjectCode(String instanceId, String compId) {
        JsonNode appProject = appDao.getAppProjectCode(instanceId, compId);
        return appProject;
    }

    /**
     * Creates a debug version of a signed instance, mimicking the way it is supposed to be delivered on Wix end
     * @param instanceId - the instanceId member of the signed instance
     * @param userId - the Wix unique user id
     * @param permissions - - the permissions member of the signed instance
     * @return
     */
    private AppInstance createTestSignedInstance(String instanceId, @Nullable String userId, @Nullable String permissions) {
        try {
            UUID instanceUuid = UUID.fromString(instanceId);
            UUID userUuid = null;
            if (userId != null)
                userUuid = UUID.fromString(userId);
            return new AppInstance(instanceUuid, new DateTime(), userUuid, permissions);
        } catch (Exception original) {
            throw new ControllerInputException("Failed parsing instanceId [%s] or userId [%s].\nValid values are GUIDs of the form [aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa] or nulls (for userId)",
                    original, instanceId, userId);
        }
    }


    public String decodeBase64(String s) {
        return StringUtils.newStringUtf8(Base64.decodeBase64(s));
    }
    public String encodeBase64(String s) {
        return Base64.encodeBase64String(StringUtils.getBytesUtf8(s));
    }
}
