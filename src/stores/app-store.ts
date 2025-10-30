import { signal } from "@preact/signals-react";
import { ThemeStore } from "./theme-store";
import { ProjectStore } from "./project-store";

export class AppStore {
    /**
     * appReady boolean detect app is ready
     */
    public appReady = signal<boolean>(false);

    /**
     * 
     */
    public appError = signal<string | null>(null);

    /**
     * 
     */
    public themeStore = new ThemeStore();
    /**
     * 
     */
    public projectStore = new ProjectStore(this);

    private _initialized = false; 

    /**
     * Initialize the app store. Call any async startup tasks here.
     * After initialization completes, `appReady` will be set to true.
     */
    public async init(): Promise<void> {
        if (this._initialized) return;
        this._initialized = true;

        try {
            // place for async initialization (e.g., load persisted state, fetch remote config)
            // await something...
        } catch (e) {
            this.appError.value = String(e ?? "init error");
        } finally {
            // mark ready even if there was an error so the UI can render and show error state
            this.appReady.value = true;
        }
    }

    public dispose() {
        this.projectStore.dispose();
    }

  
    
}