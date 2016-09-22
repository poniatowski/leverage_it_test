/**
 * author: Marcin Galaszewski
 * date: 2015-04-10
 */

app.controller('CampaignsViewController', [
    '$scope', '$location', '$routeParams', '$modal', 'CampaignsService', 'CampaignsFactory', 'ModalsFactory', 'FilesFactory', 'FileUploader', 'config_upload',
function ($scope, $location, $routeParams, $modal, CampaignsService, CampaignsFactory, ModalsFactory, FilesFactory, FileUploader, config_upload)
{
    CampaignsFactory.showCampaign($routeParams.id).success(parseCampaign);

    function parseCampaign(data) {
        $scope.campaign           = data.campaign;
        $scope.admins             = data.admins;
        $scope.leader             = data.campaign.leader;
        $scope.managers           = data.managers;
        $scope.leads              = data.campaign.leads;
        $scope.potential_leads    = data.potential_leads;
        $scope.contacts           = data.contacts;
        $scope.potential_contacts = data.potential_contacts;

        // add files to the scope
        angular.forEach(data.campaign.files, function(file) {
            $scope.uploader.queue.push({'file': file, 'progress': 100, 'isSuccess': true, 'isUploaded': true });
        });
    }

    $scope.modalBox = {
        add_manager        : { title: 'Add new Manager', message: 'Are you sure you want to ADD new Manager?' },
        delete_manager     : { title: 'Delete Manager', message: 'Are you sure you want to DELETE Manager?'},
        del_update_manager : { title: 'Reassign Manager', message: "Are you sure you want to DELETE this Manager? \r\n This Manager has Leads which will need REASSIGNING, please SELECT the Manager you wish to ASSIGN to them"},
        update_leader      : { title: 'Update Leader', message: 'Are you sure you want to UPDATE Leader?'},
        cant_delete_leader : { title: 'Delete Leader', message: 'You can not DELETE Leader. If you want to delete this Leader, before that UPDATE Leader.'},
        add_lead           : { title: 'Add new Lead', message: 'Are you sure you want to ADD new Lead?' },
        delete_lead        : { title: 'Delete Lead', message: 'Are you sure you want to DELETE Lead?'},
        add_contact        : { title: 'Add new Contact', message: 'Are you sure you want to ADD new Contact?'},
        delete_contact     : { title: 'Delete Manager', message: 'Are you sure you want to DELETE Contact?'},
        delete             : { title: 'Delete Campaign', message: 'Are you sure you want to DELETE Campaign?'}
    };

    $scope.action = function(action, user) {
        switch(action) {
            case 'add_manager':
                CampaignsFactory.addCampaignManager($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'delete_manager':
                CampaignsFactory.deleteCampaignManager($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'update_leader':
                CampaignsFactory.updateCampaignLeader($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'add_lead':
                CampaignsFactory.addCampaignLead($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'delete_lead':
                CampaignsFactory.deleteCampaignLead($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'update_leads_manager':
                CampaignsFactory.updateLeadsManager($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'add_contact':
                CampaignsFactory.addCampaignContact($routeParams.id, user).success(successData).error(errorData);
                break;
            case 'delete_contact':
                CampaignsFactory.deleteCampaignContact($routeParams.id, user).success(successData).error(errorData);
                break;
        }
    };

    var successData = function (data) {
        if(data.alert.type != 'danger') {
            $scope.success = data.alert;
        }
        else {
            $scope.errors = data.alert;
        }
    };

    var errorData = function (data) {
        $scope.errors = data.alert;
    };

    // add new participant to campaign (manager, lead, contact)
    $scope.participant = function (action, remove, add, participant) {
        this.newParticipant = null;

        $scope[add].push($scope[remove][$scope[remove].indexOf(participant)]); // add participant to table
        $scope[remove].splice($scope[remove].indexOf(participant), 1); // remove participant from the select list

        if(action.substr(0, 3) == 'add') { // do this is action is add
            this.newParticipant = {
                user_id : participant.id,
                token   : $('meta[name="token"]').attr('content')
            };
        } else { // run this code if action is delete
            this.newParticipant = participant.id;
        }

        $scope.action(action, this.newParticipant); // update information in db
    };

    // add new campaign lead
    $scope.addLead = function (participant, manager) {
        this.lenPotentialLead = $scope.potential_leads.length;

        for (var i = 0; i < this.lenPotentialLead; i++) {
            if ($scope.potential_leads[i].id == participant.id) {
                $scope.leads.push($scope.potential_leads[i]);
                $scope.campaign.leads_pivot[$scope.leads.length-1] = {
                    campaign_manager: {
                        user : manager
                    }
                };
                $scope.potential_leads.splice(i,1);
                this.newLead = {
                    user_id             : participant.id,
                    campaign_manager_id : manager.id,
                    token               : $('meta[name="token"]').attr('content')
                };

                $scope.action('add_lead', this.newLead);
                break;
            }
        }
    };

    // update campaign leader
    $scope.addLeader = function ( leader ) {
        $scope.managers.splice($scope.managers.indexOf(leader), 1); // remove old leader
        $scope.managers = $scope.leader.concat($scope.managers); // combine leader with managers into one object
        $scope.leader.pop(); // clean object
        $scope.leader.push(leader); // add new leader

        $scope.action('update_leader', leader.id); // send request to save new leader in db
    };

    // modal box with add new campaign lead
    $scope.addLeadAlert = function () {
        var self = $scope;

        $modal.open({
            templateUrl: './templates/modals/campaigns/add_lead.html',
            controller: function ($scope, $modalInstance) {
                $scope.user_id         = '';
                $scope.potential_leads = self.potential_leads;
                $scope.managersModal   = self.leader.concat(self.managers);
                $scope.tooltip         = {
                    managers : "Please select Campaign Manager.",
                    lead     : "Please select Campaign Lead."
                };
                $scope.content = self.modalBox.add_lead;
                $scope.save = function () {
                    self.addLead($scope.lead_id, $scope.manager_id);
                    $modalInstance.close();
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            },
            size: 'lg'
        });
    };

    // modal box with change leader
    $scope.addLeaderAlert = function ( leader ) {
        $scope.modal = ModalsFactory.smModal(
            './templates/modals/campaigns/add_confirmation.html',
            'sm',
            $scope.modalBox.update_leader
        );

        var modalInstance = $modal.open($scope.modal);
        modalInstance.result.then(function () {
            // change campaign leader
            $scope.addLeader( leader );
        });
    };

    // modal box with adding a new participant
    $scope.confirmAlert = function (action, remove, add, participant) {
        $scope.modal = ModalsFactory.smModal(
            './templates/modals/campaigns/add_confirmation.html',
            'sm',
            $scope.modalBox[action]
        );

        var modalInstance = $modal.open($scope.modal);
        modalInstance.result.then(function () {
            // add new manager, lead, contact
            $scope.participant(action, remove, add, participant);
        });
    };

    // modal box with delete leader
    $scope.deleteLeader = function () {
        $scope.modal = ModalsFactory.smModal(
            './templates/modals/campaigns/delete_leader.html',
            'sm',
            $scope.modalBox['cant_delete_leader']
        );
        $modal.open($scope.modal);
    };

    // modal boxes with delete manager
    $scope.deleteManager = function (action, remove, add, participant) {
        var leadsLength = $scope.campaign.leads_pivot.length,
            hasLeads = false;

        for (var i = 0; i < leadsLength; i++) {
            if ($scope.campaign.leads_pivot[i].campaign_manager.user.id == participant.id) {
                hasLeads = true;
                break;
            }
        }

        if(hasLeads) {
            var self = $scope,
                tmpManagerList = [];

            // remove this manager from temporary managers array which we display in modal box
            angular.copy($scope.managers, tmpManagerList);
            tmpManagerList.splice($scope.managers.indexOf(participant), 1);

            // show new managers
            var modalInstance = $modal.open({
                templateUrl: './templates/modals/campaigns/delete_manager.html',
                controller: function ($scope, $modalInstance) {
                    $scope.newManagers = self.leader.concat(tmpManagerList); // put leader and all managers into on object
                    var jsonManager = null;
                    $scope.tooltip     = {
                        managers : "Please select Campaign Manager."
                    };
                    $scope.content = self.modalBox.del_update_manager;
                    $scope.save = function () {
                        jsonManager = $scope.new_manager;
                        var newLeadsManager = {
                            old_manager_id : participant.id,
                            new_manager_id : jsonManager.id,
                            token          : $('meta[name="token"]').attr('content')
                        };
                        // reassign new manager
                        CampaignsFactory.updateLeadsManager($routeParams.id, newLeadsManager).success($scope.reassignManager).error(errorData);
                        $modalInstance.close();
                    };
                    $scope.reassignManager = function() {  // update new manager for leads
                        self.participant('delete_manager', remove, add, participant); // delete old manager from manager table
                        for (var i = 0; i < leadsLength; i++) {
                            if (self.campaign.leads_pivot[i].campaign_manager.user.id == participant.id) {
                                self.campaign.leads_pivot[i].campaign_manager.user = jsonManager;
                            }
                        }
                    };
                    $scope.cancel = function () {
                        $modalInstance.dismiss('cancel');
                    };
                },
                size: 'lg'
            });
        } else {
            // show confirmation to straight manager delete
            $scope.confirmAlert(action, remove, add, participant);
        }
    };

    // modal box with deleting a campaign
    $scope.deleteCampaignAlert = function () {
        $scope.modal = ModalsFactory.smModal(
            './templates/modals/campaigns/add_confirmation.html',
            'sm',
            $scope.modalBox.delete
        );

        var modalInstance = $modal.open($scope.modal);
        modalInstance.result.then(function () {
            // delete campaign
            CampaignsFactory.deleteCampaign($routeParams.id).success(function(){
                    $location.path("campaigns");
                }
            ).error(function(data){
                    $scope.alerts = data.error
                });
        });
    };

    // file uploader
    $scope.uploader = new FileUploader({
        url: '/api/files',
        headers : {
            'X-CSRF-TOKEN': document.querySelector('meta[name="token"]').getAttribute('content')
        },
        formData: [{
            id: $routeParams.id,
            action: 'Campaign'
        }],
        filters: []
    });

    // filter with file extensions
    $scope.uploader.filters.push({
        name: 'documentFilter', fn: function(item) {
            var type = '|' + item.name.slice(item.name.lastIndexOf('.')+1) + '|';
            return'|pdf|txt|doc|docx|xlsx|pptx|rtf|'.indexOf(type) !== -1;
        }});

    // filters with file size
    $scope.uploader.filters.push({
        name: 'sizeFilter', fn: function(item) {
            return item.size < config_upload.size.doc;
        }});

    // add a file to the scope
    $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
        var lastAddedFileId = $scope.uploader.queue.indexOf(fileItem);
        $scope.uploader.queue[lastAddedFileId].file.id = response.data.id;
    };

    // delete a file from db and remove this file from scope
    $scope.deleteFile = function( item ) {
        $scope.uploader.removeFromQueue(item);
        FilesFactory.deleteFile(item.file.id).success(successData).error(errorData); // send ajax in order to remove this file from db and srv
    };

}]);