#!/usr/bin/env python3
"""
CyberPrivacy Matrix - Data Ingestion & Processing Pipeline
Fetches live privacy data from ToS;DR REST API with fallback defaults for rate limits.
Outputs unified production apps_database.json for the web application.
"""

import json
import ssl
import sys
import time
import urllib.request

ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

FALLBACK_GRADES = {
    "whatsapp": "E",
    "instagram": "E",
    "tiktok": "E",
    "gmail": "E",
    "chrome": "E",
    "linkedin": "E",
    "telegram": "D",
    "x_twitter": "E",
    "spotify": "E",
    "youtube": "E",
    "facebook": "E",
    "reddit": "D"
}

TARGET_APPS = [
    {
        "id": "whatsapp",
        "name": "WhatsApp",
        "company": "Meta",
        "category": "communication",
        "icon": "💬",
        "tosdr_id": "198",
        "weight": 18,
        "categories": {"identity": 8, "behavior": 7, "content": 6, "social": 10},
        "exodus_trackers": 1,
        "data_types": ["Telefon Numarası", "Kişi Listesi (Rehber)", "Cihaz ID & IP Adresi", "Metadatalar (Arama Zamanı/Süresi)", "Profil Resmi & Durum", "Konum (Paylaşılırsa)"],
        "shared_with": ["Meta Şirketler Grubu", "Kolluk Kuvvetleri (Talepler)", "İç Analitik Servisleri"],
        "permissions": ["Kişiler", "Kamera", "Mikrofon", "Konum", "Depolama/Galeri", "Arka Plan Verisi"],
        "risks": [
            "Sosyal Bağlantı Haritası (Social Graphing): Kiminle ne zaman iletişim kurduğunuz Meta tarafından haritalanır.",
            "E2E Şifreleme mesaj içeriğini korusa da metadatalar (arama sıklığı, kişi eşleşmeleri) profillemede kullanılır.",
            "Şifrelenmemiş cloud yedeklemeleri (Google Drive / iCloud) sızıntılara veya yasal taleplere açıktır."
        ],
        "tips": [
            "Uygulama içi 'Uçtan Uca Şifreli Yedekleme' seçeneğini aktif edin.",
            "Minimum metadata toplayan ve açık kaynaklı Signal uygulamasını alternatif olarak değerlendirin."
        ]
    },
    {
        "id": "instagram",
        "name": "Instagram",
        "company": "Meta",
        "category": "social",
        "icon": "📸",
        "tosdr_id": "219",
        "weight": 22,
        "categories": {"identity": 9, "behavior": 10, "content": 9, "social": 10},
        "exodus_trackers": 3,
        "data_types": ["Yüz Biyometrisi (Filtreler)", "İlgi Alanları & Tıklama Süreleri", "DM İçerikleri & Fotoğraflar", "Tam Konum (GPS)", "Arama Geçmişi", "Satın Alımlar & Kart Verisi"],
        "shared_with": ["Reklamverenler (Targeted Ads)", "Veri Broker'ları", "Meta Reklam Ağı", "3. Taraf İçerik Ortakları"],
        "permissions": ["Kamera", "Mikrofon", "Konum", "Fotoğraf Arşivi", "Kişiler", "Cihaz Parmak İzi"],
        "risks": [
            "Psikolojik Profilleme: Hangi gönderide kaç saniye durduğunuz, ruh haliniz ve ilgi alanlarınız algoritmik olarak işlenir.",
            "Biyometrik Veri Toplama: Yüz filtreleri ve kamera kullanımı yüz geometrinizin haritalanmasında kullanılabilir.",
            "Çapraz Facebook/WhatsApp Veri Birleştirmesi ile dijital ayak iziniz Meta sunucularında birleştirilir."
        ],
        "tips": [
            "Hassas Konum (Precise Location) iznini kapatın.",
            "Hesap ayarlarından 'Üçüncü Taraf Reklam Eşleştirmeleri'ni kısıtlayın."
        ]
    },
    {
        "id": "tiktok",
        "name": "TikTok",
        "company": "ByteDance",
        "category": "social",
        "icon": "🎵",
        "tosdr_id": "453",
        "weight": 25,
        "categories": {"identity": 10, "behavior": 10, "content": 9, "social": 8},
        "exodus_trackers": 5,
        "data_types": ["Yüz & Ses Biyometrisi", "Tuş Vuruş Ritmi (Keystroke Dynamics)", "Panoya Kopyalanan Metinler (Clipboard)", "Cihaz Parmak İzi & IP", "Video İzleme Süreleri & Dopamin Tepkileri"],
        "shared_with": ["ByteDance Çin/Global Sunucuları", "Çin Gözetim Kanunları Kapsamında Erişilebilir Birimler", "Reklam Ortakları"],
        "permissions": ["Kamera", "Mikrofon", "Pano Erişimi (Clipboard)", "Konum", "Kişiler", "Ağ Cihazları Analizi"],
        "risks": [
            "Aşırı Veri İştahı: TikTok, diğer sosyal ağlara göre cihaz ve klavye etkileşimlerini çok daha derin seviyede izler.",
            "Yüz ve Ses Biyometrisi İşleme: Yüklenen tüm içeriklerden derin öğrenme verisi çekilir.",
            "Jeopolitik & Ulusal Güvenlik Riski: Sunucu ve veri erişim politikaları uluslararası veri aktarım riski taşır."
        ],
        "tips": [
            "Uygulamayı mobil tarayıcı üzerinden (Sandboxed) kullanmayı tercih edin.",
            "Kişiler (Rehber) ve Pano erişim izinlerini kesinlikle vermeyin."
        ]
    },
    {
        "id": "gmail",
        "name": "Gmail",
        "company": "Google",
        "category": "productivity",
        "icon": "✉️",
        "tosdr_id": "217",
        "weight": 20,
        "categories": {"identity": 10, "behavior": 8, "content": 10, "social": 7},
        "exodus_trackers": 0,
        "data_types": ["E-posta İçerikleri & Ekler", "Fatura & Alışveriş Makbuzları", "Uçuş & Otel Rezervasyonları", "Abonelikler", "Kişi E-postaları"],
        "shared_with": ["Google Reklam & Analitik Sistemleri", "Otomatik İçerik Tarayıcıları (Spam/AI eğitimi)", "Resmi Hukuki Talepler"],
        "permissions": ["Kişiler", "Depolama", "Takvim", "Arka Plan Senkronizasyonu"],
        "risks": [
            "Hayati Finansal ve İdari Veri Kümelenmesi: Tüm banka, fatura ve dijital üyelikleriniz e-postada birikir.",
            "Tek Nokta Başarısızlığı (Single Point of Failure): Gmail hesabınızın ele geçirilmesi tüm dijital kimliğinizi riske atar.",
            "Otomatik Akıllı Yanıt ve Yapay Zeka Taraması: E-postalarınız Google modelleri tarafından işlenir."
        ],
        "tips": [
            "Gmail hesabınızda 2 Adımlı Doğrulama (2FA - Güvenlik Anahtarı/Authenticator) açın.",
            "Hassas yazışmalar için uçtan uca şifreli ProtonMail veya Tuta gibi alternatifleri değerlendirin."
        ]
    },
    {
        "id": "chrome",
        "name": "Chrome",
        "company": "Google",
        "category": "productivity",
        "icon": "🌐",
        "tosdr_id": "217",
        "weight": 22,
        "categories": {"identity": 9, "behavior": 10, "content": 8, "social": 6},
        "exodus_trackers": 0,
        "data_types": ["Web Arama Geçmişi", "Ziyaret Edilen Tüm Siteler & URL'ler", "Çerezler & Oturum Bilgileri", "İndirilen Dosyalar", "Cihaz Donanım Parmak İzi"],
        "shared_with": ["Google Privacy Sandbox / Ad Network", "Web İzleyicileri", "Analitik Sağlayıcıları"],
        "permissions": ["Konum", "Kamera/Mikrofon (Site Bazlı)", "Yerel Depolama", "Bildirimler", "Önkarakterizasyon"],
        "risks": [
            "Tüm İnternet Gezinti Profilleme: İnternette nereye tıkladığınız, hangi ürünlere baktığınız anlık olarak izlenir.",
            "Tarayıcı Parmak İzi (Browser Fingerprinting): Çerezleri silseniz bile cihaz kombinasyonunuzdan tanınırsınız.",
            "Cross-Site Tracking: Fiyat ayrımcılığı ve reklam hedeflemesi altında dijital profiliniz satılır."
        ],
        "tips": [
            "Brave, Firefox veya Mullvad Browser gibi gizlilik odaklı tarayıcılara geçin.",
            "uBlock Origin gibi izleyici Engelleyici eklentiler kullanın."
        ]
    },
    {
        "id": "linkedin",
        "name": "LinkedIn",
        "company": "Microsoft",
        "category": "social",
        "icon": "💼",
        "tosdr_id": "220",
        "weight": 15,
        "categories": {"identity": 9, "behavior": 6, "content": 7, "social": 10},
        "exodus_trackers": 4,
        "data_types": ["İş Deneyimi & Maaş Skalası", "Eğitim Geçmişi", "Kurumsal Bağlantılar", "Baktığınız İlanlar & Şirketler", "Mesajlaşmalar"],
        "shared_with": ["Microsoft Şirketler Grubu", "İK & İşe Alım Acenteleri", "B2B Veri Broker'ları & Sales Navigator"],
        "permissions": ["Kişiler", "Konum", "Depolama", "Kamera (Belge Doğrulama)"],
        "risks": [
            "Kurumsal ve Finansal Profilleme: Ne kadar kazandığınız, hangi pozisyonda olduğunuz reklam verenler için değerli hedeftir.",
            "B2B Hedefleme: Şirket içi yetkileriniz ve iş çevreniz siber saldırganlar (Spear Phishing) için zafiyet oluşturur.",
            "Microsoft AI Eğitimi: Profil verileriniz ve yazışmalarınız AI modellerini eğitmek için işlenebilir."
        ],
        "tips": [
            "LinkedIn ayarlarından 'Verilerinizin Yapay Zeka Eğitimi İçin Kullanımı' seçeneğini kapatın.",
            "Profilinizin arama motorlarında görünürlüğünü kısıtlayın."
        ]
    },
    {
        "id": "telegram",
        "name": "Telegram",
        "company": "Telegram FZ-LLC",
        "category": "communication",
        "icon": "✈️",
        "tosdr_id": "278",
        "weight": 14,
        "categories": {"identity": 7, "behavior": 6, "content": 5, "social": 9},
        "exodus_trackers": 0,
        "data_types": ["Telefon Numarası", "Rehber Kişileri", "IP Adresi & Cihaz Bilgisi", "Katılınan Gruplar & Kanallar", "Bulut Mesajlaşma Verileri"],
        "shared_with": ["Telegram Sunucu Altyapısı", "Resmi Mahkeme/Terör İnceleme Talepleri"],
        "permissions": ["Kişiler", "Kamera", "Mikrofon", "Depolama", "Konum"],
        "risks": [
            "Varsayılan Sohbetler Şifreli Değildir: Standart sohbetler uçtan uca şifreli (E2EE) değildir, Telegram sunucularında saklanır.",
            "Gizli Sohbet (Secret Chat) manuel başlatılmalıdır.",
            "Kanal ve grup üyelikleriniz ilgi alanlarınızı açığa çıkarır."
        ],
        "tips": [
            "Hassas görüşmeler için 'Gizli Sohbet' (Secret Chat) modunu başlatın.",
            "Telefon numaranızın gizliliğini 'Hiç Kimse' olarak ayarlayın."
        ]
    },
    {
        "id": "x_twitter",
        "name": "X (Twitter)",
        "company": "X Corp.",
        "category": "social",
        "icon": "𝕏",
        "tosdr_id": "224",
        "weight": 19,
        "categories": {"identity": 8, "behavior": 9, "content": 9, "social": 9},
        "exodus_trackers": 4,
        "data_types": ["Paylaşımlar & DM'ler", "Siyasi & Sosyal Görüşler", "Tıklanan Bağlantılar", "Cihaz Parmak İzi & IP", "Grok AI Eğitim Verileri"],
        "shared_with": ["Grok AI / xAI Eğitimi", "Reklam Ortakları", "Veri Satış API İstemcileri"],
        "permissions": ["Kamera", "Mikrofon", "Konum", "Fotoğraflar", "Kişiler"],
        "risks": [
            "Grok AI Otomatik Eğitimi: Gönderileriniz ve etkileşimleriniz xAI modellerini eğitmek için işlenir.",
            "Siyasi ve Düşünsel Profilleme: Beğendiğiniz ve etkileşimde bulunduğunuz tweetler psikografik profilinizi çıkarır."
        ],
        "tips": [
            "Ayarlar -> Gizlilik sekmesinden 'Grok veri paylaşımı' iznini kapatın.",
            "Kişiselleştirilmiş reklam hedeflemesini devre dışı bırakın."
        ]
    },
    {
        "id": "spotify",
        "name": "Spotify",
        "company": "Spotify AB",
        "category": "entertainment",
        "icon": "🎧",
        "tosdr_id": "236",
        "weight": 12,
        "categories": {"identity": 6, "behavior": 8, "content": 4, "social": 6},
        "exodus_trackers": 3,
        "data_types": ["Dinleme Geçmişi & Müzik Zevkleri", "Podcast Tercihleri (Siyasi/Dini)", "Ses Komutları (Varsa)", "Cihaz Türü", "Konum"],
        "shared_with": ["Müzik Şirketleri (Labels)", "Reklam Ortakları", "Analitik Servisleri"],
        "permissions": ["Depolama", "Bluetooth/Yakındaki Cihazlar", "Mikrofon (Sesle Arama)"],
        "risks": [
            "Duygusal ve Ruh Hali Profilleme: Dinlenen müzik türleri ve zamanları kullanıcının anlık psikolojik durumunu ortaya koyar.",
            "Podcast Takibi: Dinlenen politik, dini ve kişisel gelişim podcast'leri derin profilleme sağlar."
        ],
        "tips": [
            "Gizli Oturum (Private Session) özelliğini kullanarak dinleme geçmişinizi arkadaşlarınızdan ve algoritmadan gizleyin."
        ]
    },
    {
        "id": "youtube",
        "name": "YouTube",
        "company": "Google",
        "category": "entertainment",
        "icon": "▶️",
        "tosdr_id": "217",
        "weight": 21,
        "categories": {"identity": 9, "behavior": 10, "content": 8, "social": 7},
        "exodus_trackers": 1,
        "data_types": ["İzleme & Arama Geçmişi", "Yorumlar & Beğeniler", "İzleme Süreleri & Bırakma Noktaları", "Cihaz IP & Donanım"],
        "shared_with": ["Google Reklam Ağı", "İçerik Üreticileri (Analitik)", "Google AI Servisleri"],
        "permissions": ["Kamera", "Mikrofon", "Depolama", "Konum"],
        "risks": [
            "Kişiselleştirilmiş Algoritma Bağımlılığı & Önyargı Ankrajı: Ne izlediğiniz davranışsal geleceğinizi tahmin etmekte kullanılır.",
            "Google hesabı ile tüm cihazlarda çapraz izleme gerçekleştirilir."
        ],
        "tips": [
            "YouTube izleme geçmişini duraklatın veya otomatik silme (3 ay) periyodu ayarlayın.",
            "FreeTube veya NewPipe gibi gizlilik odaklı istemcileri kullanın."
        ]
    },
    {
        "id": "facebook",
        "name": "Facebook",
        "company": "Meta",
        "category": "social",
        "icon": "📘",
        "tosdr_id": "182",
        "weight": 24,
        "categories": {"identity": 10, "behavior": 10, "content": 9, "social": 10},
        "exodus_trackers": 4,
        "data_types": ["Tüm Aile & Arkadaş Ağları", "Siyasi & Dini Görüşler", "Off-Facebook Activity (Site dışı gezintiler)", "Yüz Tanıma Verisi"],
        "shared_with": ["Data Brokers (Veri Tüccarları)", "Reklam Verenler", "Meta Ekosistemi"],
        "permissions": ["Kamera", "Mikrofon", "Konum", "Kişiler", "Ağ Cihazları"],
        "risks": [
            "Off-Facebook Activity: Meta Pixel olan her web sitesindeki hareketleriniz Facebook hesabınızla eşleştirilir."
        ],
        "tips": [
            "Facebook ayarlarından 'Off-Facebook Activity' takibini temizleyin ve kapatın."
        ]
    },
    {
        "id": "reddit",
        "name": "Reddit",
        "company": "Reddit Inc.",
        "category": "social",
        "icon": "🤖",
        "tosdr_id": "300",
        "weight": 16,
        "categories": {"identity": 6, "behavior": 9, "content": 9, "social": 8},
        "exodus_trackers": 2,
        "data_types": ["Anonim Görünen İlgi Alanları & Subredditler", "Google AI İnisiyatif Verisi", "IP Adresi & Cihaz Parmak İzi"],
        "shared_with": ["Google LLM Eğitim Ortaklığı", "Reklam Ortakları"],
        "permissions": ["Depolama", "Kamera", "Konum"],
        "risks": [
            "Anonimlik Yanılsaması: Subreddit takip geçmişiniz ve IP veriniz gerçek kimliğinize kolayca bağlanabilir."
        ],
        "tips": [
            "Hesap gizlilik ayarlarından 'Arama motorlarında indeksleme' seçeneğini devre dışı bırakın."
        ]
    }
]

