# SwitchPay

SwitchPay is an adaptive payment application designed to automatically switch between available payment routes based on network availability.

## Primary USP

SwitchPay automatically switches the payment route when the primary Internet-based payment route becomes unavailable. The user never presses an "offline mode" button — a Payment Orchestrator detects connectivity and selects the route.

```
USER WANTS TO PAY
        |
     SWITCHPAY
        |
 PAYMENT ORCHESTRATOR
        |
  NETWORK DETECTION
        |
   +----+-----------------+
   |                      |
INTERNET AVAILABLE   INTERNET UNAVAILABLE
   |                      |
ONLINE MODE           EDGE MODE
   |                      |
ONLINE ROUTE          OFFLINE ROUTE
                          |
                   LOCAL COMMUNICATION
                          |
                    OFFLINE WALLET
                          |
                   LOCAL TRANSACTION
                          |
                  (Internet returns)
                          |
                        SYNC
                          |
                   RECONCILIATION
```

The Payment Orchestrator and automatic route switching are the main feature. The offline wallet is secondary and exists to prove the fallback route actually works.

## Eventual two-phone demonstration

The demo runs on two ordinary physical Android phones with Internet disabled:

| Phone | Role | Wallet before | Wallet after |
| --- | --- | --- | --- |
| Phone A | Customer | ₹2,000 | ₹1,800 |
| Phone B | Merchant | ₹500 | ₹700 |

The customer scans the merchant QR, SwitchPay detects that Internet is unavailable, activates Edge Mode, the phones communicate locally (initially over Bluetooth), and a ₹200 transfer is recorded on both devices under the same transaction ID. When Internet returns, the transaction is synced and reconciled.

## Disclaimer

The SwitchPay wallet is a **closed-loop prototype wallet**. It is **not real bank money** and does not represent real INR settlement. There is no bank, UPI, or payment-provider integration in this prototype, and none is planned within its scope.

## Planned technology stack

- React Native 0.87 (Android-first, installable APK)
- TypeScript for application code
- Kotlin for future native Android modules (Bluetooth, connectivity, secure storage)
- Gradle / Android SDK for building the APK

## Current development phase

**Phase 2 — UI, navigation and session state placeholders.** The app now has the Splash, Role Selection, Customer Dashboard, Merchant Dashboard, Scan & Pay, Merchant QR and Transaction History screens with navigation, reusable components, and a Payment Orchestrator route selection rule. The Payment Mode displayed on every screen follows the simulated network state.

Not implemented yet: real network detection, Bluetooth, QR scanning/generation, online route execution, offline route execution, wallet mutation, local ledger, sync, reconciliation, backend, deployment.

## Project structure

```
src/
  components/        reusable UI components
  screens/           screen-level UI
  navigation/        navigation graph with native-stack
  services/
    network/         connectivity detection (native/JS bridge)
    bluetooth/       local Bluetooth transport
    storage/         on-device persistence
  engine/
    orchestrator/    payment orchestrator: route selection
    routes/online/   Internet-based payment route
    routes/offline/  Edge Mode payment route
    sync/            deferred upload of offline transactions
    reconciliation/  post-sync balance/ledger reconciliation
  store/             app state with SessionContext (role, network, derived payment mode)
  models/            shared domain types
  utils/             helpers
  theme/             colors, spacing, radii
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the responsibilities and boundaries of each layer.

## Phase 2 notes

- Network status is simulated by a labeled control on dashboards to demonstrate the automatic route switch from `ONLINE_MODE` to `EDGE_MODE`.
- The orchestrator function `src/engine/orchestrator/selectPaymentMode.ts` is the single source of mode selection and already drives the UI.
- Wallet balances are hard-coded demo values and are not mutated.
- The PAY button is disabled with a note explaining the route is not implemented yet.

## Requirements

- Node.js >= 22.11
- JDK 17
- Android SDK: platform-tools, Android platform 35, build-tools 35.0.0
- `ANDROID_HOME` exported, or `android/local.properties` containing `sdk.dir=/path/to/Android/sdk`

## Commands

Install dependencies:

```bash
npm install
```

Start the Metro dev server:

```bash
npm start
```

Run on a connected device or emulator (debug):

```bash
npm run android
```

Build a debug APK:

```bash
cd android && ./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk
```

Build a release APK (requires a signing config; the default debug keystore is used until one is added):

```bash
cd android && ./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

Install an APK on a connected phone:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Lint and type-check:

```bash
npm run lint
npx tsc --noEmit
```
