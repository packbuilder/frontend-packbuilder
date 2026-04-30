import type { User } from "@/types/user";
import { Button } from "./ui/button";
import { Link, useMatches } from "@tanstack/react-router";
import NavUser from "./header-profile";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

function BreadCrumbs() {
    const matches = useMatches();

    const filteredMatches = matches.filter(match => match.loaderData);
    // Had to cast because typescript couldnt infer its type
    const {breadcrumbs} = filteredMatches[0].loaderData as unknown as {breadcrumbs?: [string]};
    // TODO: Fix text sizing, also maybe put inside of carousel instead of using scroll overflow management
    return (
        <Breadcrumb className="max-md:overflow-x-scroll max-w-3/4 no-wrap">
            <BreadcrumbList className="max-w-full flex-nowrap">
            <BreadcrumbItem>
                <BreadcrumbLink asChild>
                <Link to="/">
                    <span className="text-white">Home</span>
                </Link>
                </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbs?.map((breadcrumb: string, index: number) => (
                <>
                <BreadcrumbSeparator />

                <BreadcrumbItem key={index} className="w-fit text-nowrap">
                    {breadcrumb}
                </BreadcrumbItem>
                </>
            ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default function Header({user} : {user: User | null}) {
    return (
    <div className="flex flex-row items-center justify-between py-2 px-4 h-fit w-full bg-[var(--surface-1)] mb-5">
        <BreadCrumbs />
        {user ? 
        <NavUser user={user} />
        : 
        <Button variant={"default"} asChild><Link to={"/login"}>Login</Link></Button>
        }
    </div>)
}