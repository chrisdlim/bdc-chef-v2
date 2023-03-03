# bdc-chef-v2
## Discord bot for BDC Discord channel

## Setup
Requirements:
-Node version at least 16
-Discord API Key
-Giphy API Key

To run on local:
Run npm install to download node packages
```
npm install
```

create a .env file

```
touch .env
```

Add the following into the .env file. Replace <> with the API tokens (excluding bracket)
```
TOKEN=<DISCORD_TOKEN_HERE>
GIPHY_<GIPHY_API_TOKEN_HERE>
EASTER_EGG_NAMES=eric6971,chad5396,g-sing2234
```

Run nodemon
```
npm run start:dev
```

For Windows:
You made need to download WSL to get nodemon to run
```
wsl --install ubuntu
```
If using vscode you should be able to open a terminal using the wsl command line

You may also need to upgrade the version from WSL 1 to WSL 2 (distro name here is ubuntu if you followed the step above)
```
wsl --set-version <distro name> 2
```

