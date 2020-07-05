//******smoke screen three.js */

$(document).ready(() => {
	// object-fit polyfill run
	objectFitImages();
	/* init Jarallax */
	jarallax(document.querySelectorAll('.jarallax'));
	jarallax(document.querySelectorAll('.jarallax-keep-img'), { keepImg: true });



	let camera, scene, renderer, geometry, material, mesh;

	window.addEventListener('resize', onWindowResize, false);

	//resizes the three js render size on when the window resized
	function onWindowResize() {
		renderer.setSize($('#smoke').innerWidth(), $('#smoke').innerHeight());
		renderer.domElement.style.height = $('#smoke').innerHeight()
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
		// textTexture = THREE.ImageUtils.loadTexture('../images/image1.jpg');
		textTexture = new THREE.TextureLoader().load('./assets/images/index-images/gamerevolution.jpg');
		let colortext = new THREE.Color('rgb(117, 69, 255		)');
		textMaterial = new THREE.MeshLambertMaterial({
			color: colortext,
			opacity: 1,
			map: textTexture,
			transparent: true,
			blending: THREE.AdditiveBlending
		});
		text = new THREE.Mesh(textGeo, textMaterial);
		text.position.z = 800;
		scene.add(text);
		//changes the lighting that is against the clouds, middle section + creates a darker smoke, left # lightens
		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(-1, 0, 2);
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
			particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 1000 - 100);
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
			smokeParticles[sp].rotation.z += delta * 0.1;
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



	
});
