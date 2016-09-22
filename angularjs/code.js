
function progress_bar() {
    $scope.progress_bar = {};
    var totalTasks = 0, id = 0, tmpTask = angular.copy($scope.task.sub_tasks);

    for (var i = $scope.states.length - 1; i >= 0; i--) {
        $scope.progress_bar[$scope.states[i].id] = {count_task: 0 };
        for (var j = tmpTask.length - 1; j >= 0; j--) {
            if($scope.states[i].id == tmpTask[j].task_states_id) {
                tmpTask.splice(tmpTask.indexOf(tmpTask[j]), 1);
                $scope.progress_bar[$scope.states[i].id].count_task = $scope.progress_bar[$scope.states[i].id].count_task + 1;
                totalTasks++;
            }
        }
    }

    for(var r in $scope.progress_bar) {
        $scope.progress_bar[r].count_task = parseFloat((($scope.progress_bar[r].count_task/ totalTasks) * 100).toFixed(1));
    }

    console.log( $scope.progress_bar );
}
