console.log('starting create_filters_data.js');

const { get } = require("axios")

const { getAgencies, getLanguages, getLicenses, sortByName } = require("./utils")

const { CODE_GOV_API_KEY, CODE_GOV_TASKS_URL } = process.env;

const fs = require('fs');

async function getTasks() {
  let tasksURL = CODE_GOV_TASKS_URL || 'https://api.code.gov/open-tasks?size=10000'
  if (CODE_GOV_API_KEY) tasksURL += `&api_key=${CODE_GOV_API_KEY}`
  return get(tasksURL).then(response => response.data.items)
}

function getCategories(tasks) {
  const categories = new Set();
  tasks.forEach(task => {
    const taskType = task.type;
    if (taskType) {
      categories.add(taskType.trim());
    }
  });

  return Array.from(categories)
  .sort((a, b) => a.toLowerCase() > b.toLowerCase() ? 1 : -1)
  .map(category => {
    const name = category === 'good' ? 'good first issue' : category
    console.log("category:", category)
    return { name, value: category.toLowerCase() }
  });
}

async function generate() {

  const filters = {};

  const tasks = await getTasks();
  console.log("tasks:", tasks.toString().substring(0, 500) + '...');

  filters.agencies = getAgencies(tasks, true);
  console.log("filters.agencies:", filters.agencies);
  filters.categories = getCategories(tasks);
  console.log("filters.categories:", filters.categories);
  filters.languages = getLanguages(tasks, true);
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
