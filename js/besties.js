
  //cache jQuery selectors
  var $doc = $(document);
  // PROTIP: $.find() is faster than $()
  var $facepile = $doc.find('#facepile'),
      $authModal = $doc.find('#authModal'),
      $fbFriendForm = $doc.find('#fbFriendForm'),
      $scrapeButton = $doc.find('#fbScrapeButton'),
	  $loadingSVG = $doc.find('#loading'),
      $pit = $doc.find('#pit'),
      $userName = $('#userName');

  //globals
  var Besties, KeyHandler;

  //main controller for app
  Besties = {
    canScrape: true,
    currentUser : null,
    init : function () {
      console.log('Besties initiated');
      Besties.loadAPI(document);
      $facepile.hide();
      // PROTIP:
      // Within this init function, `this` is a reference to `window`, not Besties
      // Functions being called through a jQuery event will have jQuery has their reference of `this`
      Besties.attachListeners();
    },
    //add all event listeners
    attachListeners : function () {
	  $loadingSVG.show();
      $scrapeButton.on('click', this.scrapeFriends); // PROTIP: parenthesis is not needed
      $doc.on('keypress', KeyHandler.onKeyPress);
    },
    //populates user data
    updateUserInfo : function () {
	  $loadingSVG.remove();
      $userName.html(this.currentUser.name);
      $fbFriendForm.val(this.currentUser.username);
    },
    //gets information about the current user
    getCurrentUser : function () {
      FB.api('/me', function (response) {
        Besties.currentUser = response;
        Besties.updateUserInfo();
      }
      );
    },
    // Takes friend ID string from input form and searches graph for Close Friends member names, appends to site
    scrapeFriends : function () {
      var friendID = $fbFriendForm.val().trim();
      if (friendID === '') {
        alert('Woahh, slow down there buddy. You have to enter a friend code first.');
        return false;
      }
      if (this.canScrape === false) {
        alert('You already scraped for your friends');
        return false;
      } else {
        FB.api(friendID + '/friendlists/close_friends?fields=members', function (response) {
          if (!response || response.error) {
            alert('Hmm - that was unexpected. Are you sure you have an access token?');
            return false;
          } else {
            $pit.remove();
            var friendCounter = 0;
            var html = '<ul id="friendList">\n';
            for (friend in response.data[0].members.data){
              html += '<li class="friend">\n';
              html += '<h3 class="friend-name">'+response.data[0].members.data[friendCounter++].name+'</h3>';
              html += '\n</li>';
            }
            html += '</ul>'
            $facepile.append(html);
            $userName.append('<span class="totalFriends">, you have '+(friendCounter)+' close friends!</span>');
          }
          $facepile.show();
          $scrapeButton.hide();
          Besties.canScrape = false;
        });
      }
    },
    // Handles reponse for sign and and account auth
    userSignIn : function (response) {
      if (response.status === 'connected') {
        $authModal.modal('hide');
        Besties.getCurrentUser();
      } else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook, but has not authenticated the app
        $authModal.modal('show');
      } else {
        $authModal.modal('show');
      }
    },
    // Load the SDK asynchronously
    loadAPI : function (d) {
      var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
      if (d.getElementById(id)) { return; }
      js = d.createElement('script'); js.id = id; js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      ref.parentNode.insertBefore(js, ref);
    }
  };

  //handles all key events
  KeyHandler = {
    //determines what to do based on which key is pressed
    onKeyPress : function (key) {
      var code = key.keyCode;
      //using a switch to allow for easy addition of new cases later
      switch (code) {
        case 13:
          Besties.scrapeFriends();
          break;
      }
    }
  }

  window.fbAsyncInit = function () {
    FB.init({
      appId: '1465893096973391',
      status: true, // check login status
      cookie: true, // enable cookies to allow the server to access the session
      xfbml: true  // parse XFBML
    });

    FB.getLoginStatus(Besties.userSignIn);

    FB.Event.subscribe('auth.authResponseChange', Besties.userSignIn);
  };

  window.onload = Besties.init;
