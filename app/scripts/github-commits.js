var GithubCommits = (function() {
    'use strict';
    
    var _createdAt, _github, _repo, _username, _reponame, _options, _lastCommits;
    
    var GithubCommits = function(username, reponame, options) {
        _username = username;
        _reponame = reponame;
        var defaults = {};
        _options = $.extend({}, defaults, options);
        this.initialize();
    };
   
    /* exported GithubCommits */
    /* global Octokit: false */
    GithubCommits.prototype = {
        initialize: function() {
            _createdAt = null;
            _lastCommits = [];
            _github = new Octokit();
            _repo = this.getRepo();
        },
   
        getRepo: function() {
            return _github.getRepo(
                _username,
                _reponame
            );
        },
      
        getLastCommits: function() {
            var deferred = new jQuery.Deferred();
            
            if (!_lastCommits || _lastCommits.length === 0) {
                _repo.getCommits({'per_page': 100}).done(function(response){
                    if(response instanceof Array) {
                        _lastCommits = response;
                    }
                    deferred.resolve(_lastCommits);
                }).fail(function(err){
                    deferred.reject(err);
                });
            } else {
                deferred.resolve(_lastCommits);
            }
            
            return deferred;
        }
    };
  
    return GithubCommits;
})();