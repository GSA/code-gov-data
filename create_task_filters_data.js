console.log('starting create_filters_data.js');

const { getAgencies, getLanguages, getLicenses, sortByName } = require("./utils")

const { CODE_GOV_API_KEY } = process.env;

const fs = require('fs');

async function getTasks() {
  return new Promise((resolve, reject) => {
    data = JSON.parse(fs.readFileSync('./help-wanted.json'))
    resolve(data.items)
  });
}

function getCategories(tasks) {
  const categories = new Set();
  tasks.forEach(task => {
    const taskType = task.type;
    if (taskType) {
      categories.add(taskType.trim());
    }
  });
  return Array.from(categories).map(category => {
    console.log("category:", category)
    return { name: category, value: category.toLowerCase() }
  });
}

async function generate() {

  const filters = {};

  const tasks = await getTasks();

  filters.agencies = getAgencies(tasks);
  console.log("filters.agencies:", filters.agencies);
  filters.categories = getCategories(tasks);
  console.log("filters.categories:", filters.categories);
  filters.languages = getLanguages(tasks);
  console.log("filters.languages:", filters.languages);
  filters.skillLevels = [
    { name: "Beginner", value: "beginner" },
    { name: "Intermediate", value: "intermediate" },
    { name: "Advanced", value: "advanced" }
  ]
  filters.timeRequired = [
    { name: "Small", value: "small" },
    { name: "Medium", value: "medium" },
    { name: "Large", value: "large" }
  ]



  fs.writeFileSync('filters/tasks/all.json', JSON.stringify(filters), 'utf-8');
  Object.keys(filters).forEach(key => {
    fs.writeFileSync(`filters/tasks/${key}.json`, JSON.stringify(filters[key], null, 2), 'utf-8');
  });
}

generate();

