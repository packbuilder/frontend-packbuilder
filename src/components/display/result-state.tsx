import { Spinner } from "../ui/spinner";
import DisplayContainer from "./display-container";

export default function ResultsState({
    isLoading,
    isEmpty,
    children,
}: {isLoading: boolean, isEmpty: boolean, children?: React.ReactNode}) {
    if (isLoading) {
        return (
            <DisplayContainer className="flex items-center justify-center h-96 w-full">
                <Spinner className="size-20" />
            </DisplayContainer>
        );
    }

    if (isEmpty) {
        return (
            <DisplayContainer className="flex items-center justify-center h-96 w-full">
                <h2>It's looking empty in here...</h2>
            </DisplayContainer>
        );
    }

    return <DisplayContainer className="flex items-center justify-center h-96 w-full">
        {
            children
        }
    </DisplayContainer>
}