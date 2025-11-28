import prisma from '../../../core/prisma';
import slugify from 'slugify';
import type { Static } from 'elysia';
import type { roleStoreDto, roleUpdateDto } from './dtos';

type RoleCreatePayload = Static<typeof roleStoreDto.body>;
type RoleUpdatePayload = Static<typeof roleUpdateDto.body>;

export class RolesService {
    private static generateSlug(name: string): string {
        return slugify(name, {
            lower: true,
            strict: true,
        });
    }

    private static async syncUsersRolesSlugs(roleId: number) {
        const usersWithRole = await prisma.userRole.findMany({
            where: { roleId },
            select: { userId: true },
        });

        if (usersWithRole.length === 0) return;

        const userIds = usersWithRole.map((ur) => ur.userId);

        await prisma.$transaction(async (tx) => {
            const usersWithRoles = await tx.user.findMany({
                where: { id: { in: userIds } },
                include: {
                    userRoles: {
                        include: {
                            role: {
                                select: { slug: true },
                            },
                        },
                    },
                },
            });

            const updatePromises = usersWithRoles.map((user) =>
                tx.user.update({
                    where: { id: user.id },
                    data: {
                        rolesSlugs: user.userRoles.map((ur) => ur.role.slug),
                    },
                }),
            );

            await Promise.all(updatePromises);
        });
    }

    static async index() {
        return prisma.role.findMany({
            orderBy: { createdAt: 'asc' },
        });
    }

    static async show({ uuid }: { uuid: string }) {
        const role = await prisma.role.findUnique({
            where: { uuid },
        });

        if (!role) throw new Error('Rol bulunamadı');
        return role;
    }

    static async store(payload: RoleCreatePayload) {
        if (payload.permissions?.includes('*') && payload.permissions.length > 1) {
            throw new Error('Wildcard (*) yetkisi tek başına kullanılmalıdır');
        }

        const slug = payload.slug ?? this.generateSlug(payload.name);

        const existing = await prisma.role.findUnique({ where: { slug } });
        if (existing) throw new Error('Bu rol adı zaten kullanılıyor');

        return prisma.role.create({
            data: {
                name: payload.name,
                slug,
                description: payload.description ?? '',
                permissions: payload.permissions,
            },
        });
    }

    static async update(uuid: string, payload: RoleUpdatePayload) {
        const role = await prisma.role.findUnique({
            where: { uuid },
            select: { id: true, name: true },
        });

        if (!role) throw new Error('Rol bulunamadı');

        if (role.id === 1 && (Array.isArray(payload.permissions) || payload.permissions === null)) {
            throw new Error('Admin rolünün yetkileri değiştirilemez');
        }

        const slug = payload.name ? this.generateSlug(payload.name) : undefined;

        const updatedRole = await prisma.role.update({
            where: { uuid },
            data: {
                name: payload.name,
                slug,
                description: payload.description,
                permissions: payload.permissions,
            },
        });

        await this.syncUsersRolesSlugs(role.id);
        return updatedRole;
    }

    static async destroy(uuid: string) {
        const role = await prisma.role.findUnique({
            where: { uuid },
            select: { id: true },
        });

        if (!role) throw new Error('Rol bulunamadı');
        if (role.id === 1) throw new Error('Admin rolü silinemez');

        await this.syncUsersRolesSlugs(role.id);

        await prisma.role.delete({
            where: { uuid },
        });
    }
}