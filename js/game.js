// Inicjuję grę dopiero po załadowaniu całej strony
window.onload = function(){
	Game.spr = new Image();
	Game.spr.onload = Game.init;
	Game.spr.src = 'img/bombe.png';
}
// Obiekt, w którym będą przechowywane „podręczne” wartości
VAR = {
	fps:15,// animacja w Bombermenie nie była tak płynna jak we współczesnych grach
	W:0,// szerokość okna
	H:0,// wysokość okna
	scale:5,// elementy gry będą wklejane w odpowiedniej skali
	//
	lastTime:0,
	rand:function(min,max){
		return Math.floor(Math.random()*(max-min+1))+min;
	},

	shuffle:function(arr) {
		//Algorytm opracowany przez Ronalda Fishera & Frank Yates
		let counter = arr.length;
		let tmp;
		let index;

		while(counter > 0) {
			counter--;
			index = Math.floor(Math.random() * counter); //Math.random() 0-1, nigdy nie daje 1,
			tmp = arr[counter];
			arr[counter] = arr[index];
			arr[index] = tmp;
		}
		return arr;
	}
};
// Obiekt zawierający bazowe funckje związane z grą.
// Game nie ma konstruktora, jest jedynie obiektem grupującym funkcje.
Game = {
	// init zostanie odpalone raz po załadowaniu strony.
	toDraw:{},
	init:function(){
		// Tworzę canvas
		Game.canvas = document.createElement('canvas');
		// Przypisuję kontekst 2D do zmiennej ctx, która jest właściwością obiektu Game
		Game.ctx = Game.canvas.getContext('2d');
		// odpalam metodę obiektu Game
		Game.board = new Board();
		Game.layout();
		// metoda layout odpali się przy każdej zmianie wielkości okna
		window.addEventListener('resize', Game.layout, false);
		// Canvas zostaje dodany do DOM
		document.body.appendChild(Game.canvas);

		
		//
		//Game.character = new Character();
		Game.hero = new Hero();

		let tmp_empty;
		for(let i=0; i<5; i++) {
			tmp_empty = Game.board.getEmptySpace();
			new Enemy(tmp_empty.x*Game.board.fW, tmp_empty.y*Game.board.fH);
		}
	
		window.addEventListener('keydown', Game.onKey, false);
		window.addEventListener('keyup', Game.onKey, false);
		
		

		// rozpoczęcie pętli gry
		Game.animationLoop();
	},
	stop:function(){
		window.removeEventListener('keydown', Game.onKey);
		window.removeEventListener('keyup', Game.onKey);
	},

	onKey:function(ev) {
		if((ev.keyCode>=37 && ev.keyCode<=40) || (ev.keyCode ==87 || ev.keyCode==83 || ev.keyCode==65 || ev.keyCode==68) || ev.keyCode==32) { //(ev.keyCode ==87 || ev.keyCode==83 || ev.keyCode==65 || ev.keyCode==68) || 
			//ev.preventDefault();
			if(ev.type=='keydown' && !Game['key_'+ev.keyCode]) {
				Game['key_'+ev.keyCode] = true;
				if(ev.keyCode>=37 && ev.keyCode<=87) { //40/87
					for(let i=37; i<=87; i++) { //40/87
						if(i!=ev.keyCode) {
							Game['key_'+i] = false; //dla wszystkiego co nie jest wciśnięte obecnie ustaw na false
						}
					}
					Game.hero.updateState();
				} else {
					new Bomb(Game.hero.column, Game.hero.row);
				}
			} else if(ev.type=='keyup') {
				Game['key_'+ev.keyCode] = false;
				Game.hero.updateState();
			}
		}
	},


	// Ta metoda będzie odpalana przy każdej zmianie wielkości okna
	layout:function(ev){
		// Dla łatwiejszego pisania wielkość okna zostaje przypisana do właściwości W i H obiektu VAR
		VAR.W = window.innerWidth;
		VAR.H = window.innerHeight;

		// Wybieramy mniejszą wartść z szerokości i wysokości (zaokrąglone w dół do liczb całkowitych żeby zachować ostrość pikseli grafik)
		VAR.scale = Math.max(1, Math.min(
			Math.floor(VAR.W / (Game.board.fW * Game.board.b[0].length)), //Szerokość okna / szerokość planszy * ilość kolumn ( b[0] = 15 kolumn)
			Math.floor(VAR.H / (Game.board.fH * Game.board.b.length)) //Szerokość okna / szerokość planszy * ilość rzędów ( b = 11 rzędów)
		));
		//
		// Obliczenie szerokości i wysokości canvas
		Game.canvas.width = Math.round(VAR.scale * Game.board.fW * Game.board.b[0].length);
		Game.canvas.height = Math.round(VAR.scale * Game.board.fH * Game.board.b.length);
		//
		Game.canvas.style[Modernizr.prefixed('transform')] = 'translate('+ Math.round((VAR.W - Game.canvas.width) / 2) + 'px,' + Math.round((VAR.H - Game.canvas.height) / 2) + 'px)';
		//
		Game.ctx.imageSmoothingEnabled = false;
		Game.ctx.mozImageSmoothingEnabled = false;
		Game.ctx.oImageSmoothingEnabled = false;
		Game.ctx.webkitImageSmoothingEnabled = false;
	},
	// Funkcja, która odpala się 60 razy na sekundę
	animationLoop:function(time){
		requestAnimationFrame( Game.animationLoop );
		// ograniczenie do ilości klatek zdefiniowanych w właściwości obiektu VAR (nie więcej niż VAR.fps)
		if(time-VAR.lastTime>=1000/VAR.fps){
			VAR.lastTime = time;
			//
			// oczyszczenie canvas
			Game.ctx.clearRect(0,0,VAR.W, VAR.H);
			//
			Game.board.draw();
			//
			for(let o in Game.toDraw) {
				Game.toDraw[o].draw();
			}
			
		}
	}
}