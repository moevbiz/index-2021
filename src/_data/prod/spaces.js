const axios  = require('axios');
const fs = require("fs");

// Handy to save the results to a local file
// to prime the dev data source
const seed = (data, path) => {
  if(['seed'].includes(process.env.ELEVENTY_ENV)) {
    fs.writeFile(path, data, err => {
      if(err) {
        console.log(err);
      } else {
        console.log(`Data saved for dev: ${path}`);
      }
    });
  }
}

const sheetID = process.env.GOOGLE_SHEET_ID;
const googleSheetUrl = `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/values?alt=json`;
const indexAPI = 'https://independentspaceindex.at/spaces.json';

function getIndex() {
  return axios.get(indexAPI);
}

function getParticipants() {
  return axios.get(googleSheetUrl);
}

const yearDisplay = (item, years) => {
  if (years.includes(item.gsx$year.$t)) {
    return false
  } else {
    if (item.gsx$visible.$t === "TRUE") {
      years.push(item.gsx$year.$t)
      return true
    }
    return false
  }
}

module.exports = () => {
  return new Promise((resolve, reject) => {

    Promise.all([getIndex(), getParticipants()])
      .then(([index, participants]) => {
        participants.forEach((participant, i) => {
          let spaceData = index.find(space => space.name === participant.gsx$space.$t)
        });

        // stash the data locally for developing without
        // needing to hit the API each time.
        seed(JSON.stringify(data, null, 4), `${__dirname}/../dev/sheet.json`);

        // resolve the promise and return the data
        resolve(data);

      })

      // handle errors
      .catch(error => {
        console.log('Error :', error);
        reject(error);
      });
  })
}
