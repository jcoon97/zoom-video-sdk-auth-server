import { type Request as ExpressRequest } from "express";

type MaybeArray<T> = T | T[];

export type CoercibleNumber = number | string;

export interface RequestBody {
  // Required Properties
  roleType?: CoercibleNumber;
  topic?: string;
  expirationMinutes?: CoercibleNumber;

  // Optional Properties
  userIdentity?: string;
  sessionKey?: string;
  geoRegions?: string | string[]; // Comma-separated list
  cloudRecordingOption?: CoercibleNumber;
  cloudRecordingElection?: CoercibleNumber;
  telemetryTrackingId?: string;
}

export interface Request extends ExpressRequest {
  body: RequestBody;
}

export type CoercibleNumbers = Pick<
  RequestBody,
  "roleType" | "expirationMinutes" | "cloudRecordingOption" | "cloudRecordingElection"
>;

export type CoercedRequestBody<
  K extends keyof RequestBody = keyof CoercibleNumbers,
  V = number | undefined
> = Omit<RequestBody, K> & { [P in K]: V };

export type CallableValidator = (
  ...args: any[]
) => (property: any, value?: unknown) => ValidationError | undefined;

export interface ValidationError {
  property: any;
  reason: string;
}

export type Validator<TRequestBody> = Partial<
  Record<keyof TRequestBody, MaybeArray<ReturnType<CallableValidator>>>
>;
