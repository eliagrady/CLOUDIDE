var app = angular.module('cld', [])
    .factory('Service', function ($http) {
        return {
            saveCode: function (code, compId) {
                $http.post('/app/save', {
                    compId: compId,
                    settings: {
                        appSettings: {
                            currentProject: {
                                name: 'Test project',
                                modified: new Date(),
                                code: $.base64.encode(code)
                            }
                        }
                    }
                })
            },
            getProject:function(){
                return currentProject;
            }
        }
    })
    .controller('testCtrl', function ($scope, Service) {

        $scope.code= $.base64.decode(settings.appSettings.currentProject.code);
        $scope.saveCode = function (code) {
            Service.saveCode(code, '');
        }
    })
    .controller('widgetCtrl', function ($scope, Service) {

        $scope.model={
            project:Service.getProject()
        };

        $scope.saveCode = function (code) {
            Service.saveCode(code, '');
        }
    })



    .directive('htmlContent', function () {
        return {
            scope: {
                htmlContent: '='
            },
            link: function (scope, elem) {
                scope.$watch('htmlContent', function (newValue) {
                    elem.html(newValue);
                });
            }
        }
    });
