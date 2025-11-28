import type { GenericPermissionObject, PermissionKey } from '../types';

export const PERMISSIONS = {
    APPOINTMENTS: {
        CREATE: { key: 'appointments:create', description: 'Randevu Oluştur' },
        VIEW: { key: 'appointments:view', description: 'Randevuları Görüntüle' },
        UPDATE: { key: 'appointments:update', description: 'Randevu Güncelle' },
        DELETE: { key: 'appointments:delete', description: 'Randevu Sil' },
    },

    PATIENTS: {
        CREATE: { key: 'patients:create', description: 'Hasta Oluştur' },
        VIEW: { key: 'patients:view', description: 'Hastaları Görüntüle' },
        UPDATE: { key: 'patients:update', description: 'Hasta Güncelle' },
        DELETE: { key: 'patients:delete', description: 'Hasta Sil' },
    },

    DOCTORS: {
        CREATE: { key: 'doctors:create', description: 'Doktor Oluştur' },
        VIEW: { key: 'doctors:view', description: 'Doktorları Görüntüle' },
        UPDATE: { key: 'doctors:update', description: 'Doktor Güncelle' },
        DELETE: { key: 'doctors:delete', description: 'Doktor Sil' },
    },

    MEDICAL_RECORDS: {
        CREATE: { key: 'medical-records:create', description: 'Tıbbi Kayıt Oluştur' },
        VIEW: { key: 'medical-records:view', description: 'Tıbbi Kayıtları Görüntüle' },
        UPDATE: { key: 'medical-records:update', description: 'Tıbbi Kayıt Güncelle' },
        DELETE: { key: 'medical-records:delete', description: 'Tıbbi Kayıt Sil' },
    },

    PRESCRIPTIONS: {
        CREATE: { key: 'prescriptions:create', description: 'Reçete Oluştur' },
        VIEW: { key: 'prescriptions:view', description: 'Reçeteleri Görüntüle' },
        UPDATE: { key: 'prescriptions:update', description: 'Reçete Güncelle' },
        DELETE: { key: 'prescriptions:delete', description: 'Reçete Sil' },
    },

    USERS: {
        CREATE: { key: 'users:create', description: 'Kullanıcı Oluştur' },
        VIEW: { key: 'users:view', description: 'Kullanıcıları Görüntüle' },
        UPDATE: { key: 'users:update', description: 'Kullanıcı Güncelle' },
        DELETE: { key: 'users:delete', description: 'Kullanıcı Sil' },
        UPDATE_ROLES: { key: 'users:update-roles', description: 'Kullanıcı Rollerini Güncelle' },
    },

    ROLES: {
        CREATE: { key: 'roles:create', description: 'Rol Oluştur' },
        VIEW: { key: 'roles:view', description: 'Rolleri Görüntüle' },
        UPDATE: { key: 'roles:update', description: 'Rol Güncelle' },
        DELETE: { key: 'roles:delete', description: 'Rol Sil' },
    },
} as const satisfies Record<string, Record<string, GenericPermissionObject>>;

export const PERMISSION_KEYS = [
    ...new Set(
        Object.values(PERMISSIONS)
            .flatMap((module) => Object.values(module))
            .map((permission) => permission.key),
    ),
] as PermissionKey[];

export const PERMISSION_GROUPS = {
    APPOINTMENTS: {
        key: 'appointments',
        description: 'Randevular',
        permissions: Object.values(PERMISSIONS.APPOINTMENTS),
    },
    PATIENTS: {
        key: 'patients',
        description: 'Hastalar',
        permissions: Object.values(PERMISSIONS.PATIENTS),
    },
    DOCTORS: {
        key: 'doctors',
        description: 'Doktorlar',
        permissions: Object.values(PERMISSIONS.DOCTORS),
    },
    MEDICAL_RECORDS: {
        key: 'medical-records',
        description: 'Tıbbi Kayıtlar',
        permissions: Object.values(PERMISSIONS.MEDICAL_RECORDS),
    },
    PRESCRIPTIONS: {
        key: 'prescriptions',
        description: 'Reçeteler',
        permissions: Object.values(PERMISSIONS.PRESCRIPTIONS),
    },
    USERS: {
        key: 'users',
        description: 'Kullanıcılar',
        permissions: Object.values(PERMISSIONS.USERS),
    },
    ROLES: {
        key: 'roles',
        description: 'Roller',
        permissions: Object.values(PERMISSIONS.ROLES),
    },
} as const satisfies Record<
    string,
    { key: string; description: string; permissions: Array<{ key: string; description: string }> }
>;

export const ROLE_PERMISSIONS = {
    admin: ['*'], // Tüm izinler
    doctor: [
        // Randevular
        PERMISSIONS.APPOINTMENTS.VIEW.key,
        PERMISSIONS.APPOINTMENTS.UPDATE.key,

        // Hastalar
        PERMISSIONS.PATIENTS.VIEW.key,
        PERMISSIONS.PATIENTS.CREATE.key,
        PERMISSIONS.PATIENTS.UPDATE.key,

        // Doktorlar
        PERMISSIONS.DOCTORS.VIEW.key,

        // Tıbbi Kayıtlar
        PERMISSIONS.MEDICAL_RECORDS.CREATE.key,
        PERMISSIONS.MEDICAL_RECORDS.VIEW.key,
        PERMISSIONS.MEDICAL_RECORDS.UPDATE.key,

        // Reçeteler
        PERMISSIONS.PRESCRIPTIONS.CREATE.key,
        PERMISSIONS.PRESCRIPTIONS.VIEW.key,
        PERMISSIONS.PRESCRIPTIONS.UPDATE.key,
    ],
    patient: [
        // Randevular - Sadece kendi randevuları
        PERMISSIONS.APPOINTMENTS.CREATE.key,
        PERMISSIONS.APPOINTMENTS.VIEW.key,
        PERMISSIONS.APPOINTMENTS.DELETE.key, // Kendi randevusunu silebilir

        // Tıbbi Kayıtlar - Sadece kendi kayıtları
        PERMISSIONS.MEDICAL_RECORDS.VIEW.key,

        // Reçeteler - Sadece kendi reçeteleri
        PERMISSIONS.PRESCRIPTIONS.VIEW.key,

        // Doktorlar - Sadece görüntüleme
        PERMISSIONS.DOCTORS.VIEW.key,
    ],
};
