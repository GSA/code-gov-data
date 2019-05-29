console.log('starting create_filters_data.js');

const { getAgencies, getLanguages, getLicenses, getUsageTypes, sortByName } = require("./utils")

const { CODE_GOV_API_KEY } = process.env;

const axios = require('axios');
const fs = require('fs');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function generate() {

  const filters = {};

  let repos = [];
  const size = 1000;
  for (let i = 0; i < 10; i++) {
    try {
      const url = `https://api.code.gov/repos?from=${i*size}&size=${size}&api_key=${CODE_GOV_API_KEY}`;
      const response = await axios.get(url);
      console.log("sleeping 5 seconds");
      await sleep(5000);
      repos = repos.concat(response.data.repos);
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  console.log("repos.length:", repos.length)

  filters.agencies = getAgencies(repos);
  console.log("filters.agencies:", filters.agencies);
  filters.languages = getLanguages(repos);
  filters.licenses = getLicenses(repos);
  console.log("filters.licenses:", filters.licenses);
  filters.usageTypes = getUsageTypes();

  fs.writeFileSync('filters/repos/all.json', JSON.stringify(filters), 'utf-8');
  Object.keys(filters).forEach(key => {
    fs.writeFileSync(`filters/repos/${key}.json`, JSON.stringify(filters[key], null, 2), 'utf-8');
  });
}

generate();
