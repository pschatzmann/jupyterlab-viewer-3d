import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the jupyterlab-viewer-3d extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab-viewer-3d:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension jupyterlab-viewer-3d is activated!');
  }
};

export default extension;
