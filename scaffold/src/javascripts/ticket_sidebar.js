import View from 'view';
import Storage from 'storage';
import I18n from 'i18n';


class TicketSidebar {
  constructor(client, data) {
    this.client = client;
    this._metadata = data.metadata;
    this._context = data.context;
    this.storage = new Storage(this._metadata.installationId);
    this.view = new View({ afterRender: () => {
      this.getCurrentUser().then(this.renderMain.bind(this));
      client.invoke('resize', { width: '318px', height: '260px' });
      client.get('ticket').then(function (data) {
        var ticketID = data.ticket.id;
        var getTicket = {
          url: '/api/v2/tickets/' + ticketID + '.json',
          type: 'GET',
          dataType: 'json'
        };
        client.request(getTicket).then(function (data) {
          var requesterID = data.ticket.requester_id;
          var getRequester = {
            url: '/api/v2/users/' + requesterID + '.json',
            type: 'GET',
            dataType: 'json'
          };
          var $ticketRequester = $('#requester');
          var $ticketRequesterEmail = $('#requester-email');
          var $requesterImage = $('#requester-image');
          client.request(getRequester).then(function (data) {
            var requesterName = data.user.name;
            var requesterEmail = data.user.email;
            var requesterPhoto = data.user.photo;
            var requesterAvatar;
            if (requesterPhoto === null) {
              requesterAvatar = 'https://i0.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png';
            } else {
              requesterAvatar = requesterPhoto.content_url;
            }
            $ticketRequester.text(requesterName);
            $ticketRequesterEmail.text(requesterEmail);
            $requesterImage.attr('src', requesterAvatar);
            $('.spinner').hide();
            $('.hidden').removeClass('hidden');
          });
          var $menuButtonContent = $('.menu-btn-content');
          var $menuButton = $('.menu-btn');
          var collaboratorIDs = data.ticket.collaborator_ids;
          if (collaboratorIDs.length < 1) {
            $menuButton.prop('disabled', true);
            $menuButtonContent.text(I18n.t("no-ccs"));
          }
          var ticketStatus = data.ticket.status;
          if (ticketStatus == 'closed') {
            $menuButton.prop('disabled', true);
            $menuButtonContent.text(I18n.t("closed-ticket"));
          }
          var $ticketCollaborators = $('#collaborators');
          var $menuButtonImage = $('#button-image');
          var $menu = $('.menu');
          ga('create', 'UA-87663201-1', 'auto');
          ga('set', 'checkProtocolTask', function (){});
          ga('require', 'displayfeatures');
          ga('send', {
            hitType: 'event',
            eventCategory: 'Usage',
            eventAction: 'Use',
            eventLabel: 'Active User'
          });
          var collaborators = [];
          _.each(collaboratorIDs, function (collaboratorID) {
            var getCC = {
              url: '/api/v2/users/' + collaboratorID + '.json',
              type: 'GET',
              dataType: 'json'
            };
            client.request(getCC).then(function (data) {
              var collaboratorID = data.user.id;
              var collaboratorName = data.user.name;
              var collaboratorEmail = data.user.email;
              var collaboratorPhoto = data.user.photo;
              var collaboratorAvatar;
              if (collaboratorPhoto === null) {
                collaboratorAvatar = 'https://i0.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png';
              } else {
                collaboratorAvatar = collaboratorPhoto.content_url;
              }
              var collaboratorObject = {
                id: collaboratorID,
                name: collaboratorName,
                email: collaboratorEmail,
                avatar: collaboratorAvatar,
              };
              collaborators.push(collaboratorObject);
            });
          });
          var $checkbox = $('#checkbox');
          var $submitButton = $('#submit_change');
          $menuButton.click(function () {
            var collaboratorsSorted = _.sortBy(collaborators, 'name');
            var collaboratorsNumber = collaboratorsSorted.length;
            _.each(collaboratorsSorted, function (index) {
              var collaboratorObjectName = index.name;
              var collaboratorObjectID = index.id;
              var collaboratorObjectEmail = index.email;
              var collaboratorObjectAvatar = index.avatar;
              var collaboratorsLi = $('.menu__item').length;
              if (collaboratorsLi < collaboratorsNumber) {
                $ticketCollaborators.append($(`
                  <li class="menu__item" id="${collaboratorObjectID}">
                    <figure class="c-avatar c-avatar--small"><img id="${collaboratorObjectID}-img" alt="user" src="${collaboratorObjectAvatar}"></figure>
                    <span class="menu-li-content" id="${collaboratorObjectID}-span" value="${collaboratorObjectID}">${collaboratorObjectName}</span>
                  </li>
                  <li class="c-tooltip tooltip_${collaboratorObjectID}" style="display: none;">${collaboratorObjectEmail}</li>
                  <li class="c-arrow arrow_${collaboratorObjectID}" style="display: none;"></li>`).attr('role', 'menuitem').attr('id', collaboratorObjectID));
              }
            }); 
            $menu.toggle();
            var $menuItem = $('.menu__item');
            $menuItem.hover(function() {
              var collaboratorID = $(this).attr('id');
              $('.tooltip_' + collaboratorID).css('display', 'inline-block');
              $('.arrow_' + collaboratorID).css('display', 'block');
            }, function() {
              var collaboratorID = $(this).attr('id');
              $('.tooltip_' + collaboratorID).hide();
              $('.arrow_' + collaboratorID).hide();
            });
            $menuItem.click(function () {
              var collaboratorID = $(this).attr('id');
              var collaboratorName = $(this).text();
              var collaboratorAvatar = $('#' + collaboratorID + 'img').attr('src');
              $menuButtonContent.attr('id', collaboratorID);
              $('#button-image').attr('src', collaboratorAvatar);
              $menuButtonContent.text(collaboratorName);
              $menu.hide();
              $checkbox.prop('disabled', false);
              $submitButton.prop('disabled', false);
            });
            $(document).mouseup(function (e) {
              if (!$menuButton.is(e.target) && !$menuButtonContent.is(e.target) && !$menuButtonImage.is(e.target) && !$('.menu-btn-icon-arrow-down').is(e.target) && !$('ul').is(e.target) && !$('li').is(e.target) && $menu.is(':visible')) {
                $menu.hide();
                $menuButtonImage.attr('src', 'https://i0.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png');
                $menuButtonContent.text('').attr('id', '');
                $checkbox.prop('disabled', true);
                $submitButton.prop('disabled', true);
              }
            });
           $(document).keyup(function (e) {
              if (e.keyCode == 27 && $menu.is(':visible')) {
                $menu.hide();
                $menuButtonImage.attr('src', 'https://i0.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png');
                $menuButtonContent.text('').attr('id', '');
                $checkbox.prop('disabled', true);
                $submitButton.prop('disabled', true);
              }
            });
           });
          $submitButton.click(function () {
            var selectedCC = $menuButtonContent.attr('id');
            var selectedCCValue = Number(selectedCC);
            var requesterArray = [];
            requesterArray.push(requesterID);
            var collaboratorsAndRequesterArray = _.union(requesterArray, collaboratorIDs);
            var collaboratorsArrayAdd = _.without(collaboratorsAndRequesterArray, selectedCCValue);
            var collaboratorsArrayRemove = _.without(collaboratorIDs, selectedCCValue);
            var ccCurrentRequester = $('#checkbox').is(':checked');
            var changeRequester = {
              url: '/api/v2/tickets/' + ticketID + '.json',
              type: 'PUT',
              contentType: 'application/json',
              data: '{"ticket": {"requester_id": ' + selectedCCValue + '}}'
            };
            var addCC = {
              url: '/api/v2/tickets/' + ticketID + '.json',
              type: 'PUT',
              contentType: 'application/json',
              data: '{"ticket": {"collaborator_ids": [' + collaboratorsArrayAdd + ']}}'
            };
            var removeCC = {
              url: '/api/v2/tickets/' + ticketID + '.json',
              type: 'PUT',
              contentType: 'application/json',
              data: '{"ticket": {"collaborator_ids": [' + collaboratorsArrayRemove + ']}}'
            };
            if (ccCurrentRequester === true) {
              client.request(addCC).then(function() {
                client.request(changeRequester);
              });
              ga('create', 'UA-87663201-1', 'auto');
              ga('set', 'checkProtocolTask', function(){});
              ga('require', 'displayfeatures');
              ga('send', {
                hitType: 'event',
                eventCategory: 'Swith',
                eventAction: 'Keep Requester CCd',
                eventLabel: 'Keep Requester CCd'
              });
            } else if (ccCurrentRequester !== true) {
              client.request(changeRequester).then(function() {
                client.request(removeCC);
              });
            }
          });
        });
      });
      client.on('ticket.updated', function () {
        window.location.reload(true);
        ga('send', {
          hitType: 'event',
          eventCategory: 'Swith',
          eventAction: 'CC Switched',
          eventLabel: 'CC Switched'
        });
      });
    }});
  }
  getCurrentUser() {
    return this.client.request({ url: '/api/v2/users/me.json' });
  }
  renderMain(data) {
    this.view.switchTo('main', data.user);
  }
}


export default TicketSidebar;
