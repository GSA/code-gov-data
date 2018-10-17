console.log('starting create_filters_data.js');

const { getAgencies, getLanguages, getLicenses, sortByName } = require("./utils")

const { CODE_GOV_API_KEY } = process.env;

const axios = require('axios');
const fs = require('fs');

async function generate() {

  const filters = {};

  const url = `https://api.code.gov/repos?size=10000&api_key=${CODE_GOV_API_KEY}`;
  const response = await axios.get(url);
  const repos = response.data.repos;

  filters.agencies = getAgencies(repos);
  console.log("filters.agencies:", filters.agencies);
  filters.languages = getLanguages(repos);
  filters.licenses = getLicenses(repos);
  console.log("filters.licenses:", filters.licenses);

  fs.writeFileSync('filters/all.json', JSON.stringify(filters), 'utf-8');
  Object.keys(filters).forEach(key => {
    fs.writeFileSync(`filters/${key}.json`, JSON.stringify(filters[key]), 'utf-8');
  });
}

generate();

