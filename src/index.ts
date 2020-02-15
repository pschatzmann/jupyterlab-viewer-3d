import { IRenderMime } from '@jupyterlab/rendermime-interfaces';
import { Widget } from '@lumino/widgets';

// ThreeJS
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { ThreeMFLoader } from 'three/examples/jsm/loaders/3MFLoader.js';
import { AMFLoader } from 'three/examples/jsm/loaders/AMFLoader.js';
import { GCodeLoader } from 'three/examples/jsm/loaders/GCodeLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";


/**
 * The class name added to the extension.
 */
const CLASS_NAME = 'mimerenderer-stl';
const MIME_EXTENSIONS = ['stl','amf','obj','3mf','gcode','dae'];
const MIME_TYPES = ['model/stl','model/amf','model/obj','model/3mf','model/gcode','model/vnd.collada+xml'];

/**
 * A widget for rendering stl.
 */
export class Output3DWidget extends Widget implements IRenderMime.IRenderer {
    private scene = new THREE.Scene();
    private renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true  } );;
    private camera = new THREE.PerspectiveCamera( 70, this.node.clientWidth/ this.node.clientHeight, 1, 100 );
    private controls!:OrbitControls;
    private mimeType:string;
    private mesh:any;
    //private materialColor = 0x0000FF;

    /**
     * Construct a new output widget.
     */
    constructor(options: IRenderMime.IRendererOptions) {
      super();
      this.mimeType = options.mimeType;
      this.addClass(CLASS_NAME);
    }

    /**
     * Render stl into this widget's node.
     */
    renderModel(model: IRenderMime.IMimeModel): Promise<void> {
      console.log("renderModel -> "+this.mimeType);
      let data = model.data[this.mimeType] as string;
      let dataUrl = "data:"+this.mimeType+";base64,"+data as string

      try {
          // setup camera
          this.scene.background = new THREE.Color( 0x999999 );
          this.scene.add( new THREE.AmbientLight( 0xffffff ) );
          //this.camera.add( new THREE.PointLight( 0xff0000, 1, 100 ) );          
          this.scene.add( this.camera );

          // add data
          this.load(dataUrl);
          this.node.appendChild( this.renderer.domElement );
      
        
          // handle resizing
          window.addEventListener('resize', (event) => {
            //console.log("resize")
            this.renderer.setSize(this.node.clientWidth, this.node.clientHeight);
            this.camera.aspect = this.node.clientWidth/this.node.clientHeight;
            this.camera.updateProjectionMatrix();
          }, false);


          // setup Controls
          this.controls = new OrbitControls( this.camera, this.renderer.domElement );
          this.controls.enableDamping = true;
          this.controls.enableZoom = true;
          this.controls.enabled = true;
          this.controls.autoRotate = true;
          this.controls.autoRotateSpeed = 1;

          // handle mouse events
          this.controls.addEventListener( 'change', (event) => { 
            this.renderer.render( this.scene, this.camera );
           } );
           this.controls.update();

          // animation
          this.animate();

      } catch(error) {
        console.error(error);
        this.node.textContent = error
      }   
        
      return Promise.resolve();
    }

    animate() {
        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();
        this.renderer.render( this.scene, this.camera );
        requestAnimationFrame(this.animate.bind(this));
    }


    load(dataUrl:string) {
        var loader = this.getLoader(this.mimeType);
        if (loader==null) {
            throw 'No loader defined for mime type '+this.mimeType;
        }

        var self = this;
        loader.load(dataUrl, function (geometry:any) {
          try {
              if (self.mimeType=='model/stl'){
                //var material = new THREE.MeshPhongMaterial( { color: self.materialColor, specular: 100, shininess: 100 } );
                var material = new THREE.MeshNormalMaterial();
                self.mesh = new THREE.Mesh( geometry, material );
                // center object
                var middle = new THREE.Vector3();
                geometry.computeBoundingBox();
                geometry.boundingBox.getCenter(middle);
                self.mesh.position.x = -middle.x;
                self.mesh.position.y = -middle.y;
                self.mesh.position.z = -middle.z;
                
                // pull the camera away so that it is a reasonable size
                var largestDimension = Math.max(geometry.boundingBox.max.x, geometry.boundingBox.max.y, geometry.boundingBox.max.z)
                self.camera.position.z = largestDimension * 1.5;
              } else {
                self.mesh = geometry;
              }
              
              self.scene.add( self.mesh );

              // setup with/height
              self.renderer.setPixelRatio( window.devicePixelRatio );
              self.renderer.setSize( self.node.clientWidth, self.node.clientHeight );
              self.camera.aspect = self.node.clientWidth/self.node.clientHeight;
              self.camera.updateProjectionMatrix();

              // render
              self.renderer.render( self.scene, self.camera );
            } catch(error) {
              console.error(error);
              self.node.textContent = error
          }   
    
        });

    }
    
    getLoader(mime:string) {
        if (mime.toLowerCase()=='model/stl'){
            return new STLLoader()
        } else if (mime.toLowerCase()=='model/amf'){
            return new AMFLoader()
        } else if (mime.toLowerCase()=='model/vnd.collada+xml'){
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
}

/**
 * A mime renderer factory for stl data.
 */
export const rendererFactory: IRenderMime.IRendererFactory = {
  safe: true,
  mimeTypes: MIME_TYPES,
  createRenderer: options => new Output3DWidget(options)
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
      mimeTypes: ['model/stl'],
      extensions: ['.stl']
    },{
      name: 'amf',
      fileFormat: 'base64',
      mimeTypes: ['model/amf'],
      extensions: ['.amf']
    },{
      name: 'obj',
      fileFormat: 'base64',
      mimeTypes: ['model/obj'],
      extensions: ['.obj']
    },{
      name: '3mf',
      fileFormat: 'base64',
      mimeTypes: ['model/3mf'],
      extensions: ['.3fm']
    },{
      name: 'gcode',
      fileFormat: 'base64',
      mimeTypes: ['model/gcode'],
      extensions: ['.gcode']
    },{
      name: 'dae',
      fileFormat: 'base64',
      mimeTypes: ['model/vnd.collada+xml/dae'],
      extensions: ['.dae']
    }
  ],
  documentWidgetFactoryOptions: {
    name: '3D viewer',
    primaryFileType: 'stl',
    modelName: 'base64',
    fileTypes: MIME_EXTENSIONS,
    defaultFor: MIME_EXTENSIONS
  }
};

export default extension;