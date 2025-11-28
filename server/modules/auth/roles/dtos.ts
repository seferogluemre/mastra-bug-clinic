import { t } from 'elysia';
import { PERMISSION_KEYS } from '../constants/permissions';

const RoleDto = t.Object({
    id: t.Number(),
    uuid: t.String(),
    name: t.String(),
    slug: t.String(),
    description: t.Nullable(t.String()),
    permissions: t.Array(t.String()),
    createdAt: t.Date(),
    updatedAt: t.Date(),
});

const rolePermissionsDto = t.Union([
    t.Array(t.Literal('*'), {
        minItems: 1,
        maxItems: 1,
        uniqueItems: true,
    }),
    t.Array(t.Union(PERMISSION_KEYS.map((key) => t.Literal(key))), {
        uniqueItems: true,
    }),
]);

export const roleIndexDto = {
    response: t.Array(RoleDto),
};

export const roleShowDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: RoleDto,
};

export const roleStoreDto = {
    body: t.Object({
        name: t.String(),
        description: t.Optional(t.String()),
        permissions: rolePermissionsDto,
        slug: t.Optional(t.String()),
    }),
    response: RoleDto,
};

export const roleUpdateDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    body: t.Partial(
        t.Object({
            name: t.String(),
            description: t.String(),
            permissions: rolePermissionsDto,
        })
    ),
    response: RoleDto,
};

export const roleDestroyDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: t.Object({
        message: t.String(),
    }),
};