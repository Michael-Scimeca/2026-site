'use client';

import { useEffect } from 'react';
import { isExternalUrl, trackOutboundClick } from '@/lib/analytics';

/**
 * OutboundLinkTracker
 *
 * Drop this component once at the layout level.  It attaches a single
 * delegated `click` listener on `document` that intercepts every anchor
 * click, checks whether the href is external, and fires a GA4 event if
 * so.  No per-link wiring required.
 *
 * The listener uses `{ capture: true }` so it fires even when
 * `e.stopPropagation()` is called by lower-level handlers.
 */
export function OutboundLinkTracker() {
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            // Walk up from the click target until we find an <a> (or give up)
            const anchor = (e.target as HTMLElement)?.closest?.('a');
            if (!anchor) return;

            const href = anchor.getAttribute('href');
            if (!href) return;

            if (isExternalUrl(href)) {
                trackOutboundClick(href, anchor.className);
            }
        }

        document.addEventListener('click', handleClick, { capture: true });
        return () =>
            document.removeEventListener('click', handleClick, { capture: true });
    }, []);

    return null; // render nothing
}
