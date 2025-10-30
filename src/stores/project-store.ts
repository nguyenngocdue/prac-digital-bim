import { AppStore } from "./app-store";

/**
 * 
 */
export class ProjectStore {
    constructor( public appStore: AppStore) {
    }
    /**
     * Load projects from the server
     */
    public async loadProjects() {
        // Call API to load projects
        console.log("Loading project")
    }

    public dispose() {

    }

}