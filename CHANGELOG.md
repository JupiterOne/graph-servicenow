# v1.5.0 (Thu Jun 27 2024)

#### 🚀 Enhancement

- Fix CMDB Converter [#53](https://github.com/JupiterOne/graph-servicenow/pull/53) ([@VDubber](https://github.com/VDubber))

#### Authors: 1

- Samuel Poulton ([@VDubber](https://github.com/VDubber))

---

# v1.4.1 (Wed Jun 26 2024)

#### 🐛 Bug Fix

- Int 11064 incidents & group members [#52](https://github.com/JupiterOne/graph-servicenow/pull/52) ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.4.0 (Tue Jun 18 2024)

#### 🚀 Enhancement

- Make servicenow faster - more resilient [#51](https://github.com/JupiterOne/graph-servicenow/pull/51) ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.3.1 (Wed Apr 17 2024)

#### 🐛 Bug Fix

- Add debug logs [#50](https://github.com/JupiterOne/graph-servicenow/pull/50) ([@jehisonprada](https://github.com/jehisonprada))

#### Authors: 1

- [@jehisonprada](https://github.com/jehisonprada)

---

# v1.3.0 (Tue Apr 16 2024)

#### 🚀 Enhancement

- Fix TypeError: Cannot convert undefined or null to object [#49](https://github.com/JupiterOne/graph-servicenow/pull/49) ([@jehisonprada](https://github.com/jehisonprada))

#### ⚠️ Pushed to `main`

- Apply remove-codeql with multi-gitter [ci skip] ([@electricgull](https://github.com/electricgull))
- Fix x-cortex-service-groups where tier-4 was set incorrectly ([@jablonnc](https://github.com/jablonnc))
- Populate CODEOWENRS, baseline package.json and baseline cortex.yaml ([@jablonnc](https://github.com/jablonnc))

#### Authors: 3

- [@jehisonprada](https://github.com/jehisonprada)
- Cameron Griffin ([@electricgull](https://github.com/electricgull))
- Noah Jablonski ([@jablonnc](https://github.com/jablonnc))

---

# v1.2.0 (Fri Aug 18 2023)

#### 🚀 Enhancement

- INT-9211 - add ingestion sources [#48](https://github.com/JupiterOne/graph-servicenow/pull/48) (ronald.arias@contractor.jupiterone.com)

#### Authors: 1

- Ronald Arias ([@RonaldEAM](https://github.com/RonaldEAM))

---

# v1.1.3 (Tue Aug 15 2023)

#### 🐛 Bug Fix

- Int 8940 fix step [#47](https://github.com/JupiterOne/graph-servicenow/pull/47) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.1.2 (Mon Aug 07 2023)

#### 🐛 Bug Fix

- Corrected converter [#46](https://github.com/JupiterOne/graph-servicenow/pull/46) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.1.1 (Fri Aug 04 2023)

#### 🐛 Bug Fix

- Int 8940 make more efficient + Quality of life improvements [#45](https://github.com/JupiterOne/graph-servicenow/pull/45) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.1.0 (Thu Aug 03 2023)

#### 🚀 Enhancement

- Int 8983 upgrade servicenow [#44](https://github.com/JupiterOne/graph-servicenow/pull/44) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.0.2 (Mon Jul 31 2023)

#### 🐛 Bug Fix

- Removed duplicated keys on cmdb_item step [#43](https://github.com/JupiterOne/graph-servicenow/pull/43) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.0.1 (Fri Jul 28 2023)

#### 🐛 Bug Fix

- Removed duplicated keys in the grmembers step [#42](https://github.com/JupiterOne/graph-servicenow/pull/42) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### Authors: 1

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))

---

# v1.0.0 (Wed Jun 21 2023)

#### 💥 Breaking Change

- Cmdb ingestion [#41](https://github.com/JupiterOne/graph-servicenow/pull/41) (gonzaloavalosribas@Gonzalos-MacBook-Pro.local)

#### 🐛 Bug Fix

- Update integration-deployment.yml [#40](https://github.com/JupiterOne/graph-servicenow/pull/40) ([@Nick-NCSU](https://github.com/Nick-NCSU))

#### Authors: 2

- Gonzalo Avalos Ribas ([@Gonzalo-Avalos-Ribas](https://github.com/Gonzalo-Avalos-Ribas))
- Nick Thompson ([@Nick-NCSU](https://github.com/Nick-NCSU))

---

## v0.3.1 - 2023-05-16

### Added

- Added `auto` package to help with builds, versioning and npm packaging.

## v0.3.0 - 2022-07-12

### Updated

- Updated SDK dependencies to 8.19.0.

## v0.2.0 - 2021-02-11

### Updated

- Updated SDK dependencies to 5.6.2.

### Fixed

- Change Polly config to not match recordings by hostname or headers.

### Added

- Added `service_now_incident` entities and relationships.

## v1.1.0 - 2020-09-25

- Initial release
- Added `service_now_account`, `service_now_user`, and `service_now_group`
  entities
