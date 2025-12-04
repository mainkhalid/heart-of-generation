/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as causes from "../causes.js";
import type * as donations from "../donations.js";
import type * as emails from "../emails.js";
import type * as gallery from "../gallery.js";
import type * as http from "../http.js";
import type * as mpesa from "../mpesa.js";
import type * as mpesaInternals from "../mpesaInternals.js";
import type * as news from "../news.js";
import type * as settings from "../settings.js";
import type * as visitations from "../visitations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  causes: typeof causes;
  donations: typeof donations;
  emails: typeof emails;
  gallery: typeof gallery;
  http: typeof http;
  mpesa: typeof mpesa;
  mpesaInternals: typeof mpesaInternals;
  news: typeof news;
  settings: typeof settings;
  visitations: typeof visitations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
