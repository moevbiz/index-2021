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

const sheetID = "1XN9AyaFrvrVdw53PUFvCFSBElc0u35Eb4ZHnncdS91w";
const sheet = {
  sites: `https://spreadsheets.google.com/feeds/list/${sheetID}/1/public/values?alt=json`,
  tech: `https://spreadsheets.google.com/feeds/list/${sheetID}/2/public/values?alt=json`,
}

const getSites = () => {
  return axios.get(sheet.sites);
}

const getTech = () => {
  return axios.get(sheet.tech);
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

    Promise.all([getSites(), getTech()])
      .then(([sites, tech]) => {
        // massage the data from the Google Sheets API into
        // a shape that will more convenient for us in our SSG.
        var data = {
          "content": [],
          "types": [],
          "tech": [],
          "date": new Date('Y'),
        };
        let years = [];
        tech.data.feed.entry.forEach(item => {
          data.tech.push({
            "name": item.gsx$tech.$t,
            "color": item.gsx$color.$t
          });
        })
        sites.data.feed.entry.forEach(item => {
          data.content.push({
            "year": item.gsx$year.$t,
            "name": item.gsx$name.$t,
            "link": item.gsx$url.$t,
            "type": item.gsx$type.$t.split(', '),
            "tech": item.gsx$tech.$t.split(', '),
            "long": item.gsx$long.$t,
            "mark": JSON.parse(item.gsx$highlight.$t.toLowerCase()),
            "visible": JSON.parse(item.gsx$visible.$t.toLowerCase()),
            "yearDisplay": yearDisplay(item, years)
          })
          if (JSON.parse(item.gsx$visible.$t.toLowerCase())) {
            item.gsx$type.$t.split(', ').forEach(type => {
              if (!data.types.includes(type)) {
                data.types.push(type);
              }
            })
          }
        });

        data.types.sort()

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
