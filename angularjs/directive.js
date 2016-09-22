app.directive('fileDownload', function() {
    return {
        restrict: 'E',
        templateUrl: './templates/file_uploader/download.html',
        scope: true,
        link: function(scope, element, attr) {
            var place = element.children()[0];

            scope.$on('download-start', function() {
                $(place).attr('disabled', 'disabled');
            });
            scope.$on('downloaded', function(event, data) {
                $(place).attr({
                    href: 'data:application/plain;base64,' + data,
                    download: attr.filename
                })
                    .removeAttr('disabled');

                var downloadLink = document.createElement('a');
                downloadLink.href = 'data:application/plain;base64,' + data;
                downloadLink.download = attr.filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
            });
        },
        controller: ['$scope', '$attrs', '$http',
            function($scope, $attrs, $http) {
            $scope.downloadFile = function() {
                $scope.$emit('download-start');
                $http.get('api/files/' + $attrs.url).then(function(response) {
                    $scope.$emit('downloaded', response.data);
                });
            };
        }]
    }});