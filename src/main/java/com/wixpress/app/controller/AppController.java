package com.wixpress.app.controller;

import com.wixpress.app.dao.AppDao;
import com.wixpress.app.dao.AppSettings;
import com.wixpress.app.domain.AppInstance;
import com.wixpress.app.domain.AuthenticationResolver;
import com.wixpress.app.domain.InvalidSignatureException;
import org.codehaus.jackson.map.ObjectMapper;
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
import java.util.UUID;

/**
 * The controller of the Wix API sample application.
 * The controller implements the widget and settings endpoints of a Wix application.
 * In addition, it implements two versions of the endpoints for stand-alone testing.
 * Elia: Adding endpoint for the editor as a separate mapping endpoint, also with
 * testing and live environments mapping
 */

@Controller
@RequestMapping(value = "/app")
public class AppController {

    private static final String DEBUG = "debug";
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
                         @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        model.addAttribute("appInstance",appInstance);
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewWidget(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode);

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
                         @RequestParam String compId,
                         @RequestParam String viewMode,
                         @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        //Add Cookie:
        response.addCookie(new Cookie("instance",instance));
        //fallback to default width
        if(width == null) {
            width = 500;
        }
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewEditor(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode);

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
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewSettings(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId);
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
    public String message(Model model,
                           HttpServletResponse response,
                           @RequestParam String encodedMessage,
                           @RequestParam String instance,
                           @RequestParam(required = false) Integer width,
                           @RequestParam(required = false) String locale,
                           @RequestParam(required = false) String origCompId,
                           @RequestParam String compId) throws IOException {
        //TODO make due with no security here
        AppInstance appInstance = authenticationResolver.unsignInstance(instance);
        response.addCookie(new Cookie("instance", instance));
        model.addAttribute("appInstance",appInstance);
        return viewMessage(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId, encodedMessage);
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
            //TODO remove debugMode from production code
            String mode = settingsUpdate.getMode();
            if(mode != null && mode.equals("debug")) {
                appDao.updateAppSettings("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",settingsUpdate.getCompId(),settingsUpdate.getSettings());
                return AjaxResult.ok();
            }
            AppInstance appInstance = authenticationResolver.unsignInstance(instance);
            appDao.updateAppSettings(appInstance.getInstanceId().toString(), settingsUpdate.getCompId(), settingsUpdate.getSettings());
            return AjaxResult.ok();
        } catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Saves changes from the settings dialog
     *
     * @param instance       - the appUpdate instance, read from a cookie placed by the editor controller view operations
     * @param settingsUpdate - the new app data and settings edited by the user and the widgetId
     * @return AjaxResult written directly to the response stream
     */
    @RequestMapping(value = "/save", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<AjaxResult> appSave(@CookieValue() String instance,
                                                @RequestBody SettingsUpdate settingsUpdate) {
        try {
            //TODO remove debugMode from production code
            String mode = settingsUpdate.getMode();
            if (mode != null && mode.equals("debug")) {
                return executeSave(createTestSignedInstance("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", null, null), settingsUpdate);
            }
            AppInstance appInstance = authenticationResolver.unsignInstance(instance);
            return executeSave(appInstance, settingsUpdate);
        }
        catch (Exception e) {
            return AjaxResult.internalServerError(e);
        }
    }
    /**
     * Helper function for saving
     */
    private ResponseEntity<AjaxResult> executeSave(AppInstance appInstance, SettingsUpdate settingsUpdate) {
        try {
            AppSettings appSettings = settingsUpdate.getSettings();
            appDao.saveAppSettings(appInstance.getInstanceId().toString(), settingsUpdate.getCompId(), appSettings);
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
            //AppSettings appData = settingsUpdate.getAppData();
            AppSettings fetched;
            if(settingsUpdate.getCompId() == null ) {
                fetched = appDao.getAppSettings(appInstance.getInstanceId().toString(),settingsUpdate.getCompId());
            }
            else {
                fetched = appDao.getAppSettings(appInstance.getInstanceId().toString(),settingsUpdate.getCompId());
            }
            //Can produce NullPointerException
            String res = fetched.getAppSettings().toString();
            appDao.saveAppSettings(appInstance.getInstanceId().toString(), settingsUpdate.getCompId(), fetched);
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
                appInstance = createTestSignedInstance("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", null, null);
            }
            else {
                appInstance = authenticationResolver.unsignInstance(instance);
            }
            fetched = appDao.getAppSettings(appInstance.getInstanceId().toString(),settingsUpdate.getCompId());
            //Can produce NullPointerException
            return AjaxResult.res(objectMapper.writeValueAsString(fetched));
        }
        catch (NullPointerException npe) {
            return AjaxResult.internalServerError(npe);
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
                                   @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        response.addCookie(new Cookie("instance", String.format("%s.%s",instanceId,compId)));
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewEditor(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode);
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
                                   @RequestParam(required = false, defaultValue = "") String mode) throws IOException {
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        response.addCookie(new Cookie("instance", String.format("%s.%s",instanceId,compId)));
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewWidget(model, sectionUrl, target, width, appInstance.getInstanceId().toString(), compId, viewMode);
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
        AppInstance appInstance = createTestSignedInstance(instanceId, userId, permissions);
        response.addCookie(new Cookie("instance", String.format("%s.%s",instanceId,origCompId)));
        if(mode != null) {
            model.addAttribute("mode",mode);
        }
        return viewSettings(model, width, appInstance.getInstanceId().toString(), locale, origCompId, compId);
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
    private String viewEditor(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode) throws IOException {
        AppSettings appSettings = getSettings(instanceId, compId);
        //AppData appData = getAppData(instanceId, compId);
        model.addAttribute("cldAppSettings", objectMapper.writeValueAsString(appSettings));
        model.addAttribute("appInstance", objectMapper.writeValueAsString(String.format("%s.%s", instanceId, compId)));
        return "editor";
    }


    // Set widget.vm
    private String viewWidget(Model model, String sectionUrl, String target, Integer width, String instanceId, String compId, String viewMode) throws IOException {
        //Why do I need the settings in this view?

        AppSettings appSettings = getSettings(instanceId, compId);
        //TODO use viewMode parameter to determine the binding of live site vs. edit and preview modes data segment
        //AppData cloudIdeData = getAppData(instanceId, compId);
        /*
        if (viewMode.equals("edit")) {
            appSettings.getAppSettings().get("projects").get(compId).get("code");
        } else if (viewMode.equals("preview")) {
            appSettings.getAppSettings().get("projects").get(compId).get("code");
        } else if (viewMode.equals("site")) {
            appSettings.getAppSettings().get("projects").get(compId).get("code");
        }
        */
        //model.addAttribute("data", objectMapper.writeValueAsString(appSettings.getAppSettings()));
        //model.addAttribute("dataString", objectMapper.writeValueAsString(appSettings.getAppSettings().get("currentProject").get("code").getTextValue()));
        //model.addAttribute("cldAppSettings", objectMapper.writeValueAsString(appSettings));
        model.addAttribute("currentProject",objectMapper.writeValueAsString(appSettings.getAppSettings().get("currentProject")));//TODO change to 'published project'
        return "widget";
    }



    // Set setting.vm
    private String viewSettings(Model model, Integer width, String instanceId, String locale, String origCompId, String compId) throws IOException {
        AppSettings appSettings = getSettings(instanceId, compId);
        //AppData cloudIdeData = getAppData(instanceId, compId);
        model.addAttribute("cldAppSettings", objectMapper.writeValueAsString(appSettings));
        return "settings";
    }

    // Set message.vm
    private String viewMessage(Model model, Integer width, String instanceId, String locale, String origCompId, String compId, String encodedMessage) throws IOException {
        AppSettings appSettings = getSettings(instanceId, compId);
        //AppData cloudIdeData = getAppData(instanceId, compId);
        model.addAttribute("message", objectMapper.writeValueAsString(URI.decodePath(encodedMessage)));
        return "message";
    }

    /**
     * Get settings from the DB if exists, otherwise return empty settings
     *
     * @param instanceId - the instance id
     * @param compId     - the appUpdate comp Id
     * @return appUpdate settings
     */
    private AppSettings getSettings(String instanceId, String compId) {
        AppSettings appSettings = appDao.getAppSettings(instanceId, compId);
        return appSettings;
    }

    private AppInstance createTestSignedInstance(String instanceId, @Nullable String userId, @Nullable String permissions) {
        try {
            UUID instanceUuid = UUID.fromString(instanceId);
            UUID userUuid = null;
            if (userId != null)
                userUuid = UUID.fromString(userId);
            return new AppInstance(instanceUuid, new DateTime(), userUuid, permissions);
        } catch (Exception original) {
            throw new ContollerInputException("Failed parsing instanceId [%s] or userId [%s].\nValid values are GUIDs of the form [aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa] or nulls (for userId)",
                    original, instanceId, userId);
        }
    }
}
