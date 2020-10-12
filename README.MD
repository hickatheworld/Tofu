<div align="center">
<h1>OC Bot</h1>
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/Hickacou/OC-Bot/Deploy">
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Hickacou/OC-Bot">
</div>
<h2>Self hosting</h2>
To host your own version of OC Bot, follow the steps : 

 - Clone this repository using the following command in your terminal :
<pre>
$ git clone https://github.com/Hickacou/OC-Bot
</pre>
- Set the environment variables. For this, rename <code>.env.example</code> to <code>.env</code> and fill the blank spaces with your values.
- Install the dependencies with : 
<pre>
$ npm install
</pre>
- Make sur you set usable constants in <code>./src/lib/Constants.ts</code>
- Compile and run with <b>pm2</b>:
<pre>
$ npm run compile
$ pm2 start build/app.js --name "OC-Bot"
</pre>
You can also use <code>npm start</code>

<b>Make sure to name your pm2 process "OC-Bot" for the npm scripts to work correctly</b>

<div align="center">
<a href="https://forthebadge.com" target="_blank"><img src="https://forthebadge.com/images/badges/made-with-typescript.svg" /></a>

<a href="https://forthebadge.com" target="_blank"><img src="https://forthebadge.com/images/badges/powered-by-water.svg" /></a>
</div>
<h3>Made by Hicka</h3>
<a href="https://github.com/Hickacou" target="_blank"><img alt="GitHub followers" src="https://img.shields.io/github/followers/Hickacou?style=social"></a>

<a href="https://twitter.com/puddingmangue" target="_blank"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/puddingmangue?style=social"></a>
<br>
Discord direct contact : **Hicka#3151**
This bot was made for the <a href="https://discord.gg/oncecommunity" target="_blank">Once Community Discord server</a>.