/**
 * @deprecated
 */
export interface ClientControlFree {
    type: 'free';
}

/**
 * @deprecated
 */
export interface ClientControlAdditionalAllowed {
    type: 'additional allowed';
}

/**
 * @deprecated
 */
export interface ClientControlAllowedWhenNotPreferred {
    type: 'allowed when not preferred';
}

/**
 * @deprecated
 */
export interface ClientControlAllowedWhenNotClaimed {
    type: 'allowed when not claimed';
}

/**
 * @deprecated
 */
export interface ClientControlNoControl {
    type: 'no control';
}

/**
 * @deprecated
 */
export type ClientControl = ClientControlFree
    | ClientControlAdditionalAllowed
    | ClientControlAllowedWhenNotPreferred
    | ClientControlAllowedWhenNotClaimed
    | ClientControlNoControl;
