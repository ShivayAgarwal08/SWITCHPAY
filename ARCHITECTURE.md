# SwitchPay architecture

Phase 1 defines boundaries only. None of the systems below are implemented yet; each directory exists so that later phases add code in one clearly-owned place.

## Layers

| Layer | Location | Responsibility | Must not |
| --- | --- | --- | --- |
| UI | `src/screens`, `src/components`, `src/navigation`, `src/theme` | Render state, capture intent | Know which payment route is active or talk to transports |
| Payment orchestration | `src/engine/orchestrator` | Decide the route for a payment from network state and route availability; emit the active mode (ONLINE MODE / EDGE MODE) | Contain transport or wallet logic |
| Network detection | `src/services/network` | Report connectivity/reachability changes to the orchestrator | Make payment decisions |
| Online route | `src/engine/routes/online` | Execute an Internet-based payment | Fall back on its own; failure is reported to the orchestrator |
| Offline route | `src/engine/routes/offline` | Execute an Edge Mode payment over a local transport | Assume a specific transport implementation |
| Bluetooth | `src/services/bluetooth` | Local device discovery and message transport | Interpret payment semantics |
| Local wallet | `src/store` (balance) + `src/services/storage` | Hold and persist the closed-loop prototype balance | Be written to by the UI directly |
| Local transaction ledger | `src/services/storage` | Append-only record of local transactions with a shared transaction ID | Be mutated after write |
| Synchronization | `src/engine/sync` | Upload pending local transactions once Internet returns | Alter balances directly |
| Reconciliation | `src/engine/reconciliation` | Resolve ledger/balance differences after sync | Perform network I/O |
| Domain models | `src/models` | Shared types (payment, transaction, route, mode) | Depend on any layer |

## Dependency direction

```
UI  ->  orchestrator  ->  routes  ->  services (network / bluetooth / storage)
                     \->  sync -> reconciliation
```

Layers depend downward only. Services never import from `engine` or UI; the orchestrator is the only component allowed to choose a route.

## Native code

Kotlin modules for Bluetooth, connectivity and secure storage will live under `android/app/src/main/java/com/switchpay/` and be exposed to TypeScript through thin wrappers in `src/services/*`.
