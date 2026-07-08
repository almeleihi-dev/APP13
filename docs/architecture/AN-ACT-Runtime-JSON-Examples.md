# AN ACT — Runtime JSON Examples

**Version:** 1.0  
**Companion:** [Runtime JSON Contract](./AN-ACT-Runtime-JSON-Contract.md)  
**Constraint:** Examples derived from repository types, builders, and demo data. Illustrative timestamps used where builders generate dynamically.

---

## Status Classification Key

| Label | Meaning |
|-------|---------|
| **Implemented** | Shape matches current API/builder output |
| **Recommended** | Includes v1.0 fields not yet wired everywhere |
| **Illustrative** | Representative composite; minor field additions for clarity |

---

## 1. Login

**Endpoint:** `POST /auth/login`  
**Classification:** **Implemented**

### Request

```json
{
  "email": "customer@example.com",
  "password": "secure-password"
}
```

### Response (201 on register / 200 on login)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "rt_8f3a2b1c9d4e5f6a7b8c9d0e1f2a3b4c"
}
```

### Session profile — `GET /auth/me`

```json
{
  "user_id": "usr_a1b2c3d4e5f6",
  "email": "customer@example.com",
  "role": "customer",
  "roles": ["customer"],
  "session_id": "sess_9x8y7z6w5v4u"
}
```

### Error — invalid credentials

```json
{
  "type": "https://app13.dev/problems/UNAUTHORIZED",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication required",
  "code": "UNAUTHORIZED",
  "engine": "platform",
  "request_id": "req_login_001"
}
```

---

## 2. Home

**Endpoint:** `GET /home`  
**Classification:** **Implemented** (semantic view — not full RuntimeScreenView)

Platform home is a **data-first dashboard**. CH3 Need Home (`GET /need-experience/home`) is the canonical **render-tree** home for MVP.

### Platform home — `GET /home`

```json
{
  "user_id": "usr_a1b2c3d4e5f6",
  "mode": "customer",
  "summary": {
    "headline": "Your AN ACT workspace",
    "active_work_count": 2,
    "unread_notifications": 3
  },
  "customer": {
    "request_count": 1,
    "active_contract_count": 1,
    "pending_offer_count": 0
  },
  "provider": null,
  "notifications": {
    "unread_count": 3,
    "latest_title": "Contract confirmed",
    "latest_recorded_at": "2026-06-28T09:15:00.000Z"
  },
  "trust": {
    "trust_score": 72,
    "tier_label": "Verified",
    "live_frame_summary": "Standard trust standing"
  },
  "recommended_action": {
    "action_code": "create_request",
    "title": "Create your next request",
    "description": "Describe what you need and get provider matches.",
    "route_hint": "POST /requests"
  },
  "quick_actions": [
    {
      "action_code": "create_request",
      "title": "Create request",
      "description": "Describe what you need and get provider matches.",
      "route_hint": "POST /requests",
      "roles": ["customer"]
    },
    {
      "action_code": "discover_providers",
      "title": "Discover providers",
      "description": "Browse ranked providers and marketplace actions.",
      "route_hint": "GET /discover/providers",
      "roles": ["customer"]
    },
    {
      "action_code": "view_notifications",
      "title": "Notifications",
      "description": "Review unread inbox events.",
      "route_hint": "GET /notifications/unread",
      "roles": ["customer", "provider"]
    }
  ],
  "generated_at": "2026-06-28T12:00:00.000Z"
}
```

### CH3 Need Home screen — `GET /need-experience/home`

See [Need Experience](#3-need-experience) below for full `RuntimeScreenView`.

---

## 3. Need Experience

**Endpoint:** `GET /need-experience`  
**Classification:** **Implemented**

### Full experience envelope

```json
{
  "version": "an-act-need-experience-v1",
  "current_screen": "need-home",
  "mode": "need",
  "screen": {
    "screenId": "need-home",
    "prototypeId": "prototype-need-home",
    "route": "/need/home",
    "mode": "need",
    "layoutId": "need-layout",
    "designTokens": [
      "background.primary",
      "text.primary",
      "surface.secondary",
      "accent.primary",
      "border.subtle"
    ],
    "typography": {
      "header": "heading",
      "body": "body"
    },
    "spacing": {
      "contentPaddingX": "space-16",
      "contentPaddingY": "space-16",
      "gap": "space-12"
    },
    "regions": [
      "safeArea",
      "statusArea",
      "topNavigation",
      "screenHeader",
      "contentArea",
      "bottomNavigation"
    ],
    "sections": [
      {
        "id": "welcome",
        "label": "Welcome",
        "purpose": "Greet the user and orient them to Need Mode discovery.",
        "components": [
          {
            "id": "welcome-heading",
            "componentId": "core-ui-navigation-bar",
            "props": {
              "title": "Discover trusted professionals",
              "subtitle": "Welcome, Licensed Customer"
            },
            "accessibility": {
              "label": "Discover trusted professionals",
              "role": "banner",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "search-entry",
        "label": "Search Entry",
        "purpose": "Primary search entry point for discovering opportunities.",
        "components": [
          {
            "id": "home-search",
            "componentId": "core-ui-search",
            "variant": "search",
            "props": {
              "placeholder": "Search for services, professionals, or programs...",
              "route": "/need/search"
            },
            "accessibility": {
              "label": "Search opportunities",
              "role": "searchbox",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "quick-categories",
        "label": "Quick Categories",
        "purpose": "Category shortcuts for common need types.",
        "components": [
          {
            "id": "category-home-services",
            "componentId": "core-ui-chip",
            "props": {
              "label": "Home Services",
              "icon": "home",
              "category": "home-services"
            },
            "accessibility": {
              "label": "Home Services",
              "role": "button",
              "tabIndex": 0
            }
          },
          {
            "id": "category-professional",
            "componentId": "core-ui-chip",
            "props": {
              "label": "Professional",
              "icon": "briefcase",
              "category": "professional"
            },
            "accessibility": {
              "label": "Professional",
              "role": "button",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "recommended-actions",
        "label": "Recommended Actions",
        "purpose": "Curated next steps based on platform intelligence.",
        "components": [
          {
            "id": "rec-1",
            "componentId": "core-ui-card",
            "variant": "elevated",
            "props": {
              "title": "Find a trusted electrician",
              "description": "Licensed professionals near you with verified Live Frame.",
              "category": "home-services",
              "route": "/need/search?category=home-services"
            },
            "accessibility": {
              "label": "Find a trusted electrician",
              "role": "article",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "bottom-navigation",
        "label": "Bottom Navigation",
        "purpose": "Persistent Need Mode tab navigation.",
        "components": [
          {
            "id": "bottom-nav",
            "componentId": "core-ui-bottom-navigation",
            "props": {
              "items": [
                { "id": "home", "label": "Home", "route": "/need/home" },
                { "id": "search", "label": "Search", "route": "/need/search" },
                { "id": "timeline", "label": "Timeline", "route": "/need/timeline" },
                { "id": "profile", "label": "Profile", "route": "/need/profile" }
              ],
              "activeId": "home"
            },
            "accessibility": {
              "label": "Need mode navigation",
              "role": "navigation",
              "tabIndex": 0
            }
          }
        ]
      }
    ],
    "navigation": {
      "pattern": "tab",
      "canGoBack": false,
      "bottomNavigationVisible": true,
      "activeBottomNavId": "home",
      "stackDepth": 1,
      "nextRoute": "/need/search"
    },
    "accessibility": {
      "minimumTouchTargetPx": 44,
      "supportsKeyboardNavigation": true,
      "supportsScreenReader": true,
      "reducedMotion": false,
      "focusRegion": "contentArea",
      "landmarkRegions": [
        "safeArea",
        "statusArea",
        "topNavigation",
        "screenHeader",
        "contentArea",
        "bottomNavigation"
      ]
    },
    "generatedAt": "2026-06-28T12:00:00.000Z"
  },
  "navigation": {
    "mode": "need",
    "phase": "idle",
    "stack": [
      {
        "screenId": "need-home",
        "route": "/need/home",
        "presentation": "push",
        "timestamp": "2026-06-28T12:00:00.000Z"
      }
    ],
    "activeRoute": "/need/home",
    "canGoBack": false,
    "bottomNavigationVisible": true,
    "sideNavigationVisible": false,
    "transitionActive": false
  },
  "search": {
    "keyword": "",
    "category": null,
    "hasResults": true
  },
  "request_draft": {
    "opportunityId": null,
    "actionSummary": "",
    "location": "",
    "schedule": "",
    "notes": "",
    "estimatedCost": 0
  },
  "transition": null,
  "flow": [
    { "screenId": "need-home", "route": "/need/home", "label": "Need Home" },
    { "screenId": "search", "route": "/need/search", "label": "Search" },
    { "screenId": "opportunity-list", "route": "/need/opportunities", "label": "Opportunity List" },
    { "screenId": "request", "route": "/need/request/create", "label": "Request" },
    { "screenId": "transition", "route": "/system/transition", "label": "Official Transition" }
  ],
  "generated_at": "2026-06-28T12:00:00.000Z",
  "runtime_experience": true
}
```

### Opportunity list screen — `GET /need-experience/opportunities`

```json
{
  "screenId": "opportunity-list",
  "prototypeId": "prototype-opportunity-list",
  "route": "/need/opportunities",
  "mode": "need",
  "layoutId": "need-layout",
  "designTokens": [
    "background.primary",
    "text.primary",
    "surface.secondary",
    "accent.primary",
    "border.subtle"
  ],
  "typography": { "header": "heading", "body": "body" },
  "spacing": {
    "contentPaddingX": "space-16",
    "contentPaddingY": "space-16",
    "gap": "space-12"
  },
  "regions": [
    "safeArea",
    "statusArea",
    "topNavigation",
    "screenHeader",
    "contentArea",
    "bottomNavigation"
  ],
  "sections": [
    {
      "id": "opportunity-list-header",
      "label": "Opportunities",
      "purpose": "List header with result count.",
      "components": [
        {
          "id": "list-header",
          "componentId": "core-ui-navigation-bar",
          "props": {
            "title": "Opportunities",
            "subtitle": "3 matches found"
          },
          "accessibility": {
            "label": "Opportunity list",
            "role": "banner",
            "tabIndex": 0
          }
        }
      ]
    },
    {
      "id": "opportunity-cards",
      "label": "Opportunity Cards",
      "purpose": "Matched opportunities with Live Frame, rating, distance, availability, time, cost, and badges.",
      "components": [
        {
          "id": "opp-opp-1",
          "componentId": "core-ui-card",
          "variant": "elevated",
          "props": {
            "title": "Certified Electrician — Panel Upgrade",
            "opportunityId": "opp-1",
            "liveFrame": {
              "componentId": "core-ui-live-frame",
              "tier": "gold"
            },
            "trust_score": 88,
            "ui_tier": "gold",
            "rating": 4.9,
            "distanceKm": 2.4,
            "availability": "Available today",
            "estimatedMinutes": 120,
            "estimatedCostSar": 850,
            "badges": [
              {
                "componentId": "core-ui-badge",
                "variant": "professional",
                "label": "Licensed"
              },
              {
                "componentId": "core-ui-badge",
                "variant": "professional",
                "label": "Insured"
              },
              {
                "componentId": "core-ui-badge",
                "variant": "professional",
                "label": "Live Frame Verified"
              }
            ]
          },
          "accessibility": {
            "label": "Certified Electrician — Panel Upgrade, rated 4.9, 2.4 km away",
            "role": "article",
            "tabIndex": 0
          }
        }
      ]
    },
    {
      "id": "bottom-navigation",
      "label": "Bottom Navigation",
      "purpose": "Persistent Need Mode tab navigation.",
      "components": [
        {
          "id": "bottom-nav",
          "componentId": "core-ui-bottom-navigation",
          "props": {
            "items": [
              { "id": "home", "label": "Home", "route": "/need/home" },
              { "id": "search", "label": "Search", "route": "/need/search" }
            ],
            "activeId": "search"
          },
          "accessibility": {
            "label": "Need mode navigation",
            "role": "navigation",
            "tabIndex": 0
          }
        }
      ]
    }
  ],
  "navigation": {
    "pattern": "stack",
    "canGoBack": true,
    "backRoute": "/need/search",
    "bottomNavigationVisible": true,
    "activeBottomNavId": "search",
    "stackDepth": 3,
    "nextRoute": "/need/request/create"
  },
  "accessibility": {
    "minimumTouchTargetPx": 44,
    "supportsKeyboardNavigation": true,
    "supportsScreenReader": true,
    "reducedMotion": false,
    "focusRegion": "contentArea",
    "landmarkRegions": ["contentArea", "bottomNavigation"]
  },
  "generatedAt": "2026-06-28T12:00:00.000Z"
}
```

Note: `trust_score` and `ui_tier` on card props are **Recommended** v1.0 fields; demo repo currently emits `liveFrame.tier` only.

### Transition screen — `GET /need-experience/transition?progress=0.4`

```json
{
  "screenId": "transition",
  "prototypeId": "prototype-transition",
  "route": "/system/transition",
  "mode": "transition",
  "layoutId": "transition-layout",
  "designTokens": ["transition.start", "transition.mid", "transition.end"],
  "sections": [
    {
      "id": "transition-content",
      "label": "Transition",
      "purpose": "Official Need to Action mode transition.",
      "components": [
        {
          "id": "transition-loading",
          "componentId": "core-ui-loading",
          "props": {
            "brandLine": "an act...",
            "stageText": "Preparing action mode"
          },
          "accessibility": {
            "label": "Transition in progress",
            "role": "status",
            "tabIndex": 0
          }
        },
        {
          "id": "transition-progress",
          "componentId": "core-ui-progress",
          "props": {
            "value": 40,
            "variant": "linear"
          },
          "accessibility": {
            "label": "Transition progress 40 percent",
            "role": "progressbar",
            "tabIndex": 0
          }
        }
      ]
    }
  ],
  "navigation": {
    "pattern": "stack",
    "canGoBack": false,
    "bottomNavigationVisible": false,
    "stackDepth": 5
  },
  "accessibility": {
    "minimumTouchTargetPx": 44,
    "supportsKeyboardNavigation": false,
    "supportsScreenReader": true,
    "reducedMotion": false,
    "focusRegion": "transitionLayer",
    "landmarkRegions": ["transitionLayer"]
  },
  "generatedAt": "2026-06-28T12:00:00.000Z"
}
```

---

## 4. Provider Experience

**Endpoint:** `GET /home/provider`  
**Classification:** **Implemented** (semantic view)

Provider-facing home summarizes active work, offers, and trust. CH3 Action Home (`GET /action-experience/home`) is the execution render-tree for providers.

```json
{
  "user_id": "usr_provider_001",
  "mode": "provider",
  "provider": {
    "offer_count": 4,
    "active_contract_count": 2,
    "completed_action_count": 47,
    "response_rate": 0.94,
    "average_rating": 4.8
  },
  "notifications": {
    "unread_count": 1,
    "latest_title": "New match received",
    "latest_recorded_at": "2026-06-28T08:30:00.000Z"
  },
  "trust": {
    "trust_score": 88,
    "tier_label": "Sapphire Verified",
    "live_frame_summary": "Sapphire Verified live frame at 88 trust score"
  },
  "recommended_action": {
    "action_code": "view_provider_dashboard",
    "title": "Review incoming offers",
    "description": "Track conversion offers you sent to customers.",
    "route_hint": "GET /providers/:userId/offers"
  },
  "quick_actions": [
    {
      "action_code": "view_provider_dashboard",
      "title": "Provider dashboard",
      "description": "Review incoming offers and active contracts.",
      "route_hint": "GET /providers/:userId/dashboard",
      "roles": ["provider"]
    },
    {
      "action_code": "view_provider_profile",
      "title": "Public profile",
      "description": "Review your provider profile and trust signals.",
      "route_hint": "GET /providers/:userId/profile",
      "roles": ["provider"]
    }
  ],
  "generated_at": "2026-06-28T12:00:00.000Z"
}
```

### Action Home screen — `GET /action-experience/home` (provider execution)

```json
{
  "screenId": "action-home",
  "prototypeId": "prototype-action-home",
  "route": "/action/home",
  "mode": "action",
  "layoutId": "action-layout",
  "designTokens": [
    "background.primary",
    "text.primary",
    "surface.elevated",
    "accent.primary"
  ],
  "typography": { "header": "heading", "body": "body" },
  "spacing": {
    "contentPaddingX": "space-16",
    "contentPaddingY": "space-16",
    "gap": "space-12"
  },
  "regions": [
    "safeArea",
    "statusArea",
    "topNavigation",
    "screenHeader",
    "contentArea",
    "floatingActionArea",
    "bottomNavigation"
  ],
  "sections": [
    {
      "id": "action-header",
      "label": "Action Header",
      "purpose": "Active action context for provider execution.",
      "components": [
        {
          "id": "action-nav",
          "componentId": "core-ui-navigation-bar",
          "props": {
            "title": "Action Mode",
            "subtitle": "Panel Upgrade — Active"
          },
          "accessibility": {
            "label": "Action Mode — Panel Upgrade Active",
            "role": "banner",
            "tabIndex": 0
          }
        }
      ]
    },
    {
      "id": "active-action-card",
      "label": "Active Action",
      "purpose": "Current action summary and status.",
      "components": [
        {
          "id": "action-card",
          "componentId": "core-ui-card",
          "variant": "elevated",
          "props": {
            "title": "Panel Upgrade",
            "status": "active",
            "schedule": "Mon 10:00",
            "location": "Riyadh",
            "estimatedCostSar": 850
          },
          "accessibility": {
            "label": "Panel Upgrade active action",
            "role": "article",
            "tabIndex": 0
          }
        }
      ]
    },
    {
      "id": "floating-action",
      "label": "Floating Action",
      "purpose": "Primary action mode control.",
      "components": [
        {
          "id": "fab",
          "componentId": "core-ui-floating-action-button",
          "props": {
            "label": "View progress",
            "route": "/action/progress"
          },
          "accessibility": {
            "label": "View action progress",
            "role": "button",
            "tabIndex": 0
          }
        }
      ]
    }
  ],
  "navigation": {
    "pattern": "tab",
    "canGoBack": false,
    "bottomNavigationVisible": true,
    "activeBottomNavId": "home",
    "stackDepth": 1,
    "nextRoute": "/action/contract"
  },
  "accessibility": {
    "minimumTouchTargetPx": 44,
    "supportsKeyboardNavigation": true,
    "supportsScreenReader": true,
    "reducedMotion": false,
    "focusRegion": "contentArea",
    "landmarkRegions": ["contentArea", "floatingActionArea"]
  },
  "generatedAt": "2026-06-28T12:00:00.000Z"
}
```

---

## 5. Live Frame

**Endpoint:** `GET /live-frame`  
**Classification:** **Implemented** (semantic trust view — X2 Live Frame Experience)

```json
{
  "user_id": "usr_provider_001",
  "identity": {
    "user_id": "usr_provider_001",
    "provider_id": "prv_001",
    "display_name": "Licensed Professional",
    "verification_tier": "verified",
    "live_frame": {
      "provider_id": "prv_001",
      "user_id": "usr_provider_001",
      "trust_score": 88,
      "tier": "SAPPHIRE_VERIFIED",
      "color": "sapphire",
      "label": "Sapphire Verified",
      "generated_at": "2026-06-28T12:00:00.000Z"
    }
  },
  "summary": {
    "trust_score": 88,
    "tier": "SAPPHIRE_VERIFIED",
    "tier_label": "Sapphire Verified",
    "color": "sapphire",
    "badge_label": "Verified Professional",
    "badge_description": "Meets platform trust standards",
    "headline": "Sapphire Verified live frame at 88 trust score."
  },
  "progress": {
    "current_tier": "SAPPHIRE_VERIFIED",
    "current_tier_label": "Sapphire Verified",
    "next_tier": "EMERALD_PRO",
    "next_tier_label": "Emerald Pro",
    "current_score": 88,
    "next_tier_minimum_score": 85,
    "points_to_next_tier": 0,
    "progress_percent": 100,
    "at_max_tier": false,
    "summary": "You have reached Sapphire Verified. 7 points to Emerald Pro."
  },
  "evolution": {
    "window_days": 30,
    "points": [
      {
        "date": "2026-06-01",
        "positive_events": 2,
        "negative_events": 0,
        "neutral_events": 1,
        "net_impact": 4
      }
    ],
    "positive_event_count": 12,
    "negative_event_count": 1,
    "neutral_event_count": 3,
    "net_direction": "up",
    "summary": "Trust trend is improving over the last 30 days."
  },
  "positive_drivers": [
    {
      "driver_code": "COMPLETION_RATE",
      "title": "Completion Rate",
      "description": "High contract completion rate",
      "score": 92,
      "weight_percent": 25,
      "impact": "positive"
    }
  ],
  "negative_drivers": [],
  "platform_context": {
    "providers_with_scores": 1284,
    "average_trust_score": 74,
    "low_trust_provider_count": 42,
    "tier_distribution": [
      { "tier": "SAPPHIRE_VERIFIED", "count": 412 },
      { "tier": "EMERALD_PRO", "count": 198 }
    ],
    "trust_events_last_7_days": 342,
    "trust_events_last_30_days": 1456
  },
  "generated_at": "2026-06-28T12:00:00.000Z"
}
```

### Profile Live Frame screen — `GET /profile-experience/live-frame`

Runtime render-tree embedding `core-ui-live-frame`:

```json
{
  "screenId": "profile-live-frame",
  "prototypeId": "prototype-profile",
  "route": "/profile/live-frame",
  "mode": "need",
  "layoutId": "need-layout",
  "sections": [
    {
      "id": "current-frame",
      "label": "Current Frame",
      "purpose": "Current Live Frame tier.",
      "components": [
        {
          "id": "frame",
          "componentId": "core-ui-live-frame",
          "props": {
            "tier": "gold",
            "score": 88,
            "readOnly": true
          },
          "accessibility": {
            "label": "gold Live Frame",
            "role": "region",
            "tabIndex": 0
          }
        }
      ]
    },
    {
      "id": "frame-score",
      "label": "Frame Score",
      "purpose": "Current frame score.",
      "components": [
        {
          "id": "score",
          "componentId": "core-ui-badge",
          "variant": "professional",
          "props": {
            "label": "Score: 88",
            "value": 88
          },
          "accessibility": {
            "label": "Frame score 88",
            "role": "status",
            "tabIndex": 0
          }
        }
      ]
    }
  ],
  "generatedAt": "2026-06-28T12:00:00.000Z"
}
```

Note: Profile demo previously used invalid `frameScore: 847`; v1.0 requires 0–100 — **Recommended** fix per Live Frame Migration Plan.

---

## 6. Marketplace

**Endpoint:** `GET /discover/providers?text=electrician&limit=10`  
**Classification:** **Implemented**

```json
{
  "providers": [
    {
      "provider_id": "prv_001",
      "provider_user_id": "usr_provider_001",
      "display_name": "Licensed Electrician Co.",
      "action_codes": ["ELECTRICAL_PANEL_UPGRADE", "ELECTRICAL_OUTLET_REPAIR"],
      "rank_score": 0.92,
      "trust_score": 88,
      "trust_tier": "SAPPHIRE_VERIFIED",
      "trust_label": "Sapphire Verified",
      "available_now": true,
      "completed_contracts": 47,
      "average_rating": 4.9,
      "issues_raised": 1,
      "issues_resolved": 1,
      "active_issues": 0,
      "availability": {
        "available_now": true,
        "active_contracts": 2,
        "capacity_remaining": 3,
        "provider_status": "active"
      },
      "ranking": {
        "total_score": 0.92,
        "trust_score": 0.88,
        "availability_score": 0.95,
        "completion_score": 0.96,
        "rating_score": 0.98,
        "dispute_score": 0.99,
        "weights": {
          "trust": 0.35,
          "availability": 0.2,
          "completion": 0.15,
          "rating": 0.15,
          "dispute": 0.15
        },
        "summary": "Highly ranked based on trust, availability, and completion history."
      }
    },
    {
      "provider_id": "prv_002",
      "provider_user_id": "usr_provider_002",
      "display_name": "Quick Fix Electrical",
      "action_codes": ["ELECTRICAL_OUTLET_REPAIR"],
      "rank_score": 0.78,
      "trust_score": 72,
      "trust_tier": "SAPPHIRE_VERIFIED",
      "trust_label": "Sapphire Verified",
      "available_now": false,
      "completed_contracts": 23,
      "average_rating": 4.6,
      "issues_raised": 0,
      "issues_resolved": 0,
      "active_issues": 0,
      "availability": {
        "available_now": false,
        "active_contracts": 4,
        "capacity_remaining": 0,
        "provider_status": "active"
      },
      "ranking": {
        "total_score": 0.78,
        "trust_score": 0.72,
        "availability_score": 0.45,
        "completion_score": 0.88,
        "rating_score": 0.92,
        "dispute_score": 1.0,
        "weights": {
          "trust": 0.35,
          "availability": 0.2,
          "completion": 0.15,
          "rating": 0.15,
          "dispute": 0.15
        },
        "summary": "Strong trust and rating; limited availability today."
      }
    }
  ],
  "summary": {
    "total_providers": 1284,
    "total_actions": 156,
    "total_requests": 0,
    "returned_providers": 2,
    "returned_actions": 0,
    "returned_requests": 0,
    "applied_filters": ["text:electrician"]
  },
  "generated_at": "2026-06-28T12:00:00.000Z"
}
```

### Mapping discovery → runtime card (**Recommended**)

When wiring Need opportunities to discovery, clients or server adapter map:

```
trust_tier: SAPPHIRE_VERIFIED → ui_tier: gold
trust_score: 88 → core-ui-live-frame props.score
```

---

## 7. Contract

**Endpoint:** `GET /contract-experience`  
**Classification:** **Implemented**

### Full contract experience envelope

```json
{
  "version": "an-act-contract-experience-v1",
  "need_experience_version": "an-act-need-experience-v1",
  "action_experience_version": "an-act-action-experience-v1",
  "current_screen": "contract-home",
  "mode": "action",
  "screen": {
    "screenId": "contract-home",
    "prototypeId": "prototype-contract",
    "route": "/contract/home",
    "mode": "action",
    "layoutId": "action-layout",
    "designTokens": [
      "background.primary",
      "text.primary",
      "surface.elevated",
      "accent.primary",
      "border.subtle"
    ],
    "typography": { "header": "heading", "body": "body" },
    "spacing": {
      "contentPaddingX": "space-16",
      "contentPaddingY": "space-16",
      "gap": "space-12"
    },
    "regions": [
      "safeArea",
      "statusArea",
      "topNavigation",
      "screenHeader",
      "contentArea",
      "bottomNavigation"
    ],
    "sections": [
      {
        "id": "contract-summary",
        "label": "Contract Summary",
        "purpose": "Overview of the active contract.",
        "components": [
          {
            "id": "contract-card",
            "componentId": "core-ui-contract-card",
            "props": {
              "title": "Panel Upgrade Agreement",
              "status": "pending_review",
              "customerName": "Licensed Customer",
              "providerName": "Licensed Professional",
              "estimatedCostSar": 850,
              "schedule": "Mon 10:00"
            },
            "accessibility": {
              "label": "Panel Upgrade Agreement contract",
              "role": "region",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "parties-preview",
        "label": "Parties",
        "purpose": "Customer and provider with Live Frame.",
        "components": [
          {
            "id": "parties-card",
            "componentId": "core-ui-card",
            "props": {
              "customer": "Licensed Customer",
              "provider": "Licensed Professional"
            },
            "accessibility": {
              "label": "Parties: Licensed Customer and Licensed Professional",
              "role": "region",
              "tabIndex": 0
            }
          },
          {
            "id": "provider-frame",
            "componentId": "core-ui-live-frame",
            "props": {
              "tier": "gold",
              "score": 88,
              "readOnly": true
            },
            "accessibility": {
              "label": "Provider Live Frame gold tier",
              "role": "img",
              "tabIndex": 0
            }
          }
        ]
      },
      {
        "id": "contract-navigation",
        "label": "Contract Navigation",
        "purpose": "Navigate contract sections.",
        "components": [
          {
            "id": "review-btn",
            "componentId": "core-ui-button",
            "variant": "primary",
            "props": {
              "label": "Review contract",
              "route": "/contract/review"
            },
            "accessibility": {
              "label": "Review contract",
              "role": "button",
              "tabIndex": 0
            }
          },
          {
            "id": "bottom-nav",
            "componentId": "core-ui-bottom-navigation",
            "props": {
              "items": [
                { "id": "home", "label": "Contract", "route": "/contract/home" },
                { "id": "terms", "label": "Terms", "route": "/contract/terms" }
              ],
              "activeId": "home"
            },
            "accessibility": {
              "label": "Contract navigation",
              "role": "navigation",
              "tabIndex": 0
            }
          }
        ]
      }
    ],
    "navigation": {
      "pattern": "stack",
      "canGoBack": true,
      "backRoute": "/action/home",
      "bottomNavigationVisible": true,
      "stackDepth": 2,
      "nextRoute": "/contract/review"
    },
    "accessibility": {
      "minimumTouchTargetPx": 44,
      "supportsKeyboardNavigation": true,
      "supportsScreenReader": true,
      "reducedMotion": false,
      "focusRegion": "contentArea",
      "landmarkRegions": ["contentArea", "bottomNavigation"]
    },
    "generatedAt": "2026-06-28T12:00:00.000Z"
  },
  "navigation": {
    "mode": "action",
    "phase": "idle",
    "stack": [
      { "screenId": "action-home", "route": "/action/home", "presentation": "push", "timestamp": "2026-06-28T11:00:00.000Z" },
      { "screenId": "contract-home", "route": "/contract/home", "presentation": "push", "timestamp": "2026-06-28T12:00:00.000Z" }
    ],
    "activeRoute": "/contract/home",
    "canGoBack": true,
    "bottomNavigationVisible": true,
    "sideNavigationVisible": false,
    "transitionActive": false
  },
  "summary": {
    "contractId": "ctr_001",
    "actionSummary": "Panel Upgrade",
    "status": "pending_review",
    "customerName": "Licensed Customer",
    "providerName": "Licensed Professional",
    "estimatedCostSar": 850,
    "schedule": "Mon 10:00"
  },
  "visited_sections": ["summary"],
  "review": {
    "ready": false,
    "missingSections": ["terms", "cost", "confirmation"],
    "summary": "Contract review incomplete — visit terms, cost, and confirmation."
  },
  "transition": null,
  "flow": [
    { "screenId": "contract-home", "route": "/contract/home", "label": "Contract Home" },
    { "screenId": "contract-review", "route": "/contract/review", "label": "Review" },
    { "screenId": "confirmation", "route": "/contract/confirmation", "label": "Confirmation" }
  ],
  "generated_at": "2026-06-28T12:00:00.000Z",
  "runtime_experience": true
}
```

---

## 8. AI Experience

**Endpoint:** `GET /ai-experience`  
**Classification:** **Implemented**

### AI Foundation home

```json
{
  "schema_version": "ai-experience-foundation-v1",
  "headline": "AN ACT AI Experience Foundation",
  "description": "Foundational read-only AI Experience layer for Chapter 5 — delegates-only via CH4-C22 Action Intelligence Final Closure.",
  "foundation_chain": [
    "intent",
    "canonical_action",
    "action_plan",
    "dynamic_pricing",
    "contract_intelligence",
    "execution_intelligence",
    "outcome_intelligence",
    "trust_intelligence",
    "decision_intelligence",
    "recommendation_intelligence",
    "insight_intelligence",
    "prediction_intelligence",
    "strategy_intelligence",
    "learning_intelligence",
    "optimization_intelligence",
    "evolution_intelligence",
    "orchestration_intelligence",
    "action_intelligence_experience",
    "intelligence_dashboard",
    "executive_intelligence_center",
    "action_intelligence_certification",
    "action_intelligence_final_closure",
    "ai_experience_foundation"
  ],
  "chapter_number": 5,
  "upstream_chapter_number": 4,
  "upstream_module": "CH4-C22",
  "scenario_count": 5,
  "scenarios": [
    {
      "scenario_id": "moving_a_room",
      "canonical_action_id": "MOVING_ROOM_CONTENTS",
      "goal": "Plan and price a room move action"
    },
    {
      "scenario_id": "fixing_small_home_issue",
      "canonical_action_id": "HOME_REPAIR_MINOR",
      "goal": "Match and price a minor home repair"
    }
  ],
  "foundation_views": [
    "Shared Context",
    "Foundation Status",
    "Chapter Handoff",
    "Intelligence Lineage",
    "Foundation Readiness",
    "Delegation Foundation"
  ],
  "ch5_foundation_note": "Shared AI experience context for all future Chapter 5 modules — no new business logic.",
  "read_only": true,
  "generated_at": "2026-07-01T04:00:00.000Z"
}
```

### AI context view — `GET /ai-experience/context?scenario_id=fixing_small_home_issue`

```json
{
  "schema_version": "ai-experience-foundation-v1",
  "output_id": "ai-exp-fixing-small-home-issue-001",
  "shared_context": {
    "scenario_id": "fixing_small_home_issue",
    "canonical_action_id": "HOME_REPAIR_MINOR",
    "intent": "Fix a leaking kitchen faucet",
    "urgency": "normal",
    "distance_band": "local",
    "goal": "Match and price a minor home repair",
    "read_only": true
  },
  "foundation_confidence": {
    "level": "high",
    "score": 0.91,
    "summary": "Foundation context is complete for this scenario."
  },
  "read_only": true
}
```

### AI summary view — `GET /ai-experience/summary?scenario_id=fixing_small_home_issue`

```json
{
  "schema_version": "ai-experience-foundation-v1",
  "summary": {
    "schemaVersion": "ai-experience-foundation-v1",
    "outputId": "ai-exp-fixing-small-home-issue-001",
    "goal": "Match and price a minor home repair",
    "scenarioId": "fixing_small_home_issue",
    "foundationConfidenceLevel": "high",
    "foundationConfidenceScore": 0.91,
    "foundationStatusLevel": "ready",
    "foundationStatusScore": 0.88,
    "handoffReady": true,
    "foundationChain": ["intent", "canonical_action", "action_plan", "..."],
    "readOnly": true,
    "generatedAt": "2026-07-01T04:00:00.000Z"
  },
  "read_only": true
}
```

AI responses are **not** render-tree payloads. Adapters map intelligence data into runtime screens when pixels are required — **Recommended**.

---

## 9. Executive Dashboard

**Endpoint:** `GET /runtime-executive`  
**Classification:** **Implemented** (hybrid — partial screen structure)

```json
{
  "version": "an-act-runtime-executive-v1",
  "runtime_operations_version": "an-act-runtime-operations-v1",
  "runtime_release_version": "an-act-runtime-release-v1",
  "runtime_launcher_version": "an-act-runtime-launcher-v1",
  "runtime_health_version": "an-act-runtime-health-v1",
  "definition": {
    "version": "an-act-runtime-executive-v1",
    "readOnly": true,
    "delegatesOnly": true,
    "noDeployment": true,
    "noRuntimeExecution": true,
    "noBubbleIntegration": true,
    "noBusinessLogicDuplication": true
  },
  "module_count": 26,
  "home": {
    "screenId": "executive-dashboard-home",
    "readOnly": true,
    "sections": [
      {
        "id": "executive-home",
        "label": "Executive Dashboard Home",
        "components": [
          {
            "id": "readiness",
            "componentId": "core-ui-progress",
            "props": { "score": 87, "readOnly": true },
            "accessibility": { "label": "Executive readiness", "role": "region" }
          },
          {
            "id": "modules",
            "componentId": "core-ui-badge",
            "props": { "count": 26, "readOnly": true },
            "accessibility": { "label": "Runtime modules", "role": "region" }
          },
          {
            "id": "read-only",
            "componentId": "core-ui-chip",
            "props": { "readOnly": true, "noRuntimeExecution": true },
            "accessibility": { "label": "Read-only executive view", "role": "region" }
          }
        ]
      }
    ]
  },
  "overview": {
    "moduleCount": 26,
    "certifiedModuleCount": 24,
    "executiveReadinessLabel": "Ready with fixes",
    "launchPhase": "pre-render-layer",
    "summary": "Runtime executive overview aggregating operations, release, launcher, and health modules."
  },
  "kpis": {
    "executiveReadinessScore": 87,
    "runtimeHealthScore": 92,
    "releaseCandidateScore": 85,
    "launcherReadinessScore": 90,
    "operationsCoverageScore": 88
  },
  "session": {
    "sessionId": "exec_sess_001",
    "userId": "usr_admin_001",
    "lastRefreshedAt": "2026-06-21T22:00:00.000Z"
  },
  "accessibility": {
    "minimumTouchTargetPx": 44,
    "compliant": true
  },
  "generated_at": "2026-06-21T22:00:00.000Z",
  "runtime_executive": true,
  "read_only": true,
  "delegates_only": true,
  "no_runtime_execution": true
}
```

### Executive command board — `GET /runtime-executive/board`

```json
{
  "screenId": "executive-command-board",
  "readOnly": true,
  "sections": [
    {
      "id": "executive-command-board",
      "label": "Executive Command Board",
      "components": [
        {
          "id": "command-ops",
          "componentId": "core-ui-chip",
          "props": {
            "id": "ops",
            "label": "Runtime Operations",
            "status": "certified",
            "delegateModule": "runtime-operations",
            "priority": "high",
            "readOnly": true
          },
          "accessibility": { "label": "Runtime Operations", "role": "region" }
        },
        {
          "id": "command-release",
          "componentId": "core-ui-chip",
          "props": {
            "id": "release",
            "label": "Release Candidate",
            "status": "conditional",
            "delegateModule": "runtime-release",
            "priority": "high",
            "readOnly": true
          },
          "accessibility": { "label": "Release Candidate", "role": "region" }
        }
      ]
    }
  ]
}
```

Note: Executive views omit full `AnActRuntimeScreenView` layout block today. Migration to canonical screen contract is **Recommended**.

---

## Appendix — Error example (protected route without token)

**Endpoint:** `GET /need-experience` (no Authorization header)  
**Classification:** **Implemented**

```json
{
  "type": "https://app13.dev/problems/UNAUTHORIZED",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Authentication required",
  "code": "UNAUTHORIZED",
  "engine": "platform",
  "request_id": "req_need_401"
}
```

---

*Runtime JSON Examples v1.0 — documentation only; no source code modified.*

*Contract: [AN-ACT-Runtime-JSON-Contract.md](./AN-ACT-Runtime-JSON-Contract.md)*
