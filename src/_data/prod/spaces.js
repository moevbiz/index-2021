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
            eventWebsite: readEntry(participant, 'eventwebsite'),
            // altLat: readEntry(participant, 'eventlat'),
            // altLng: readEntry(participant, 'eventlng'),
            spaceData,
          }

          if (readEntry(participant, 'altlat')) {
            entry.altLat = readEntry(participant, 'altlat');
          };
          if (readEntry(participant, 'altlng')) {
            entry.altLng = readEntry(participant, 'altlng');
          }
          if (readEntry(participant, 'altwebsite')) {
            entry.altWebsite = readEntry(participant, 'altwebsite');
          };
          if (readEntry(participant, 'altaddress')) {
            entry.altAddress = readEntry(participant, 'altaddress');
          }
          // console.log(!readEntry(participant, 'altlat'));
          // console.log(!!readEntry(participant, 'altlat'));
          
          data.entries.push(entry);
        });
        
        // stash the data locally for developing without
        // needing to hit the API each time.
        seed(JSON.stringify(data.entries, null, 4), `${__dirname}/../dev/spaces.json`);

        // resolve the promise and return the data
        resolve(data.entries);
      })

      // handle errors
      .catch(error => {
        console.log('Error :', error);
        reject(error);
      });
  })
}
