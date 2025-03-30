# Katkıda Bulunma Rehberi

Anket Pro projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, projeye katkıda bulunmak isteyenler için yönergeler sunmaktadır.

## Geliştirme Ortamının Kurulumu

1. Repoyu forklayın ve klonlayın:
   ```bash
   git clone https://github.com/username/anket-pro.git
   cd anket-pro
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run serve
   ```

## Kodlama Standartları

- ESLint kurallarına uyunuz
- Kodunuzu açıklayan yorumlar ekleyin
- Commit mesajları için [Conventional Commits](https://www.conventionalcommits.org/) kurallarını takip edin

## Commit Mesajları

Commit mesajlarınızı aşağıdaki formatta yazınız:

```
<type>(scope): <description>

[optional body]

[optional footer]
```

Tip (type) şunlardan biri olabilir:
- feat: Yeni bir özellik
- fix: Hata düzeltmesi
- docs: Sadece dokümantasyon değişiklikleri
- style: Kodun anlamını değiştirmeyen değişiklikler (boşluk, biçimlendirme, nokta virgül eksikliği vb.)
- refactor: Hata düzeltmeyen ve yeni özellik eklemeyen kod değişikliği
- perf: Performansı artıran değişiklikler
- test: Test eklemek veya var olan testleri düzeltmek
- chore: Yapı süreçlerini veya yardımcı araçları değiştiren değişiklikler

## Pull Request Süreci

1. Yeni bir branch oluşturun:
   ```bash
   git checkout -b feature/my-feature
   ```

2. Değişikliklerinizi commit edin:
   ```bash
   git commit -m "feat: Harika bir özellik ekle"
   ```

3. Branch'inizi push edin:
   ```bash
   git push origin feature/my-feature
   ```

4. GitHub üzerinden bir Pull Request açın

## Lisans

Katkıda bulunarak, katkılarınızın projenin [MIT Lisansı](LICENSE) altında yayınlanacağını kabul etmiş olursunuz. 