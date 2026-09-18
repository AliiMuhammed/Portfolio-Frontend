# Portfolio

React / Create React App portfolio with Sanity and Netlify.

## Local setup and deployment

Copy `.env.example` to `.env` and set the two public configuration values:

- `REACT_APP_SANITY_PROJECT_ID`: your Sanity project ID.
- `REACT_APP_SANITY_DATASET`: `production` for the existing dataset.

The dataset must allow public reads. No Sanity token belongs in this frontend.
A previously committed token must be revoked/rotated in the Sanity dashboard;
untracking `.env` does not remove its exposure from Git history. Remove the old
token variable from local and Netlify environments as well. Do not replace it
with a new browser token. The start/build guard rejects the legacy token variable
because CRA can inline environment objects even when the client does not use it.

Run `npm ci`, `npm test -- --watchAll=false --runInBand`, and `npm run build`.
Netlify should use `npm run build`, publish `build`, and receive the same two
non-secret variables above at build time. Rebuild after changing them.
Use `http://localhost:3000` for local preview: it and the existing production
origin are allowed by Sanity CORS. Other origins require explicit CORS setup.
`netlify.toml` preserves the SPA fallback for direct route visits and refreshes.

The application uses ordinary CSS. The unused direct Tailwind installation was
removed; CRA still includes its own inactive transitive Tailwind dependency.

The prior production outage was a Netlify account/usage issue; restoring hosting
availability requires resolving that account issue separately.

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
