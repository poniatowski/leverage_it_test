/**
 * author: Marcin Galaszewski
 * date: 2015-03-27
 * angularjs dates filter
 */

angular.module('filters',[])
    .filter('datesFilter', ['$filter', function($filter){
        return function(input, startDate, endDate, columnName) {
            this.datesFilter = {};
            this.datesFilter.createDate = function(date) {
                this.newDate = $filter('date')(date, 'yyyy-MM-dd');
                return this.newDate.substring(0, 10);
            };

            this.datesFilter.main = function() {
                var result = [];
                var pivot = null;
                var filterFrom = null;
                var filterTo = null;

                angular.forEach(input, function(obj) {
                    if (obj[columnName] != null) {
                        pivot = this.datesFilter.createDate(obj[columnName]);
                        if (startDate != null) filterFrom = this.datesFilter.createDate(startDate);
                        if (endDate != null) filterTo = this.datesFilter.createDate(endDate);

                        if (startDate && endDate) {
                            if (pivot >= filterFrom && filterTo >= pivot) {
                                result.push(obj);
                            }
                        } else if (startDate) {
                            if (pivot >= filterFrom) {
                                result.push(obj);
                            }
                        } else if (endDate) {
                            if (pivot <= filterTo) {
                                result.push(obj);
                            }
                        }
                    }
                });

                if (startDate != null || endDate != null) return result;
                else return input;
            };

            return this.datesFilter.main();
        };

    }]);