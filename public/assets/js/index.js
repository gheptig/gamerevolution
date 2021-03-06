//******smoke screen three.js reference https://codepen.io/teolitto/pen/KwOVvL */

///////////////KEEPING COMMENTED OUT CODE FOR FUTURE REFERENCE -MARIA/////////

$(document).ready(() => {
	//===================== JS for the parallax plugin============================//
	// object-fit polyfill run
	// objectFitImages();
	/* init Jarallax */
	jarallax(document.querySelectorAll('.jarallax'));
	jarallax(document.querySelectorAll('.jarallax-keep-img'), { keepImg: true });

	//=======================JS for the scroll in magic==========================//
	var controller = new ScrollMagic.Controller();
	let scrollScene = new ScrollMagic.Scene({
		triggerElement: '#trigger1',
		triggerHook: 0.9, // show, when scrolled 10% into view
		duration: '80%', // hide 10% before exiting view (80% + 10% from bottom)
		offset: 50 // move trigger to center of element
	});
	$('#reveal1').removeClass('d-none');
	scrollScene.setClassToggle('#reveal1', 'd-block'); // add class to reveal
	//scrollScene.addIndicators(); // add indicators (requires plugin)
	scrollScene.addTo(controller);

	//===================JS for THREE JS SMOKE BANNER============================//
	let camera, scene, renderer, geometry, material, mesh;

	window.addEventListener('resize', onWindowResize, false);

	//resizes the three js render size on when the window resized
	function onWindowResize() {
		renderer.setSize($('#smoke').innerWidth(), $('#smoke').innerHeight());
		renderer.domElement.style.height = $('#smoke').innerHeight();
	}

	initThreeJSSmokeCanvas();
	animateSmokeCanvas();

	function initThreeJSSmokeCanvas() {
		clock = new THREE.Clock();
		//changes the size of canvas to screen//
		renderer = new THREE.WebGLRenderer();
		renderer.setSize($('#smoke').innerWidth(), $('#smoke').innerHeight());

		scene = new THREE.Scene();
		//position of cameras
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.z = 1000;
		scene.add(camera);

		geometry = new THREE.CubeGeometry(200, 200, 200);
		material = new THREE.MeshLambertMaterial({ color: 0xaa6666, wireframe: false });
		mesh = new THREE.Mesh(geometry, material);
		//scene.add( mesh );
		cubeSineDriver = 0;

		textGeo = new THREE.PlaneGeometry(300, 300);
		THREE.ImageUtils.crossOrigin = ''; //Need this to pull in crossdomain images from AWS
		// textTexture = THREE.ImageUtils.loadTexture('../images/image1.jpg' colors the text);
		textTexture = new THREE.TextureLoader().load('./assets/images/index-images/GELogo1900px.png');
		let colortext = new THREE.Color('rgb(255,255,255)');
		textMaterial = new THREE.MeshLambertMaterial({
			color: colortext,
			opacity: 1,
			map: textTexture,
			transparent: true,
			blending: THREE.AdditiveBlending
		});
		text = new THREE.Mesh(textGeo, textMaterial);
		text.position.z = 700;
		scene.add(text);
		//changes the lighting that is against the clouds, middle section + creates a darker smoke, left # lightens
		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(-2, 0, 3);
		scene.add(light);

		smokeTexture = THREE.ImageUtils.loadTexture(
			'https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png'
		);
		//changes the color of the smoke, variable enters that color//
		let color = new THREE.Color('rgb(117, 69, 255		)');
		smokeMaterial = new THREE.MeshLambertMaterial({ color: color, map: smokeTexture, transparent: true });
		smokeGeo = new THREE.PlaneGeometry(300, 300);
		smokeParticles = [];

		for (p = 0; p < 150; p++) {
			let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
			//in math.random the end of the line where it says 2000 changes how much smoke shows up
			particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 4000 - 100);
			particle.rotation.z = Math.random() * 360;
			scene.add(particle);
			smokeParticles.push(particle);
		}

		//appends the smoke renderer to the div of the parallax, with an ID//
		$('#smoke').append(renderer.domElement);
	}

	function animateSmokeCanvas() {
		// note: three.js includes requestAnimationFrame shim
		delta = clock.getDelta();
		requestAnimationFrame(animateSmokeCanvas);
		evolveSmoke();
		render();
	}
	//changes the speed of the smoke at delta
	function evolveSmoke() {
		let sp = smokeParticles.length;
		while (sp--) {
			smokeParticles[sp].rotation.z += delta * 0.3;
		}
	}
	//rotation of the smoke
	function render() {
		mesh.rotation.x += 0.005;
		mesh.rotation.y += 0.01;
		cubeSineDriver += 0.01;
		mesh.position.z = 100 + Math.sin(cubeSineDriver) * 500;
		renderer.render(scene, camera);
	}

	//====================check user data==================//

	//toggle nav bar link if the user is logged in
	$.get('/api/user-data', () => {}).then((result) => {
		if (result.userId) {
			$('#myprofilelink').removeClass('d-none');
			$('#signOut').parent().removeClass('d-none');
			$('#loginBtn').addClass('d-none');
		}
	});

	//handle sign out btn
	$('#signOut').on('click', function() {
		$.get('/api/logout', (data) => {
			window.location.replace('/');
		});
	});
	//calling api data to present 3 top games into cards html//
	let searchTopThree = `https://api.rawg.io/api/games?dates=2020-01-01%2C2020-12-31&ordering=-rating&page=2&page_size=3`;

	// loops to top three results
	$.get(searchTopThree).then((response) => {
		console.log(response);
		response.results.forEach((element) => {
			console.log(element);
			const createdCard = createTopThreeCard(element.background_image, element.name);
			//appending the div onto the element//
			$('#topGameCards').append(createdCard);
		});
	});

	//creates div to hold card image text overlay
	let createTopThreeCard = (imgsrc, gameName) => {
		return $(` <div class="col-l-4 "  id= "reveal1">
		<div class="card bg-dark text-white">
		  <img src="${imgsrc}" class="card-img animate__animated animate__fadeIn" alt="...">
		  <div class="card-img-overlay">
			<h4 class="card-title"><b>${gameName}</b></h4>
		  </div>
		</div>
		
	  </div>`);
	};
});
