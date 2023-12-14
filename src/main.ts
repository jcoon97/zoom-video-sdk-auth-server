import dotenv from "dotenv";
import express from "express";
import { SignJWT } from "jose";
import { AddressInfo } from "net";
import { Logger } from "tslog";
import {
  type CoercedRequestBody,
  type CoercibleNumbers,
  type Request,
  type RequestBody,
  type Validator,
} from "./types";
import { toStringArray } from "./utils";
import {
  inNumberArray,
  isBetween,
  isLengthLessThan,
  isRequired,
  matchesStringArray,
  validateRequest,
} from "./validations";

dotenv.config();
const app = express();
const logger = new Logger();

app.use(express.json());

const allowedValues = {
  roleType: [0, 1],
  geoRegions: ["AU", "BR", "CA", "CN", "DE", "HK", "IN", "JP", "MX", "NL", "SG", "US"],
  cloudRecordingOption: [0, 1],
  cloudRecordingElection: [0, 1],
};

const coercibleNumbers: (keyof CoercibleNumbers)[] = [
  "roleType",
  "expirationMinutes",
  "cloudRecordingOption",
  "cloudRecordingElection",
];

const EXPIRATION_MINUTES_FLOOR = 30;
const EXPIRATION_MINUTES_CEILING = 2880;
const TOPIC_MAX_LENGTH = 200;
const USER_IDENTITY_MAX_LENGTH = 35;
const SESSION_KEY_MAX_LENGTH = 36;

const validator: Validator<CoercedRequestBody> = {
  roleType: [isRequired, inNumberArray(allowedValues.roleType)],
  topic: [isRequired, isLengthLessThan(TOPIC_MAX_LENGTH)],
  expirationMinutes: [isRequired, isBetween(EXPIRATION_MINUTES_FLOOR, EXPIRATION_MINUTES_CEILING)],
  userIdentity: isLengthLessThan(USER_IDENTITY_MAX_LENGTH),
  sessionKey: isLengthLessThan(SESSION_KEY_MAX_LENGTH),
  geoRegions: matchesStringArray(allowedValues.geoRegions),
  cloudRecordingOption: inNumberArray(allowedValues.cloudRecordingOption),
  cloudRecordingElection: inNumberArray(allowedValues.cloudRecordingElection),
};

// @ts-ignores
// Ignoring this function since, for whatever reason, TypeScript is claiming that types are
// mismatched even though the result produced is as expected.
const coerceRequestBody = (body: RequestBody): CoercedRequestBody => ({
  ...body,
  ...coercibleNumbers.reduce(
    (acc, cur) => ({
      ...acc,
      [cur]:
        body[cur] && typeof body[cur] === "string" ? parseInt(body[cur] as string, 10) : body[cur],
    }),
    {}
  ),
});

const joinGeoRegions = (geoRegions: CoercedRequestBody["geoRegions"]): string | undefined =>
  toStringArray(geoRegions)?.join(",");

app.post("/", async (req: Request, res) => {
  const requestBody = coerceRequestBody(req.body);
  const validationErrors = validateRequest(requestBody, validator);

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const {
    roleType,
    expirationMinutes,
    topic,
    userIdentity,
    sessionKey,
    geoRegions,
    cloudRecordingOption,
    cloudRecordingElection,
    telemetryTrackingId,
  } = requestBody;

  const jwtPayload = {
    app_key: process.env.ZOOM_VIDEO_SDK_KEY,
    role_type: roleType,
    tpc: topic,
    version: 1,
    user_identity: userIdentity,
    session_key: sessionKey,
    geo_regions: joinGeoRegions(geoRegions),
    cloud_recording_option: cloudRecordingOption,
    cloud_recording_election: cloudRecordingElection,
    telemetry_tracking_id: telemetryTrackingId,
  };

  const signedJwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${expirationMinutes}m`)
    .sign(new TextEncoder().encode(process.env.ZOOM_VIDEO_SDK_SECRET));

  logger.info(`Generated JWT token: ${signedJwt}`);
  return res.json({ _payload: jwtPayload, token: signedJwt });
});

const hasAddressPort = (obj: unknown): obj is AddressInfo =>
  typeof (obj as AddressInfo)?.port !== "undefined";

const server = app.listen(process.env.PORT || 4000, () => {
  if (process.env.ZOOM_VIDEO_SDK_KEY && process.env.ZOOM_VIDEO_SDK_SECRET) {
    const address = server.address();
    const listenerPort = hasAddressPort(address) ? `port ${address.port}` : `socket ${address}`;
    logger.info(`Zoom Video SDK Auth Endpoint Sample listening on ${listenerPort}`);
  } else {
    logger.fatal(
      "Zoom Video SDK key or secret not found in environment variable, shutting down..."
    );
    server.close(() => logger.info("Server successfully shut down"));
  }
});
