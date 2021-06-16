const axios  = require('axios');
const fs = require("fs");
require('dotenv').config();

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

function readFromSheet(sheet, index, value) {
  let val = sheet.data.feed.entry[index]['gsx$' + value];
  return val ? val.$t : '';
}

function readEntry(entry, value) {
  let val = entry['gsx$' + value];
  return val ? val.$t : '';
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
      .then(([index, googleSheet]) => {
        var data = {
          entries: [],
        };

        let participants = googleSheet.data.feed.entry;

        participants.forEach((participant, i) => {
          if (readEntry(participant, 'public') !== 'TRUE') return;

          let spaceData = index.data.find(space => space.uid === readEntry(participant, 'spaceid'));

          let entry = {
            spaceName: spaceData ? spaceData.name : readEntry(participant, 'spacename'),
            spaceID: readEntry(participant, 'spaceid'),
            eventTitle: readEntry(participant, 'eventtitle'),
            eventDetails: readEntry(participant, 'eventdetails'),
            spaceData,
          }

          data.entries.push(entry);
        });

        let json = JSON.stringify(data, null, 4)

        // stash the data locally for developing without
        // needing to hit the API each time.
        seed(json, `${__dirname}/../dev/sheet.json`);

        // resolve the promise and return the data
        resolve(json);
      })

      // handle errors
      .catch(error => {
        console.log('Error :', error);
        reject(error);
      });
  })
}
