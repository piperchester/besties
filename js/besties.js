  window.fbAsyncInit = function () {
    FB.init({
      appId: '1465893096973391',
      status: true, // check login status
      cookie: true, // enable cookies to allow the server to access the session
      xfbml: true  // parse XFBML
    });

    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        $('#authModal').modal('hide');
      }
      else if (response.status === 'not_authorized') {
        // the user is logged in to Facebook,
        // but has not authenticated your app
        $('#authModal').modal('show');
      } else {
        // the user isn't logged in to Facebook.
        $('#authModal').modal('show');

      }
    });

    FB.Event.subscribe('auth.authResponseChange', function (response) {
      // Here we specify what we do with the response anytime this event occurs.
      if (response.status === 'connected') {
        $('#authModal').modal('hide');
      } else if (response.status === 'not_authorized') {
        $('#authModal').modal('show');
      } else {
        $('#authModal').modal('show');
      }
    });
  };

  // Load the SDK asynchronously
  (function (d) {
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) { return; }
    js = d.createElement('script'); js.id = id; js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    ref.parentNode.insertBefore(js, ref);
  }(document));

  // Presents the FB add Friend dialog
  function scrapeFriends() {
    var friendID = $('#fbFriendForm').val();
    FB.api(friendID + '/friendlists/close_friends?fields=members', function (response) {
      if (!response || response.error) {
        alert('Hmm - that was unexpected. Are you sure you have an access token?');
      } else {
        $('#pit').hide();
        var friendCounter = 0;
        for (friend in response.data[0].members.data){
          $('#facepile').append('<section classs="alert alert-info">' + response.data[0].members.data[friendCounter++].name + '</section><br><br>');
        }
        // alert("First friend on the list: " + response.data[0].members.data[0].name);
      }
    });
  }
