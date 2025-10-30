import {createContext, useContext} from "react";
import { AppStore } from "./app-store";

/**
 * 
 */
type AppProviderProps = {
    children: React.ReactNode;
    appStore: AppStore;
};

/**
 * Context to provide AppStore instance
 */
const AppStoreContext = createContext<AppStore | null>(null);
/**
 * @param param0 appStore instance of AppStore
 * @param param1 children components
 * @return AppProvider component to wrap the app with AppStore context
 */
export function AppProvider({children, appStore, ...props}: AppProviderProps) {
    return (
        <AppStoreContext.Provider {...props} value={appStore}>
            {children}
        </AppStoreContext.Provider>
    )
}

export function useAppStore() {
    const context = useContext(AppStoreContext);
    if (!context) {
        throw new Error("useAppStore must be used within an AppProvider");
    }
    return context;
}