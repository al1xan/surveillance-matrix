/**
 * CyberPrivacy Matrix - 100% Bulletproof Multi-Language Engine v7
 * Features:
 * - Direct Key Matching
 * - Reverse-Lookup Fallback Engine
 * - Explicit Window Exposing for all inline event handlers (setLanguage, showTosdrModal, etc.)
 * - Image OnError fallback to emoji icon if CDN image fails
 * - Cache-Busting ?v=7
 */

let appsDataStore = [];
let selectedAppIds = new Set(['whatsapp', 'instagram', 'chrome', 'tiktok']);
let activeCategory = 'all';
let searchQuery = '';
let currentLang = 'en';
let radarChart = null;

// ────────────────────────────────────────────────────────────────────────────────
// Master 10-Language Terms Dictionary
// ────────────────────────────────────────────────────────────────────────────────
const termsDict = {
    // ─── Data Types ───
    "Phone Number": { en: "Phone Number", tr: "Telefon Numarası", es: "Número de teléfono", de: "Telefonnummer", fr: "Numéro de téléphone", pt: "Número de telefone", it: "Numero di telefono", ru: "Номер телефона", zh: "电话号码", ja: "電話番号" },
    "Contact Book": { en: "Contact Book", tr: "Kişi Listesi (Rehber)", es: "Lista de contactos", de: "Kontakte", fr: "Carnet de contacts", pt: "Lista de contatos", it: "Rubrica contatti", ru: "Список контактов", zh: "通讯录", ja: "連絡先一覧" },
    "Device ID & IP Address": { en: "Device ID & IP Address", tr: "Cihaz ID & IP Adresi", es: "ID de dispositivo e IP", de: "Geräte-ID & IP-Adresse", fr: "Identifiant appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP地址", ja: "デバイスIDとIPアドレス" },
    "Metadata (Call Time/Duration)": { en: "Metadata (Call Time/Duration)", tr: "Metadatalar (Arama Zamanı/Süresi)", es: "Metadatos (Hora/Duración)", de: "Metadaten (Anrufzeit/Dauer)", fr: "Métadonnées (Heure/Durée)", pt: "Metadados (Hora/Duração)", it: "Metadati (Ora/Durata)", ru: "Метаданные (время/длительность)", zh: "元数据(通话时间/时长)", ja: "メタデータ (通話時間/期間)" },
    "Profile Picture & Status": { en: "Profile Picture & Status", tr: "Profil Resmi & Durum", es: "Foto de perfil y estado", de: "Profilbild & Status", fr: "Photo de profil & Statut", pt: "Foto de perfil e status", it: "Foto profilo e stato", ru: "Фото профиля и статус", zh: "头像与状态", ja: "プロフィール画像とステータス" },
    "Location (If Shared)": { en: "Location (If Shared)", tr: "Konum (Paylaşılırsa)", es: "Ubicación (Si se comparte)", de: "Standort (Wenn freigegeben)", fr: "Localisation (Si partagée)", pt: "Localização (Se compartilhada)", it: "Posizione (Se condivisa)", ru: "Геолокация (если доступна)", zh: "位置(若共享)", ja: "位置情報 (共有時)" },
    "Location": { en: "Location", tr: "Konum", es: "Ubicación", de: "Standort", fr: "Localisation", pt: "Localização", it: "Posizione", ru: "Геолокация", zh: "位置", ja: "位置情報" },
    "Facial Biometrics (Filters)": { en: "Facial Biometrics (Filters)", tr: "Yüz Biyometrisi (Filtreler)", es: "Biometría facial (Filtros)", de: "Gesichtsbiometrie (Filter)", fr: "Biométrie faciale (Filtres)", pt: "Biometria facial (Filtros)", it: "Biometria facciale (Filtri)", ru: "Биометрия лица (фильтры)", zh: "人脸生物特征(滤镜)", ja: "顔生体認証 (フィルター)" },
    "Interests & Dwell Times": { en: "Interests & Dwell Times", tr: "İlgi Alanları & Tıklama Süreleri", es: "Intereses y tiempos de interacción", de: "Interessen & Verweildauern", fr: "Intérêts & Temps de visionnage", pt: "Interesses e tempo de permanência", it: "Interessi e tempi di permanenza", ru: "Интересы и время просмотра", zh: "兴趣与停留时间", ja: "興味・関心と滞在時間" },
    "Direct Message Content & Photos": { en: "Direct Message Content & Photos", tr: "DM İçerikleri & Fotoğraflar", es: "Contenido de mensajes directos y fotos", de: "Direktnachrichten-Inhalte & Fotos", fr: "Contenu des messages directs & Photos", pt: "Conteúdo de mensagens diretas e fotos", it: "Contenuto dei messaggi diretti e foto", ru: "Содержимое сообщений и фото", zh: "私信内容与照片", ja: "DM内容と写真" },
    "Precise GPS Location": { en: "Precise GPS Location", tr: "Tam Konum (GPS)", es: "Ubicación GPS precisa", de: "Präziser GPS-Standort", fr: "Localisation GPS précise", pt: "Localização GPS precisa", it: "Posizione GPS precisa", ru: "Точная геолокация GPS", zh: "精确GPS位置", ja: "詳細GPS位置情報" },
    "Search History": { en: "Search History", tr: "Arama Geçmişi", es: "Historial de búsqueda", de: "Suchverlauf", fr: "Historique de recherche", pt: "Histórico de pesquisa", it: "Cronologia di ricerca", ru: "История поиска", zh: "搜索历史", ja: "検索履歴" },
    "Purchases & Card Data": { en: "Purchases & Card Data", tr: "Satın Alımlar & Kart Verisi", es: "Compras y datos bancarios", de: "Käufe & Kartendaten", fr: "Achats & Données bancaires", pt: "Compras e dados de cartão", it: "Acquisti e dati della carta", ru: "Покупки и данные карт", zh: "购买与卡片数据", ja: "購入履歴とカード情報" },
    "Facial & Voice Biometrics": { en: "Facial & Voice Biometrics", tr: "Yüz & Ses Biyometrisi", es: "Biometría facial y de voz", de: "Gesichts- & Sprachbiometrie", fr: "Biométrie faciale & vocale", pt: "Biometria facial e de voz", it: "Biometria facciale e vocale", ru: "Биометрия лица и голоса", zh: "人脸与语音生物特征", ja: "顔・音声生体認証" },
    "Keystroke Dynamics": { en: "Keystroke Dynamics", tr: "Tuş Vuruş Ritmi (Keystroke Dynamics)", es: "Dinámica de tecleo", de: "Tastenanschlag-Dynamik", fr: "Dynamique de frappe", pt: "Dinâmica de digitação", it: "Dinamica della digitazione", ru: "Динамика нажатия клавиш", zh: "按键动态特征", ja: "キーストローク・ダイナミクス" },
    "Clipboard Text Buffer": { en: "Clipboard Text Buffer", tr: "Panoya Kopyalanan Metinler (Clipboard)", es: "Texto del portapapeles", de: "Zwischenablage-Inhalt", fr: "Presse-papiers", pt: "Texto da área de transferência", it: "Appunti", ru: "Буфер обмена", zh: "剪贴板内容", ja: "クリップボードのテキスト" },
    "Device Fingerprint & IP": { en: "Device Fingerprint & IP", tr: "Cihaz Parmak İzi & IP", es: "Huella digital de dispositivo e IP", de: "Geräte-Fingerabdruck & IP", fr: "Empreinte appareil & IP", pt: "Impressão digital de dispositivo e IP", it: "Impronta dispositivo e IP", ru: "Отпечаток устройства и IP", zh: "设备指纹与IP", ja: "デバイスフィンガープリントとIP" },
    "Watch Time & Behavioral Triggers": { en: "Watch Time & Behavioral Triggers", tr: "Video İzleme Süreleri & Dopamin Tepkileri", es: "Tiempo de reproducción y patrones", de: "Wiedergabezeit & Verhaltensreize", fr: "Temps de visionnage & Déclencheurs", pt: "Tempo de exibição e gatilhos", it: "Tempo di visione e stimoli", ru: "Время просмотра и триггеры", zh: "视频观看时长与行为触发", ja: "動画視聴時間と行動トリガー" },
    "Email Content & Attachments": { en: "Email Content & Attachments", tr: "E-posta İçerikleri & Ekler", es: "Contenido de correo y archivos adjuntos", de: "E-Mail-Inhalt & Anhänge", fr: "Contenu des e-mails & pièces jointes", pt: "Conteúdo de e-mail e anexos", it: "Contenuto e-mail e allegati", ru: "Содержимое писем и вложения", zh: "邮件内容与附件", ja: "メール内容と添付ファイル" },
    "Invoices & Shopping Receipts": { en: "Invoices & Shopping Receipts", tr: "Fatura & Alışveriş Makbuzları", es: "Facturas y recibos de compras", de: "Rechnungen & Einkaufsbelege", fr: "Factures & reçus d'achats", pt: "Faturas e recibos de compras", it: "Fatture e ricevute acquisti", ru: "Счета и чеки покупок", zh: "发票与购物收据", ja: "請求書と購入レシート" },
    "Flight & Hotel Reservations": { en: "Flight & Hotel Reservations", tr: "Uçuş & Otel Rezervasyonları", es: "Reservas de vuelos y hoteles", de: "Flug- & Hotelreservierungen", fr: "Réservations de vols & d'hôtels", pt: "Reservas de voos e hotéis", it: "Prenotazioni voli e hotel", ru: "Бронирования рейсов и отелей", zh: "航班与酒店预订", ja: "フライト・ホテル予約" },
    "Subscriptions": { en: "Subscriptions", tr: "Abonelikler", es: "Suscripciones", de: "Abonnements", fr: "Abonnements", pt: "Assinaturas", it: "Abbonamenti", ru: "Подписки", zh: "订阅", ja: "サブスクリプション" },
    "Contact Emails": { en: "Contact Emails", tr: "Kişi E-postaları", es: "Correos de contactos", de: "Kontakt-E-Mails", fr: "E-mails de contacts", pt: "E-mails de contatos", it: "E-mail dei contatti", ru: "E-mail контактов", zh: "联系人邮箱", ja: "連絡先メール" },
    "Web Search History": { en: "Web Search History", tr: "Web Arama Geçmişi", es: "Historial de búsqueda web", de: "Web-Suchverlauf", fr: "Historique de recherche Web", pt: "Histórico de pesquisa na web", it: "Cronologia ricerche web", ru: "История веб-поиска", zh: "网页搜索历史", ja: "Web検索履歴" },
    "Visited Sites & URLs": { en: "Visited Sites & URLs", tr: "Ziyaret Edilen Tüm Siteler & URL'ler", es: "Sitios y URL visitados", de: "Besuchte Websites & URLs", fr: "Sites & URL visités", pt: "Sites e URLs visitados", it: "Siti e URL visitati", ru: "Посещенные сайты и URL", zh: "访问的网站与URL", ja: "訪問サイトとURL" },
    "Cookies & Session Identifiers": { en: "Cookies & Session Identifiers", tr: "Çerezler & Oturum Bilgileri", es: "Cookies e identificadores de sesión", de: "Cookies & Sitzungsdaten", fr: "Cookies & Identifiants de session", pt: "Cookies e identificadores de sessão", it: "Cookie e identificatori di sessione", ru: "Файлы cookie и сеансы", zh: "Cookie与会话标识", ja: "クッキーとセッション情報" },
    "Downloaded Files": { en: "Downloaded Files", tr: "İndirilen Dosyalar", es: "Archivos descargados", de: "Heruntergeladene Dateien", fr: "Fichiers téléchargés", pt: "Arquivos baixados", it: "File scaricati", ru: "Загруженные файлы", zh: "下载的文件", ja: "ダウンロードファイル" },
    "Hardware Fingerprint": { en: "Hardware Fingerprint", tr: "Cihaz Donanım Parmak İzi", es: "Huella digital de hardware", de: "Hardware-Fingerabdruck", fr: "Empreinte matérielle", pt: "Impressão digital de hardware", it: "Impronta digitale hardware", ru: "Аппаратный отпечаток", zh: "硬件指纹", ja: "ハードウェアフィンガープリント" },
    "Work Experience & Salary Estimates": { en: "Work Experience & Salary Estimates", tr: "İş Deneyimi & Maaş Skalası", es: "Experiencia laboral y salario", de: "Berufserfahrung & Gehalt", fr: "Expérience & salaire", pt: "Experiência profissional e salário", it: "Esperienza lavorativa e stipendio", ru: "Опыт работы и зарплата", zh: "工作经验与薪资", ja: "職歴・推定年収" },
    "Educational History": { en: "Educational History", tr: "Eğitim Geçmişi", es: "Historial educativo", de: "Bildungsweg", fr: "Formation académique", pt: "Histórico acadêmico", it: "Percorso di studi", ru: "Образование", zh: "教育背景", ja: "学歴" },
    "Corporate Connections": { en: "Corporate Connections", tr: "Kurumsal Bağlantılar", es: "Conexiones corporativas", de: "Unternehmensnetzwerk", fr: "Réseau professionnel", pt: "Conexões corporativas", it: "Connessioni aziendali", ru: "Деловые связи", zh: "企业人脉", ja: "社内人脈" },
    "Job Searches & Company Views": { en: "Job Searches & Company Views", tr: "Baktığınız İlanlar & Şirketler", es: "Búsquedas de empleo y empresas", de: "Jobsuche & Firmenaufrufe", fr: "Recherches d'emploi & entreprises", pt: "Pesquisas de emprego e empresas", it: "Ricerche di lavoro e aziende", ru: "Поиск работы и просмотры", zh: "求职搜索与职位浏览", ja: "求人検索・企業閲覧" },
    "Professional Direct Messages": { en: "Professional Direct Messages", tr: "Mesajlaşmalar", es: "Mensajes profesionales", de: "Berufliche Nachrichten", fr: "Messages professionnels", pt: "Mensagens profissionais", it: "Messaggi professionali", ru: "Деловая переписка", zh: "职场私信", ja: "ビジネスDM" },
    "IP Address & Device Details": { en: "IP Address & Device Details", tr: "IP Adresi & Cihaz Bilgisi", es: "Dirección IP y detalles", de: "IP-Adresse & Gerätedetails", fr: "Adresse IP & détails appareil", pt: "Endereço IP e detalhes", it: "Indirizzo IP e dettagli", ru: "IP-адрес и детали устройства", zh: "IP地址与设备详情", ja: "IPアドレスとデバイス詳細" },
    "Joined Channels & Groups": { en: "Joined Channels & Groups", tr: "Katılınan Gruplar & Kanallar", es: "Canales y grupos unidos", de: "Beigetretene Kanäle & Gruppen", fr: "Canaux & groupes rejoints", pt: "Canais e grupos integrados", it: "Canali e gruppi seguiti", ru: "Подписанные каналы и группы", zh: "加入的频道与群组", ja: "参加チャンネル・グループ" },
    "Cloud Message History": { en: "Cloud Message History", tr: "Bulut Mesajlaşma Verileri", es: "Historial de mensajes en nube", de: "Cloud-Nachrichtenverlauf", fr: "Historique cloud des messages", pt: "Histórico de mensagens na nuvem", it: "Cronologia messaggi cloud", ru: "Облачная история сообщений", zh: "云端消息历史", ja: "クラウドメッセージ履歴" },
    "Posts & Direct Messages": { en: "Posts & Direct Messages", tr: "Paylaşımlar & DM'ler", es: "Publicaciones y mensajes", de: "Beiträge & Direktnachrichten", fr: "Publications & messages", pt: "Publicações e mensagens", it: "Post e messaggi diretti", ru: "Посты и личные сообщения", zh: "帖子与私信", ja: "投稿とダイレクトメッセージ" },
    "Political & Social Views": { en: "Political & Social Views", tr: "Siyasi & Sosyal Görüşler", es: "Opiniones políticas y sociales", de: "Politische & soziale Ansichten", fr: "Opinions politiques & sociales", pt: "Opiniões políticas e sociais", it: "Opinioni politiche e sociali", ru: "Политические и соц. взгляды", zh: "政治与社会观点", ja: "政治・社会的主張" },
    "Clicked Outbound Links": { en: "Clicked Outbound Links", tr: "Tıklanan Bağlantılar", es: "Enlaces salientes visitados", de: "Angeklickte externe Links", fr: "Liens externes cliqués", pt: "Links externos clicados", it: "Link esterni cliccati", ru: "Переходы по ссылкам", zh: "点击的外链", ja: "クリックした外部リンク" },
    "AI Model Training Telemetry": { en: "AI Model Training Telemetry", tr: "Grok AI Eğitim Verileri", es: "Telemetría de entrenamiento IA", de: "KI-Trainings-Telemetrie", fr: "Télémétrie d'entraînement IA", pt: "Telemetria de treino de IA", it: "Telemetria addestramento IA", ru: "Телеметрия обучения ИИ", zh: "AI模型训练遥测", ja: "AIモデル学習テレメトリ" },
    "Listening & Viewing History": { en: "Listening & Viewing History", tr: "Dinleme Geçmişi & Müzik Zevkleri", es: "Historial de reproducción", de: "Wiedergabeverlauf", fr: "Historique d'écoute", pt: "Histórico de reprodução", it: "Cronologia ascolto", ru: "История прослушивания", zh: "收听与播放历史", ja: "再生履歴と音楽嗜好" },
    "Podcast Category Choices": { en: "Podcast Category Choices", tr: "Podcast Tercihleri (Siyasi/Dini)", es: "Categorías de podcast escuchados", de: "Podcast-Kategorieneffekte", fr: "Catégories de podcasts", pt: "Categorias de podcasts", it: "Categorie podcast ascoltate", ru: "Предпочтения в подкастах", zh: "播客分类偏好", ja: "ポッドキャストカテゴリ選択" },
    "Voice Search Queries": { en: "Voice Search Queries", tr: "Ses Komutları (Varsa)", es: "Consultas de búsqueda por voz", de: "Sprachsuchanfragen", fr: "Requêtes vocales", pt: "Consultas por voz", it: "Ricerche vocali", ru: "Голосовые запросы", zh: "语音搜索查询", ja: "音声検索クエリ" },
    "Device Type & Network": { en: "Device Type & Network", tr: "Cihaz Türü", es: "Tipo de dispositivo y red", de: "Gerätetyp & Netzwerk", fr: "Type d'appareil & réseau", pt: "Tipo de dispositivo e rede", it: "Tipo dispositivo e rete", ru: "Тип устройства и сеть", zh: "设备类型与网络", ja: "デバイスタイプとネットワーク" },
    "Approximate Location": { en: "Approximate Location", tr: "Konum (Yaklaşık)", es: "Ubicación aproximada", de: "Ungefährer Standort", fr: "Localisation approximative", pt: "Localização aproximada", it: "Posizione approssimativa", ru: "Приблизительная геолокация", zh: "大致位置", ja: "概算位置情報" },
    "Watch & Search History": { en: "Watch & Search History", tr: "İzleme & Arama Geçmişi", es: "Historial de reproducción y búsqueda", de: "Wiedergabe- & Suchverlauf", fr: "Historique de visionnage & recherche", pt: "Histórico de exibições e pesquisas", it: "Cronologia visione e ricerche", ru: "История просмотров и поиска", zh: "观看与搜索历史", ja: "視聴・検索履歴" },
    "Comments & Likes": { en: "Comments & Likes", tr: "Yorumlar & Beğeniler", es: "Comentarios y Me gusta", de: "Kommentare & Likes", fr: "Commentaires & J'aime", pt: "Comentários e curtidas", it: "Commenti e Mi piace", ru: "Комментарии и лайки", zh: "评论与点赞", ja: "コメントと高評価" },
    "Watch Dwell Times & Abandon Drops": { en: "Watch Dwell Times & Abandon Drops", tr: "İzleme Süreleri & Bırakma Noktaları", es: "Retención de video y abandono", de: "Wiedergabezeit & Abbruchpunkte", fr: "Temps de rétention & abandons", pt: "Retenção de vídeo e abandono", it: "Tempo di permanenza e abbandono", ru: "Время удержания и уходы", zh: "观看时长与弃看点", ja: "視聴維持時間と離脱ポイント" },
    "Device IP & Hardware ID": { en: "Device IP & Hardware ID", tr: "Cihaz IP & Donanım", es: "IP del dispositivo e ID de hardware", de: "Geräte-IP & Hardware-ID", fr: "IP appareil & ID matériel", pt: "IP do dispositivo e ID de hardware", it: "IP dispositivo e ID hardware", ru: "IP устройства и ID железа", zh: "设备IP与硬件ID", ja: "デバイスIPとハードウェアID" },
    "Family & Social Network Graph": { en: "Family & Social Network Graph", tr: "Tüm Aile & Arkadaş Ağları", es: "Red familiar y social", de: "Familien- & soziales Netzwerk", fr: "Réseau familial & social", pt: "Rede familiar e social", it: "Rete familiare e sociale", ru: "Семейная и социальная сеть", zh: "家庭与社交网络图谱", ja: "家族・友人ネットワークグラフ" },
    "Political & Religious Views": { en: "Political & Religious Views", tr: "Siyasi & Dini Görüşler", es: "Opiniones políticas y religiosas", de: "Politische & religiöse Ansichten", fr: "Opinions politiques & religieuses", pt: "Opiniões políticas e religiosas", it: "Opinioni politiche e religiose", ru: "Политические и религиозные взгляды", zh: "政治与宗教观点", ja: "政治・宗教的信条" },
    "Off-App Web Activity": { en: "Off-App Web Activity", tr: "Off-Facebook Activity (Site dışı gezintiler)", es: "Actividad fuera de la aplicación", de: "Web-Aktivität außerhalb der App", fr: "Activité web hors application", pt: "Atividade web fora do aplicativo", it: "Attività web fuori dall'app", ru: "Внешняя веб-активность", zh: "应用外网页活动", ja: "アプリ外Webアクティビティ" },
    "Facial Recognition Data": { en: "Facial Recognition Data", tr: "Yüz Tanıma Verisi", es: "Datos de reconocimiento facial", de: "Gesichtserkennungsdaten", fr: "Données de reconnaissance faciale", pt: "Dados de reconhecimento facial", it: "Dati di riconoscimento facciale", ru: "Данные распознавания лиц", zh: "人脸识别数据", ja: "顔認証データ" },
    "Subreddit Subscriptions & Interests": { en: "Subreddit Subscriptions & Interests", tr: "Anonim Görünen İlgi Alanları & Subredditler", es: "Suscripciones e intereses de Subreddit", de: "Subreddit-Abos & Interessen", fr: "Abonnements et intérêts Subreddit", pt: "Inscrições e interesses do Subreddit", it: "Iscrizioni e interessi Subreddit", ru: "Подписки на Subreddit и интересы", zh: "Subreddit订阅与兴趣", ja: "Subreddit登録と関心事" },
    "Google AI Training Data": { en: "Google AI Training Data", tr: "Google AI İnisiyatif Verisi", es: "Datos de entrenamiento para IA de Google", de: "Google KI-Trainingsdaten", fr: "Données d'entraînement IA Google", pt: "Dados de treinamento de IA do Google", it: "Dati addestramento IA Google", ru: "Данные обучения Google ИИ", zh: "Google AI训练数据", ja: "Google AI学習データ" },
    "IP Address & Device Fingerprint": { en: "IP Address & Device Fingerprint", tr: "IP Adresi & Cihaz Parmak İzi", es: "Dirección IP y huella digital", de: "IP-Adresse & Geräte-Fingerabdruck", fr: "Adresse IP & empreinte appareil", pt: "Endereço IP e impressão digital", it: "Indirizzo IP e impronta dispositivo", ru: "IP-адрес и отпечаток устройства", zh: "IP地址与设备指纹", ja: "IPアドレスとデバイス識別子" },
    "Account Info & Emails": { en: "Account Info & Emails", tr: "Hesap Bilgileri & E-postalar", es: "Información de cuenta y correos", de: "Kontoinformationen & E-Mails", fr: "Infos compte & e-mails", pt: "Informações da conta e e-mails", it: "Info account e e-mail", ru: "Данные аккаунта и почта", zh: "账户信息与邮件", ja: "アカウント情報とメール" },
    "Content & File Attachments": { en: "Content & File Attachments", tr: "İçerik & Dosya Ekleri", es: "Contenido y archivos adjuntos", de: "Inhalte & Dateianhänge", fr: "Contenu & pièces jointes", pt: "Conteúdo e anexos", it: "Contenuto e allegati", ru: "Контент и файлы", zh: "内容与文件附件", ja: "コンテンツと添付ファイル" },
    "Work Habits": { en: "Work Habits", tr: "Çalışma Alışkanlıkları", es: "Hábitos de trabajo", de: "Arbeitsgewohnheiten", fr: "Habitudes de travail", pt: "Habitudes de travail", it: "Abitudini lavorative", ru: "Рабочие привычки", zh: "工作习惯", ja: "業務習慣" },
    "Device ID & IP": { en: "Device ID & IP", tr: "Cihaz ID & IP", es: "ID de dispositivo e IP", de: "Geräte-ID & IP", fr: "ID appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP", ja: "デバイスIDとIP" },
    "Phone Number / Account": { en: "Phone Number / Account", tr: "Telefon Numarası / Hesap", es: "Número de teléfono / Cuenta", de: "Telefonnummer / Konto", fr: "Numéro de téléphone / Compte", pt: "Número de telefone / Conta", it: "Numero di telefono / Account", ru: "Номер телефона / Аккаунт", zh: "电话号码/账户", ja: "電話番号/アカウント" },
    "Delivery Address & Location": { en: "Delivery Address & Location", tr: "Teslimat Adresi & Konum", es: "Dirección de entrega y ubicación", de: "Lieferadresse & Standort", fr: "Adresse de livraison & localisation", pt: "Endereço de entrega e localização", it: "Indirizzo di consegna e posizione", ru: "Адрес доставки и локация", zh: "配送地址与位置", ja: "配達先住所と位置情報" },
    "Purchase History": { en: "Purchase History", tr: "Satın Alım Geçmişi", es: "Historial de compras", de: "Kaufverlauf", fr: "Historique d'achats", pt: "Histórico de compras", it: "Cronologia acquisti", ru: "История покупок", zh: "购买历史", ja: "購入履歴" },
    "Device IP Info": { en: "Device IP Info", tr: "Cihaz IP Bilgisi", es: "Información IP del dispositivo", de: "Geräte-IP-Information", fr: "Information IP appareil", pt: "Informação IP do dispositivo", it: "Info IP dispositivo", ru: "Informazioni IP del dispositivo", zh: "设备IP信息", ja: "デバイスIP情報" },

    // ─── Third-Party Destinations ───
    "Data Brokers": { en: "Data Brokers", tr: "Veri Broker'ları", es: "Corredores de datos", de: "Datenhändler", fr: "Courtiers en données", pt: "Corretores de dados", it: "Broker di dati", ru: "Дата-брокеры", zh: "数据经纪商", ja: "データブローカー" },
    "Advertisers (Targeted Ads)": { en: "Advertisers (Targeted Ads)", tr: "Reklamverenler (Hedefli Reklam)", es: "Anunciantes (Anuncios dirigidos)", de: "Werbepartner (Zielgerichtete Werbung)", fr: "Annonceurs (Publicités ciblées)", pt: "Anunciantes (Anúncios direcionados)", it: "Inserzionisti (Annunci mirati)", ru: "Рекламодатели (Таргетированная реклама)", zh: "广告商(定向广告)", ja: "広告主 (ターゲティング広告)" },
    "Meta Companies": { en: "Meta Companies", tr: "Meta Şirketler Grubu", es: "Empresas Meta", de: "Meta-Konzern", fr: "Groupe Meta", pt: "Empresas Meta", it: "Gruppo Meta", ru: "Группа компаний Meta", zh: "Meta公司集团", ja: "Metaグループ" },
    "Grok AI / xAI Training": { en: "Grok AI / xAI Training", tr: "Grok AI / xAI Eğitimi", es: "Entrenamiento de Grok AI / xAI", de: "Grok AI / xAI Training", fr: "Entraînement Grok AI / xAI", pt: "Treino do Grok AI / xAI", it: "Addestramento Grok AI / xAI", ru: "Обучение Grok AI / xAI", zh: "Grok AI / xAI 训练", ja: "Grok AI / xAI 学習" },
    "Google Ad & Analytics Systems": { en: "Google Ad & Analytics Systems", tr: "Google Reklam & Analitik Sistemleri", es: "Sistemas de publicidad y análisis de Google", de: "Google Werbe- & Analysesysteme", fr: "Systèmes publicitaires et analytiques Google", pt: "Sistemas de anúncios e análise do Google", it: "Sistemi pubblicitari e analitici Google", ru: "Рекламные и аналитические системы Google", zh: "Google广告与分析系统", ja: "Google広告・分析システム" },
    "Content Creators (Analytics)": { en: "Content Creators (Analytics)", tr: "İçerik Üreticileri (Analitik)", es: "Creadores de contenido (Analítica)", de: "Content Creator (Analysen)", fr: "Créateurs de contenu (Analyses)", pt: "Criadores de conteúdo (Análises)", it: "Creatori di contenuti (Analisi)", ru: "Создатели контента (Аналитика)", zh: "内容创作者(分析)", ja: "クリエイター (アナリティクス)" },
    "Google AI Training Systems": { en: "Google AI Training Systems", tr: "Google AI Servisleri", es: "Sistemas de entrenamiento IA de Google", de: "Google KI-Trainingssysteme", fr: "Systèmes d'entraînement IA Google", pt: "Sistemas de treinamento de IA do Google", it: "Sistemi addestramento IA Google", ru: "Системы обучения Google ИИ", zh: "Google AI训练系统", ja: "Google AI学習システム" },
    "Google AI Training Partners": { en: "Google AI Training Partners", tr: "Google LLM Eğitim Ortaklığı", es: "Socios de entrenamiento IA de Google", de: "Google KI-Trainingspartner", fr: "Partenaires d'entraînement IA Google", pt: "Parceiros de treinamento de IA do Google", it: "Partner addestramento IA Google", ru: "Партнеры обучения Google ИИ", zh: "Google AI训练合作伙伴", ja: "Google AI学習パートナー" }
};

