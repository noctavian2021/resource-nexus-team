
// Initial data for our backend server
const { teamMembers, departments, projects } = require('./initial-data');

// Store data in memory
const db = {
  teamMembers: [...teamMembers],
  departments: [...departments],
  projects: [...projects]
};

// Get unique ID for new items
const getNextId = (collection) => {
  const maxId = Math.max(...db[collection].map(item => parseInt(item.id)));
  return (maxId + 1).toString();
};

module.exports = {
  db,
  getNextId
};
