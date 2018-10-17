const fs = require("fs");
const licenses = require('spdx-license-list');

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

const sortByName = (a, b) => {
  return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
}


function getAgencies(items) {
  const agencies = new Set();

  items.forEach(item => {
    const { acronym, name } = item.agency;
    if (acronym && name) {
      agencies.add(JSON.stringify({ 'name': name, 'value': acronym }));
    }
  });

  return Array.from(agencies).map(JSON.parse).sort(sortByName);
}

function getLanguages(items) {
  const languages = new Set();

  items.forEach(item => {
    if (item.languages) {
      item.languages.forEach(language => {
        if (language) {
          const language_in_lower_case = language.toLowerCase();
          if (languageKey2Name.hasOwnProperty(language_in_lower_case)) {
            const proper_name = languageKey2Name[language_in_lower_case];
            languages.add(JSON.stringify({ 'name': proper_name, 'value': language_in_lower_case }));
          }
        }
      });
    }
  });

  return Array.from(languages).map(JSON.parse).sort(sortByName);
}


function getLicenses(repos) {
  const licenses = new Set();

  repos.forEach(repo => {
    if (repo.permissions && repo.permissions.licenses) {
        if (Array.isArray(repo.permissions.licenses)) {
          repo.permissions.licenses.forEach(license => {
            const { name, URL } = license;

            if (name) {
              const key = name.toLowerCase().trim();
              if (licensesKey2Name.hasOwnProperty(key)) {
                const {name, id } = licensesKey2Name[key];
                licenses.add(JSON.stringify({ name, value: id}));
              }
            }

            if (URL) {
              const key = URL.toLowerCase().trim();
              if (licensesKey2Name.hasOwnProperty(key)) {
                const {name, id } = licensesKey2Name[key];
                licenses.add(JSON.stringify({ name, value: id}));
              }

            }
          });
        }
    }
  });

  return Array.from(licenses).map(JSON.parse).sort(sortByName);
}

module.exports = { getAgencies, getLanguages, getLicenses, languageKey2Name, licensesKey2Name, sortByName }
