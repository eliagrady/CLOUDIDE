package com.wixpress.app.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.wixpress.app.dao.AppDao;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;

/**
 * Created by Elia on 15/01/2015.
 */
@RestController
public class FileController {

    @Resource
    private AppDao appDao;

    @RequestMapping("/js")
    public JsonNode greeting(
            @RequestParam(value="name", defaultValue="test") String instanceId,
            @RequestParam(value="name", defaultValue="test") String compId) {
        return getAppProjectCode(instanceId, compId);
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

    @RequestMapping(value="/static/{instanceId}/{compId}")
    public ModelAndView getJavascriptFile(@PathVariable String instanceId,
                                          @PathVariable String compId,
                                          HttpServletResponse response) {
        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setViewName("javascriptTemplate");
        JsonNode appProject = appDao.getAppProjectCode(instanceId, compId);
        //TODO debug appProject - should it be parsed here?


        String json = "var app = angular.module('cld', [])\n" +
                "    .factory('Service', function ($http) {\n" +
                "        return {\n" +
                "            saveCode: function (code, compId) {\n" +
                "                $http.post('/app/save', {\n" +
                "                    compId: compId,\n" +
                "                    settings: {\n" +
                "                        appSettings: {\n" +
                "                            currentProject: {\n" +
                "                                name: 'Test project',\n" +
                "                                modified: new Date(),\n" +
                "                                code: $.base64.encode(code)\n" +
                "                            }\n" +
                "                        }\n" +
                "                    }\n" +
                "                })\n" +
                "            },\n" +
                "            getProject:function(){\n" +
                "                return currentProject;\n" +
                "            }\n" +
                "        }\n" +
                "    })\n" +
                "    .controller('testCtrl', function ($scope, Service) {\n" +
                "\n" +
                "        $scope.code= $.base64.decode(settings.appSettings.currentProject.code);\n" +
                "        $scope.saveCode = function (code) {\n" +
                "            Service.saveCode(code, '');\n" +
                "        }\n" +
                "    })\n" +
                "    .controller('widgetCtrl', function ($scope, Service) {\n" +
                "\n" +
                "        $scope.model={\n" +
                "            project:Service.getProject()\n" +
                "        };\n" +
                "\n" +
                "        $scope.saveCode = function (code) {\n" +
                "            Service.saveCode(code, '');\n" +
                "        }\n" +
                "    })\n" +
                "\n" +
                "\n" +
                "\n" +
                "    .directive('htmlContent', function () {\n" +
                "        return {\n" +
                "            scope: {\n" +
                "                htmlContent: '='\n" +
                "            },\n" +
                "            link: function (scope, elem) {\n" +
                "                scope.$watch('htmlContent', function (newValue) {\n" +
                "                    elem.html(newValue);\n" +
                "                });\n" +
                "            }\n" +
                "        }\n" +
                "    });\n";
        response.setContentType("application/javascript");
        modelAndView.addObject("data", json);
        return modelAndView;
    }
}
