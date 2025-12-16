import pfp from "../Seed-Avatar.jpg"
import { useEffect, useState } from "react";
import type { BreadCrumb } from "@/types/breadcrumb";
import { Skeleton } from "./ui/skeleton";
import type { User } from "@/types/user";
import { Button } from "./ui/button";
import BreadCrumbLink from "./breadcrumb-link";
import { Link, useLocation } from "@tanstack/react-router";
import store from "@/store/store";

function BreadCrumb() {
    // Make breadcrumb component listen for redirect event to add or remove accordingly
    const {breadCrumbs, updateBreadCrumbs} = store();

    return <div className="flex flex-row justify-around gap-4 items-center max-w-3/4 h-full p-2 max-sm:overflow-scroll">
        {breadCrumbs.map((breadCrumb, index) => {
            return <Link 
            onClick={() => {updateBreadCrumbs(breadCrumb.link);}}
            key={index} 
            to={breadCrumb.link}
            className={`flex flex-row justify-around gap-4 items-center ${breadCrumbs.length - 1 === index ? "font-bold" : ""}`}>
                <button className="cursor-pointer"><p className="text-center whitespace-nowrap">{breadCrumb.text}</p></button>
                {breadCrumbs.length - 1 === index ? null : <p className="">{"/"}</p>}
            </Link> 
        })}
    </div>
}

export default function Header({user} : {user: User | null}) {
    const { addBreadCrumb, updateBreadCrumbs } = store();
    const [isHydrated, setIsHydrated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = store.persist.onFinishHydration(() => {
            setIsHydrated(true);
        });
        
        if (store.persist.hasHydrated()) {
            updateBreadCrumbs(location.pathname);
            setIsHydrated(true);
        }

        return () => unsubscribe();
    }, []);
    
    if(!isHydrated) {
        return (
            <div className="flex flex-row items-center justify-between gap-4 py-5 px-2 h-fit w-full bg-[rgba(255,255,255,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12.1px] border border-[rgba(255,255,255,0.3)]">
                <Skeleton className="h-4 w-[250px] opacity-50" />
                <Skeleton className="size-[50px] rounded-[50%] opacity-50" />
            </div>
        ) 
    }
    
    return (
    <div className="flex flex-row items-center justify-between py-2 px-4 h-fit w-full bg-[rgba(255,255,255,0.2)] shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[12.1px] border border-[rgba(255,255,255,0.3)]">
        <BreadCrumb />
        {user ? 
        <BreadCrumbLink link={`/profile/${user.name}`} text="Profile">
            <img className="cursor-pointer border-white border-2 rounded-[50%] size-[50px]" src={pfp} alt={user.avatar} />
        </BreadCrumbLink>
        : 
        <Button variant={"default"} asChild><Link to={"/login"} onClick={() => addBreadCrumb({text: "Login", link: "/login"})}>Login</Link></Button>
        }
    </div>)
}