## Clients

- `-` prefix excluded from routes
- `_` prefix for pathless routes
- `$` prefix for dynamic routes
  [Routing Concepts | TanStack Router Docs](https://tanstack.com/router/latest/docs/routing/routing-concepts#non-nested-routes)

```
clients/
└── start/                                				# Project Name
    └── src/
		├── i18n/
		│   └── config.ts                               # Config for i18n pulling from the package
		├── router.tsx
		├── routeTree.gen.ts
        ├── tests/
        └── routes/
            ├── __root.tsx
            └── _pathless-layout/
                ├── route.tsx
                └── users/
                    ├── -components/
                    │   └── users-form.tsx              # Components with tight logic to users
                    ├── -hooks/
                    │   └── use-users.tsx               # Reusable logic for users
                    ├── -lib/
                    │   └── users-fn.ts                 # File containing Tanstack Start server function
                    ├── -tests/
                    ├── create.tsx
                    ├── route.tsx                       # Used as layout over other users routes.
                    ├── $postsId.index.tsx
                    └── $postsId.edit.tsx

packages/
├── shared/
│   ├── server/                  						# Shareable server code (framework-agnostic)
│   │   ├── services/
│   │   │   └── users-service.ts                        # Contain logic for API calls that could be reuse
│   │   ├── tests/
│   │   ├── db/
│   │   │   ├── client.ts
│   │   │   ├── user-db-schema.ts
│   │   │   └── migrations/
│   │   ├── env.ts
│   │   └── drizzle.config.ts
│   ├── client/											# Shareable client code
│   │   ├── hooks/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── tests/
│   │   └── types/
│   ├── tests/
│   └── lib/											# Shareable code between clients & servers
│       └── schemas/
│           └── users-schema.ts
├── design-system/						  				# See [SKILL](.agents/skills/design-system/SKILL.md)
├── storybook/											# See [README](packages/storybook/README.md)
└── i18n/ 						  		  				# See [README](packages/i18n/README.md)
```
