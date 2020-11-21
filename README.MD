<div align="center">
<h1>Tofu</h1>
<img alt="GitHub Deploying Status" src="https://github.com/Hickacou/Tofu/workflows/Deploy/badge.svg">    
<img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Hickacou/Tofu">
</div>
<h2>Self hosting</h2>
To host your own version of Tofu, follow the steps : 

 - Clone this repository using the following command in your terminal :
<pre>
$ git clone https://github.com/Hickacou/Tofu
</pre>
- Set the environment variables. For this, rename <code>.env.example</code> to <code>.env</code> and fill the blank spaces with your values.
- Install the dependencies with : 
<pre>
$ npm install
</pre>
- Make sure you set usable constants in <code>src/lib/Constants.ts</code>
- Compile and run with <b>pm2</b>:
<pre>
$ npm run compile
$ pm2 start build/app.js --name "Tofu"
</pre>
You can also use <code>npm start</code>

<b>Make sure to name your pm2 process "Tofu" for the npm scripts to work correctly</b>

<div align="center">
<a href="https://forthebadge.com" target="_blank"><img src="https://forthebadge.com/images/badges/made-with-typescript.svg" /></a>

<a href="https://forthebadge.com" target="_blank"><img src="https://forthebadge.com/images/badges/powered-by-water.svg" /></a>
</div>
<h3>Made by Hicka</h3>
<a href="https://github.com/Hickacou" target="_blank"><img alt="GitHub followers" src="https://img.shields.io/github/followers/Hickacou?style=social"></a>

<a href="https://twitter.com/puddingmangue" target="_blank"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/puddingmangue?style=social"></a>
<br>
Discord : **Hicka🍡#3151**
