Character.count = 0;

function Character(inheritance) {
    Character.count++;
    this.id ='ch_'+Character.count; //Tworzenie Id dla kolejnej postaci na planszy Wróg / bochater
    if(!inheritance) {
        Game.toDraw[this.id]  = this;
    }
    //
    this.fW = 21; //szerokość animacji
    this.fH = 24; //wysokość animacji
    //
    this.mod_x = -2;
    this.mod_y = -9;
    //
    this.speed = 2;
    //
    this.current_f = 0; //aktualna klatka (index tablicy)
    //
    this.f_max_delay = 2;
    this.change_f_delay = 0;

}

Character.prototype.rowAndColumn = function() {
    this.row = Math.round(this.y / Game.board.fH);
    this.column = Math.round(this.x / Game.board.fW);
    if(this.state.slice(-2)=='go') {
        if(this.state=='left_go' || this.state=='right_go') {
            this.next_row = this.row;
            this.next_column = this.state == 'left_go' ? Math.floor(this.x / Game.board.fW) : Math.ceil(this.x / Game.board.fW);
        } else {
            this.next_column = this.column;
            this.next_row = this.state == 'up_go' ? Math.floor(this.y / Game.board.fH) : Math.ceil(this.y / Game.board.fH)
        }
        if( !(this.row==this.next_row && this.column==this.next_column) && Game.board.b[this.next_row][this.next_column].type !='empty') {
            this.state = this.state.slice(0,this.state.indexOf('_go'));
            this.current_f = 0;
            if(this.row != this.next_row) {
                this.y = this.row * Game.board.fH;
            } else {
                this.x = this.column * Game.board.fW;
            }
        } else {
            if(this.row != this.next_row) {
                this.x = this.column*Game.board.fW;
            } else if(this.column != this.next_column) {
                this.y = this.row*Game.board.fH;
            }
        }
    } else {
        this.next_row = this.row;
        this.next_column = this.column;
    }
}

Character.prototype.draw = function() {
    if(this.state.slice(-2)=='go') {
        if(this.state=='down_go') {
            this.y += this.speed;
        } else if(this.state=='right_go') {
            this.x += this.speed;
        } else if(this.state=='left_go') {
            this.x -= this.speed;
        } else if(this.state=='up_go') {
            this.y -= this.speed;
        }
        this.rowAndColumn();
    }
    
//funkcje pomocnicze do oznaczenia aktualnegi i następnego pola
    // Game.ctx.fillRect(this.column*Game.board.fW*VAR.scale,
    //     this.row*Game.board.fH*VAR.scale,
    //     Game.board.fH*VAR.scale,
    //     Game.board.fW*VAR.scale);

    // Game.ctx.fillRect(this.next_column*Game.board.fW*VAR.scale,
    //     this.next_row*Game.board.fH*VAR.scale,
    //     Game.board.fH*VAR.scale,
    //     Game.board.fW*VAR.scale);

    if(Game.board.b[this.row][this.column].sub_type=='bomb' && Game.board.b[this.row][this.column].bum_type) {
        this.setKO();
    }


    if(this.states[ this.state ].flip) {
        Game.ctx.save(); //zapisujemy ustawienia
        Game.ctx.scale(-1, 1);
    }

    //rysowanie obrazka
    Game.ctx.drawImage(
        //pobranie źródła
        Game.spr, //źródło
        //this.start_x + this.frames[this.current_f] * this.fW, //kierunek x - stan początkowy + obecna klatka * szerokość klatki
        this.states[ this.state ].sx + this.states[ this.state ].f[ this.current_f ] * this.fW,
        this.states[ this.state ].sy,
        this.fW, 
        this.fH, 

        //gdzie wklejamy obrazek
        this.states[ this.state ].flip ? (-this.fW - this.mod_x - this.x) * VAR.scale : (this.mod_x + this.x) * VAR.scale,
        (this.y + this.mod_y) * VAR.scale,
        this.fW * VAR.scale,
        this.fH * VAR.scale,
    );
    
    if(this.states[ this.state ].flip) {
        Game.ctx.restore();
    }

    if(this.change_f_delay < this.f_max_delay) {
        this.change_f_delay++;
    } else {
        this.change_f_delay = 0;
        if(this.state=='ko' && this.current_f==this.states[this.state].f.length-1) {
            this.afterKO();
        } else {
            this.current_f = this.current_f +1 >= this.states[ this.state ].f.length ? 0 : this.current_f +1;
        }   
    }
}

Character.prototype.setKO = function() {
    this.state = 'ko';
}

Character.prototype.afterKO = function() {
    delete Game.toDraw[this.id];
}

function Hero() {
    Character.call(this);
    this.state = 'down';
    //definiujemy wszystkie stany
    this.states = {
        'down':{sx:0, sy:0, f:[0]},
        'down_go':{sx:0, sy:0, f:[1,0,2,0]},
        'left':{sx:63, sy:0, f:[0]},
        'left_go':{sx:63, sy:0, f:[1,0,2,0]},
        'up':{sx:0, sy:24, f:[0]},
        'up_go':{sx:0, sy:24, f:[1,0,2,0]},
        'right':{sx:63, sy:0, f:[0], flip:true},
        'right_go':{sx:63, sy:0, f:[1,0,2,0], flip:true}, 
        'ko':{sx:0, sy:48, f:[0,1,0,1,0,1,2,3,4]}
    }
    this.x = Game.board.fW;
    this.y = Game.board.fH;
    this.rowAndColumn();
}


