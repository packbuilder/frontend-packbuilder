export type BreadCrumb = {
    text: string,
    link: string
}

export enum ModPlatform {
    Thunderstore = "0",
    CurseForge = "1"
}

export enum ModAction {
    Added = "0",
    Removed = "1",
    Updated = "2"
}

export enum SuggestionState {
    Unverified = "0",
    Verified = "1",
    VerificationPending = "2"
}

export enum ModLoader {
    Any = "0",
    Forge = "1",
    Cauldron = "2",
    LiteLoader = "3",
    Fabric = "4",
    Quilt = "5",
    NeoForge = "6",
}