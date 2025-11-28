import prisma from '../../../core/prisma';
import type { PermissionIdentifier, PermissionKey } from './types';

// Helper types
type UserWithRoles = {
    rolesSlugs: string[];
};

export function isPermissionGrantedToRole(role: { permissions: unknown }, permission: PermissionIdentifier) {
    const permissions = role.permissions as PermissionKey[];
    const permissionKey = typeof permission === 'string' ? permission : permission.key;
    return permissions.includes('*') || permissions.includes(permissionKey);
}

export async function isPermissionGrantedToUser(
    user: UserWithRoles,
    permission: PermissionIdentifier,
) {
    if (!user) {
        return false;
    }

    for (const slug of user.rolesSlugs) {
        const role = await prisma.role.findUnique({
            where: { slug },
        });

        if (role && isPermissionGrantedToRole(role, permission)) {
            return true;
        }
    }
    return false;
}

export async function ensureRoleHasPermission(role: { permissions: unknown }, permission?: PermissionIdentifier | null) {
    if (!permission) return;
    if (!isPermissionGrantedToRole(role, permission)) {
        throw new Error('Forbidden: Bu işlem için yetkiniz yok');
    }
}

export async function ensureUserHasPermission(
    user: UserWithRoles,
    permission?: PermissionIdentifier | null,
) {
    if (!permission) return;

    const userHasPermission = await isPermissionGrantedToUser(user, permission);

    if (!userHasPermission) {
        throw new Error('Forbidden: Bu işlem için yetkiniz yok');
    }
}

export async function getUserPermissions(user: UserWithRoles): Promise<PermissionKey[]> {
    if (!user) {
        throw new Error('Unauthorized');
    }

    const permissions = new Set<PermissionKey>();

    for (const slug of user.rolesSlugs) {
        const role = await prisma.role.findUnique({
            where: { slug },
        });

        if (role) {
            const rolePermissions = role.permissions as PermissionKey[];

            if (rolePermissions.includes('*')) {
                const { PERMISSION_KEYS } = await import('../constants/permissions');
                PERMISSION_KEYS.forEach((permission) => permissions.add(permission));
            } else {
                rolePermissions.forEach((permission) => permissions.add(permission));
            }
        }
    }

    return Array.from(permissions);
}