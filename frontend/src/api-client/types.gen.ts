// This file is auto-generated by @hey-api/openapi-ts

export type Challenge = {
    id?: number | null;
    username: string;
    challenge: string;
};

export type ChallengeRequest = {
    username: string;
};

export type ExceptionModel = {
    detail: string;
};

export type GetUidResponse = {
    uid: number;
};

export type HttpValidationError = {
    detail?: Array<ValidationError>;
};

export type User = {
    id?: number | null;
    username: string;
    public_key: string;
};

export type ValidationError = {
    loc: Array<string | number>;
    msg: string;
    type: string;
};

export type SignupApiAuthSignupPostData = {
    body: User;
    path?: never;
    query?: never;
    url: '/api/auth/signup';
};

export type SignupApiAuthSignupPostErrors = {
    /**
     * Conflict
     */
    409: ExceptionModel;
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type SignupApiAuthSignupPostError = SignupApiAuthSignupPostErrors[keyof SignupApiAuthSignupPostErrors];

export type SignupApiAuthSignupPostResponses = {
    /**
     * Successful Response
     */
    200: User;
};

export type SignupApiAuthSignupPostResponse = SignupApiAuthSignupPostResponses[keyof SignupApiAuthSignupPostResponses];

export type ChallengeApiAuthLoginChallengePostData = {
    body: ChallengeRequest;
    path?: never;
    query?: never;
    url: '/api/auth/login_challenge';
};

export type ChallengeApiAuthLoginChallengePostErrors = {
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type ChallengeApiAuthLoginChallengePostError = ChallengeApiAuthLoginChallengePostErrors[keyof ChallengeApiAuthLoginChallengePostErrors];

export type ChallengeApiAuthLoginChallengePostResponses = {
    /**
     * Successful Response
     */
    200: Challenge;
};

export type ChallengeApiAuthLoginChallengePostResponse = ChallengeApiAuthLoginChallengePostResponses[keyof ChallengeApiAuthLoginChallengePostResponses];

export type AnswerApiAuthLoginAnswerPostData = {
    body: Challenge;
    path?: never;
    query?: never;
    url: '/api/auth/login_answer';
};

export type AnswerApiAuthLoginAnswerPostErrors = {
    /**
     * Forbidden
     */
    403: ExceptionModel;
    /**
     * Validation Error
     */
    422: HttpValidationError;
};

export type AnswerApiAuthLoginAnswerPostError = AnswerApiAuthLoginAnswerPostErrors[keyof AnswerApiAuthLoginAnswerPostErrors];

export type AnswerApiAuthLoginAnswerPostResponses = {
    /**
     * Successful Response
     */
    200: User;
};

export type AnswerApiAuthLoginAnswerPostResponse = AnswerApiAuthLoginAnswerPostResponses[keyof AnswerApiAuthLoginAnswerPostResponses];

export type GetUidApiSessionGetUidPostData = {
    body?: never;
    path?: never;
    query?: never;
    url: '/api/session/get_uid';
};

export type GetUidApiSessionGetUidPostResponses = {
    /**
     * Successful Response
     */
    200: GetUidResponse;
};

export type GetUidApiSessionGetUidPostResponse = GetUidApiSessionGetUidPostResponses[keyof GetUidApiSessionGetUidPostResponses];

export type ClientOptions = {
    baseUrl: `${string}://${string}` | (string & {});
};