'use strict';
/* global GithubCommits: false */
var commits,
    github,
    excludes = [];

// From Jonathan Feinberg's cue.language, see lib/cue.language/license.txt.
var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g,
    wordSeparators = /[\s]+/g,
    hash1 = /[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/g,
    hash2 = /[a-z0-9]{40}/g,
    hashReference = /[\S]+@[\d]{5}/g;

var getRepoUrlFromHash = function() {
    var match;
    match = window.location.hash.match(/#(.*?)\/(.*?)$/);
    if (match) {
        return {
            user: match[1],
            repo: match[2]
        };
    }
};

function render(words){
    $('#cloud').jQCloud(words);
    $('#filter-container').removeClass('hide');
}

function commitsLink(repo) {
    repo = repo.replace(/.*github.com[\/:](.*?)(\.git)?$/, '$1');
    repo = repo.match(/(.*?)\/(.*?)$/);
    if (repo) {
        return {
            user: repo[1],
            repo: repo[2]
        };
    }
}

function error(message){
    if( console && console.log ){
        console.log('Error getting comments. Response:' + message);
    }
    $('#repo').fadeIn();
    $('#filter').select2('enable', false);
    render([
        {text: 'not found', weight: 10},
        {text: '404', weight: 10},
        {text: 'error', weight: 9},
        {text: 'blunder', weight: 8},
        {text: 'mistake', weight: 7},
        {text: 'goof', weight: 6},
        {text: 'boo-boo', weight: 6},
        {text: 'slip-up', weight: 6},
        {text: 'miscalculation', weight: 5},
        {text: 'whoopsies', weight: 5},
        {text: 'inaccuracy', weight: 4},
        {text: 'try again', weight: 3},
        {text: 'accident', weight: 2},
        {text: 'fault', weight: 1},
        {text: 'flub', weight: 1}
    ]);
}

function error403(){
    $('#repo').fadeIn();
    $('#filter').select2('enable', false);
    render([
        {text: 'forbidden', weight: 10},
        {text: '403', weight: 10},
        {text: 'max queries exceeded', weight: 9},
        {text: 'try again later', weight: 9},
        {text: 'error', weight: 8},
        {text: 'goof', weight: 6},
        {text: 'boo-boo', weight: 6},
        {text: 'slip-up', weight: 6},
        {text: 'miscalculation', weight: 5},
        {text: 'whoopsies', weight: 5},
        {text: 'inaccuracy', weight: 4},
        {text: 'try again', weight: 3},
        {text: 'accident', weight: 2},
        {text: 'fault', weight: 1},
        {text: 'flub', weight: 1}
    ]);
}

function addWord(words, word) {
    word = word.toLowerCase();
    if (hash1.test(word)) {return;}
    if (hash2.test(word)) {return;}
    if (hashReference.test(word)) {return;}
    word = word.replace(punctuation, '');
    if (stopWords.test(word)) {return;}
    if (word.length < 2) {return;}
    for(var x in excludes){
        if( word === excludes[x].toLowerCase() ) {return;}
    }
    if( words[word] ){
        words[word].weight++;
    } else {
        words[word] = {
            text: word,
            weight: 1,
            html: {
                title: 'Click to filter this keyword',
                'data-value': word
            }
        };
    }
}

function parseCommits() {
    var savedWords = {}, message;
    
    for (var i in commits) {
        message = commits[i].commit.message;
        var words = message.split(wordSeparators);
        
        for(var x in words){
            addWord(savedWords, words[x]);
        }
    }
  
    // Map words to an array for jQCloud
    savedWords = $.map(savedWords, function(value) {
        return value;
    });
  
    // Sort by weight to remove small words
    savedWords = savedWords.sort(function(a,b){
        return b.weight - a.weight;
    });
  
    // Only keep top 200 heavy words
    savedWords = savedWords.splice(0, 200);
  
    return savedWords;
}

function loadCloud(){
    github.getLastCommits().done(function(response){
        if ( response instanceof Array && response.length > 0) {
            commits = response;
            var words = parseCommits();
            render(words);
        } else {
            error(response);
        }
    }).fail(function(err){
        if (err && err.status === 403) {
            error403();
        } else {
            error();
        }
    });
}

function initialize(){
    $(window).on('hashchange', function() {
        return window.location.reload();
    });
    
    $('#repo').submit(function(e){
        e.preventDefault();
        var repo = commitsLink(this.repo.value);
        if (repo) {
            window.history.pushState(void 0, void 0, '#' + repo.user + '/' + repo.repo);
            github = new GithubCommits(repo.user, repo.repo);
            $('#cloud').jQCloud('destroy');
            loadCloud(repo);
            $(this).fadeOut();
        }
    });
    
    $('#cloud').on('click', 'span[class^="w"]', function(){
        var tags = $('#filter').select2('val');
        var newTag = $(this).data('value');
        tags.push(newTag);
        $('#filter').select2('val', tags);
        $('#filter').trigger('change');
    });
    
    $('#filter').select2({
        tags: function(){
            var words = parseCommits();
            return $.map(words, function(obj){
                return obj.text;
            });
        },
        tokenSeparators: [',', ' ']
    });
    
    $('#filter').change(function(){
        excludes = $('#filter').select2('val');
        var words = parseCommits();
        $('#cloud').jQCloud('destroy');
        if(words.length > 0){
            render(words);
        } else {
            error('no words found');
        }
    });
    
    var repo = getRepoUrlFromHash();
    if (repo) {
        github = new GithubCommits(repo.user, repo.repo);
        loadCloud(repo);
    } else {
        $('#repo').fadeIn();
    }
}

$(function() {
    initialize();
});













