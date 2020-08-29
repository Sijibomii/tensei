import { Field, User } from '@flamingo/common'

export interface AuthToolConfig {
    fields: Field[]
    nameResource: string
    roleResource: string
    permissionResource: string
    passwordResetsResource: string
    apiPath: string
    jwt: {
        expiresIn: string
        secretKey: string
    }
    teams: boolean
    teamFields: Field[]
    twoFactorAuth: boolean
}

export interface UserWithTwoFactorAuth extends User {
    two_factor_secret?: string
    two_factor_enabled?: boolean
}

export type AuthData = { email: string; password: string; name?: string }