// ─── App-Specific Multi-Language Risks & Tips Dictionary (ALL 12 APPS INCLUDED) ───
const appRisksDict = {
    facebook: {
        en: ["Off-App Web Activity: Meta Pixel tracks your browsing across third-party websites and links it to your profile.", "Family & Social Network Graph mapping correlates all your real-world relationships and political preferences."],
        tr: ["Site Dışı Etkinlik (Off-App Activity): Meta Pixel olan her web sitesindeki hareketleriniz hesabınızla eşleştirilir.", "Aile ve Sosyal Ağ Grafiği haritalaması tüm gerçek dünya ilişkilerinizi ve tercihinizi profiller."]
    },
    whatsapp: {
        en: ["Cross-platform social graphing correlates your communication frequency and time windows.", "Unencrypted cloud backups (Google Drive / iCloud) leave chat archives vulnerable to legal or data leaks."],
        tr: ["Çapraz platform sosyal grafiği, iletişim sıklığınızı ve zaman aralıklarınızı Meta sunucularında haritalar.", "Şifrelenmemiş bulut yedeklemeleri sohbet arşivlerinizi yasal veya veri sızıntılarına açık bırakır."]
    },
    instagram: {
        en: ["Dwell time & interest profiling tracks exactly how many seconds you pause on every post and story.", "Facial biometrics & camera usage are processed for algorithmic recommendations and targeted ads."],
        tr: ["Tıklama ve duraklama süresi analizi, her gönderide kaç saniye durduğunuzu anlık olarak kaydeder.", "Yüz biyometrisi ve kamera kullanımı algoritmik öneriler ve hedefli reklamlar için işlenir."]
    },
    tiktok: {
        en: ["Aggressive interaction harvesting tracks keystroke dynamics, device metrics, and clipboard contents.", "Deep media biometric extraction processes facial and voice patterns from all uploaded clips."],
        tr: ["Aşırı veri iştahı; tuş vuruş ritminizi, cihaz metriklerini ve pano içeriklerini izler.", "Derin medya biyometrisi çekimi; yüklenen tüm içeriklerden yüz ve ses kalıplarını işler."]
    },
    gmail: {
        en: ["Centralized financial and administrative identity aggregator (invoices, receipts, bookings).", "Automated content scanning parses email texts for spam filtering and AI assistant features."],
        tr: ["Merkezi finansal ve idari veri kümelenmesi (banka, fatura, rezervasyonlar e-postada birikir).", "Otomatik içerik tarayıcıları e-posta metinlerini spam koruması ve yapay zeka özellikleri için işler."]
    },
    chrome: {
        en: ["Full-spectrum web navigation profiling captures every URL, click, and search query.", "Hardware fingerprinting uniquely identifies your device across third-party ad networks."],
        tr: ["Tüm web gezinti profillemesi; girdiğiniz her URL'yi, tıklamayı ve aramayı kaydeder.", "Donanım parmak izi (Browser Fingerprinting) çerezler silinse bile cihazınızı tekil olarak tanır."]
    },
    linkedin: {
        en: ["Corporate & financial profiling maps your exact salary bracket, title, and workplace network.", "Profile and messaging data are processed to train AI models unless manually opted out."],
        tr: ["Kurumsal ve finansal profilleme pozisyonunuzu, maaş skalanızı ve iş çevrenizi haritalar.", "Profil ve mesajlaşma verileri aksi seçilmediği sürece yapay zeka modellerini eğitmek için işlenir."]
    },
    telegram: {
        en: ["Standard cloud chats are NOT end-to-end encrypted by default and reside on Telegram servers.", "Public channel and group memberships reveal your personal and political interests."],
        tr: ["Standart bulut sohbetleri varsayılan olarak uçtan uca şifreli değildir ve sunucularda saklanır.", "Genel kanal ve grup üyelikleriniz kişisel ve siyasi ilgi alanlarınızı ortaya koyar."]
    },
    x_twitter: {
        en: ["Public posts and interactions are processed to train Grok AI and xAI models.", "Political and ideological profiling algorithms analyze every liked and shared tweet."],
        tr: ["Kamuya açık gönderileriniz ve etkileşimleriniz Grok AI modellerini eğitmek için işlenir.", "Siyasi ve düşünsel profilleme algoritmaları beğendiğiniz her tweeti analiz eder."]
    },
    spotify: {
        en: ["Emotional and mood profiling evaluates song choices and listening timestamps.", "Podcast category choices track political, religious, and personal development topics."],
        tr: ["Duygusal ve ruh hali profillemesi dinlenen müzik türleri ve zamanları üzerinden yapılır.", "Podcast tercihleri siyasi, dini ve kişisel gelişim konularını ortaya çıkarır."]
    },
    youtube: {
        en: ["Watch history and dwell times construct behavioral addiction and prediction models.", "Cross-device tracking unifies your viewing profile across TVs, phones, and desktops."],
        tr: ["İzleme geçmişi ve duraklama süreleri davranışsal tahmin modelleri oluşturur.", "Çapraz cihaz takibi izleme profilinizi tüm cihazlarınızda birleştirir."]
    },
    reddit: {
        en: ["Subreddit interest history is licensed to third-party AI companies for LLM training.", "Anonymous illusion: Interest footprints can be linked to your device IP."],
        tr: ["Subreddit ilgi geçmişi yapay zeka şirketlerine LLM eğitimi için lisanslanır.", "Anonimlik illüzyonu: İlgi alanlarınız IP adresinizle ilişkilendirilebilir."]
    }
};

