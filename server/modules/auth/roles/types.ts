import type { Simplify, ValueOf } from 'type-fest';
import { PERMISSIONS } from '../constants/permissions';

export type Permission = string;

export type GenericPermissionObject = {
    key: string;
    description: string;
    isHidden?: boolean;
};

export type BasePermissionObject = Simplify<
    ValueOf<{
        [K in keyof typeof PERMISSIONS]: ValueOf<(typeof PERMISSIONS)[K]>;
    }>
>;

export type PermissionObject =
    | BasePermissionObject
    | {
        key: '*';
        description: 'Tüm yetkilere izin ver';
    };

export type PermissionKey = BasePermissionObject['key'] | '*';

export type PermissionIdentifier = PermissionKey | PermissionObject;

// Auth context type - Elysia middleware'de kullanılacak
export interface AuthContext {
    user: {
        id: string;
        email: string;
        rolesSlugs: string[];
        firstName: string;
        lastName: string;
    };
    set: {
        status?: number;
        headers?: Record<string, string>;
    };
}