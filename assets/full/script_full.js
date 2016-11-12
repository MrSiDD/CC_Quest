$(document).ready(function() {
  var ticketRequester = $('#requester');
  var ticketRequesterEmail = $('#requester-email');
  var ticketCollaborators = $('#collaborators');
  var menuButton = $('.menu-btn');
  var menuButtonImage = $('#button-image');
  var menuButtonContent = $('.menu-btn-content');
  var menu = $('.menu');
  var checkbox = $('#checkbox');
  var submitButton = $('#submit_change');
  var client = ZAFClient.init();
  client.invoke('resize', { width: '318px', height: '260px' });
  client.get('ticket').then(function(data) {
    var ticketID = data.ticket.id;
    var requesterName = data.ticket.requester.name;
    var requesterAvatar = data.ticket.requester.avatarUrl;
    var requesterID = data.ticket.requester.id;
    var requesterEmail = data.ticket.requester.email;
    var collaborators = data.ticket.collaborators;
    var collaboratorsSorted = _.sortBy(collaborators, 'name');
    ticketRequester.text(requesterName);
    ticketRequesterEmail.text(requesterEmail);
    $('#requester-image').attr('src', requesterAvatar);
    if (collaborators.length < 1) {
      $(menuButton).prop('disabled', true);
      $(menuButtonContent).text('No CCs Available');
      $(checkbox).prop('disabled', true);
      $(submitButton).prop('disabled', true);
    }
    menuButton.click(function() {
      menu.toggle();
    });
    $(document).mouseup(function (e) {
      if (!menuButton.is(e.target) && !menuButtonContent.is(e.target) && !menuButtonImage.is(e.target) && !$('.menu-btn-icon-arrow-down').is(e.target) && !$('ul').is(e.target) && !$('li').is(e.target) && menu.is(':visible')) {
        menu.hide();
        menuButtonImage.attr('src', 'https://i0.wp.com/assets.zendesk.com/images/2016/default-avatar-80.png');
        menuButtonContent.text('').attr('id', '');
      }
    });
    $.each(collaboratorsSorted, function(index, value) {
      var collaboratorName = value.name;
      var collaboratorID = value.id;
      var collaboratorAvatar = value.avatarUrl;
      var collaboratorEmail = value.email;
      ticketCollaborators.append($('<li class="menu__item"><figure class="c-avatar c-avatar--small"><img id="' + collaboratorID + 'img" alt="user" src="' + collaboratorAvatar + '"></figure><span class="menu-li-content" id="'+ collaboratorID +'" value="' + collaboratorID + '">' + collaboratorName + '</span></li><li class="c-tooltip tooltip_' + collaboratorID + '" style="display:none;">' + collaboratorEmail + '</li><li class="c-arrow tooltip_' + collaboratorID + '"> </li>').attr('role', 'menuitem').attr('id', collaboratorID));
    }); 
    var menuItem = $('.menu__item');
    menuItem.hover(function() {
      var collaboratorID = $(this).attr('id');
      $('.tooltip_' + collaboratorID).toggle();
    });
    menuItem.click(function() {
      var collaboratorID = $(this).attr('id');
      var collaboratorName = $(this).text();
      var collaboratorAvatar = $('#' + collaboratorID + 'img').attr('src');
      menuButtonContent.attr('id', collaboratorID);
      $('#button-image').attr('src', collaboratorAvatar);
      menuButtonContent.text(collaboratorName);
      menu.hide();
    });
    var collaboratorsArray = new Array();
    $('#collaborators li').each(function() {
      if ($(this).attr('id') != '') {
        var collaboratorsIDs = Number($(this).attr('id'));
        collaboratorsArray.push(collaboratorsIDs);
      }
    });
    submitButton.click(function() {
      var selectedCC = $(menuButtonContent).attr('id');
      if (selectedCC > 0) {
        var selectedCCValue = Number(selectedCC);
        var changeRequester = {
          url: '/api/v2/tickets/' + ticketID + '.json',
          type: 'PUT',
          contentType: 'application/json',
          data: '{"ticket": {"requester_id": ' + selectedCCValue + '}}'
        };
        var collaboratorsArrayRequester = new Array(); 
        collaboratorsArrayRequester.push(requesterID);
        var collaboratorsArrayRequesterUnion = _.union(collaboratorsArrayRequester, collaboratorsArray);
        var collaboratorsArrayAdd = _.without(collaboratorsArrayRequesterUnion, selectedCCValue);
        var addCC = {
          url: '/api/v2/tickets/' + ticketID + '.json',
          type: 'PUT',
          contentType: 'application/json',
          data: '{"ticket": {"collaborator_ids": [' + collaboratorsArrayAdd + ']}}'
        };
        var collaboratorsArrayRemove = _.without(collaboratorsArray, selectedCCValue);
        var removeCC = {
          url: '/api/v2/tickets/' + ticketID + '.json',
          type: 'PUT',
          contentType: 'application/json',
          data: '{"ticket": {"collaborator_ids": [' + collaboratorsArrayRemove + ']}}'
        };
        var ccCurrentRequester = $('#checkbox').is(':checked');
        if (ccCurrentRequester == true) {
          client.request(addCC).then(function() {
            client.request(changeRequester);
          });
        }
        else if (ccCurrentRequester != true) {
          client.request(changeRequester).then(function() {
            client.request(removeCC);
          });
        }
      }
    });
  });
  client.on('ticket.updated', function() {
    window.location.reload(true);
  });
});
