const {dialog} = require('electron').remote;
var fs = require('fs');
var progress = require('request-progress');
var url = require('url');

angular.module('app2', ['AxelSoft']).controller('mainController', ['$scope', '$http', function ($scope, $http) {
    $scope.link = "";
    $scope.mainFolderAjaxPattern = "?ajax&id=4FI0qr5VKzqiHVHqz79zMc&folder=";
    $scope.selectedDirectory = '';

    $scope.seasons = [];
    $scope.translations = [];
    $scope.translationsAuthors = [];
    $scope.videoQuality = [];
    $scope.fileList = [];

    $scope.autocompleteItems = [];
    $scope.autocompleteSelectedItem = null;
    $scope.error = '';

    $scope.level1Options = function (item) {
        $scope.getMainFolder2();
    };

    $scope.clear = function() {
        $scope.error = '';
        $scope.seasons = [];
        $scope.translations = [];
        $scope.translationsAuthors = [];
        $scope.videoQuality = [];
        $scope.fileList = [];
    };

    $scope.searchAsync = function (term) {
        if (term.length < 2) {
            return;
        }

        var searchLink = "http://fs.to/search.aspx?f=quick_search&search=" + term;
        return $.getJSON(searchLink);
    };

    $scope.getMainFolder2 = function() {
        $scope.link = 'http://fs.to' + $scope.autocompleteSelectedItem.link;
        var link = $scope.link + $scope.mainFolderAjaxPattern + '0';
        $.get(link).then(function (data) {
            $scope.error = '';
            $scope.seasons = [];
            $scope.translations = [];
            $scope.translationsAuthors = [];
            $scope.videoQuality = [];
            $scope.fileList = [];
            var vals = $(data).find('.link-simple');

            function tryResolveError(problemElement) {
                var el = problemElement.find('.link-subtype');

                if (el.length != 0) {
                    $scope.getTranslations(0);
                    return true;
                }

                return false;
            }

            if (vals.length == 0) {
                if (tryResolveError($(data))) {
                    return;
                }
                $scope.error = $(data).text();
            } else {
                $.each(vals, function (index, elem) {
                    var el = $(elem);
                    var season = {name: el.text(), folder: el.attr('name').substring(2)};
                    $scope.seasons.push(season);
                });
            }

            $scope.$apply();
        });
    };

    $scope.getTranslations = function (folderId) {
        var link = $scope.link + $scope.mainFolderAjaxPattern + folderId;
        $.get(link).then( function(data) {
            $scope.translations = [];
            $scope.translationsAuthors = [];
            $scope.videoQuality = [];
            $scope.fileList = [];
            var vals = $(data).find('.link-subtype');
            $.each(vals, function (index, elem) {
                var el = $(elem);
                var season = {name: el.text(), folder: el.attr('name').substring(2)};
                $scope.translations.push(season);
            });
            $scope.$apply();
        });
    };

    $scope.getTranslationAuthors = function (folderId) {
        var link = $scope.link + $scope.mainFolderAjaxPattern + folderId;
        $.get(link).then( function(data) {
            $scope.translationsAuthors = [];
            $scope.videoQuality = [];
            $scope.fileList = [];
            var vals = $(data).find('.link-subtype');
            $.each(vals, function (index, elem) {
                var el = $(elem);
                var season = {name: el.text(), folder: el.attr('name').substring(2)};
                $scope.translationsAuthors.push(season);
            });
            $scope.$apply();
        });
    };

    $scope.getVideoQuality = function (folderId) {
        var link = $scope.link + $scope.mainFolderAjaxPattern + folderId;
        $.get(link).then( function(data) {
            $scope.videoQuality = [];
            $scope.fileList = [];
            var vals = $(data).find('.video-qulaity');
            $.each(vals, function (index, elem) {
                var el = $(elem);
                var val = el.text();

                var contains = $scope.videoQuality.indexOf(val) > -1;
                if (!contains) {
                    $scope.videoQuality.push(val);
                }
            });
            $scope.$apply();
        });
    };

    $scope.getFileList = function (folderId) {
        var link = $scope.link + $scope.mainFolderAjaxPattern + folderId;
        $.get(link).then( function(data) {
            $scope.fileList = [];
            var files = $(data).find('.b-file-new');

            var tt = files.filter(function (index, elem) {
                var s = $(elem).find(".video-qulaity").text();
                return s === $scope.selectedQuality;
            });

            var pattern = files.find(".video-qulaity:contains('" + $scope.selectedQuality + "')");

            $.each(tt, function (index, elem) {
                var el = $(elem);
                var filename = el.find('.b-file-new__link-material-filename-text').text();
                var fileSize = el.find('.b-file-new__link-material-size').text();
                var series = el.find('.b-file-new__link-material-filename-series-num').text();
                series = series.length == 0 ? filename : series;

                var dl = el.find('.b-file-new__link-material-download').attr('href');
                var file = {
                    name: filename.trim(),
                    seiresName: series,
                    link: 'http://www.fs.to' + dl,
                    size: fileSize,
                    percentage: 0
                };
                $scope.fileList.push(file);
            });
            $scope.$apply();
        });
    };

    $scope.selectedSeason = null;
    $scope.selectSeason = function (item) {
        $scope.selectedSeason = item;
        $scope.getTranslations(item.folder);
    };

    $scope.selectedTranslation = null;
    $scope.selectTranslation = function (item) {
        $scope.selectedTranslation = item;
        $scope.getTranslationAuthors(item.folder);
    };

    $scope.selectedTranslationAuthor = null;
    $scope.selectTranslationAuthor = function (item) {
        $scope.selectedTranslationAuthor = item;
        $scope.getVideoQuality(item.folder);
    };

    $scope.selectedQuality = null;
    $scope.selectQuality = function (item) {
        $scope.selectedQuality = item;
        $scope.getFileList($scope.selectedTranslationAuthor.folder);
    };

    $scope.getQuickSearch = function () {
        var searchLink = "http://fs.to/search.aspx?f=quick_search&search=" + "рик";
        $.getJSON(searchLink, function (data) {
            $scope.autocompleteItems = [];
            $.each(data, function (key, value) {
                value.poster = 'http:' + value.poster;
                $scope.autocompleteItems.push(value);
            });
            $scope.$apply();
        })
    };

    $scope.fileNameChanged = function (folder) {
        var files = folder;
        $scope.selectedDirectory = folder;
    };

    $scope.getAll = function (dir, files) {
        files.forEach(function (item) {
            var request = require('request');
            var req = progress(request(item.link));

            req.on('progress', function (state) {
                item.percentage =(state.percentage * 100).toFixed(1);
                $scope.$apply();
            });

            req.on('end', function () {
                item.percentage = 100;
                $scope.$apply();
            });

            req.pipe(fs.createWriteStream(dir + '\\' + item.name));
        });
    };

    $scope.downloadAll = function (el) {
        dialog.showOpenDialog({properties: ['openDirectory']}, function (res) {
            $scope.selectedDirectory = res;
            var f = $scope.fileList[0];

            $scope.getAll(res, $scope.fileList);
        });
    };
}]);















