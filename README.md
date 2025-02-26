# İşletme Bulma Uygulaması

Bu proje, kullanıcıların konumlarına yakın işletmeleri bulabilecekleri, değerlendirebilecekleri ve işletme sahiplerinin işletmelerini yönetebilecekleri bir web uygulamasıdır.

## 🚀 Özellikler

- 📍 Konum bazlı işletme arama
- 🏢 İşletme profil yönetimi
- ⭐ Değerlendirme ve yorumlar
- 📱 Responsive tasarım
- 🔐 Rol tabanlı yetkilendirme (USER, BUSINESS, ADMIN)
- 📸 İşletme fotoğrafları yönetimi
- 💬 İşletme-kullanıcı mesajlaşması

## 📦 Kurulum

### 1. Depoyu Klonlayın:
```bash
git clone https://github.com/aayseekaya/findy.git
cd proje-adi
```

### 2. Bağımlılıkları Yükleyin:
```bash
npm install
```

### 3. Çevre Değişkenlerini Ayarlayın:
```bash
cp .env.example .env
```

### 4. Veritabanını Oluşturun:
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Uygulamayı Başlatın:
```bash
npm run dev
```

## 📝 API Dokümantasyonu

API dokümantasyonuna aşağıdaki adresten erişebilirsiniz:

[http://localhost:3000/docs](http://localhost:3000/docs)

## 🗄️ Veritabanı Şeması

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  password String
  name     String?
  role     Role     @default(USER)
  business Business?
  reviews  Review[]
  messages Message[]
}

model Business {
  id          String         @id @default(cuid())
  name        String
  description String?
  address     String
  latitude    Float
  longitude   Float
  categoryId  String
  userId      String   @unique
  maxDistance Float    @default(20)
  category    Category @relation(fields: [categoryId], references: [id])
  reviews     Review[]
  images      BusinessImage[]
  messages    Message[]
}
```

## 📁 Proje Yapısı

```
├── app/
│   ├── api/        # API routes
│   ├── auth/       # Kimlik doğrulama sayfaları
│   ├── business/   # İşletme dashboard
│   ├── admin/      # Admin paneli
│   └── components/ # Paylaşılan componentler
├── prisma/
│   ├── schema.prisma  # Veritabanı şeması
│   └── seed.ts        # Seed verileri
├── public/            # Statik dosyalar
└── types/             # TypeScript tipleri
```

## 🔐 Roller ve İzinler

- **USER:** İşletmeleri arayabilir, değerlendirebilir ve mesaj gönderebilir.
- **BUSINESS:** İşletme profilini yönetebilir ve mesajlara cevap verebilir.
- **ADMIN:** Tüm işletmeleri ve kullanıcıları yönetebilir.

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin.
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing`).
3. Değişikliklerinizi commit edin (`git commit -m 'Harika özellik eklendi'`).
4. Branch'inizi push edin (`git push origin feature/amazing`).
5. Bir Pull Request oluşturun.

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

- **Geliştirici Adı** - [@aayseekaya](https://github.com/aayseekaya)

## 📞 İletişim

Sorularınız için: [aaysee5446@gmail.com](mailto:aaysee5446@gmail.com)

