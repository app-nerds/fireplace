## Fireplace

This repository houses the Fireplace application. Website and app for the Fireplace logging server

## Authors

* adampresley@appnerds.net

## Environment Variables

To run this project a set of environment variables need to be set in your .env file. 

* `SERVER_HOST` - Default value == `0.0.0.0:8080`
* `LOGLEVEL` - Default value == `debug`
* `DSN` - Set this to a DSN suitable for the database tech chosen
* `GITHUB_TOKEN` - Provide a Github Personal Access token which has access to your private repositories

## Run Locally

Step 1: Clone the project

```
git clone git@github.com:app-nerds/fireplace.git
```

Step 2: Setup and install dependencies

```
cd fireplacelogging
make setup
```

Step 3: Run the application

```
make run
```

