import prisma from '../core/prisma';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedDatabase() {
  console.log('🌱 Database seeding başlatılıyor...\n');

  try {
    // JSON dosyalarını oku
    const usersData = JSON.parse(
      readFileSync(join(__dirname, 'users', 'users.json'), 'utf-8')
    );
    const appointmentsData = JSON.parse(
      readFileSync(join(__dirname, 'appointments', 'appointments.json'), 'utf-8')
    );

    // Mevcut verileri temizle (opsiyonel - dikkatli kullan!)
    console.log('🗑️  Mevcut veriler temizleniyor...');
    await prisma.appointment.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.doctor.deleteMany({});
    console.log('✅ Mevcut veriler temizlendi\n');

    // Hastaları ekle
    console.log('👥 Hastalar ekleniyor...');
    for (const patient of usersData.patients) {
      await prisma.patient.create({
        data: {
          ...patient,
          dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth) : null,
        },
      });
    }
    console.log(`✅ ${usersData.patients.length} hasta eklendi\n`);

    // Doktorları ekle
    console.log('👨‍⚕️ Doktorlar ekleniyor...');
    for (const doctor of usersData.doctors) {
      await prisma.doctor.create({
        data: doctor,
      });
    }
    console.log(`✅ ${usersData.doctors.length} doktor eklendi\n`);

    // Randevuları ekle
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
    
    // Özet bilgi
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const appointmentCount = await prisma.appointment.count();

    console.log('📊 Database Özeti:');
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

// Script çalıştır
seedDatabase();

