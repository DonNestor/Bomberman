Board.templates = [
    [ 
        'WWWWWWWWWWWWWWW',
        'W             W',
        'W X X X X X X W',
        'W             W',
        'W X X X X X X W',
        'W             W',
        'W X X X X X X W',
        'W             W',
        'W X X X X X X W',
        'W             W',
        'WWWWWWWWWWWWWWW'
    ] //jeden typ planszy
    ,[ 
        'WWWWWWWWWWWWWWW',
        'W             W',
        'W X XXX XXX X W',
        'W             W',
        'W X X X X X X W',
        'W X         X W',
        'W X X X X X X W',
        'W             W',
        'W X XXX XXX X W',
        'W             W',
        'WWWWWWWWWWWWWWW'
    ] //jeden typ planszy
];

Board.elements = {
    'floor': {sx:174, sy:16, type: 'empty', sub_type:'board'},
    'W': {sx:190, sy:16, type: 'solid', sub_type:'board'},
    'X': {sx:206, sy:16, type: 'solid', sub_type:'board'},
    'box': {sx:126, sy:0, type: 'soft', sub_type:'board', ko_obj:'Crate'}
};

function Board(){
    this.fW = 16;
    this.fH = 16;
    this.parse(Board.templates[VAR.rand(0, Board.templates.length-1)])
    for(let i=0; i<20; i++) {
        this.addCrate();
    }
}


Board.prototype.getEmptySpace = function() {
    return this.emptySpaces.length > 0 ? this.emptySpaces.shift() : null; //shift - usuwa z początku tablicy, skraca tablicę i zwraca ten element
};

Board.prototype.addCrate = function() {
    let pos = this.getEmptySpace();
    if(pos) {
        this.b[pos.y][pos.x] = Board.elements.box;
    }
}

Board.prototype.draw = function() {
    for(let i=0; i<this.b.length; i++) {
        for(let j=0; j<this.b[i].length; j++) {
            Game.ctx.drawImage(
                Game.spr, //źródło wycięcia obrazka
                //parametry wycięcia obrazka
                this.b[i][j].sx,
                this.b[i][j].sy,
                this.fW,
                this.fH,
                //miejsce w canvas, gdzie wklejamy wycinek z png
                j*this.fW*VAR.scale, //x
                i*this.fH*VAR.scale, //y
                this.fW*VAR.scale, //szerokość
                this.fH*VAR.scale, //wysokość
            );
            if(this.b[i][j].sub_type!='board') {
                this.b[i][j].draw();
            }
        }
    }
};

Board.prototype.parse = function(arr) {
    this.emptySpaces = [];
    this.b = [];

    for(let i=0; i<arr.length; i++) {
        this.b.push([]); //pojedynczy rząd
        for( let j=0; j<arr[i].length; j++) {
            this.b[i].push( Board.elements[ arr[i].charAt(j) ==' ' ? 'floor' : arr[i].charAt(j) ]) //charAt - character at position
            //
            if(this.b[i][j].type=='empty' && !(i==1 && j==1) && !(i==2 && j==1) && !(i==1 && j==2)) {
                this.emptySpaces.push( {x:j, y:i}); //miejsca gdzie mogą zrespić się skrzynki
            }
        }
    }

    this.emptySpaces = VAR.shuffle(this.emptySpaces);
};