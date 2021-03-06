/*
* TODO: Add comments
* TODO: Cache jQuery lookups
* TODO: Make gAnalytics function
*/

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
      this.client.invoke('resize', { height: '260px', width: '100%' });
      client.get('ticket').then(function (data) {
        let ticketID = data.ticket.id;
        let getTicket = {
          url: `/api/v2/tickets/${ticketID}.json`,
          type: 'GET',
          dataType: 'json'
        };
        client.request(getTicket).then(function (data) {
          let requesterID = data.ticket.requester_id;
          let getRequester = {
            url: `/api/v2/users/${requesterID}.json`,
            type: 'GET',
            dataType: 'json'
          };
          let $ticketRequester = $('#requester');
          let $ticketRequesterEmail = $('#requester-email');
          let $requesterImage = $('#requester-image');
          client.request(getRequester).then(function (data) {
            let requesterName = data.user.name;
            let requesterEmail = data.user.email;
            let requesterPhoto = data.user.photo;
            let requesterRole = data.user.role;
            let requesterAvatar;
            if (requesterPhoto === null) {
              requesterAvatar = 'https://aculligan.github.io/CDN/Universal_App_Assets/img/Zendesk-brand-assets/default-avatar.png';
            } else {
              requesterAvatar = requesterPhoto.content_url;
            }
            $ticketRequester.text(requesterName);
            $ticketRequesterEmail.text(requesterEmail);
            $requesterImage.attr('src', requesterAvatar);
            if (requesterRole !== 'end-user') {
              $('.avatar-badge').show();
            }
            $('.spinner').hide();
            $('.main-app').removeClass('hidden');
          });
          let $menuButtonContent = $('.menu-btn-content');
          let $menuButton = $('.menu-btn');
          let collaboratorIDs = data.ticket.collaborator_ids;
          if (collaboratorIDs.length < 1) {
            $menuButton.prop('disabled', true);
            $menuButtonContent.text(I18n.t('no-ccs'));
            $('.main-app').addClass('hidden');
          }
          let ticketStatus = data.ticket.status;
          if (ticketStatus === 'closed') {
            $menuButton.prop('disabled', true);
            $menuButtonContent.text(I18n.t('closed-ticket'));
          }
          let $ticketCollaborators = $('.menu');
          let $menuButtonImage = $('.menu-btn .c-avatar__img');
          let $menu = $('.menu');
          /*ga('create', 'UA-87663201-1', 'auto');
          ga('set', 'checkProtocolTask', function (){});
          ga('require', 'displayfeatures');
          ga('send', {
            hitType: 'event',
            eventCategory: 'Usage',
            eventAction: 'Use',
            eventLabel: 'Active User'
          });*/
          let collaborators = [];
          _.each(collaboratorIDs, function (collaboratorID) {
            let getCC = {
              url: `/api/v2/users/${collaboratorID}.json`,
              type: 'GET',
              dataType: 'json'
            };
            client.request(getCC).then(function (data) {
              let collaboratorID = data.user.id;
              let collaboratorName = data.user.name;
              let collaboratorEmail = data.user.email;
              let collaboratorPhoto = data.user.photo;
              let collaboratorRole = data.user.role;
              let collaboratorAvatar;
              if (collaboratorPhoto === null) {
                collaboratorAvatar = 'https://aculligan.github.io/CDN/Universal_App_Assets/img/Zendesk-brand-assets/default-avatar.png';
              } else {
                collaboratorAvatar = collaboratorPhoto.content_url;
              }
              let collaboratorObject = {
                id: collaboratorID,
                name: collaboratorName,
                email: collaboratorEmail,
                avatar: collaboratorAvatar,
                role: collaboratorRole
              };
              collaborators.push(collaboratorObject);
            });
          });
          let $checkbox = $('.c-chk__input');
          let $submitButton = $('.submit-btn');
          $menuButton.click(function () {
            let collaboratorsSorted = _.sortBy(collaborators, 'name');
            let collaboratorsNumber = collaboratorsSorted.length;
            _.each(collaboratorsSorted, function (index) {
              let collaboratorObjectName = index.name;
              let collaboratorObjectID = index.id;
              let collaboratorObjectEmail = index.email;
              let collaboratorObjectAvatar = index.avatar;
              let collaboratorObjectRole = index.role;
              let collaboratorBadgeVisble;
              if (collaboratorObjectRole !== 'end-user') {
                collaboratorBadgeVisble = 'badge-visible';
              } else {
                collaboratorBadgeVisble = '';
              }
              let collaboratorsLi = $('.menu__item').length;
              if (collaboratorsLi < collaboratorsNumber) {
                $ticketCollaborators.append($(`
                  <li class="menu__item c-menu__item" id="${collaboratorObjectID}" badge="${collaboratorBadgeVisble}">
                    <figure class="c-avatar c-avatar--small"><img class="c-avatar__img" id="${collaboratorObjectID}-img" alt="user" src="${collaboratorObjectAvatar}"></figure>
                    <img class="collaborator-badge ${collaboratorBadgeVisble}" src="https://aculligan.github.io/CDN/Universal_App_Assets/img/Zendesk-brand-assets/agent-badge.svg">
                    <span class="menu-li-content" id="${collaboratorObjectID}-span" value="${collaboratorObjectID}">${collaboratorObjectName}</span>
                  </li>
                  <li class="c-tooltip tooltip_${collaboratorObjectID}" style="display: none;">${collaboratorObjectEmail}</li>
                  <li class="c-arrow arrow_${collaboratorObjectID}" style="display: none;"></li>`).attr('role', 'menuitem').attr('id', collaboratorObjectID));
                $('.badge-visible').show();
              }
            });
            $menu.toggle();
            let $menuItem = $('.menu__item');
            $menuItem.hover(function () {
              let collaboratorID = $(this).attr('id');
              $(`.tooltip_${collaboratorID}`).css('display', 'inline-block');
              $(`.arrow_${collaboratorID}`).css('display', 'block');
            }, function () {
              let collaboratorID = $(this).attr('id');
              $(`.tooltip_${collaboratorID}`).hide();
              $(`.arrow_${collaboratorID}`).hide();
            });
            let $buttonBadge = $('.button-badge');
            $menuItem.click(function () {
              $buttonBadge.removeClass('badge-visible');
              $buttonBadge.hide();
              let collaboratorID = $(this).attr('id');
              let collaboratorName = $(this).text();
              let collaboratorAvatar = $(`#${collaboratorID}-img`).attr('src');
              let collaboratorRoleBadge = $(this).attr('badge');
              $menuButtonContent.attr('id', collaboratorID);
              $menuButtonImage.attr('src', collaboratorAvatar);
              $menuButtonContent.text(collaboratorName);
              $buttonBadge.addClass(collaboratorRoleBadge);
              $('.badge-visible').show();
              $menu.hide();
              $checkbox.prop('disabled', false);
              $('.checkbox .label').removeClass('hidden');
              $('.checkbox .c-chk').removeClass('hidden');
              $submitButton.prop('disabled', false);
            });
            $(document).mouseup(function (e) {
              if (!$menuButton.is(e.target) && !$menuButtonContent.is(e.target) && !$menuButtonImage.is(e.target) && !$('.menu-btn-icon-arrow-down').is(e.target) && !$('ul').is(e.target) && !$('li').is(e.target) && $menu.is(':visible')) {
                $menu.hide();
                $buttonBadge.removeClass('badge-visible');
                $buttonBadge.hide();
                $menuButtonImage.attr('src', 'https://aculligan.github.io/CDN/Universal_App_Assets/img/Zendesk-brand-assets/default-avatar.png');
                $menuButtonContent.text('').attr('id', '');
                $checkbox.prop('disabled', true);
                $('.checkbox .label').addClass('hidden');
                $('.checkbox .c-chk').addClass('hidden');
                $submitButton.prop('disabled', true);
              }
            });
            $(document).keyup(function (e) {
              if (e.keyCode === 27 && $menu.is(':visible')) {
                $menu.hide();
                $buttonBadge.removeClass('badge-visible');
                $buttonBadge.hide();
                $menuButtonImage.attr('src', 'https://aculligan.github.io/CDN/Universal_App_Assets/img/Zendesk-brand-assets/default-avatar.png');
                $menuButtonContent.text('').attr('id', '');
                $checkbox.prop('disabled', true);
                $('.checkbox .label').addClass('hidden');
                $('.checkbox .c-chk').addClass('hidden');
                $submitButton.prop('disabled', true);
              }
            });
           });
          $submitButton.click(function () {
            let selectedCC = $menuButtonContent.attr('id');
            let selectedCCValue = Number(selectedCC);
            let requesterArray = [];
            requesterArray.push(requesterID);
            let collaboratorsAndRequesterArray = _.union(requesterArray, collaboratorIDs);
            let collaboratorsArrayAdd = _.without(collaboratorsAndRequesterArray, selectedCCValue);
            let collaboratorsArrayRemove = _.without(collaboratorIDs, selectedCCValue);
            let ccCurrentRequester = $checkbox.is(':checked');
            let addCC = {
              url: `/api/v2/tickets/${ticketID}.json`,
              type: 'PUT',
              contentType: 'application/json',
              data: `{"ticket": {"requester_id": ${selectedCCValue}, "collaborator_ids": [${collaboratorsArrayAdd}]}}`
            };
            let removeCC = {
              url: `/api/v2/tickets/${ticketID}.json`,
              type: 'PUT',
              contentType: 'application/json',
              data: `{"ticket": {"requester_id": ${selectedCCValue}, "collaborator_ids": [${collaboratorsArrayRemove}]}}`
            };
            if (ccCurrentRequester === true) {
              client.request(addCC);
              /*ga('create', 'UA-87663201-1', 'auto');
              ga('set', 'checkProtocolTask', function (){});
              ga('require', 'displayfeatures');
              ga('send', {
                hitType: 'event',
                eventCategory: 'Swith',
                eventAction: 'Keep Requester CCd',
                eventLabel: 'Keep Requester CCd'
              });*/
            } else if (ccCurrentRequester !== true) {
              client.request(removeCC);
            }
          });
        });
      });
      client.on('ticket.updated', function () {
        window.location.reload(true);
        /*ga('send', {
          hitType: 'event',
          eventCategory: 'Swith',
          eventAction: 'CC Switched',
          eventLabel: 'CC Switched'
        });*/
      });
    }});

    this.renderMain.bind(this);

    this.view.switchTo('main');
  }
  renderMain(data) {
    this.view.switchTo('main');
  }
}

export default TicketSidebar;
