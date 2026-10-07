import { Spinner } from "../ui/spinner";

export default function ResultsState({
    isLoading,
    isEmpty,
    children,
}: {isLoading: boolean, isEmpty: boolean, children?: React.ReactNode}) {
    if (isLoading) {
        return (
            <div className="displayContainer flex items-center justify-center h-96 w-full">
                <Spinner className="size-20" />
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className="displayContainer flex items-center justify-center h-96 w-full">
                <h2>It's looking empty in here...</h2>
            </div>
        );
    }

    return <div className="displayContainer flex items-center justify-center h-96 w-full">{children}</div>
}