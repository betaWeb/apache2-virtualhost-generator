# apache2-virtualhost-generator

> Apache2 virtualhost config file (on sites-available folder) generator build with NodeJS.

![Editer une configuration](/static/images/pic1.png)

## Installation
Run the following command to build the project:
```
npm run build
```
Then, check that you have su permissions. If not, add this line on `/etc/sudoers` (replace `<username>` by your current username) :
```
<username> ALL=(ALL) NOPASSWD: ALL
```
## Run application
To run application, just run the following command :
```
npm run serve:prod
```

The server starts by default on port `3000`. To launch app with other port, or define other environment variables, you can edit `.env` file.
```
APP_ENV="production"

API_PROTOCOL="http"
API_HOST="localhost"
API_PORT=8905
API_URL=

APP_PROTOCOL=http
APP_PORT=3000

CONF_PATH="/etc/apache2/"
CONF_EXTENSION=".conf"
CONF_AVAILABLES="sites-available/"
CONF_ENABLED="sites-enabled/"
```