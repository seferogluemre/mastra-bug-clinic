import prisma from '../core/prisma';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ROLE_PERMISSIONS } from '../modules/auth/constants/permissions';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedDatabase() {
  console.log('🌱 Database seeding başlatılıyor...\n');

  try {
    const usersData = JSON.parse(
      readFileSync(join(__dirname, 'users', 'users.json'), 'utf-8')
    );
    const appointmentsData = JSON.parse(
      readFileSync(join(__dirname, 'appointments', 'appointments.json'), 'utf-8')
    );

    console.log('🗑️  Mevcut veriler temizleniyor...');
    // Önce ilişkili tabloları temizle
    await prisma.userRole.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Mevcut veriler temizlendi\n');

    // 1. Rolleri oluştur
    console.log('🛡️  Roller oluşturuluyor...');
    const roles = {
      admin: await prisma.role.create({
        data: {
          name: 'Admin',
          slug: 'admin',
          description: 'Sistem Yöneticisi',
          permissions: ROLE_PERMISSIONS.admin,
        },
      }),
      doctor: await prisma.role.create({
        data: {
          name: 'Doktor',
          slug: 'doctor',
          description: 'Doktor',
          permissions: ROLE_PERMISSIONS.doctor,
        },
      }),
      patient: await prisma.role.create({
        data: {
          name: 'Hasta',
          slug: 'patient',
          description: 'Hasta',
          permissions: ROLE_PERMISSIONS.patient,
        },
      }),
    };
    console.log('✅ Roller oluşturuldu\n');

    console.log('👤 Admin kullanıcısı oluşturuluyor...');
    const adminPassword = await bcrypt.hash('password123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@mastra.ai',
        hashedPassword: adminPassword,
        firstName: 'System',
        lastName: 'Admin',
        rolesSlugs: ['admin'],
        userRoles: {
          create: {
            roleId: roles.admin.id,
          },
        },
      },
    });
    console.log('✅ Admin kullanıcısı oluşturuldu: admin@mastra.ai / password123\n');

    console.log('👥 Hastalar ekleniyor...');
    for (const patient of usersData.patients) {
      // Hasta için user oluştur
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: patient.email,
          hashedPassword,
          firstName: patient.name.split(' ')[0],
          lastName: patient.name.split(' ').slice(1).join(' '),
          rolesSlugs: ['patient'],
          userRoles: {
            create: {
              roleId: roles.patient.id,
            },
          },
        },
      });

      await prisma.patient.create({
        data: {
          ...patient,
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
        },
      });
    }
    console.log(`✅ ${usersData.patients.length} hasta eklendi\n`);

    console.log('👨‍⚕️ Doktorlar ekleniyor...');
    for (const doctor of usersData.doctors) {
      // Doktor için user oluştur
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: doctor.email,
          hashedPassword,
          firstName: doctor.name.split(' ')[0],
          lastName: doctor.name.split(' ').slice(1).join(' '),
          rolesSlugs: ['doctor'],
          userRoles: {
            create: {
              roleId: roles.doctor.id,
            },
          },
        },
      });

      await prisma.doctor.create({
        data: doctor,
      });
    }
    console.log(`✅ ${usersData.doctors.length} doktor eklendi\n`);

    console.log('📅 Randevular ekleniyor...');
    for (const appointment of appointmentsData.appointments) {
      await prisma.appointment.create({
        data: {
          ...appointment,
          date: new Date(appointment.date),
        },
      });
    }
    console.log(`✅ ${appointmentsData.appointments.length} randevu eklendi\n`);

    console.log('🎉 Database seeding başarıyla tamamlandı!\n');

    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();
    const roleCount = await prisma.role.count();
    const userCount = await prisma.user.count();

    console.log('📊 Database Özeti:');
    console.log(`   - Roller: ${roleCount}`);
    console.log(`   - Kullanıcılar: ${userCount}`);
    console.log(`   - Hastalar: ${patientCount}`);
    console.log(`   - Doktorlar: ${doctorCount}`);
    console.log(`   - Randevular: ${appointmentCount}`);

  } catch (error) {
    console.error('❌ Seeding sırasında hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();