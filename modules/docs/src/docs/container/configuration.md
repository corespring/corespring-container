# Configuration + Deployment

## FileComponentLoader

If you are using the FileComponentLoader, you need to set the path to the components.
In production mode this must be an absolute path, as Play doesn't guarantee a working directory when run in Production mode.

### Shell Configuration

The Shell is a simple play app that allows you to run the editor and player.

* env var: `CONTAINER_COMPONENTS_PATH`
* conf var: components.path
* default: corespring-components/components
