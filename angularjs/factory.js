/**
 * author: Marcin Galaszewski
 * date: 2015-04-08
 */

app.factory('CampaignsFactory', ['$http', function($http)
{
    var CampaignsFactory = {};
    var url_campaign     = 'api/campaigns';
    var url_lead         = 'campaign_leads';
    var url_contact      = 'campaign_contacts';
    var token            = { headers: { 'Content-Type' : 'application/x-www-form-urlencoded', 'X-CSRF-Token' : $('meta[name="token"]').attr('content') }};

    CampaignsFactory.indexCampaigns = function () {
        return $http.get(url_campaign);
    };

    CampaignsFactory.createCampaign = function () {
        return $http.get(url_campaign +'/'+ 'create');
    };

    CampaignsFactory.storeCampaign = function (campaign) {
        return $http.post(url_campaign, $.param(campaign), token);
    };

    CampaignsFactory.showCampaign = function (id) {
        return $http.get(url_campaign +'/'+ id);
    };

    CampaignsFactory.deleteCampaign = function (id) {
        return $http.delete(url_campaign +'/'+ id);
    };

    CampaignsFactory.editCampaign = function (id) {
        return $http.get(url_campaign +'/'+ 'edit/' + id);
    };

    CampaignsFactory.updateCampaign = function (campaign) {
        return $http.put(url_campaign +'/'+ campaign.id, $.param(campaign), token)
    };

    CampaignsFactory.addCampaignCategory = function (campaign_type) {
        return $http.post('api/campaign_categories', $.param(campaign_type), token);
    };

    CampaignsFactory.addCampaignState = function (campaign_state) {
        return $http.post('api/campaign_states', $.param(campaign_state), token);
    };

    // managers part
    CampaignsFactory.addCampaignManager = function (campaign_id, campaign_manager) {
        return $http.post(url_campaign + '/' + campaign_id + '/campaign_managers', $.param(campaign_manager), {
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded', 'X-CSRF-Token' : $('meta[name="token"]').attr('content') },
            ignoreLoadingBar: true
        });
    };

    CampaignsFactory.deleteCampaignManager = function (campaign_id, user_id) {
        return $http.delete(url_campaign + '/' + campaign_id + '/campaign_managers/' + user_id, {
            ignoreLoadingBar: true
        });
    };

    CampaignsFactory.updateCampaignLeader = function (campaign_id, new_leader_id) {
        return $http.get(url_campaign + '/' + campaign_id + '/update_leader/' + new_leader_id, {
            ignoreLoadingBar: true
        });
    };

    // leads part
    CampaignsFactory.addCampaignLead = function (campaign_id, campaign_lead) {
        return $http.post(url_campaign + '/' + campaign_id + '/' + url_lead, $.param(campaign_lead), {
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded', 'X-CSRF-Token' : $('meta[name="token"]').attr('content') },
            ignoreLoadingBar: true
        });
    };

    CampaignsFactory.deleteCampaignLead = function (campaign_id, lead_id) {
        return $http.delete(url_campaign + '/' + campaign_id + '/' + url_lead + '/' + lead_id, {
            ignoreLoadingBar: true
        });
    };

    // contacts part
    CampaignsFactory.addCampaignContact = function (campaign_id, campaign_contact) {
        return $http.post(url_campaign + '/' + campaign_id + '/' + url_contact, $.param(campaign_contact), {
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded', 'X-CSRF-Token' : $('meta[name="token"]').attr('content') },
            ignoreLoadingBar: true
        });
    };

    CampaignsFactory.deleteCampaignContact = function (campaign_id, contact_id) {
        return $http.delete(url_campaign + '/' + campaign_id + '/' + url_contact + '/' + contact_id, {
            ignoreLoadingBar: true
        });
    };

    return CampaignsFactory;

}]);
