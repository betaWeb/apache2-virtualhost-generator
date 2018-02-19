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

The server starts by default on port 3000.