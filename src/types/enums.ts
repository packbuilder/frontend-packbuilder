export enum ModPlatform {
    Thunderstore = "0",
    CurseForge = "1"
}

export enum ModAction {
    Added = "0",
    Removed = "1",
    Updated = "2"
}

export enum ModificationFilter {
    All = "0",
    Added = "1",
    Removed = "2",
    Conflicting = "3"
}

export enum SuggestionFilter {
    All = "0",
    Verified = "1",
    Unverified = "2"
}

export enum CurseForgeSearchFilter {
    Featured = "0",
    Popularity = "1",
    TotalDownloads = "2",
    Rating = "3"
}

export enum SuggestionState {
    Unverified = "0",
    Verified = "1",
    VerificationPending = "2",
    MergePending = "3"
}

export enum ConflictState {
    NoConflicts = "0",
    Conflicting = "1",
    MissingDependencies = "2"
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

export enum ImageType {
    Stock = "0",
    Upload = "1"
}