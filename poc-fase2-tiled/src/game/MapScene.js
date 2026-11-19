import Phaser from 'phaser';

export class MapScene extends Phaser.Scene {

    constructor() {
        super('MapScene');
    }

    // 1. Cargamos el tileset y el mapa JSON
    preload() {
        this.load.image('tiles_oficina', '/assets/tileset.png');
        this.load.tilemapTiledJSON('mapa_oficina', '/assets/mapa.json');
    }

    // 2. Construimos el mapa
    create() {

        const map = this.make.tilemap({ key: 'mapa_oficina' });

        // Conectamos el tileset de Tiled con la imagen
        const tileset = map.addTilesetImage('tileset_tiled', 'tiles_oficina');

        if (!tileset) {
            console.error('Error: revisa el nombre tileset_tiled');
            return;
        }

        // Creamos las capas en el orden correcto
        const capaTerra = map.createLayer('Terra', tileset, 0, 0);
        const capaMobles = map.createLayer('Mobles', tileset, 0, 0);
        const capaParets = map.createLayer('Parets', tileset, 0, 0);

        // Activamos las colisiones de las paredes
        capaParets?.setCollisionByProperty({ collides: true });

        // 3. Leemos los objetos de Tiled
        const capaObjectes = map.getObjectLayer('Objectes');

        const elementsDetectats = [];

        capaObjectes?.objects.forEach((obj) => {

            // Leemos las propiedades personalizadas
            const props = this.obtenirPropietats(obj);

            // Calculamos el centro del objeto
            const cx = obj.x + (obj.width || 0) / 2;
            const cy = obj.y + (obj.height || 0) / 2;

            // SPAWN: punto donde aparece el jugador
            if (props.tipus === 'spawn') {
                this.avatar = this.add.circle(
                    cx,
                    cy,
                    14,
                    0x10b981
                ).setStrokeStyle(2, 0xffffff);
            }

            // ZONA: salas
            if (props.tipus === 'zona') {
                this.add.rectangle(
                    cx,
                    cy,
                    obj.width,
                    obj.height,
                    0x10b981,
                    0.22
                ).setStrokeStyle(2, 0x10b981);

                this.add.text(
                    cx,
                    cy,
                    props.nomSala || 'Zona',
                    {
                        fontSize: '13px',
                        color: '#a7f3d0'
                    }
                ).setOrigin(0.5);

                elementsDetectats.push({
                    tipus: 'Zona',
                    nom: props.nomSala || 'Sense nom',
                    aforament: props.aforament || 0
                });
            }

            // MONITOR: pantallas
            if (props.tipus === 'monitor') {
                this.add.rectangle(
                    cx,
                    cy,
                    28,
                    20,
                    0xf59e0b
                ).setStrokeStyle(2, 0xffffff);

                this.add.text(
                    cx,
                    cy - 18,
                    props.titol || 'Monitor',
                    {
                        fontSize: '12px',
                        color: '#fde68a'
                    }
                ).setOrigin(0.5);

                elementsDetectats.push({
                    tipus: 'Monitor',
                    nom: props.titol || 'Pantalla'
                });
            }
        });

        // 4. Enviamos los elementos detectados a Vue
        this.game.events.emit('mapa-carregat', elementsDetectats);
    }

    // 5. Leemos las propiedades de Tiled
    obtenirPropietats(obj) {
        const resultat = {};

        (obj.properties || []).forEach((p) => {
            resultat[p.name] = p.value;
        });

        return resultat;
    }
}