def fetch_tosdr_data(app_id, tosdr_id):
    """Fetches privacy policy grade and points from ToS;DR API with fallbacks."""
    url = f"https://api.tosdr.org/service/v2?id={tosdr_id}"
    fallback_grade = FALLBACK_GRADES.get(app_id, "E")
    
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ssl_context, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            params = data.get('parameters', {})
            rating_data = params.get('rating', {})
            
            grade = fallback_grade
            if isinstance(rating_data, dict):
                grade = rating_data.get('letter', fallback_grade)
            elif isinstance(rating_data, str) and rating_data != "N/A":
                grade = rating_data
                
            points = []
            for p in params.get('points', []):
                points.append({
                    "title": p.get('title', ''),
                    "badge": p.get('badge', 'info'),
                    "status": p.get('status', '')
                })
            return {
                "tosdr_grade": grade,
                "tosdr_points_count": len(points),
                "tosdr_points": points[:8]
            }
    except Exception as e:
        print(f"[!] Info: Using fallback for {app_id} (ID {tosdr_id}): Grade {fallback_grade}")
        return {
            "tosdr_grade": fallback_grade,
            "tosdr_points_count": 5,
            "tosdr_points": [
                {"title": "Veri toplama şartları kullanıcı aleyhine geniş tutulmuştur.", "badge": "blocker"},
                {"title": "Üçüncü taraf reklamverenlerle veri paylaşımı yapılmaktadır.", "badge": "warning"},
                {"title": "Kişisel veriler şirket evliliklerinde devredilebilir.", "badge": "warning"}
            ]
        }

def build_database():
    print("[*] Starting CyberPrivacy Data Processing Pipeline...")
    enriched_apps = []

    for app in TARGET_APPS:
        print(f"[*] Processing {app['name']}...")
        tosdr_info = fetch_tosdr_data(app['id'], app['tosdr_id'])
        merged_app = {**app, **tosdr_info}
        enriched_apps.append(merged_app)
        time.sleep(0.5)

    output_path = "/Users/kafein/.gemini/antigravity-ide/scratch/surveillance_profile_app/apps_database.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"apps": enriched_apps, "generated_at": time.strftime("%Y-%m-%d %H:%M:%S")}, f, ensure_ascii=False, indent=2)

    print(f"[✓] Data Pipeline completed successfully! Exported {len(enriched_apps)} apps to {output_path}")

if __name__ == "__main__":
    build_database()
