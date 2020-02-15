import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader.js';
import { GCodeLoader } from 'three/examples/jsm/loaders/GCodeLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/**
 * The default mime type for the extension.
 */
const MIME_TYPE = 'model/stl';

/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-stl';

/**
 * A widget for rendering stl.
 */
export class OutputWidget extends Widget implements IRenderMime.IRenderer {
  /**
   * Construct a new output widget.
   */
  constructor(options: IRenderMime.IRendererOptions) {
    super();
    this._mimeType = options.mimeType;
    this.addClass(CLASS_NAME);
  }

  /**
   * Render stl into this widget's node.
   */
  renderModel(model: IRenderMime.IMimeModel): Promise<void> {
    
    //let data = model.data[this._mimeType] as string;
    //this.node.textContent = data.slice(0, 16384);

    let data = model.data[this._mimeType] as string;
    let dataUrl = "data:"+this._mimeType+","+data as string
    try {
        var scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x999999 );
        scene.add( new THREE.AmbientLight( 0x999999 ) );
        var camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 500 );
        // Z is up for objects intended to be 3D printed.
        camera.up.set( 0, 0, 1 );
        camera.position.set( 0, - 9, 6 );
        camera.add( new THREE.PointLight( 0xffffff, 0.8 ) );
        scene.add( camera );
        var grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x555555 );
        grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * Math.PI / 180  );
        scene.add( grid );
        var renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        this.node.appendChild( renderer.domElement );
        var loader = this.getLoader(this._mimeType);
        if (loader==null) {
            throw 'No loader defined for mime type '+this._mimeType;
        }
        loader.load(dataUrl, function (amfobject:any) {
            scene.add( amfobject );
            //render();
        });
        var controls = new OrbitControls( camera, renderer.domElement );
        //controls.addEventListener( 'change', render );
        controls.target.set( 0, 1.2, 2 );
        controls.update();
    } catch(error) {
         this.node.textContent = error
    }   
      
    return Promise.resolve();
  }
    
  getLoader(mime:string):THREE.Loader {
      if (mime.toLowerCase()=='model/stl'){
          return new STLLoader()
      } else if (mime.toLowerCase()=='model/amf'){
          return new AMFLoader()
      } else if (mime.toLowerCase()=='model/collada'){
          return new ColladaLoader()
      } else if (mime.toLowerCase()=='model/obj'){
          return new OBJLoader()
      } else if (mime.toLowerCase()=='model/3mf'){
          return new ThreeMFLoader()
      } else if (mime.toLowerCase()=='model/gcode'){
          return new GCodeLoader();
      } 
      return null;
  }  
    


  private _mimeType: string;
}

/**
 * A mime renderer factory for stl data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: [MIME_TYPE],
  createRenderer: options => new OutputWidget(options)
};

/**
 * Extension definition.
 */
const extension: IRenderMime.IExtension = {
  id: 'jupyterlab-viewer-stl:plugin',
  rendererFactory,
  rank: 0,
  dataType: 'string',
  fileTypes: [
    {
      name: 'stl',
      fileFormat: 'base64',
      mimeTypes: [MIME_TYPE],
      extensions: ['.stl']
    }
  ],
  documentWidgetFactoryOptions: {
    name: 'STL viewer',
    primaryFileType: 'stl',
    fileTypes: ['stl'],
    modelName: 'base64',
    defaultFor: ['stl']
  }
};

export default extension;