//Dziedziczenie po Character
Hero.prototype = new Character(true);
Hero.prototype.constructor = Hero;
Hero.prototype.parent = Character.prototype;

Hero.prototype.updateState = function() {
    this.tmp_state = this.state;
    if(Game.key_37|| Game.key_65) {
        this.tmp_state = 'left_go';
    } else if(Game.key_38 || Game.key_87) {
        this.tmp_state = 'up_go';
    } else if(Game.key_39 || Game.key_68) {
        this.tmp_state = 'right_go';
    } else if(Game.key_40 || Game.key_83) {
        this.tmp_state = 'down_go';
    } else if(this.state.slice(-2) == 'go') {
        this.tmp_state = this.state.slice(0,this.state.indexOf('_go'));
    }

    if(this.tmp_state != this.state) {
        this.current_f = 0;
        this.state = this.tmp_state;
    }
}

Hero.prototype.setKO = function() {
    this.parent.setKO.call(this);
    Game.stop();
}

Hero.prototype.afterKO = function() {
    if(!Game.is_over){
        Game.is_over = true;
        console.log('Game Over');
    }

}

Hero.prototype.enemyHitTest = function() {
    for(let e in Enemy.all) {
        e = Enemy.all[e];
        if((this.row == e.row && e.x + Game.board.fW > this.x && e.x < this.x + Game.board.fW) 
        || (this.column == e.column && e.y + Game.board.fH > this.y && e.y < this.y + Game.board.fH) ) {
            return true;
        }
    }
    return false;
};

Hero.prototype.draw = function() {
    this.parent.draw.call(this); //wywolanie oryginalnej funkcji
    //rozszerzenie
    if(this.state != 'ko' && this.enemyHitTest()) {
        this.setKO();
    }
}

Enemy.all = {};
function Enemy(x,y) {
    Character.call(this);
    Enemy.all[this.id] = this;
    this.state = 'down';
    this.states = {
        'down':{sx:0, sy:72, f:[0]},
        'down_go':{sx:0, sy:72, f:[1,0,2,0]},
        'left':{sx:63, sy:24, f:[0]},
        'left_go':{sx:63, sy:24, f:[1,0,2,0]},
        'up':{sx:63, sy:72, f:[0]},
        'up_go':{sx:63, sy:72, f:[1,0,2,0]},
        'right':{sx:63, sy:24, f:[0], flip:true},
        'right_go':{sx:63, sy:24, f:[1,0,2,0], flip:true}, 
        'ko':{sx:0, sy:96, f:[0,1,2,3,4,5]}
    };
    this.x = x;
    this.y = y;
    this.rowAndColumn();
    this.setDirector();
}

Enemy.prototype = new Character(true);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.parent = Character.prototype;

Enemy.prototype.setDirector = function() {
    this.canGo = this.canGo || []; //jeśli jest już tablica dla danego enemy to wykorzystuje ją, w przeciwnym razie tworzy nową, pusta.
    this.canGo.length = 0; //pusta tablica, brak elementów

    for(let i=this.column-1; i<=this.column+1; i++) {
        for(let j=this.row-1; j<=this.row+1; j++) {
            if(!(i==this.column && j==this.row)) { //wykluczamy pole na którym stoi kurczak
                if(i==this.column || j == this.row) { //sprawdzanie pól sąsiednich
                    if(Game.board.b[j][i].type=='empty') {
                        this.canGo.push({x:i, y:j});
                    }
                }
            }
        }
    }

    if(this.canGo.length > 0) {
        this.tmp_pos = this.canGo[ VAR.rand(0, this.canGo.length-1)];
        if(this.column < this.tmp_pos.x) {
            this.state = 'right_go';
        } else if(this.column > this.tmp_pos.x) {
            this.state = 'left_go';
        } else if(this.row < this.tmp_pos.y) {
            this.state = 'down_go';
        } else if(this.row > this.tmp_pos.y) {
            this.state = 'up_go';
        }

    } else if(this.state.slice(-2)=='go') {
        this.state = this.state.slice(0, this.state.indexOf('_go'));
    }
};

Enemy.prototype.rowAndColumn = function() {
    this.prev_state = this.state;
    this.parent.rowAndColumn.call(this);

    if(this.state!=this.prev_state && this.state.slice(-2) != 'go' && this.prev_state.slice(-2)=='go'){
        this.setDirector();
    }
}
Enemy.prototype.afterKO = function() {
    this.parent.afterKO.call(this);
    delete Enemy.all[this.id];
    let some_enemy = false;
    for(let e in Enemy.all) {
        some_enemy = true;
        break;
    }
    if(!some_enemy){
        console.log('success');
    }
};