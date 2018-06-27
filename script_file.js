const JIRA_STORY_NUMBER = /^FS-[0-9]+/

function httpGet(theUrl) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.setRequestHeader("Authorization", "Basic ZnVuZ2libGU6ZnVuZ2libGUxMjM=");
    xmlHttp.send();
    return xmlHttp.responseText;
}

module.exports = function (data, callback) {
    var unique_stories = {};

    data.commits.forEach(function (commit) {
        const story_number_matches = commit.title.match(JIRA_STORY_NUMBER);

        // If the commit tile includes "FS-XXX"
        if (story_number_matches) {
            const story_number = story_number_matches[0];
            const response = JSON.parse(httpGet("https://jira.loyalty.com/rest/api/latest/issue/" + story_number));

            if (!response.errorMessages) {
                unique_stories[story_number] = {
                    summary: response.fields.summary,
                    description: response.fields.description
                };
            }
        }
    });

    callback({
        commits: data.commits,
        range: data.range,
        stories: unique_stories
    });
}