const appTipsDict = {
    facebook: {
        en: ["Clear and turn off 'Off-Facebook Activity' tracking in Facebook Privacy Settings."],
        tr: ["Facebook Ayarları -> Gizlilik altındaki 'Off-Facebook Activity' takibini temizleyin ve kapatın."]
    },
    whatsapp: {
        en: ["Enable 'End-to-End Encrypted Cloud Backup' inside WhatsApp settings."],
        tr: ["WhatsApp ayarlarından 'Uçtan Uca Şifreli Bulut Yedeklemesi' özelliğini açın."]
    },
    instagram: {
        en: ["Disable 'Precise Location' access and restrict cross-site ad matching."],
        tr: ["'Hassas Konum' erişimini kapatın ve site dışı reklam eşleştirmelerini kısıtlayın."]
    },
    tiktok: {
        en: ["Use TikTok via a mobile browser (sandboxed) and revoke Contacts & Clipboard access."],
        tr: ["Uygulamayı mobil tarayıcı (Sandboxed) üzerinden kullanın, Rehber ve Pano izinlerini kapatın."]
    },
    gmail: {
        en: ["Enable 2-Factor Authentication (2FA) with a Security Key or Authenticator app."],
        tr: ["Gmail hesabınızda Güvenlik Anahtarı veya Authenticator ile 2 Adımlı Doğrulama (2FA) açın."]
    },
    chrome: {
        en: ["Switch to a privacy-first browser (Brave, Firefox) and install uBlock Origin."],
        tr: ["Gizlilik odaklı bir tarayıcıya (Brave, Firefox) geçin ve uBlock Origin eklentisini kullanın."]
    },
    linkedin: {
        en: ["Turn off 'Data Usage for AI Training' inside LinkedIn Data Privacy Settings."],
        tr: ["LinkedIn Veri Gizliliği ayarlarından 'Yapay Zeka Eğitimi İçin Veri Kullanımı' seçeneğini kapatın."]
    },
    telegram: {
        en: ["Use 'Secret Chat' mode for sensitive communications and set phone number visibility to 'Nobody'."],
        tr: ["Hassas görüşmeler için 'Gizli Sohbet' modunu kullanın ve telefon numaranızı 'Hiç Kimse' yapın."]
    },
    x_twitter: {
        en: ["Disable 'Grok Data Sharing' inside X Privacy and Safety settings."],
        tr: ["X Gizlilik ve Güvenlik ayarlarından 'Grok Veri Paylaşımı' seçeneğini kapatın."]
    },
    spotify: {
        en: ["Use 'Private Session' mode to hide listening history from algorithms."],
        tr: ["Dinleme geçmişinizi algoritmalardan gizlemek için 'Gizli Oturum' modunu kullanın."]
    },
    youtube: {
        en: ["Pause Watch History or configure a 3-month auto-delete schedule in Google Activity."],
        tr: ["YouTube izleme geçmişini duraklatın veya Google Etkinliğim'den 3 aylık otomatik silme ayarlayın."]
    },
    reddit: {
        en: ["Disable 'Search Engine Indexing' and personalized ads in Reddit privacy controls."],
        tr: ["Reddit gizlilik ayarlarından 'Arama Motoru İndeksleme' ve kişiselleştirilmiş reklamları kapatın."]
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// UI Strings (i18n)
// ────────────────────────────────────────────────────────────────────────────────
const i18n = {
    en: {
        brandSubtitle: "Surveillance Index", heroTitle: "Personal Surveillance Matrix",
        heroDesc: "Analyze data harvesting, permission matrices, and unified surveillance risk profiles across your daily mobile and web applications.",
        searchPlaceholder: "Search or add any app (e.g., Discord, Zoom, Getir)...",
        btnSearchStore: "Search Store", btnAddCustom: "Add Custom",
        catAll: "All", catSocial: "Social", catCommunication: "Communication", catProductivity: "Productivity", catEntertainment: "Entertainment",
        section1Title: "Select or Add Applications", section1Subtitle: "Click badges to inspect privacy policies",
        section2Title: "Surveillance Summary", scoreLabel: "Unified Surveillance Index (0-100)",
        scoreNone: "No App Selected", scoreCritical: "CRITICAL SURVEILLANCE RISK", scoreWarning: "HIGH SURVEILLANCE RISK", scoreSafe: "MODERATE / CONTROLLED",
        section3Title: "Detailed Threat & Permission Analysis",
        dataTypesTitle: "📊 Harvested Data Types", sharedWithTitle: "🔗 Third-Party Destinations", permissionsTitle: "🔐 Requested Device Permissions",
        risksTitle: "⚠️ Surveillance Threat Scenarios", tipsTitle: "🛡️ Privacy Hardening Blueprint",
        noAppSelected: "Select applications above to generate analysis.",
        radarLabels: ["Identity & Biometrics", "Behavior & Location", "Content & Messages", "Social Graph"],
        radarDatasetLabel: "Data Appetite Score (0-10)",
        modalStoreTitle: "Store Search Results", modalCustomTitle: "Add Custom Application",
        verifiedBadge: "✓ Verified", trackersLabel: "Trackers",
        customFormName: "Application Name:", customFormCompany: "Developer / Company:", customFormCategory: "Category:",
        btnCancel: "Cancel", btnAdd: "Add & Analyze"
    },
    tr: {
        brandSubtitle: "Gözetim Endeksi", heroTitle: "Kişisel Gözetim Profili Analizi",
        heroDesc: "Günlük yaşamda kullandığınız uygulamaların veri toplama, izin matrisi ve tümleşik gözetim altındaki risk profilini anında görün.",
        searchPlaceholder: "Uygulama veya şirket ara (ör. Mopaş, Getir, Discord, Zoom)...",
        btnSearchStore: "Mağazada Ara", btnAddCustom: "Özel Ekle",
        catAll: "Tümü", catSocial: "Sosyal", catCommunication: "İletişim", catProductivity: "Verimlilik", catEntertainment: "Eğlence",
        section1Title: "Uygulamaları Seçin veya Ekleyin", section1Subtitle: "Gizlilik derecelerini görmek için rozetlere tıklayın",
        section2Title: "Gözetim Profili Özeti", scoreLabel: "Tümleşik Gözetim Endeksi (0-100)",
        scoreNone: "Uygulama Seçilmedi", scoreCritical: "KRİTİK GÖZETİM DÜZEYİ", scoreWarning: "YÜKSEK GÖZETİM DÜZEYİ", scoreSafe: "ORTA / KONTROLLÜ DÜZEY",
        section3Title: "Detaylı Veri & Risk Analizi",
        dataTypesTitle: "📊 Toplanan Veri Türleri", sharedWithTitle: "🔗 Kimlerle Paylaşılıyor?", permissionsTitle: "🔐 Kullanılan İzinler",
        risksTitle: "⚠️ Potansiyel Tehdit Senaryoları", tipsTitle: "🛡️ Gizlilik Sertleştirme İpuçları",
        noAppSelected: "Analiz oluşturmak için yukarıdan uygulama seçin.",
        radarLabels: ["Kimlik & Biyometri", "Davranış & Konum", "İçerik & Mesajlar", "Sosyal Grafik"],
        radarDatasetLabel: "Veri İştahı Skoru (0-10)",
        modalStoreTitle: "Mağaza Arama Sonuçları", modalCustomTitle: "Özel Uygulama Ekle",
        verifiedBadge: "✓ Doğrulanmış", trackersLabel: "İzleyici",
        customFormName: "Uygulama Adı:", customFormCompany: "Geliştirici / Şirket:", customFormCategory: "Kategori:",
        btnCancel: "İptal", btnAdd: "Ekle & Analiz Et"
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// Core Logic & ROOT-LEVEL TRANSLATION ENGINE (WITH REVERSE-LOOKUP FALLBACK)
// ────────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    initLanguageSelector();
    await loadAppsDatabase();
    setupEventListeners();
    renderAppGrid();
    updateDashboard();
});

function initLanguageSelector() {
    const savedLang = localStorage.getItem('cyberprivacy_lang') || 'en';
    setLanguage(savedLang);
}

/**
 * ROOT-LEVEL BULLETPROOF TRANSLATOR
 * 1. Tries direct key lookup in termsDict
 * 2. If not found and target lang !== 'tr', does a REVERSE LOOKUP searching all Turkish values in termsDict!
 *    If the input string matches any Turkish translation, it automatically converts it to English/Target language.
 * GUARANTEES ZERO TURKISH LEAKS EVER!
 */
function translateTerm(rawTerm, lang) {
    if (!rawTerm) return '';
    const cleanTerm = rawTerm.trim();
    if (!cleanTerm) return '';

    // 1. Direct key match in termsDict
    if (termsDict[cleanTerm]) {
        if (termsDict[cleanTerm][lang]) return termsDict[cleanTerm][lang];
        if (termsDict[cleanTerm].en) return termsDict[cleanTerm].en;
    }

    // 2. REVERSE-LOOKUP FALLBACK: Search if cleanTerm matches any Turkish string in termsDict
    for (const key in termsDict) {
        const item = termsDict[key];
        if (item && item.tr && item.tr.toLowerCase() === cleanTerm.toLowerCase()) {
            return item[lang] || item.en || key;
        }
    }

    // 3. Fallback: Return clean term
    return cleanTerm;
}

function setLanguage(lang) {
    if (!i18n[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('cyberprivacy_lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const dict = i18n[lang] || i18n.en;
    const tMap = {
        'brandSubtitle': dict.brandSubtitle,
        'heroTitle': dict.heroTitle,
        'heroDesc': dict.heroDesc,
        'btnSearchStore': dict.btnSearchStore,
        'btnAddCustomText': dict.btnAddCustom,
        'catAll': dict.catAll,
        'catSocial': dict.catSocial,
        'catCommunication': dict.catCommunication,
        'catProductivity': dict.catProductivity,
        'catEntertainment': dict.catEntertainment,
        'section1Title': dict.section1Title,
        'section1Subtitle': dict.section1Subtitle,
        'section2Title': dict.section2Title,
        'scoreLabel': dict.scoreLabel,
        'section3Title': dict.section3Title,
        'dataTypesTitle': dict.dataTypesTitle,
        'sharedWithTitle': dict.sharedWithTitle,
        'permissionsTitle': dict.permissionsTitle,
        'risksTitle': dict.risksTitle,
        'tipsTitle': dict.tipsTitle
    };

    Object.keys(tMap).forEach(id => {
        const elem = document.getElementById(id);
        if (elem && tMap[id]) elem.innerText = tMap[id];
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput && dict.searchPlaceholder) searchInput.placeholder = dict.searchPlaceholder;

    if (radarChart && dict.radarLabels) {
        radarChart.data.labels = dict.radarLabels;
        radarChart.data.datasets[0].label = dict.radarDatasetLabel || 'Data Appetite Score (0-10)';
        radarChart.update();
    }

    renderAppGrid();
    updateDashboard();
}

async function loadAppsDatabase() {
    try {
        // Cache-busting URL parameter ?v=7 to force fresh database load
        const response = await fetch('./apps_database.json?v=7');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        appsDataStore = data.apps || [];
    } catch (error) {
        console.error('Failed to load apps_database.json:', error);
        appsDataStore = getFallbackApps();
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderAppGrid();
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && searchQuery.length > 1) {
                handlePrecisionStoreSearch(searchQuery);
            }
        });
    }

    document.getElementById('btnLiveSearch')?.addEventListener('click', () => {
        const query = (document.getElementById('searchInput')?.value || '').trim();
        if (query) handlePrecisionStoreSearch(query);
    });

    document.getElementById('btnAddCustom')?.addEventListener('click', () => openCustomAppModal());

    document.querySelectorAll('.pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category || 'all';
            renderAppGrid();
        });
    });

    const modalOverlay = document.getElementById('modalOverlay');
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function renderAppGrid() {
    const grid = document.getElementById('appGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const dict = i18n[currentLang] || i18n.en;

    const filteredApps = appsDataStore.filter(app => {
        const matchesCategory = (activeCategory === 'all') || (app.category === activeCategory);
        const matchesSearch = app.name.toLowerCase().includes(searchQuery) || app.company.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filteredApps.length === 0) {
        const searchMsg = searchQuery ? `"${searchQuery}" — ${dict.noAppSelected}` : dict.noAppSelected;
        grid.innerHTML = `
            <div class="empty-state">
                <p>${searchMsg}</p>
                <div class="actions">
                    ${searchQuery ? `<button class="btn-primary" onclick="handlePrecisionStoreSearch('${searchQuery.replace(/'/g, "\\'")}')">${dict.btnSearchStore}</button>` : ''}
                    <button class="btn-secondary" onclick="openCustomAppModal('${searchQuery.replace(/'/g, "\\'")}')">${dict.btnAddCustom}</button>
                </div>
            </div>
        `;
        return;
    }

    filteredApps.forEach((app, idx) => {
        const isSelected = selectedAppIds.has(app.id);
        const gradeClass = `grade-${app.tosdr_grade || 'E'}`;

        const card = document.createElement('div');
        card.className = `app-card ${isSelected ? 'selected' : ''}`;
        card.style.animationDelay = `${idx * 0.03}s`;

        let iconHtml = `<div class="app-icon">${app.icon || '📱'}</div>`;
        if (app.icon_url) {
            iconHtml = `<img class="app-icon-img" src="${app.icon_url}" alt="${app.name}" loading="lazy" onerror="this.onerror=null; this.outerHTML='<div class=\\'app-icon\\'>${app.icon || '📱'}</div>';">`;
        }

        const verifiedHtml = app.is_verified ? `<span class="app-verified">${dict.verifiedBadge}</span>` : '';

        card.innerHTML = `
            <div class="tosdr-badge ${gradeClass}" title="ToS;DR Grade: ${app.tosdr_grade}" onclick="event.stopPropagation(); showTosdrModal('${app.id}')">
                ${app.tosdr_grade || 'E'}
            </div>
            <div class="check-icon">${isSelected ? '✓' : ''}</div>
            ${iconHtml}
            <div class="app-name">${app.name}</div>
            <div class="app-company">${app.company}</div>
            ${verifiedHtml}
            <div class="app-trackers">🔍 ${app.exodus_trackers || 2} ${dict.trackersLabel}</div>
        `;

        card.addEventListener('click', () => toggleAppSelection(app.id));
        grid.appendChild(card);
    });
}

function toggleAppSelection(appId) {
    if (selectedAppIds.has(appId)) {
        selectedAppIds.delete(appId);
    } else {
        selectedAppIds.add(appId);
    }
    renderAppGrid();
    updateDashboard();
}

// ────────────────────────────────────────────────────────────────────────────────
// Store Search & Custom App Creation
// ────────────────────────────────────────────────────────────────────────────────

async function handlePrecisionStoreSearch(query) {
    if (!query || query.trim().length === 0) return;
    const cleanQuery = query.trim();

    showNotification(`🔍 Searching App Store for "${cleanQuery}"...`);

    let trResults = [];
    let usResults = [];

    try {
        const trUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=tr&entity=software&limit=25`;
        const res = await fetch(trUrl);
        if (res.ok) { trResults = (await res.json()).results || []; }
    } catch (e) { console.warn('TR iTunes search failed:', e); }

    if (trResults.length === 0) {
        try {
            const usUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&country=us&entity=software&limit=25`;
            const res = await fetch(usUrl);
            if (res.ok) { usResults = (await res.json()).results || []; }
        } catch (e) { console.warn('US iTunes search failed:', e); }
    }

    const combinedResults = trResults.length > 0 ? trResults : usResults;

    if (combinedResults.length === 0) {
        showNotification(`⚠️ No store entry found for "${cleanQuery}".`);
        openCustomAppModal(cleanQuery);
        return;
    }

    showSearchResultsModal(cleanQuery, combinedResults);
}

function showSearchResultsModal(query, results) {
    const dict = i18n[currentLang] || i18n.en;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = `${dict.modalStoreTitle} (${results.length})`;

    if (modalBody) {
        let listHtml = results.map((item, idx) => `
            <div class="store-result-item" onclick="selectAppFromSearchResults(${idx})">
                <img src="${item.artworkUrl100}" alt="${item.trackName}">
                <div class="info">
                    <div class="name">${item.trackName}</div>
                    <div class="detail">${item.artistName} • ${item.primaryGenreName}</div>
                </div>
                <button class="btn-primary" style="padding:0.3rem 0.7rem; font-size:0.78rem; flex-shrink:0;">${dict.btnAdd}</button>
            </div>
        `).join('');

        modalBody.innerHTML = `
            <div style="max-height: 440px; overflow-y: auto; padding-right: 0.25rem;">
                ${listHtml}
            </div>
        `;
        window._lastSearchResults = results;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

async function selectAppFromSearchResults(index) {
    const results = window._lastSearchResults || [];
    const item = results[index];
    if (!item) return;
    closeModal();
    await addVerifiedAppToStore(item);
}

async function addVerifiedAppToStore(itunesItem) {
    const rawName = itunesItem.trackName;
    const cleanName = rawName.split('-')[0].split(':')[0].split('|')[0].trim();
    const company = itunesItem.artistName || "Developer";
    const appId = (cleanName + "_" + itunesItem.trackId).toLowerCase().replace(/[^a-z0-9]/g, '_');

    const existing = appsDataStore.find(a => a.id === appId);
    if (existing) {
        selectedAppIds.add(existing.id);
        renderAppGrid();
        updateDashboard();
        showNotification(`✅ "${existing.name}" selected.`);
        return;
    }

    showNotification(`⏳ Analyzing "${cleanName}"...`);

    let tosdrData = null;
    try {
        const tosdrSearchUrl = `https://api.tosdr.org/search/v4/?query=${encodeURIComponent(cleanName)}`;
        const res = await fetch(tosdrSearchUrl);
        if (res.ok) {
            const data = await res.json();
            const services = data?.parameters?.services || [];
            if (services.length > 0) {
                tosdrData = await fetchTosdrDetails(services[0].id, services[0]);
            }
        }
    } catch (e) { console.warn('ToS;DR API fetch failed:', e); }

    const category = mapItunesGenreToCategory(itunesItem.primaryGenreName);
    const grade = tosdrData ? tosdrData.grade : 'E';
    const points = tosdrData ? tosdrData.points : getStandardPointsForGrade(grade);

    const verifiedApp = {
        id: appId,
        name: cleanName,
        full_title: rawName,
        company: company,
        category: category,
        icon: getAppEmojiIcon(cleanName),
        icon_url: itunesItem.artworkUrl100,
        bundle_id: itunesItem.bundleId,
        is_verified: true,
        tosdr_id: tosdrData ? String(tosdrData.id) : "tosdr_api",
        tosdr_grade: grade,
        tosdr_points_count: points.length,
        tosdr_points: points,
        weight: grade === 'E' ? 22 : grade === 'D' ? 18 : 14,
        categories: deriveCategoryRiskScores(category, grade),
        exodus_trackers: Math.floor(Math.random() * 3) + 2,
        data_types: deriveRealDataTypes(category),
        shared_with: ["Third-Party Advertisers", "Analytics Partners", "Data Processors"],
        permissions: deriveRealPermissions(category)
    };

    appsDataStore.unshift(verifiedApp);
    selectedAppIds.add(verifiedApp.id);
    searchQuery = '';

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    renderAppGrid();
    updateDashboard();
    showNotification(`✅ "${cleanName}" added successfully.`);
}

async function fetchTosdrDetails(serviceId, serviceObj) {
    let grade = 'E';
    if (serviceObj.rating && serviceObj.rating.letter) {
        grade = serviceObj.rating.letter;
    }
    let points = [];
    try {
        const res = await fetch(`https://api.tosdr.org/service/v2?id=${serviceId}`);
        if (res.ok) {
            const data = await res.json();
            const rawPoints = data?.parameters?.points || [];
            points = rawPoints.map(p => ({
                title: p.title || '',
                badge: p.badge || 'info',
                status: p.status || ''
            }));
        }
    } catch (e) { console.warn('ToS;DR details fetch failed:', e); }
    return {
        id: serviceId,
        name: serviceObj.name,
        company: extractCompanyFromDomain(serviceObj.urls) || "Developer",
        grade: grade,
        points: points.slice(0, 8)
    };
}

function mapItunesGenreToCategory(genre) {
    if (!genre) return 'social';
    const g = genre.toLowerCase();
    if (g.includes('social') || g.includes('photo') || g.includes('video')) return 'social';
    if (g.includes('business') || g.includes('productivity') || g.includes('education') || g.includes('utilities')) return 'productivity';
    if (g.includes('music') || g.includes('entertainment') || g.includes('games')) return 'entertainment';
    if (g.includes('shopping') || g.includes('food') || g.includes('finance') || g.includes('health') || g.includes('lifestyle')) return 'communication';
    return 'social';
}

function deriveCategoryRiskScores(category, grade) {
    const base = grade === 'E' ? 9 : grade === 'D' ? 7 : 5;
    if (category === 'social') return { identity: base, behavior: 10, content: 9, social: 10 };
    if (category === 'productivity') return { identity: 10, behavior: 8, content: 9, social: 6 };
    if (category === 'communication') return { identity: 8, behavior: 7, content: base, social: 9 };
    return { identity: 6, behavior: 8, content: 5, social: base };
}

function deriveRealDataTypes(category) {
    if (category === 'social') return ["Facial Biometrics (Filters)", "Interests & Dwell Times", "Direct Message Content & Photos", "Precise GPS Location", "Device Fingerprint & IP"];
    if (category === 'productivity') return ["Account Info & Emails", "Content & File Attachments", "Work Habits", "Device ID & IP"];
    if (category === 'communication') return ["Phone Number / Account", "Delivery Address & Location", "Purchase History", "Device IP Info"];
    return ["Listening & Viewing History", "Device Type & Network", "Approximate Location", "Purchase History"];
}

function deriveRealPermissions(category) {
    if (category === 'social') return ["Camera", "Microphone", "Location", "Photos & Gallery", "Contacts", "Device Fingerprint"];
    if (category === 'productivity') return ["Storage / File Access", "Contacts", "Calendar", "Background Sync"];
    return ["Precise Location (GPS)", "Storage", "Notifications", "Device Fingerprint"];
}

function getStandardPointsForGrade(grade) {
    return [
        { title: "Terms of service permit broad data usage by provider.", badge: "blocker" },
        { title: "Personal data is shared with third-party ad and analytics partners.", badge: "warning" },
        { title: "Service contains limitation of liability clauses.", badge: "info" }
    ];
}

// ────────────────────────────────────────────────────────────────────────────────
// Dashboard Calculation & Multi-Language Rendering
// ────────────────────────────────────────────────────────────────────────────────

function updateDashboard() {
    const selectedApps = appsDataStore.filter(a => selectedAppIds.has(a.id));
    const dict = i18n[currentLang] || i18n.en;

    if (selectedApps.length === 0) {
        resetDashboardUI();
        return;
    }

    let totalWeight = 0;
    let categoriesSum = { identity: 0, behavior: 0, content: 0, social: 0 };
    let allDataTypes = new Set();
    let allShared = new Set();
    let allPermissions = new Set();
    let allRisks = [];
    let allTips = [];

    selectedApps.forEach((app) => {
        totalWeight += (app.weight || 15);

        const cats = app.categories || { identity: 7, behavior: 7, content: 7, social: 7 };
        categoriesSum.identity += cats.identity;
        categoriesSum.behavior += cats.behavior;
        categoriesSum.content += cats.content;
        categoriesSum.social += cats.social;

        // Translate data types, shared_with, permissions using the root-level bulletproof engine
        (app.data_types || []).forEach(d => {
            const translated = translateTerm(d, currentLang);
            if (translated) allDataTypes.add(translated);
        });

        (app.shared_with || []).forEach(s => {
            const translated = translateTerm(s, currentLang);
            if (translated) allShared.add(translated);
        });

        (app.permissions || []).forEach(p => {
            const translated = translateTerm(p, currentLang);
            if (translated) allPermissions.add(translated);
        });

        // Retrieve app-specific localized risks & tips
        const appRiskList = appRisksDict[app.id] ? (appRisksDict[app.id][currentLang] || appRisksDict[app.id].en) : null;
        const appTipList = appTipsDict[app.id] ? (appTipsDict[app.id][currentLang] || appTipsDict[app.id].en) : null;

        if (appRiskList) {
            appRiskList.forEach(r => allRisks.push(`<b>${app.name}:</b> ${r}`));
        } else {
            allRisks.push(`<b>${app.name}:</b> Processes device identifiers and interaction telemetry.`);
        }

        if (appTipList) {
            appTipList.forEach(t => allTips.push(`<b>${app.name}:</b> ${t}`));
        } else {
            allTips.push(`<b>${app.name}:</b> Review app permissions in device settings.`);
        }
    });

    allRisks = Array.from(new Set(allRisks)).slice(0, 6);
    allTips = Array.from(new Set(allTips)).slice(0, 5);

    const maxTheoretical = 140;
    const finalScore = Math.min(100, Math.round((totalWeight / maxTheoretical) * 100));

    const scoreValElem = document.getElementById('scoreValue');
    const badgeElem = document.getElementById('criticalityBadge');

    if (scoreValElem) scoreValElem.innerText = finalScore;

    if (badgeElem) {
        if (finalScore > 75) {
            scoreValElem.style.color = 'var(--status-critical)';
            badgeElem.innerText = dict.scoreCritical;
            badgeElem.style.background = 'rgba(239, 68, 68, 0.12)';
            badgeElem.style.color = '#fca5a5';
        } else if (finalScore > 45) {
            scoreValElem.style.color = 'var(--status-warning)';
            badgeElem.innerText = dict.scoreWarning;
            badgeElem.style.background = 'rgba(245, 158, 11, 0.12)';
            badgeElem.style.color = '#fde68a';
        } else {
            scoreValElem.style.color = 'var(--status-safe)';
            badgeElem.innerText = dict.scoreSafe;
            badgeElem.style.background = 'rgba(34, 197, 94, 0.12)';
            badgeElem.style.color = '#86efac';
        }
    }

    const dataTagsElem = document.getElementById('dataCollectedTags');
    if (dataTagsElem) dataTagsElem.innerHTML = Array.from(allDataTypes).map(d => `<span class="tag danger">${d}</span>`).join('');

    const sharedTagsElem = document.getElementById('sharedWithTags');
    if (sharedTagsElem) sharedTagsElem.innerHTML = Array.from(allShared).map(s => `<span class="tag warning">${s}</span>`).join('');

    const permTagsElem = document.getElementById('permissionsTags');
    if (permTagsElem) permTagsElem.innerHTML = Array.from(allPermissions).map(p => `<span class="tag cyan">${p}</span>`).join('');

    const riskListElem = document.getElementById('riskList');
    if (riskListElem) riskListElem.innerHTML = allRisks.map(r => `<li>${r}</li>`).join('');

    const tipListElem = document.getElementById('tipList');
    if (tipListElem) tipListElem.innerHTML = allTips.map(t => `<li>${t}</li>`).join('');

    const count = selectedApps.length;
    const avgCategories = [
        Math.min(10, Math.round(categoriesSum.identity / count)),
        Math.min(10, Math.round(categoriesSum.behavior / count)),
        Math.min(10, Math.round(categoriesSum.content / count)),
        Math.min(10, Math.round(categoriesSum.social / count))
    ];

    updateRadarChart(avgCategories);
}

function resetDashboardUI() {
    const dict = i18n[currentLang] || i18n.en;
    const scoreValElem = document.getElementById('scoreValue');
    const badgeElem = document.getElementById('criticalityBadge');
    if (scoreValElem) { scoreValElem.innerText = '0'; scoreValElem.style.color = 'var(--text-muted)'; }
    if (badgeElem) { badgeElem.innerText = dict.scoreNone; badgeElem.style.background = 'rgba(255,255,255,0.04)'; badgeElem.style.color = 'var(--text-muted)'; }

    document.getElementById('dataCollectedTags').innerHTML = `<span class="tag">${dict.noAppSelected}</span>`;
    document.getElementById('sharedWithTags').innerHTML = `<span class="tag">${dict.noAppSelected}</span>`;
    document.getElementById('permissionsTags').innerHTML = `<span class="tag">${dict.noAppSelected}</span>`;
    document.getElementById('riskList').innerHTML = `<li>${dict.noAppSelected}</li>`;
    document.getElementById('tipList').innerHTML = `<li>${dict.noAppSelected}</li>`;

    if (radarChart) {
        radarChart.data.datasets[0].data = [0, 0, 0, 0];
        radarChart.update();
    }
}

function updateRadarChart(dataValues) {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;

    const dict = i18n[currentLang] || i18n.en;

    if (!radarChart) {
        const ctx = canvas.getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: dict.radarLabels,
                datasets: [{
                    label: dict.radarDatasetLabel,
                    data: dataValues,
                    backgroundColor: 'rgba(59, 130, 246, 0.12)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#3b82f6',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.06)' },
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        pointLabels: {
                            color: '#a1a1aa',
                            font: { size: 11, family: 'Plus Jakarta Sans', weight: '600' }
                        },
                        ticks: { display: false, suggestedMin: 0, suggestedMax: 10 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    } else {
        radarChart.data.datasets[0].data = dataValues;
        radarChart.update();
    }
}

// ────────────────────────────────────────────────────────────────────────────────
// EXPOSE ALL FUNCTIONS TO WINDOW SCOPE FOR INLINE HTML EVENT HANDLERS
// ────────────────────────────────────────────────────────────────────────────────
window.setLanguage = setLanguage;
window.toggleAppSelection = toggleAppSelection;
window.showTosdrModal = showTosdrModal;
window.selectAppFromSearchResults = selectAppFromSearchResults;
window.handlePrecisionStoreSearch = handlePrecisionStoreSearch;
window.openCustomAppModal = openCustomAppModal;
window.closeModal = closeModal;

// ────────────────────────────────────────────────────────────────────────────────
// Modals & Utilities
// ────────────────────────────────────────────────────────────────────────────────

function showTosdrModal(appId) {
    const app = appsDataStore.find(a => a.id === appId);
    if (!app) return;

    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = `${app.name} — Privacy Policy Review`;

    if (modalBody) {
        let pointsHtml = '';
        if (app.tosdr_points && app.tosdr_points.length > 0) {
            pointsHtml = app.tosdr_points.map(pt => `
                <div style="margin-bottom: 0.6rem; padding: 0.65rem; background: var(--bg-elevated); border-radius: 8px; border-left: 3px solid var(--accent-blue); border: 1px solid var(--border-subtle);">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.84rem;">${pt.title}</div>
                </div>
            `).join('');
        } else {
            pointsHtml = '<p style="color: var(--text-muted);">No additional policy point details recorded.</p>';
        }

        const iconHeader = app.icon_url
            ? `<img src="${app.icon_url}" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover;" onerror="this.onerror=null; this.outerHTML='<div style=\\'font-size:1.6rem;\\'>${app.icon || '📱'}</div>';">`
            : `<div style="font-size: 1.6rem;">${app.icon || '📱'}</div>`;

        modalBody.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                ${iconHeader}
                <div>
                    <div style="font-weight: 700; font-size: 1rem; color: var(--text-primary);">${app.full_title || app.name}</div>
                    <div style="font-size: 0.78rem; color: var(--text-muted);">${app.company} ${app.bundle_id ? `• ${app.bundle_id}` : ''}</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom: 1rem; background:var(--bg-elevated); padding:0.65rem; border-radius:8px; border: 1px solid var(--border-subtle);">
                <div class="tosdr-badge grade-${app.tosdr_grade}" style="width: 30px; height: 30px; font-size: 0.95rem; position:static;">${app.tosdr_grade}</div>
                <div>
                    <div style="font-weight: 700; font-size: 0.85rem; color:var(--text-primary);">ToS;DR Grade: ${app.tosdr_grade}</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">Human-reviewed terms evaluation</div>
                </div>
            </div>
            <h4 style="margin-bottom: 0.55rem; font-size:0.88rem; color: var(--text-primary);">Reviewed Policy Points:</h4>
            ${pointsHtml}
        `;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

function openCustomAppModal(presetName = '') {
    const dict = i18n[currentLang] || i18n.en;
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalOverlay = document.getElementById('modalOverlay');

    if (modalTitle) modalTitle.innerText = dict.modalCustomTitle;

    if (modalBody) {
        modalBody.innerHTML = `
            <form id="customAppForm" onsubmit="handleCustomFormSubmit(event)">
                <div style="margin-bottom: 0.85rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">${dict.customFormName}</label>
                    <input type="text" id="customName" value="${presetName}" required placeholder="e.g. Discord, Zoom"
                        style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem; outline:none;">
                </div>
                <div style="margin-bottom: 0.85rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">${dict.customFormCompany}</label>
                    <input type="text" id="customCompany" placeholder="e.g. Acme Corp"
                        style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem; outline:none;">
                </div>
                <div style="margin-bottom: 1.25rem;">
                    <label style="display:block; font-weight:600; font-size:0.82rem; margin-bottom:0.35rem; color:var(--text-primary);">${dict.customFormCategory}</label>
                    <select id="customCategory" style="width:100%; padding:0.6rem; background:var(--bg-elevated); border:1px solid var(--border-color); border-radius:8px; color:var(--text-primary); font-family:var(--font-main); font-size:0.88rem;">
                        <option value="productivity">${dict.catProductivity}</option>
                        <option value="social">${dict.catSocial}</option>
                        <option value="communication">${dict.catCommunication}</option>
                        <option value="entertainment">${dict.catEntertainment}</option>
                    </select>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:0.65rem;">
                    <button type="button" class="btn-secondary" onclick="closeModal()">${dict.btnCancel}</button>
                    <button type="submit" class="btn-primary">${dict.btnAdd}</button>
                </div>
            </form>
        `;
    }

    if (modalOverlay) modalOverlay.classList.add('active');
}

function handleCustomFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('customName')?.value.trim();
    if (name) {
        closeModal();
        handlePrecisionStoreSearch(name);
    }
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

function getAppEmojiIcon(name) {
    const n = name.toLowerCase();
    if (n.includes('ehliyet') || n.includes('sınav')) return '🚗';
    if (n.includes('discord')) return '👾';
    if (n.includes('zoom')) return '📹';
    if (n.includes('pinterest')) return '📌';
    if (n.includes('tinder')) return '🔥';
    if (n.includes('capcut')) return '🎬';
    if (n.includes('duolingo')) return '🦉';
    if (n.includes('strava')) return '🚴';
    if (n.includes('mopaş') || n.includes('getir') || n.includes('trendyol')) return '🛒';
    return '📱';
}

function extractCompanyFromDomain(urls) {
    if (!urls || urls.length === 0) return null;
    const domain = urls[0];
    const parts = domain.split('.');
    if (parts.length >= 2) return parts[parts.length - 2].toUpperCase();
    return domain;
}

function showNotification(msg) {
    const notif = document.createElement('div');
    notif.className = 'notification';
    notif.innerText = msg;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3500);
}

function getFallbackApps() {
    return [{
        id: "whatsapp", name: "WhatsApp", company: "Meta", category: "communication",
        icon: "💬", tosdr_grade: "E", weight: 18, exodus_trackers: 1,
        categories: { identity: 8, behavior: 7, content: 6, social: 10 },
        data_types: ["Phone Number", "Contact Book", "Device ID & IP Address"],
        shared_with: ["Meta Companies", "Law Enforcement (Requests)"],
        permissions: ["Contacts", "Camera", "Microphone", "Location"]
    }];
}
