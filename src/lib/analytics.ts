/**
 * Google Analytics utility functions for custom event tracking.
 *
 * GA4 is loaded conditionally via CookieConsent.tsx, so all helpers
 * guard against `gtag` being undefined (consent declined / script not
 * yet loaded).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

/**
 * Low-level wrapper around `gtag('event', …)`.
 * No-ops when GA hasn't been loaded.
 */
export function gtagEvent(
    eventName: string,
    params?: Record<string, string | number | boolean>,
) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
}

/**
 * Returns `true` when the URL points to a different origin than the
 * current page (i.e. it's an outbound / external link).
 */
export function isExternalUrl(url: string): boolean {
    try {
        const linkUrl = new URL(url, window.location.origin);
        return linkUrl.hostname !== window.location.hostname;
    } catch {
        return false;
    }
}

/**
 * Track an outbound link click in GA4.
 *
 * Sends a `click` event with the recommended GA4 parameters:
 *  - `link_url`      – full destination URL
 *  - `link_domain`   – hostname of the destination
 *  - `link_classes`   – CSS classes of the anchor (useful for filtering)
 *  - `outbound`      – always `true`
 *
 * This mirrors what GA4 Enhanced Measurement sends for outbound clicks,
 * so reports stay consistent whether or not EM is enabled.
 */
export function trackOutboundClick(
    url: string,
    anchorClasses?: string,
) {
    try {
        const linkUrl = new URL(url, window.location.origin);
        gtagEvent('click', {
            link_url: url,
            link_domain: linkUrl.hostname,
            link_classes: anchorClasses ?? '',
            outbound: true,
        });
    } catch {
        // malformed URL – still fire basic event
        gtagEvent('click', {
            link_url: url,
            outbound: true,
        });
    }
}
