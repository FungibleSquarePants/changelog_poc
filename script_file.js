const JIRA_STORY_NUMBER=/^FS-[0-9]+/

function httpGet(theUrl) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.setRequestHeader("Authorization", "Basic ZnVuZ2libGU6ZnVuZ2libGUxMjM=");
    xmlHttp.send();
    return xmlHttp.responseText;
}

module.exports = function (data, callback) {
    const rewritten = data.commits.map((commit) => {
    const story_number = commit.title.match(JIRA_STORY_NUMBER);
    commit.jira_summary = "DEFAULT";
    if (story_number) {
      commit.story_number = story_number[0];
      var response = JSON.parse(httpGet("https://jira.loyalty.com/rest/api/latest/issue/" + commit.story_number));
      if (!response.errorMessages) {
        if (response.fields.summary) {
          commit.jira_summary = response.fields.summary;
        }
      }
    } else {
      commit.story_number = "Story number does not exist in Jira.";
    }
    return commit;
  });

  callback({
    commits: rewritten.filter(Boolean),
    range: data.range.split('.')[0],
  });
}