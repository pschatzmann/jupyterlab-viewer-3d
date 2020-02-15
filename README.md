# jupyterlab-viewer-3d

A JupyterLab extension for rendering 3d files (stl, amf, obj, 3mf, gcode, collada)

## Prerequisites

* JupyterLab 1.0 or later

## Installation

```bash
jupyter labextension install jupyterlab-viewer-3d
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

