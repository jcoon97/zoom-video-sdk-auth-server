import type { ValidationError, Validator } from "./types";
import { isStringArray, isValidationError, toStringArray } from "./utils";

/* Curried Validation Functions */
export const inNumberArray =
  (allowedValues: number[]) =>
  (property: any, value?: unknown): ValidationError | undefined => {
    if (typeof value === "undefined") return;

    if (typeof value !== "number" || isNaN(value)) {
      return {
        property,
        reason: `Value ${value} not allowed, must be of type number`,
      };
    }

    if (!allowedValues.includes(value)) {
      return {
        property,
        reason: `Value is not valid. Got ${value}, expected ${allowedValues}`,
      };
    }
  };

export const isBetween =
  (min: number, max: number) =>
  (property: any, value?: unknown): ValidationError | undefined => {
    if (typeof value === "undefined") return;

    if (typeof value !== "number" || isNaN(value)) {
      return {
        property,
        reason: `Value ${value} not allowed, must be of type number`,
      };
    }

    if (value < min || value > max) {
      return {
        property,
        reason: `Value must be in between ${min} and ${max}`,
      };
    }
  };

export const isLengthLessThan =
  (maxLength: number) =>
  (property: any, value?: unknown): ValidationError | undefined => {
    if (typeof value === "undefined") return;

    if (typeof value !== "string") {
      return {
        property,
        reason: `Value ${value} not allowed, must be of type string`,
      };
    }

    if (value.length > maxLength) {
      return {
        property,
        reason: `Value exceeds max length. Got ${length}, expected less than or equal to ${maxLength}`,
      };
    }
  };

export const isRequired = (property: any, value?: unknown): ValidationError | undefined => {
  if (typeof value === "undefined") {
    return {
      property,
      reason: "Field is required, but not present in request body",
    };
  }
};

export const matchesStringArray =
  (allowedStrings: string[]) =>
  (property: any, value?: unknown): ValidationError | undefined => {
    if (typeof value === "undefined") return;

    if (typeof value !== "string" && !isStringArray(value)) {
      return {
        property,
        reason: `Value ${value} not allowed, must of type string or string array`,
      };
    }

    const valueArr = toStringArray(value) as string[];

    if (valueArr.length === 0) {
      return {
        property,
        reason: `Property defined, but no value(s) were present`,
      };
    }

    if (!valueArr.every((x) => allowedStrings.includes(x))) {
      return {
        property,
        reason: `One or more value(s) not allowed. Got (${valueArr}), expected (${allowedStrings})`,
      };
    }
  };

/* Validation Checker/Runner */
export const validateRequest = <TBody>(
  body: TBody,
  validator: Validator<TBody>
): (ValidationError | undefined)[] =>
  (Object.keys(validator) as (keyof TBody)[])
    .flatMap((property) => {
      const value = body?.[property];
      const validatorFunc = validator[property];
      const allValidations = Array.isArray(validatorFunc)
        ? validatorFunc.map((f) => f(property, value))
        : validatorFunc?.(property, value);
      return Array.isArray(allValidations) ? allValidations : [allValidations];
    })
    .filter(isValidationError);
