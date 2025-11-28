import type { AuthContext, PermissionIdentifier } from './types';
import { isPermissionGrantedToUser } from './helpers/helpers';

export function withPermission(permission?: PermissionIdentifier) {
    return {
        beforeHandle: async ({ user, set }: AuthContext) => {
            if (!permission) return;

            const userHasPermission = await isPermissionGrantedToUser(user, permission);
            if (!userHasPermission) {
                set.status = 403;
                return {
                    message: 'Bu işlem için yetkiniz yok'
                };
            }
        },
    };
}