# RemovedItemBanner

## Description

A transient confirmation banner shown after a shopper removes a line item from the
cart. It reassures the shopper the removal worked by naming the removed record
(e.g. "Removed 'Kind of Blue' from your cart"). It appears near the top of the Cart
page content area (and works from the `CartDrawer` removal path as well), then
automatically dismisses after a short delay. It is purely a confirmation surface —
removal itself is performed by the remove action on `CartLineItem`. Modeled on the
DailyArt removal-confirmation reference.

## Interactions

- The banner appears automatically in response to a removal; it is not opened by
  the user directly.
- It auto-dismisses after a short timeout. It may also expose a manual dismiss (×)
  control to close it immediately.

## Effects

- **Appearance:** when a `CartLineItem` is removed, the banner becomes visible and
  displays the removed record's name.
- **Auto-dismiss:** after a short delay the banner fades/slides out and is no longer
  visible, without affecting the cart contents.
- **Manual dismiss (if present):** clicking the dismiss (×) control hides the banner
  immediately.
- The banner does not itself change cart state — it only confirms the removal that
  already happened.

## Dependencies

- Triggered by the remove action on `CartLineItem`.
- Names the record that was removed.
- Does not affect `OrderSummary` totals (those are driven by the removal itself).

## Tests

* Test: Banner appears with the removed record's name
  - Initial state: On `/cart` with two distinct records in the cart (note the name
    of the first record).
  - Action: Click the remove action on the first line item.
  - Expected: The `RemovedItemBanner` appears and its text includes the removed
    record's name (e.g. "Removed '<title>' from your cart").

* Test: Banner auto-dismisses after a delay
  - Initial state: On `/cart` immediately after removing a line item, with the
    `RemovedItemBanner` visible.
  - Action: Wait for the auto-dismiss timeout to elapse (no user action).
  - Expected: The banner is no longer visible; the cart contents are unchanged from
    just after the removal.

* Test: Manual dismiss hides the banner immediately
  - Initial state: On `/cart` with the `RemovedItemBanner` visible after a removal.
  - Action: Click the banner's dismiss (×) control.
  - Expected: The banner disappears immediately; the cart contents are unchanged.

* Test: Banner reflects the most recent removal
  - Initial state: On `/cart` with three distinct records in the cart.
  - Action: Remove the first record, then remove another record before the first
    banner has dismissed.
  - Expected: The `RemovedItemBanner` updates to show the most recently removed
    record's name (the second removal), confirming it reflects the latest removal.
