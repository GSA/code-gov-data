console.log('starting create_filters_data.js');

const { CODE_GOV_API_KEY } = process.env;

const axios = require('axios');
const fs = require('fs');
const licenses = require('spdx-license-list');

const sortByName = (a, b) => {
  return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
}

function getAgencies(repos) {
  const agencies = new Set();

  repos.forEach(repo => {
    const { acronym, name } = repo.agency;
    if (acronym && name) {
      agencies.add(JSON.stringify({ 'name': name, 'value': acronym }));
    }
  });

  return Array.from(agencies).map(JSON.parse).sort(sortByName);
}

function getLanguages(repos, value2name) {
  const languages = new Set();

  repos.forEach(repo => {
    if (repo.languages) {
      repo.languages.forEach(language => {
        if (language) {
          const language_in_lower_case = language.toLowerCase();
          if (value2name.hasOwnProperty(language_in_lower_case)) {
            const proper_name = value2name[language_in_lower_case];
            languages.add(JSON.stringify({ 'name': proper_name, 'value': language_in_lower_case }));
          }
        }
      });
    }
  });

  return Array.from(languages).map(JSON.parse).sort(sortByName);
}

function getLicenses(repos, key2name) {
  const licenses = new Set();

  repos.forEach(repo => {
    if (repo.permissions && repo.permissions.licenses) {
        if (Array.isArray(repo.permissions.licenses)) {
          repo.permissions.licenses.forEach(license => {
            const { name, URL } = license;

            if (name) {
              const key = name.toLowerCase().trim();
              if (key2name.hasOwnProperty(key)) {
                const {name, id } = key2name[key];
                licenses.add(JSON.stringify({ name, value: id}));
              }
            }

            if (URL) {
              const key = URL.toLowerCase().trim();
              if (key2name.hasOwnProperty(key)) {
                const {name, id } = key2name[key];
                licenses.add(JSON.stringify({ name, value: id}));
              }

            }
          });
        }
    }
  });

  return Array.from(licenses).map(JSON.parse).sort(sortByName);
}


async function generate() {

  const filters = {};

  // generate
  const text = fs.readFileSync('languages.txt', 'utf-8');
  const standard_languages = text.split("\n").map(line => line.trim()).filter(Boolean);
  console.log("standardLanguages:", standard_languages);

  const languageKey2Name = standard_languages.reduce((accumulator, language) => {
    accumulator[language.toLowerCase()] = language;
    return accumulator;
  }, {});

  const licensesKey2Name = Object.keys(licenses).reduce((accumulator, id) => {
    const { name, url } = licenses[id];
    accumulator[id.toLowerCase()] = { id, name };
    accumulator[name.toLowerCase()] = { id, name };
    accumulator[url.toLowerCase()] = { id, name };
    return accumulator;
  }, {});


  const url = `https://api.code.gov/repos?size=10000&api_key=${CODE_GOV_API_KEY}`;
  const response = await axios.get(url);
  const repos = response.data.repos;

  filters.agencies = getAgencies(repos);
  console.log("filters.agencies:", filters.agencies);
  filters.languages = getLanguages(repos, languageKey2Name);
  filters.licenses = getLicenses(repos, licensesKey2Name);
  console.log("filters.licenses:", filters.licenses);

  fs.writeFileSync('filters/all.json', JSON.stringify(filters), 'utf-8');
  Object.keys(filters).forEach(key => {
    fs.writeFileSync(`filters/${key}.json`, JSON.stringify(filters[key]), 'utf-8');
  });
}

generate();

