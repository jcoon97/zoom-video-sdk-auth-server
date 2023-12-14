import { type ValidationError } from "./types";

const isDefined = (str: string): boolean => !!str;

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((x) => typeof x === "string");

export const isValidationError = (value: unknown): value is ValidationError =>
  typeof (value as ValidationError)?.property !== "undefined" &&
  typeof (value as ValidationError)?.reason !== "undefined";

const replaceWhitespace = (str: string): string => str.replace(/\s+/g, "");

export const toStringArray = (value: string | string[] | undefined): string[] | undefined =>
  Array.isArray(value)
    ? value.flatMap(replaceWhitespace).filter(isDefined)
    : value?.split(",").map(replaceWhitespace).filter(isDefined);
