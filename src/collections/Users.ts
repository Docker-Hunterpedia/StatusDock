import type { CollectionConfig } from 'payload'
import { isLocalLoginDisabled } from '@/lib/oidc'

const isProduction = process.env.NODE_ENV === 'production'

// Check if password login should be disabled (SSO-only mode)
const disablePasswordLogin = isLocalLoginDisabled()

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: {
    // Disable database sessions - use stateless JWT
    // Sessions cause issues behind reverse proxy
    useSessions: false,
    cookies: {
      secure: isProduction,
      sameSite: 'Lax',
    },
    // Disable password login when OIDC_DISABLE_LOCAL_LOGIN=true
    // Keep email field for user identification
    ...(disablePasswordLogin && {
      disableLocalStrategy: {
        enableFields: true,
      },
    }),
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description: 'User role for access control',
      },
    },
  ],
}
