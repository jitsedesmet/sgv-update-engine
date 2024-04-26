enum ClientControlType {
    Free = 'free',
    AdditionalAllowed = 'additional allowed',
    AllowedWhenNotPreferred = 'allowed when not preferred',
    AllowedWhenNotClaimed = 'allowed when not claimed',
    NoControl = 'no control',
}

/**
 * @deprecated
 */
export interface ClientControl {
    type: ClientControlType;
}
