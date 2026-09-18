// CRA can inline the entire REACT_APP_* environment object through dependencies.
process.env.NODE_ENV = process.argv[2] || 'production';
require('react-scripts/config/env');

if (process.env.REACT_APP_SANITY_TOKEN) {
  console.error('Remove the legacy Sanity token variable from the frontend environment before starting or building. Public reads require only the project ID and dataset.');
  process.exit(1);
}
