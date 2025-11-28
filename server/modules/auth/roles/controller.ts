
import { Elysia } from 'elysia';
import { RolesService } from './service';
import { roleIndexDto, roleShowDto, roleStoreDto, roleUpdateDto, roleDestroyDto } from './dtos';
import { withPermission } from './middleware';
import { PERMISSIONS } from '../constants/permissions';

export const rolesController = new Elysia({ prefix: '/roles' })
    .get('/', async () => {
        return RolesService.index();
    }, {
        detail: { tags: ['Roles'] },
        ...roleIndexDto,
        beforeHandle: withPermission(PERMISSIONS.ROLES.VIEW).beforeHandle
    })
    .get('/:uuid', async ({ params: { uuid } }) => {
        return RolesService.show({ uuid });
    }, {
        detail: { tags: ['Roles'] },
        ...roleShowDto,
        beforeHandle: withPermission(PERMISSIONS.ROLES.VIEW).beforeHandle
    })
    .post('/', async ({ body }) => {
        return RolesService.store(body);
    }, {
        detail: { tags: ['Roles'] },
        ...roleStoreDto,
        beforeHandle: withPermission(PERMISSIONS.ROLES.CREATE).beforeHandle
    })
    .patch('/:uuid', async ({ params: { uuid }, body }) => {
        return RolesService.update(uuid, body);
    }, {
        detail: { tags: ['Roles'] },
        ...roleUpdateDto,
        beforeHandle: withPermission(PERMISSIONS.ROLES.UPDATE).beforeHandle
    })
    .delete('/:uuid', async ({ params: { uuid } }) => {
        await RolesService.destroy(uuid);
        return { message: 'Rol silindi' };
    }, {
        detail: { tags: ['Roles'] },
        ...roleDestroyDto,
        beforeHandle: withPermission(PERMISSIONS.ROLES.DELETE).beforeHandle
    });