import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type DisplayToggle = {
    value: string;
    label: string;
};

type DisplayRadioGroupProps = {
    value: string;
    options: DisplayToggle[];
    onValueChange: (value: string) => void;
};

export default function DisplayRadioGroup({
    value,
    options,
    onValueChange,
}: DisplayRadioGroupProps) {
    return (
        <RadioGroup
            value={value}
            onValueChange={onValueChange}
            className="inline-flex rounded-full bg-muted p-1"
        >
            {options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                    <RadioGroupItem
                        value={option.value}
                        className="peer sr-only"
                    />

                    <div
                        className={`px-4 py-1.5 text-sm rounded-full transition duration-200 ${
                            value === option.value
                                ? "bg-primary text-white"
                                : "text-muted-foreground"
                        }`}
                    >
                        {option.label}
                    </div>
                </label>
            ))}
        </RadioGroup>
    );
}