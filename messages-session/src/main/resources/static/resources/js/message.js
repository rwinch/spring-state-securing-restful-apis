function CsrfToken(data) {
    var self = this;
    self.headerName = ko.observable(data.headerName);
    self.token = ko.observable(data.token);
}

function User(data) {
    var self = this;
    self.href = ko.observable(data._links ? data._links.self.href : '');
    self.email = ko.observable(data.email);
    self.password = ko.observable(data.password);
}

function Message(data) {
    var self = this;
    self.href = ko.observable(data._links.self.href);
    self.text = ko.observable(data.text);
    self.summary = ko.observable(data.summary);
    self.created = ko.observable(new Date(data.created));
    self.to = ko.observable(data.to);
    self.from = ko.observable(data.from);
}

function ComposeMessage(data) {
    var self = this;
    self.text = ko.observable(data.text);
    self.summary = ko.observable(data.summary);
    self.from = ko.observable(data.from);
    self.toEmail = ko.observable('');
    self.to = ko.observable('');
}

function MessageListViewModel() {
    var self = this;
    self.messages = ko.observableArray([]);
    self.chosenMessageData = ko.observable();
    self.inbox = ko.observable();
    self.sent = ko.observable();
    self.compose = ko.observable();
    self.errors = ko.observableArray([]);
    self.user = ko.observable(new User([]));
    self.login = ko.observable();
    self.csrf = ko.observable(new CsrfToken([]));

    self.goToMessage = function(message) {
        self.clearPages();
        $.getJSON(message.href(), function(data) {
            self.chosenMessageData(new Message(data));
        });
    };

    self.goToCompose = function(data) {
        self.clearPages();
        self.compose(new ComposeMessage({'from':self.user().href(),'toEmail':'rob@example.com'}));
    };

    self.goToInbox = function() {
        self.clearPages();
        $.getJSON("./messages/search/inbox", function(allData) {
            var mappedMessages = $.map(allData['_embedded']['messages'], function(item) { return new Message(item) });
            self.messages(mappedMessages);
            self.inbox(mappedMessages);
        });
    }

    self.goToSent = function() {
        self.clearPages();
        $.getJSON("./messages/search/sent", function(allData) {
            var mappedMessages = $.map(allData['_embedded']['messages'], function(item) { return new Message(item) });
            self.messages(mappedMessages);
            self.sent(mappedMessages);
        });
    }

    self.goToLogin = function() {
        self.clearPages();
        self.user(new User([]));
        self.login(new User({email:'rob@example.com',password:'password'}));
    }

    self.clearPages = function() {
        self.login(null);
        self.inbox(null);
        self.sent(null);
        self.compose(null);
        self.chosenMessageData(null);
    }

    self.save = function() {
        $.ajax("./users/search/findByEmail", {
            data: {'email' : self.compose().toEmail() },
            type: "get", contentType: "application/json",
            success: function(result) {
                if(result._embedded) {
                    self.compose().to(result._embedded.users[0]._links.self.href);
                    $.ajax("./messages/", {
                        data: ko.toJSON(self.compose),
                        type: "post", contentType: "application/json",
                        success: function(result) {
                            self.goToInbox();
                        }
                    });
                } else {
                    self.errors(['Invalid user']);
                }
            }
        });
    };

    self.deleteMessageFromInbox = function(message) {
        self.deleteMessage(message, self.goToInbox);
    }

    self.deleteMessageFromSent = function(message) {
        self.deleteMessage(message, self.goToSent);
    }

    self.deleteMessage = function(message, onSuccess) {
        $.ajax(message.href(), {
            type: "delete", contentType: "application/json",
            success: onSuccess
        });
    }

    self.performLogin = function() {
        var username = self.login().email();
        var password = self.login().password();
        self.getCurrentUser(username,password);
    }

    self.performLogout = function() {
        $.post("./logout");
        self.getCurrentUser();
    }

    self.getCurrentUser = function(username, password) {
        self.user(new User([]));
        var additionalHeaders = username ? {
            "Authorization": "Basic " + btoa(username + ":" + password)
        } : {};
        $.ajax("./authenticate", {
            headers: additionalHeaders,
            type: "get", contentType: "application/json",
            success: function(result) {
                self.user(new User(result));
                self.goToInbox();
                self.getCsrf();
            }
        });
    };

    self.getCsrf = function() {
        $.get("./csrf", function(data) {
            self.csrf(new CsrfToken(data));
        });
    };

    self.getCurrentUser();
}

$(function () {
  var messageModel = new MessageListViewModel();
  $(document).ajaxSend(function(e, xhr, options) {
    messageModel.errors.removeAll();
    xhr.setRequestHeader( "Content-type", "application/json" );

    var header = messageModel.csrf().headerName();
    var token = messageModel.csrf().token();
    if(token) {
        xhr.setRequestHeader(header, token);
    }
  });
  $(document).ajaxError(function( event, jqxhr, settings, exception ) {
    if (jqxhr.status == 401 ) {
      messageModel.goToLogin();
    } else if(jqxhr.status == 400) {
      var errors = $.parseJSON(jqxhr.responseText)['errors'];
      for (var i = 0; i < errors.length; i++) {
        messageModel.errors.push(errors[i].message);
      }
    } else {
      alert("Error processing "+ settings.url);
    }
  });
  ko.applyBindings(messageModel)
});

