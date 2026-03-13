import axios from "axios";
import { env } from "../config/env.js";
import { hashPII, generateEventId } from "../utils/crypto.js";

export interface TikTokEventData {
  event: string;
  event_id?: string;
  event_time?: number;
  user?: {
    email?: string;
    phone?: string;
    external_id?: string;
    ip?: string;
    user_agent?: string;
    ttclid?: string;
    ttp?: string;
  };
  page?: {
    url?: string;
    referrer?: string;
  };
  properties?: {
    value?: number;
    currency?: string;
    content_id?: string;
    content_type?: string;
    content_name?: string;
    content_category?: string;
    contents?: Array<{
      content_id?: string;
      content_name?: string;
      content_category?: string;
      quantity?: number;
      price?: number;
    }>;
    query?: string;
  };
}

/**
 * Service to send events to TikTok via the Events API (CAPI)
 */
export async function trackTikTokEvent(data: TikTokEventData) {
  const { accessToken, pixelId } = env.tiktok;

  if (!accessToken || !pixelId) {
    // Silently fail if not configured, or log in dev
    if (env.nodeEnv === "development") {
      console.warn("TikTok Events API not configured. Missing TIKTOK_ACCESS_TOKEN or TIKTOK_PIXEL_ID.");
    }
    return;
  }

  try {
    const payload = {
      pixel_code: pixelId,
      event: data.event,
      event_id: data.event_id || generateEventId(),
      timestamp: data.event_time || Math.floor(Date.now() / 1000),
      context: {
        user: {
          email: hashPII(data.user?.email),
          phone: hashPII(data.user?.phone),
          external_id: hashPII(data.user?.external_id),
          ip: data.user?.ip,
          user_agent: data.user?.user_agent,
          ttclid: data.user?.ttclid,
          ttp: data.user?.ttp,
        },
        page: {
          url: data.page?.url,
          referrer: data.page?.referrer,
        },
      },
      properties: data.properties,
    };

    const response = await axios.post(
      "https://business-api.tiktok.com/open_api/v1.3/event/track/",
      payload,
      {
        headers: {
          "Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.code !== 0) {
      console.error("TikTok Events API Error:", response.data.message);
    }
  } catch (error: any) {
    console.error("TikTok Events API Request Failed:", error?.response?.data || error.message);
  }
}
