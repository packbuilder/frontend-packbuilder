import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"
import type { BreadCrumb } from "../types/breadcrumb";

type Store = {
    isHydrated: boolean;
    breadCrumbs: BreadCrumb[];
    setJwt: (jwt: string, expirationDays: number) => void;
    removeBreadCrumb: (text: string) => void;
    addBreadCrumb: (breadCrumb: BreadCrumb) => void;
    updateBreadCrumbs: (curPagePath: string) => void;
}

const store = create<Store>()(
    persist(
        (set, get) => ({
            isHydrated: false,
            breadCrumbs: [{text: "Home", link: "/"}],
            setJwt: (jwt: string, expirationDays: number) => {
                Cookies.set("_packbuilder_jwt", jwt, {
                    secure: true,
                    expires: expirationDays,
                });
            },
            addBreadCrumb: (newBreadCrumb: BreadCrumb) => {
                const breadCrumbs = get().breadCrumbs;
                let hasVisitedPage = false;
        
                breadCrumbs.forEach((breadCrumb: BreadCrumb) => {
                    if(breadCrumb.link === newBreadCrumb.link) {
                        hasVisitedPage = true;
                    }
                });
        
                if(!hasVisitedPage) breadCrumbs.push(newBreadCrumb);
        
                set({breadCrumbs: breadCrumbs});
            },
            removeBreadCrumb: (text: string) => {
                const breadCrumbs = get().breadCrumbs;
                const newBreadCrumbs = [] as BreadCrumb[];

                breadCrumbs.forEach(breadCrumb => {
                    if(breadCrumb.text !== text) {
                        newBreadCrumbs.push(breadCrumb);
                    }
                })

                set({breadCrumbs: newBreadCrumbs});
            },
            updateBreadCrumbs: (curPagePath: string) => {
                const breadCrumbs = get().breadCrumbs;
        
                while(breadCrumbs[breadCrumbs.length - 1].link !== curPagePath) {
                    
                    if(breadCrumbs.length === 1) {
                        break;
                    }
                    
                    breadCrumbs.pop();
                }
        
                set({breadCrumbs: breadCrumbs});
            },
        }),
        {
            name: "PersistedStore",
            partialize: (state) => ({context: state.breadCrumbs}),
            merge: (persistedState, currentState) => {
                if(persistedState) {
                    const {context} = persistedState as {context: BreadCrumb[]}
                    currentState.breadCrumbs = context;
                }
                
                return currentState;
            },
        }
    )
);

export default store;