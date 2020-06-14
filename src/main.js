const tmi = require('tmi.js');

const bananaImage = new Image();
bananaImage.src = require('./banana.png');

const sound_sources = [
	require('./recordings/0.mp3'),
	require('./recordings/1.mp3'),
	require('./recordings/2.mp3'),
	require('./recordings/3.mp3'),
	require('./recordings/4.mp3'),
	require('./recordings/5.mp3'),
	require('./recordings/6.mp3'),
	require('./recordings/7.mp3'),
]
const sounds = [];
for (let index = 0; index < sound_sources.length; index++) {
	const element = sound_sources[index];
	sounds.push(new Audio(element));
}

let channels = ['antimattertape'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

if (query_vars.volume) {
	for (let index = 0; index < sounds.length; index++) {
		const element = sounds[index];
		element.volume = Number(query_vars.volume)/100
	}
}

const client = new tmi.Client({
	options: { debug: false },
	connection: {
		reconnect: true,
		secure: true
	},
	channels: channels,
});
client.connect();
client.on('message', (channel, tags, message, self) => {
	if (message.match(/banana|🍌/i)) {
		fire_banana();
	}
});

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const bananas = [];
const default_bananaSize = 100;
const bananaSize = query_vars.scale ? Number(query_vars.scale)*default_bananaSize || default_bananaSize : default_bananaSize;
const bananaLifespan = 5;
const bananaMinimumSpeed = 50;
const bananaMaximumSpeed = 150;
const fire_banana = () => {
	const direction = Math.random()*Math.PI;
	bananas.push({
		x: Math.random()*canvas.width-bananaSize/2,
		y: Math.random()*canvas.height-bananaSize/2,
		vx: Math.cos(direction),
		vy: Math.sin(direction),
		p: bananaLifespan,
		r: Math.random()*Math.PI,
		rSpeed: Math.random(),
		speed: bananaMinimumSpeed+Math.random()*(bananaMaximumSpeed - bananaMinimumSpeed)
	});
	sounds[Math.floor(Math.random()*sounds.length)].play();
}

let last_frame = Date.now();
const draw = () => {
	window.requestAnimationFrame(draw);
	const delta = (Date.now() - last_frame) / 1000;
	last_frame = Date.now();

	ctx.clearRect(0, 0, canvas.width, canvas.height)
	for (let index = bananas.length-1; index >= 0; index--) {
		const banana = bananas[index];
		banana.x += banana.vx*delta*banana.speed;
		banana.y += banana.vx*delta*banana.speed;
		banana.p -= delta;
		banana.r += banana.rSpeed*delta;

		ctx.globalAlpha = banana.p/bananaLifespan;
		ctx.save();
		ctx.translate(banana.x, banana.y);
		ctx.rotate(banana.r)
		ctx.drawImage(bananaImage, 0, 0, bananaSize, bananaSize);
		ctx.restore();

		if (banana.p <= 0) {
			bananas.splice(index, 1);
		}
	}
}
window.requestAnimationFrame(draw);

window.addEventListener('DOMContentLoaded', ()=>{
	document.body.appendChild(canvas);
	const resize = ()=>{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resize();
	window.addEventListener('resize', resize);
})


//setInterval(fire_banana, 250)