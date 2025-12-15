import type { Modpack } from "app/types/modpack";
import modpackImage from "@/modpack.gif"
import BreadCrumbLink from "./breadcrumb-link";

function ModpackCard({modpack} : {modpack: Modpack}) {
    return <BreadCrumbLink 
    link={`/modpack/${modpack.user.name}/${modpack.slug}`}
    text="Modpack"
    className="duration-100 cursor-pointer relative before:content-[''] before:absolute before:top-0 before:left-[-150%] before:w-[60%] before:h-full before:bg-white before:opacity-40 before:skew-x-[45deg] before:transition-all before:duration-500 before:ease-linear hover:before:left-[180%] hover:cursor-pointer focus:shadow focus:scale-110 hover:shadow hover:scale-110 p-2 border dark:border-white flex flex-col gap-2 items-center w-44 rounded overflow-hidden" 
    style={{
        background:"rgba(255, 255, 255, 0.2)",
        borderRadius: "16px",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(12.1px)",
        WebkitBackdropFilter: "blur(5px)",
        border:" 1px solid rgba(255, 255, 255, 0.3)"
    }}>
    
        <img src={modpackImage} alt={`Logo for ${modpack.name}`} className="rounded-[16px]" />
        <h1>{modpack.name}</h1>
    </BreadCrumbLink>
}

export default ModpackCard;