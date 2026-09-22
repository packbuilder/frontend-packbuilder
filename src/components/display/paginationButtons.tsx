import type { CurseForgePagination } from "@/types/curseforge/curseforgePagination";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function CurseforgePaginationButtons({ curseforgePaginationData, curPage, onPageChange } : { 
    curseforgePaginationData: CurseForgePagination | undefined, 
    curPage: number, 
    onPageChange: (newPage: number) => void 
}) {
    
    const nextPage = async () => {
        if(!curseforgePaginationData || curseforgePaginationData.resultCount !== curseforgePaginationData.pageSize) {
            return;
        }
        onPageChange(curPage + 1);
    }

    const previousPage = async () => {
        if(curPage - 1 < 0) {
            return;
        }
        onPageChange(curPage - 1);
    }


    return <div className="flex justify-center items-center gap-2">
        <Button className="rounded-full" variant={"outline"} onClick={previousPage}>
            <ArrowLeft />
        </Button>
        <h2 className="font-bold">{curPage + 1}</h2>
        <Button className="rounded-full" variant={"outline"} onClick={nextPage}>
            <ArrowRight />
        </Button>
    </div>
}

export default function PaginationButtons({curPage, totalPages, onPageChange} : {curPage: number, totalPages: number, onPageChange: (newPage: number) => void}) {
    
    const nextPage = () => {
        if(curPage >= totalPages) {
            return;
        }

        onPageChange(curPage + 1);
    }

    const previousPage = () => {
        if(curPage <= 1) {
            return;
        }

        onPageChange(curPage - 1);
    }
    
    return <div className="flex justify-center items-center gap-2">
        <Button className="rounded-full" variant={"outline"} onClick={previousPage}>
            <ArrowLeft />
        </Button>
            <h2 className="font-bold">{curPage}</h2>
            <h2 className="font-bold">/</h2>
            <h2 className="font-bold">{totalPages}</h2>
        <Button className="rounded-full" variant={"outline"} onClick={nextPage}>
            <ArrowRight />
        </Button>
    </div>
}