

/**
 * Waffle.io uses the syntax `[Connected to #123]` to link PRs to the original task
 */
//const WAFFLE_INFO = /\[connected to #\d+\]\s?/gi;
const JIRA_STORY_NUMBER=/^FS-[0-9]+/

module.exports = function (data, callback) {
  console.log(data);
  const rewritten = data.commits.map((commit) => {
    console.log("commit = ", commit)
    const story_number = commit.title.match(JIRA_STORY_NUMBER);
    console.log("story_number =", story_number);
    //TODO get details of jira story that don't have a story number in the commit
    if (story_number) {
      // extra metadata to remember the linked tasks
      commit.story_number = story_number[0];
      console.log(commit.story_number);
      fetch("https://jira.loyalty.com/rest/api/2/issue/FS-600", {
        method: 'GET',
        headers: new Headers({
          'Authorization': 'Basic yourkey_here',
          'Content-Type': 'application/json'
        })
        /* mode: 'cors', // no-cors, cors, *same-origin
          redirect: 'follow', // manual, *follow, error
          referrer: 'no-referrer', // *client, no-referrer*/
      }).then((resp) => {
        console.log(resp);
        commit.jira_summary = resp.json().fields.summary;
        console.log(commit.jira_summary);
      }).catch(err => {
        console.log("hehrafadsf", err);
      });
    }

    return commit;
  });

  callback({
    commits: rewritten.filter(Boolean),
    // rewrite the range because the template only cares about the starting point
    range: data.range.split('.')[0],
  });
}