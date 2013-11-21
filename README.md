# Commit Cloud

[Demo](http://lightswitch05.github.io/commit-cloud/) - 
Generates a word cloud using commit messages from github repos.

## About
Commit Cloud Uses the github API (via [octokit](https://github.com/philschatz/octokit.js) ) to get the 100 most recent commit messages. It splits the messages into individual words and tracks the frequency of each word. It then generates the word cloud using a modified version of [jQCloud](https://github.com/lucaong/jQCloud).

Special thanks to [StarLogs](https://github.com/artemave/StarLogs) for inspiration and code examples.

## Development
 - Clone the repo
 - `npm install`
 - `bower install`
 - `grunt serve` to start dev server
 - `grunt` to build production version
