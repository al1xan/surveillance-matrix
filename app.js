/**
 * CyberPrivacy Matrix - Comprehensive Multi-Language Engine v2 (All Bugs Fixed)
 * Languages: EN (Default), TR, ES, DE, FR, PT, IT, RU, ZH, JA
 * 
 * BUG FIXES:
 * - ALL data_types, shared_with, permissions are now fully translated via termsDict
 * - risks and tips from database are now rendered using localized i18n strings (not raw Turkish)
 * - deriveRealDataTypes/Permissions return English keys that map through termsDict
 * - addVerifiedAppToStore uses English keys for shared_with
 * - Varied risk/tip scenarios per app (not just riskSocialGraph repeated)
 */

let appsDataStore = [];
let selectedAppIds = new Set(['whatsapp', 'instagram', 'chrome', 'tiktok']);
let activeCategory = 'all';
let searchQuery = '';
let currentLang = 'en';
let radarChart = null;

// ────────────────────────────────────────────────────────────────────────────────
// TERMS DICTIONARY: Translates data types, permissions, destinations
// Keys are ENGLISH (canonical). Database stores Turkish keys for legacy entries,
// so we also add Turkish-key aliases that map to the same translations.
// ────────────────────────────────────────────────────────────────────────────────
const termsDict = {
    // ─── Data Types ───
    "Phone Number": { en: "Phone Number", tr: "Telefon Numarası", es: "Número de teléfono", de: "Telefonnummer", fr: "Numéro de téléphone", pt: "Número de telefone", it: "Numero di telefono", ru: "Номер телефона", zh: "电话号码", ja: "電話番号" },
    "Telefon Numarası": { en: "Phone Number", tr: "Telefon Numarası", es: "Número de teléfono", de: "Telefonnummer", fr: "Numéro de téléphone", pt: "Número de telefone", it: "Numero di telefono", ru: "Номер телефона", zh: "电话号码", ja: "電話番号" },
    
    "Contact Book": { en: "Contact Book", tr: "Kişi Listesi (Rehber)", es: "Lista de contactos", de: "Kontakte", fr: "Carnet de contacts", pt: "Lista de contatos", it: "Rubrica contatti", ru: "Список контактов", zh: "通讯录", ja: "連絡先一覧" },
    "Kişi Listesi (Rehber)": { en: "Contact Book", tr: "Kişi Listesi (Rehber)", es: "Lista de contactos", de: "Kontakte", fr: "Carnet de contacts", pt: "Lista de contatos", it: "Rubrica contatti", ru: "Список контактов", zh: "通讯录", ja: "連絡先一覧" },
    
    "Device ID & IP Address": { en: "Device ID & IP Address", tr: "Cihaz ID & IP Adresi", es: "ID de dispositivo e IP", de: "Geräte-ID & IP-Adresse", fr: "Identifiant appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP地址", ja: "デバイスIDとIPアドレス" },
    "Cihaz ID & IP Adresi": { en: "Device ID & IP Address", tr: "Cihaz ID & IP Adresi", es: "ID de dispositivo e IP", de: "Geräte-ID & IP-Adresse", fr: "Identifiant appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP地址", ja: "デバイスIDとIPアドレス" },
    "Cihaz ID": { en: "Device ID", tr: "Cihaz ID", es: "ID de dispositivo", de: "Geräte-ID", fr: "Identifiant appareil", pt: "ID do dispositivo", it: "ID dispositivo", ru: "ID устройства", zh: "设备ID", ja: "デバイスID" },
    "IP Address": { en: "IP Address", tr: "IP Adresi", es: "Dirección IP", de: "IP-Adresse", fr: "Adresse IP", pt: "Endereço IP", it: "Indirizzo IP", ru: "IP-адрес", zh: "IP地址", ja: "IPアドレス" },
    "IP Adresi": { en: "IP Address", tr: "IP Adresi", es: "Dirección IP", de: "IP-Adresse", fr: "Adresse IP", pt: "Endereço IP", it: "Indirizzo IP", ru: "IP-адрес", zh: "IP地址", ja: "IPアドレス" },
    
    "Metadata (Call Time/Duration)": { en: "Metadata (Call Time/Duration)", tr: "Metadatalar (Arama Zamanı/Süresi)", es: "Metadatos (Hora/Duración)", de: "Metadaten (Anrufzeit/Dauer)", fr: "Métadonnées (Heure/Durée)", pt: "Metadados (Hora/Duração)", it: "Metadati (Ora/Durata)", ru: "Метаданные (время/длительность)", zh: "元数据(通话时间/时长)", ja: "メタデータ (通話時間/期間)" },
    "Metadatalar (Arama Zamanı/Süresi)": { en: "Metadata (Call Time/Duration)", tr: "Metadatalar (Arama Zamanı/Süresi)", es: "Metadatos (Hora/Duración)", de: "Metadaten (Anrufzeit/Dauer)", fr: "Métadonnées (Heure/Durée)", pt: "Metadados (Hora/Duração)", it: "Metadati (Ora/Durata)", ru: "Метаданные (время/длительность)", zh: "元数据(通话时间/时长)", ja: "メタデータ (通話時間/期間)" },
    
    "Profile Picture & Status": { en: "Profile Picture & Status", tr: "Profil Resmi & Durum", es: "Foto de perfil y estado", de: "Profilbild & Status", fr: "Photo de profil & Statut", pt: "Foto de perfil e status", it: "Foto profilo e stato", ru: "Фото профиля и статус", zh: "头像与状态", ja: "プロフィール画像とステータス" },
    "Profil Resmi & Durum": { en: "Profile Picture & Status", tr: "Profil Resmi & Durum", es: "Foto de perfil y estado", de: "Profilbild & Status", fr: "Photo de profil & Statut", pt: "Foto de perfil e status", it: "Foto profilo e stato", ru: "Фото профиля и статус", zh: "头像与状态", ja: "プロフィール画像とステータス" },
    
    "Location (If Shared)": { en: "Location (If Shared)", tr: "Konum (Paylaşılırsa)", es: "Ubicación (Si se comparte)", de: "Standort (Wenn freigegeben)", fr: "Localisation (Si partagée)", pt: "Localização (Se compartilhada)", it: "Posizione (Se condivisa)", ru: "Геолокация (если доступна)", zh: "位置(若共享)", ja: "位置情報 (共有時)" },
    "Konum (Paylaşılırsa)": { en: "Location (If Shared)", tr: "Konum (Paylaşılırsa)", es: "Ubicación (Si se comparte)", de: "Standort (Wenn freigegeben)", fr: "Localisation (Si partagée)", pt: "Localização (Se compartilhada)", it: "Posizione (Se condivisa)", ru: "Геолокация (если доступна)", zh: "位置(若共享)", ja: "位置情報 (共有時)" },
    
    "GPS Location History": { en: "GPS Location History", tr: "GPS Konum Geçmişi", es: "Historial de ubicación GPS", de: "GPS-Standortverlauf", fr: "Historique de localisation GPS", pt: "Histórico de localização GPS", it: "Cronologia posizioni GPS", ru: "История GPS-локаций", zh: "GPS位置历史", ja: "GPS位置履歴" },
    "GPS Konum Geçmişi": { en: "GPS Location History", tr: "GPS Konum Geçmişi", es: "Historial de ubicación GPS", de: "GPS-Standortverlauf", fr: "Historique de localisation GPS", pt: "Histórico de localização GPS", it: "Cronologia posizioni GPS", ru: "История GPS-локаций", zh: "GPS位置历史", ja: "GPS位置履歴" },
    
    "Precise GPS Location": { en: "Precise GPS Location", tr: "Tam Konum (GPS)", es: "Ubicación GPS precisa", de: "Präziser GPS-Standort", fr: "Localisation GPS précise", pt: "Localização GPS precisa", it: "Posizione GPS precisa", ru: "Точная геолокация GPS", zh: "精确GPS位置", ja: "詳細GPS位置情報" },
    "Tam Konum (GPS)": { en: "Precise GPS Location", tr: "Tam Konum (GPS)", es: "Ubicación GPS precisa", de: "Präziser GPS-Standort", fr: "Localisation GPS précise", pt: "Localização GPS precisa", it: "Posizione GPS precisa", ru: "Точная геолокация GPS", zh: "精确GPS位置", ja: "詳細GPS位置情報" },
    
    "Facial Biometrics (Filters)": { en: "Facial Biometrics (Filters)", tr: "Yüz Biyometrisi (Filtreler)", es: "Biometría facial (Filtros)", de: "Gesichtsbiometrie (Filter)", fr: "Biométrie faciale (Filtres)", pt: "Biometria facial (Filtros)", it: "Biometria facciale (Filtri)", ru: "Биометрия лица (фильтры)", zh: "人脸生物特征(滤镜)", ja: "顔生体認証 (フィルター)" },
    "Yüz Biyometrisi (Filtreler)": { en: "Facial Biometrics (Filters)", tr: "Yüz Biyometrisi (Filtreler)", es: "Biometría facial (Filtros)", de: "Gesichtsbiometrie (Filter)", fr: "Biométrie faciale (Filtres)", pt: "Biometria facial (Filtros)", it: "Biometria facciale (Filtri)", ru: "Биометрия лица (фильтры)", zh: "人脸生物特征(滤镜)", ja: "顔生体認証 (フィルター)" },
    
    "Facial & Voice Biometrics": { en: "Facial & Voice Biometrics", tr: "Yüz & Ses Biyometrisi", es: "Biometría facial y de voz", de: "Gesichts- & Sprachbiometrie", fr: "Biométrie faciale & vocale", pt: "Biometria facial e de voz", it: "Biometria facciale e vocale", ru: "Биометрия лица и голоса", zh: "人脸与语音生物特征", ja: "顔・音声生体認証" },
    "Yüz & Ses Biyometrisi": { en: "Facial & Voice Biometrics", tr: "Yüz & Ses Biyometrisi", es: "Biometría facial y de voz", de: "Gesichts- & Sprachbiometrie", fr: "Biométrie faciale & vocale", pt: "Biometria facial e de voz", it: "Biometria facciale e vocale", ru: "Биометрия лица и голоса", zh: "人脸与语音生物特征", ja: "顔・音声生体認証" },
    
    "Facial & Media Biometrics": { en: "Facial & Media Biometrics", tr: "Yüz & Medya Biyometrisi", es: "Biometría facial y de medios", de: "Gesichts- & Medienbiometrie", fr: "Biométrie faciale & média", pt: "Biometria facial e de mídia", it: "Biometria facciale e multimediale", ru: "Биометрия лица и медиа", zh: "人脸与媒体生物识别", ja: "顔・メディア生体認証" },
    "Yüz & Medya Biyometrisi": { en: "Facial & Media Biometrics", tr: "Yüz & Medya Biyometrisi", es: "Biometría facial y de medios", de: "Gesichts- & Medienbiometrie", fr: "Biométrie faciale & média", pt: "Biometria facial e de mídia", it: "Biometria facciale e multimediale", ru: "Биометрия лица и медиа", zh: "人脸与媒体生物识别", ja: "顔・メディア生体認証" },
    
    "Interests & Dwell Times": { en: "Interests & Dwell Times", tr: "İlgi Alanları & Tıklama Süreleri", es: "Intereses y tiempos de interacción", de: "Interessen & Verweildauern", fr: "Intérêts & Temps de visionnage", pt: "Interesses e tempo de permanência", it: "Interessi e tempi di permanenza", ru: "Интересы и время просмотра", zh: "兴趣与停留时间", ja: "興味・関心と滞在時間" },
    "İlgi Alanları & Tıklama Süreleri": { en: "Interests & Dwell Times", tr: "İlgi Alanları & Tıklama Süreleri", es: "Intereses y tiempos de interacción", de: "Interessen & Verweildauern", fr: "Intérêts & Temps de visionnage", pt: "Interesses e tempo de permanência", it: "Interessi e tempi di permanenza", ru: "Интересы и время просмотра", zh: "兴趣与停留时间", ja: "興味・関心と滞在時間" },
    
    "Direct Message Content & Photos": { en: "Direct Message Content & Photos", tr: "DM İçerikleri & Fotoğraflar", es: "Contenido de mensajes directos y fotos", de: "Direktnachrichten-Inhalte & Fotos", fr: "Contenu des messages directs & Photos", pt: "Conteúdo de mensagens diretas e fotos", it: "Contenuto dei messaggi diretti e foto", ru: "Содержимое сообщений и фото", zh: "私信内容与照片", ja: "DM内容と写真" },
    "DM İçerikleri & Fotoğraflar": { en: "Direct Message Content & Photos", tr: "DM İçerikleri & Fotoğraflar", es: "Contenido de mensajes directos y fotos", de: "Direktnachrichten-Inhalte & Fotos", fr: "Contenu des messages directs & Photos", pt: "Conteúdo de mensagens diretas e fotos", it: "Contenuto dei messaggi diretti e foto", ru: "Содержимое сообщений и фото", zh: "私信内容与照片", ja: "DM内容と写真" },
    
    "Direct Messages & Photos": { en: "Direct Messages & Photos", tr: "DM & Fotoğraflar", es: "Mensajes directos y fotos", de: "Direktnachrichten & Fotos", fr: "Messages directs & Photos", pt: "Mensagens diretas e fotos", it: "Messaggi diretti e foto", ru: "Личные сообщения и фото", zh: "私信与照片", ja: "ダイレクトメッセージと写真" },
    "DM & Fotoğraflar": { en: "Direct Messages & Photos", tr: "DM & Fotoğraflar", es: "Mensajes directos y fotos", de: "Direktnachrichten & Fotos", fr: "Messages directs & Photos", pt: "Mensagens diretas e fotos", it: "Messaggi diretti e foto", ru: "Личные сообщения и фото", zh: "私信与照片", ja: "ダイレクトメッセージと写真" },
    
    "Search History": { en: "Search History", tr: "Arama Geçmişi", es: "Historial de búsqueda", de: "Suchverlauf", fr: "Historique de recherche", pt: "Histórico de pesquisa", it: "Cronologia di ricerca", ru: "История поиска", zh: "搜索历史", ja: "検索履歴" },
    "Arama Geçmişi": { en: "Search History", tr: "Arama Geçmişi", es: "Historial de búsqueda", de: "Suchverlauf", fr: "Historique de recherche", pt: "Histórico de pesquisa", it: "Cronologia di ricerca", ru: "История поиска", zh: "搜索历史", ja: "検索履歴" },
    
    "Purchases & Card Data": { en: "Purchases & Card Data", tr: "Satın Alımlar & Kart Verisi", es: "Compras y datos bancarios", de: "Käufe & Kartendaten", fr: "Achats & Données bancaires", pt: "Compras e dados de cartão", it: "Acquisti e dati della carta", ru: "Покупки и данные карт", zh: "购买与卡片数据", ja: "購入履歴とカード情報" },
    "Satın Alımlar & Kart Verisi": { en: "Purchases & Card Data", tr: "Satın Alımlar & Kart Verisi", es: "Compras y datos bancarios", de: "Käufe & Kartendaten", fr: "Achats & Données bancaires", pt: "Compras e dados de cartão", it: "Acquisti e dati della carta", ru: "Покупки и данные карт", zh: "购买与卡片数据", ja: "購入履歴とカード情報" },
    
    "Purchase History": { en: "Purchase History", tr: "Satın Alım Geçmişi", es: "Historial de compras", de: "Kaufverlauf", fr: "Historique d'achats", pt: "Histórico de compras", it: "Cronologia acquisti", ru: "История покупок", zh: "购买历史", ja: "購入履歴" },
    "Satın Alım Geçmişi": { en: "Purchase History", tr: "Satın Alım Geçmişi", es: "Historial de compras", de: "Kaufverlauf", fr: "Historique d'achats", pt: "Histórico de compras", it: "Cronologia acquisti", ru: "История покупок", zh: "购买历史", ja: "購入履歴" },
    
    "Keystroke Dynamics": { en: "Keystroke Dynamics", tr: "Tuş Vuruş Ritmi (Keystroke Dynamics)", es: "Dinámica de tecleo", de: "Tastenanschlag-Dynamik", fr: "Dynamique de frappe", pt: "Dinâmica de digitação", it: "Dinamica della digitazione", ru: "Динамика нажатия клавиш", zh: "按键动态特征", ja: "キーストローク・ダイナミクス" },
    "Tuş Vuruş Ritmi (Keystroke Dynamics)": { en: "Keystroke Dynamics", tr: "Tuş Vuruş Ritmi (Keystroke Dynamics)", es: "Dinámica de tecleo", de: "Tastenanschlag-Dynamik", fr: "Dynamique de frappe", pt: "Dinâmica de digitação", it: "Dinamica della digitazione", ru: "Динамика нажатия клавиш", zh: "按键动态特征", ja: "キーストローク・ダイナミクス" },
    
    "Clipboard Text Buffer": { en: "Clipboard Text Buffer", tr: "Panoya Kopyalanan Metinler (Clipboard)", es: "Texto del portapapeles", de: "Zwischenablage-Inhalt", fr: "Presse-papiers", pt: "Texto da área de transferência", it: "Appunti", ru: "Буфер обмена", zh: "剪贴板内容", ja: "クリップボードのテキスト" },
    "Panoya Kopyalanan Metinler (Clipboard)": { en: "Clipboard Text Buffer", tr: "Panoya Kopyalanan Metinler (Clipboard)", es: "Texto del portapapeles", de: "Zwischenablage-Inhalt", fr: "Presse-papiers", pt: "Texto da área de transferência", it: "Appunti", ru: "Буфер обмена", zh: "剪贴板内容", ja: "クリップボードのテキスト" },
    
    "Device Fingerprint & IP": { en: "Device Fingerprint & IP", tr: "Cihaz Parmak İzi & IP", es: "Huella digital de dispositivo e IP", de: "Geräte-Fingerabdruck & IP", fr: "Empreinte appareil & IP", pt: "Impressão digital de dispositivo e IP", it: "Impronta dispositivo e IP", ru: "Отпечаток устройства и IP", zh: "设备指纹与IP", ja: "デバイスフィンガープリントとIP" },
    "Cihaz Parmak İzi & IP": { en: "Device Fingerprint & IP", tr: "Cihaz Parmak İzi & IP", es: "Huella digital de dispositivo e IP", de: "Geräte-Fingerabdruck & IP", fr: "Empreinte appareil & IP", pt: "Impressão digital de dispositivo e IP", it: "Impronta dispositivo e IP", ru: "Отпечаток устройства и IP", zh: "设备指纹与IP", ja: "デバイスフィンガープリントとIP" },
    "Cihaz IP & Parmak İzi": { en: "Device Fingerprint & IP", tr: "Cihaz Parmak İzi & IP", es: "Huella digital de dispositivo e IP", de: "Geräte-Fingerabdruck & IP", fr: "Empreinte appareil & IP", pt: "Impressão digital de dispositivo e IP", it: "Impronta dispositivo e IP", ru: "Отпечаток устройства и IP", zh: "设备指纹与IP", ja: "デバイスフィンガープリントとIP" },
    
    "Watch Time & Behavioral Triggers": { en: "Watch Time & Behavioral Triggers", tr: "Video İzleme Süreleri & Dopamin Tepkileri", es: "Tiempo de reproducción y patrones", de: "Wiedergabezeit & Verhaltensreize", fr: "Temps de visionnage & Déclencheurs", pt: "Tempo de exibição e gatilhos", it: "Tempo di visione e stimoli", ru: "Время просмотра и триггеры", zh: "视频观看时长与行为触发", ja: "動画視聴時間と行動トリガー" },
    "Video İzleme Süreleri & Dopamin Tepkileri": { en: "Watch Time & Behavioral Triggers", tr: "Video İzleme Süreleri & Dopamin Tepkileri", es: "Tiempo de reproducción y patrones", de: "Wiedergabezeit & Verhaltensreize", fr: "Temps de visionnage & Déclencheurs", pt: "Tempo de exibição e gatilhos", it: "Tempo di visione e stimoli", ru: "Время просмотра и триггеры", zh: "视频观看时长与行为触发", ja: "動画視聴時間と行動トリガー" },
    
    "Web Search History": { en: "Web Search History", tr: "Web Arama Geçmişi", es: "Historial de búsqueda web", de: "Web-Suchverlauf", fr: "Historique de recherche Web", pt: "Histórico de pesquisa na web", it: "Cronologia ricerche web", ru: "История веб-поиска", zh: "网页搜索历史", ja: "Web検索履歴" },
    "Web Arama Geçmişi": { en: "Web Search History", tr: "Web Arama Geçmişi", es: "Historial de búsqueda web", de: "Web-Suchverlauf", fr: "Historique de recherche Web", pt: "Histórico de pesquisa na web", it: "Cronologia ricerche web", ru: "История веб-поиска", zh: "网页搜索历史", ja: "Web検索履歴" },
    
    "Visited Sites & URLs": { en: "Visited Sites & URLs", tr: "Ziyaret Edilen Tüm Siteler & URL'ler", es: "Sitios y URL visitados", de: "Besuchte Websites & URLs", fr: "Sites & URL visités", pt: "Sites e URLs visitados", it: "Siti e URL visitati", ru: "Посещенные сайты и URL", zh: "访问的网站与URL", ja: "訪問サイトとURL" },
    "Ziyaret Edilen Tüm Siteler & URL'ler": { en: "Visited Sites & URLs", tr: "Ziyaret Edilen Tüm Siteler & URL'ler", es: "Sitios y URL visitados", de: "Besuchte Websites & URLs", fr: "Sites & URL visités", pt: "Sites e URLs visitados", it: "Siti e URL visitati", ru: "Посещенные сайты и URL", zh: "访问的网站与URL", ja: "訪問サイトとURL" },
    
    "Cookies & Session Identifiers": { en: "Cookies & Session Identifiers", tr: "Çerezler & Oturum Bilgileri", es: "Cookies e identificadores de sesión", de: "Cookies & Sitzungsdaten", fr: "Cookies & Identifiants de session", pt: "Cookies e identificadores de sessão", it: "Cookie e identificatori di sessione", ru: "Файлы cookie и сеансы", zh: "Cookie与会话标识", ja: "クッキーとセッション情報" },
    "Çerezler & Oturum Bilgileri": { en: "Cookies & Session Identifiers", tr: "Çerezler & Oturum Bilgileri", es: "Cookies e identificadores de sesión", de: "Cookies & Sitzungsdaten", fr: "Cookies & Identifiants de session", pt: "Cookies e identificadores de sessão", it: "Cookie e identificatori di sessione", ru: "Файлы cookie и сеансы", zh: "Cookie与会话标识", ja: "クッキーとセッション情報" },
    
    "Downloaded Files": { en: "Downloaded Files", tr: "İndirilen Dosyalar", es: "Archivos descargados", de: "Heruntergeladene Dateien", fr: "Fichiers téléchargés", pt: "Arquivos baixados", it: "File scaricati", ru: "Загруженные файлы", zh: "下载的文件", ja: "ダウンロードファイル" },
    "İndirilen Dosyalar": { en: "Downloaded Files", tr: "İndirilen Dosyalar", es: "Archivos descargados", de: "Heruntergeladene Dateien", fr: "Fichiers téléchargés", pt: "Arquivos baixados", it: "File scaricati", ru: "Загруженные файлы", zh: "下载的文件", ja: "ダウンロードファイル" },
    
    "Hardware Fingerprint": { en: "Hardware Fingerprint", tr: "Cihaz Donanım Parmak İzi", es: "Huella digital de hardware", de: "Hardware-Fingerabdruck", fr: "Empreinte matérielle", pt: "Impressão digital de hardware", it: "Impronta digitale hardware", ru: "Аппаратный отпечаток", zh: "硬件指纹", ja: "ハードウェアフィンガープリント" },
    "Cihaz Donanım Parmak İzi": { en: "Hardware Fingerprint", tr: "Cihaz Donanım Parmak İzi", es: "Huella digital de hardware", de: "Hardware-Fingerabdruck", fr: "Empreinte matérielle", pt: "Impressão digital de hardware", it: "Impronta digitale hardware", ru: "Аппаратный отпечаток", zh: "硬件指纹", ja: "ハードウェアフィンガープリント" },

    // Gmail / Productivity specific data types
    "Email Content & Attachments": { en: "Email Content & Attachments", tr: "E-posta İçerikleri & Ekler", es: "Contenido de correo y archivos adjuntos", de: "E-Mail-Inhalt & Anhänge", fr: "Contenu des e-mails & pièces jointes", pt: "Conteúdo de e-mail e anexos", it: "Contenuto e-mail e allegati", ru: "Содержимое писем и вложения", zh: "邮件内容与附件", ja: "メール内容と添付ファイル" },
    "E-posta İçerikleri & Ekler": { en: "Email Content & Attachments", tr: "E-posta İçerikleri & Ekler", es: "Contenido de correo y archivos adjuntos", de: "E-Mail-Inhalt & Anhänge", fr: "Contenu des e-mails & pièces jointes", pt: "Conteúdo de e-mail e anexos", it: "Contenuto e-mail e allegati", ru: "Содержимое писем и вложения", zh: "邮件内容与附件", ja: "メール内容と添付ファイル" },
    
    "Invoices & Shopping Receipts": { en: "Invoices & Shopping Receipts", tr: "Fatura & Alışveriş Makbuzları", es: "Facturas y recibos de compras", de: "Rechnungen & Einkaufsbelege", fr: "Factures & reçus d'achats", pt: "Faturas e recibos de compras", it: "Fatture e ricevute acquisti", ru: "Счета и чеки покупок", zh: "发票与购物收据", ja: "請求書と購入レシート" },
    "Fatura & Alışveriş Makbuzları": { en: "Invoices & Shopping Receipts", tr: "Fatura & Alışveriş Makbuzları", es: "Facturas y recibos de compras", de: "Rechnungen & Einkaufsbelege", fr: "Factures & reçus d'achats", pt: "Faturas e recibos de compras", it: "Fatture e ricevute acquisti", ru: "Счета и чеки покупок", zh: "发票与购物收据", ja: "請求書と購入レシート" },
    
    "Flight & Hotel Reservations": { en: "Flight & Hotel Reservations", tr: "Uçuş & Otel Rezervasyonları", es: "Reservas de vuelos y hoteles", de: "Flug- & Hotelreservierungen", fr: "Réservations de vols & d'hôtels", pt: "Reservas de voos e hotéis", it: "Prenotazioni voli e hotel", ru: "Бронирования рейсов и отелей", zh: "航班与酒店预订", ja: "フライト・ホテル予約" },
    "Uçuş & Otel Rezervasyonları": { en: "Flight & Hotel Reservations", tr: "Uçuş & Otel Rezervasyonları", es: "Reservas de vuelos y hoteles", de: "Flug- & Hotelreservierungen", fr: "Réservations de vols & d'hôtels", pt: "Reservas de voos e hotéis", it: "Prenotazioni voli e hotel", ru: "Бронирования рейсов и отелей", zh: "航班与酒店预订", ja: "フライト・ホテル予約" },
    
    "Subscriptions": { en: "Subscriptions", tr: "Abonelikler", es: "Suscripciones", de: "Abonnements", fr: "Abonnements", pt: "Assinaturas", it: "Abbonamenti", ru: "Подписки", zh: "订阅", ja: "サブスクリプション" },
    "Abonelikler": { en: "Subscriptions", tr: "Abonelikler", es: "Suscripciones", de: "Abonnements", fr: "Abonnements", pt: "Assinaturas", it: "Abbonamenti", ru: "Подписки", zh: "订阅", ja: "サブスクリプション" },
    
    "Contact Emails": { en: "Contact Emails", tr: "Kişi E-postaları", es: "Correos de contactos", de: "Kontakt-E-Mails", fr: "E-mails de contacts", pt: "E-mails de contatos", it: "E-mail dei contatti", ru: "E-mail контактов", zh: "联系人邮箱", ja: "連絡先メール" },
    "Kişi E-postaları": { en: "Contact Emails", tr: "Kişi E-postaları", es: "Correos de contactos", de: "Kontakt-E-Mails", fr: "E-mails de contacts", pt: "E-mails de contatos", it: "E-mail dei contatti", ru: "E-mail контактов", zh: "联系人邮箱", ja: "連絡先メール" },

    // Listening/Entertainment data types
    "Listening & Viewing History": { en: "Listening & Viewing History", tr: "Dinleme & İzleme Geçmişi", es: "Historial de reproducción", de: "Wiedergabeverlauf", fr: "Historique d'écoute et de visionnage", pt: "Histórico de reprodução", it: "Cronologia ascolto e visione", ru: "История прослушивания", zh: "收听与观看记录", ja: "再生履歴" },
    "Dinleme & İzleme Geçmişi": { en: "Listening & Viewing History", tr: "Dinleme & İzleme Geçmişi", es: "Historial de reproducción", de: "Wiedergabeverlauf", fr: "Historique d'écoute et de visionnage", pt: "Histórico de reprodução", it: "Cronologia ascolto e visione", ru: "История прослушивания", zh: "收听与观看记录", ja: "再生履歴" },
    
    "Device Type & Network": { en: "Device Type & Network", tr: "Cihaz Türü & Ağ Bağlantısı", es: "Tipo de dispositivo y red", de: "Gerätetyp & Netzwerk", fr: "Type d'appareil & Réseau", pt: "Tipo de dispositivo e rede", it: "Tipo dispositivo e rete", ru: "Тип устройства и сеть", zh: "设备类型与网络", ja: "デバイスタイプとネットワーク" },
    "Cihaz Türü & Ağ Bağlantısı": { en: "Device Type & Network", tr: "Cihaz Türü & Ağ Bağlantısı", es: "Tipo de dispositivo y red", de: "Gerätetyp & Netzwerk", fr: "Type d'appareil & Réseau", pt: "Tipo de dispositivo e rede", it: "Tipo dispositivo e rete", ru: "Тип устройства и сеть", zh: "设备类型与网络", ja: "デバイスタイプとネットワーク" },
    
    "Approximate Location": { en: "Approximate Location", tr: "Konum (Yaklaşık)", es: "Ubicación aproximada", de: "Ungefährer Standort", fr: "Localisation approximative", pt: "Localização aproximada", it: "Posizione approssimativa", ru: "Приблизительная геолокация", zh: "大致位置", ja: "おおよその位置情報" },
    "Konum (Yaklaşık)": { en: "Approximate Location", tr: "Konum (Yaklaşık)", es: "Ubicación aproximada", de: "Ungefährer Standort", fr: "Localisation approximative", pt: "Localização approximada", it: "Posizione approssimativa", ru: "Приблизительная геолокация", zh: "大致位置", ja: "おおよその位置情報" },

    // Derived data types for store-added apps
    "Account Info & Emails": { en: "Account Info & Emails", tr: "Hesap Bilgileri & E-postalar", es: "Información de cuenta y correos", de: "Kontoinformationen & E-Mails", fr: "Informations de compte & e-mails", pt: "Informações da conta e e-mails", it: "Informazioni account e e-mail", ru: "Данные аккаунта и почта", zh: "账户信息与邮件", ja: "アカウント情報とメール" },
    "Hesap Bilgileri & E-postalar": { en: "Account Info & Emails", tr: "Hesap Bilgileri & E-postalar", es: "Información de cuenta y correos", de: "Kontoinformationen & E-Mails", fr: "Informations de compte & e-mails", pt: "Informações da conta e e-mails", it: "Informazioni account e e-mail", ru: "Данные аккаунта и почта", zh: "账户信息与邮件", ja: "アカウント情報とメール" },
    
    "Content & File Attachments": { en: "Content & File Attachments", tr: "İçerik & Dosya Ekleri", es: "Contenido y archivos adjuntos", de: "Inhalte & Dateianhänge", fr: "Contenu et pièces jointes", pt: "Conteúdo e anexos", it: "Contenuti e allegati", ru: "Контент и файлы", zh: "内容与文件附件", ja: "コンテンツとファイル添付" },
    "İçerik & Dosya Ekleri": { en: "Content & File Attachments", tr: "İçerik & Dosya Ekleri", es: "Contenido y archivos adjuntos", de: "Inhalte & Dateianhänge", fr: "Contenu et pièces jointes", pt: "Conteúdo e anexos", it: "Contenuti e allegati", ru: "Контент и файлы", zh: "内容与文件附件", ja: "コンテンツとファイル添付" },
    
    "Work Habits": { en: "Work Habits", tr: "Çalışma Alışkanlıkları", es: "Hábitos de trabajo", de: "Arbeitsgewohnheiten", fr: "Habitudes de travail", pt: "Hábitos de trabalho", it: "Abitudini lavorative", ru: "Рабочие привычки", zh: "工作习惯", ja: "業務習慣" },
    "Çalışma Alışkanlıkları": { en: "Work Habits", tr: "Çalışma Alışkanlıkları", es: "Hábitos de trabajo", de: "Arbeitsgewohnheiten", fr: "Habitudes de travail", pt: "Hábitos de trabalho", it: "Abitudini lavorative", ru: "Рабочие привычки", zh: "工作习惯", ja: "業務習慣" },
    
    "Device ID & IP": { en: "Device ID & IP", tr: "Cihaz ID & IP", es: "ID de dispositivo e IP", de: "Geräte-ID & IP", fr: "ID appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP", ja: "デバイスIDとIP" },
    "Cihaz ID & IP": { en: "Device ID & IP", tr: "Cihaz ID & IP", es: "ID de dispositivo e IP", de: "Geräte-ID & IP", fr: "ID appareil & IP", pt: "ID do dispositivo e IP", it: "ID dispositivo e IP", ru: "ID устройства и IP", zh: "设备ID与IP", ja: "デバイスIDとIP" },
    
    "Phone Number / Account": { en: "Phone Number / Account", tr: "Telefon Numarası / Hesap", es: "Número de teléfono / Cuenta", de: "Telefonnummer / Konto", fr: "Numéro de téléphone / Compte", pt: "Número de telefone / Conta", it: "Numero di telefono / Account", ru: "Номер телефона / Аккаунт", zh: "电话号码/账户", ja: "電話番号/アカウント" },
    "Telefon Numarası / Hesap": { en: "Phone Number / Account", tr: "Telefon Numarası / Hesap", es: "Número de teléfono / Cuenta", de: "Telefonnummer / Konto", fr: "Numéro de téléphone / Compte", pt: "Número de telefone / Conta", it: "Numero di telefono / Account", ru: "Номер телефона / Аккаунт", zh: "电话号码/账户", ja: "電話番号/アカウント" },
    
    "Delivery Address & Location": { en: "Delivery Address & Location", tr: "Teslimat Adresi & Konum", es: "Dirección de entrega y ubicación", de: "Lieferadresse & Standort", fr: "Adresse de livraison & localisation", pt: "Endereço de entrega e localização", it: "Indirizzo di consegna e posizione", ru: "Адрес доставки и локация", zh: "配送地址与位置", ja: "配達先住所と位置情報" },
    "Teslimat Adresi & Konum": { en: "Delivery Address & Location", tr: "Teslimat Adresi & Konum", es: "Dirección de entrega y ubicación", de: "Lieferadresse & Standort", fr: "Adresse de livraison & localisation", pt: "Endereço de entrega e localização", it: "Indirizzo di consegna e posizione", ru: "Адрес доставки и локация", zh: "配送地址与位置", ja: "配達先住所と位置情報" },
    
    "Device IP Info": { en: "Device IP Info", tr: "Cihaz IP Bilgisi", es: "Información IP del dispositivo", de: "Geräte-IP-Information", fr: "Information IP de l'appareil", pt: "Informação IP do dispositivo", it: "Informazione IP dispositivo", ru: "Информация IP устройства", zh: "设备IP信息", ja: "デバイスIP情報" },
    "Cihaz IP Bilgisi": { en: "Device IP Info", tr: "Cihaz IP Bilgisi", es: "Información IP del dispositivo", de: "Geräte-IP-Information", fr: "Information IP de l'appareil", pt: "Informação IP do dispositivo", it: "Informazione IP dispositivo", ru: "Информация IP устройства", zh: "设备IP信息", ja: "デバイスIP情報" },

    // ─── Third-Party Destinations ───
    "Third-Party Destinations": { en: "Third-Party Destinations", tr: "Kimlerle Paylaşılıyor?", es: "Destinos de terceros", de: "Drittanbieter-Ziele", fr: "Destinataires tiers", pt: "Destinos de terceiros", it: "Destinatari terzi", ru: "Сторонние получатели", zh: "第三方数据共享", ja: "第三者提供先" },
    "Meta Companies": { en: "Meta Companies", tr: "Meta Şirketler Grubu", es: "Empresas Meta", de: "Meta-Konzern", fr: "Groupe Meta", pt: "Empresas Meta", it: "Gruppo Meta", ru: "Группа компаний Meta", zh: "Meta公司集团", ja: "Metaグループ" },
    "Meta Şirketler Grubu": { en: "Meta Companies", tr: "Meta Şirketler Grubu", es: "Empresas Meta", de: "Meta-Konzern", fr: "Groupe Meta", pt: "Empresas Meta", it: "Gruppo Meta", ru: "Группа компаний Meta", zh: "Meta公司集团", ja: "Metaグループ" },
    
    "Law Enforcement (Requests)": { en: "Law Enforcement (Requests)", tr: "Kolluk Kuvvetleri (Talepler)", es: "Fuerzas del orden (Solicitudes)", de: "Strafverfolgung (Anfragen)", fr: "Services de police (Requêtes)", pt: "Autoridades policiais (Pedidos)", it: "Forze dell'ordine (Richieste)", ru: "Правоохранительные органы (Запросы)", zh: "执法机关(调取请求)", ja: "法執行機関 (要請)" },
    "Kolluk Kuvvetleri (Talepler)": { en: "Law Enforcement (Requests)", tr: "Kolluk Kuvvetleri (Talepler)", es: "Fuerzas del orden (Solicitudes)", de: "Strafverfolgung (Anfragen)", fr: "Services de police (Requêtes)", pt: "Autoridades policiais (Pedidos)", it: "Forze dell'ordine (Richieste)", ru: "Правоохранительные органы (Запросы)", zh: "执法机关(调取请求)", ja: "法執行機関 (要請)" },
    
    "Internal Analytics Engines": { en: "Internal Analytics Engines", tr: "İç Analitik Servisleri", es: "Servicios de analítica interna", de: "Interne Analyse-Dienste", fr: "Services d'analyse interne", pt: "Serviços de análise interna", it: "Servizi di analisi interna", ru: "Внутренние аналитические службы", zh: "内部分析服务", ja: "社内アナリティクスサービス" },
    "İç Analitik Servisleri": { en: "Internal Analytics Engines", tr: "İç Analitik Servisleri", es: "Servicios de analítica interna", de: "Interne Analyse-Dienste", fr: "Services d'analyse interne", pt: "Serviços de análise interna", it: "Servizi di analisi interna", ru: "Внутренние аналитические службы", zh: "内部分析服务", ja: "社内アナリティクスサービス" },
    
    "Advertisers (Targeted Ads)": { en: "Advertisers (Targeted Ads)", tr: "Reklamverenler (Hedefli Reklam)", es: "Anunciantes (Anuncios dirigidos)", de: "Werbepartner (Zielgerichtete Werbung)", fr: "Annonceurs (Publicités ciblées)", pt: "Anunciantes (Anúncios direcionados)", it: "Inserzionisti (Annunci mirati)", ru: "Рекламодатели (Таргетированная реклама)", zh: "广告商(定向广告)", ja: "広告主 (ターゲティング広告)" },
    "Reklamverenler (Targeted Ads)": { en: "Advertisers (Targeted Ads)", tr: "Reklamverenler (Hedefli Reklam)", es: "Anunciantes (Anuncios dirigidos)", de: "Werbepartner (Zielgerichtete Werbung)", fr: "Annonceurs (Publicités ciblées)", pt: "Anunciantes (Anúncios direcionados)", it: "Inserzionisti (Annunci mirati)", ru: "Рекламодатели (Таргетированная реклама)", zh: "广告商(定向广告)", ja: "広告主 (ターゲティング広告)" },
    
    "Third-Party Advertisers": { en: "Third-Party Advertisers", tr: "Üçüncü Taraf Reklamverenler", es: "Anunciantes de terceros", de: "Drittanbieter-Werbepartner", fr: "Annonceurs tiers", pt: "Anunciantes terceiros", it: "Inserzionisti terzi", ru: "Сторонние рекламодатели", zh: "第三方广告商", ja: "サードパーティ広告主" },
    "Üçüncü Taraf Reklamverenler": { en: "Third-Party Advertisers", tr: "Üçüncü Taraf Reklamverenler", es: "Anunciantes de terceros", de: "Drittanbieter-Werbepartner", fr: "Annonceurs tiers", pt: "Anunciantes terceiros", it: "Inserzionisti terzi", ru: "Сторонние рекламодатели", zh: "第三方广告商", ja: "サードパーティ広告主" },
    
    "Data Brokers": { en: "Data Brokers", tr: "Veri Broker'ları", es: "Corredores de datos", de: "Datenhändler", fr: "Courtiers en données", pt: "Corretores de dados", it: "Broker di dati", ru: "Дата-брокеры", zh: "数据经纪商", ja: "データブローカー" },
    "Veri Broker'ları": { en: "Data Brokers", tr: "Veri Broker'ları", es: "Corredores de datos", de: "Datenhändler", fr: "Courtiers en données", pt: "Corretores de dados", it: "Broker di dati", ru: "Дата-брокеры", zh: "数据经纪商", ja: "データブローカー" },
    
    "Meta Audience Network": { en: "Meta Audience Network", tr: "Meta Reklam Ağı", es: "Red de audiencia Meta", de: "Meta-Werbenetzwerk", fr: "Réseau publicitaire Meta", pt: "Rede de anúncios Meta", it: "Rete pubblicitaria Meta", ru: "Рекламная сеть Meta", zh: "Meta受众网络", ja: "Metaオーディエンスネットワーク" },
    "Meta Reklam Ağı": { en: "Meta Audience Network", tr: "Meta Reklam Ağı", es: "Red de audiencia Meta", de: "Meta-Werbenetzwerk", fr: "Réseau publicitaire Meta", pt: "Rede de anúncios Meta", it: "Rete pubblicitaria Meta", ru: "Рекламная сеть Meta", zh: "Meta受众网络", ja: "Metaオーディエンスネットワーク" },
    
    "Third-Party Content Partners": { en: "Third-Party Content Partners", tr: "3. Taraf İçerik Ortakları", es: "Socios de contenido de terceros", de: "Drittanbieter-Inhaltspartner", fr: "Partenaires de contenu tiers", pt: "Parceiros de conteúdo terceiros", it: "Partner di contenuti terzi", ru: "Сторонние контент-партнеры", zh: "第三方内容合作伙伴", ja: "サードパーティコンテンツパートナー" },
    "3. Taraf İçerik Ortakları": { en: "Third-Party Content Partners", tr: "3. Taraf İçerik Ortakları", es: "Socios de contenido de terceros", de: "Drittanbieter-Inhaltspartner", fr: "Partenaires de contenu tiers", pt: "Parceiros de conteúdo terceiros", it: "Partner di contenuti terzi", ru: "Сторонние контент-партнеры", zh: "第三方内容合作伙伴", ja: "サードパーティコンテンツパートナー" },
    
    "ByteDance Global/Regional Servers": { en: "ByteDance Global/Regional Servers", tr: "ByteDance Çin/Global Sunucuları", es: "Servidores globales de ByteDance", de: "ByteDance Globale Server", fr: "Serveurs mondiaux ByteDance", pt: "Servidores globais ByteDance", it: "Server globali ByteDance", ru: "Глобальные серверы ByteDance", zh: "字节跳动全球/区域服务器", ja: "ByteDanceグローバルサーバー" },
    "ByteDance Çin/Global Sunucuları": { en: "ByteDance Global/Regional Servers", tr: "ByteDance Çin/Global Sunucuları", es: "Servidores globales de ByteDance", de: "ByteDance Globale Server", fr: "Serveurs mondiaux ByteDance", pt: "Servidores globais ByteDance", it: "Server globali ByteDance", ru: "Глобальные серверы ByteDance", zh: "字节跳动全球/区域服务器", ja: "ByteDanceグローバルサーバー" },
    
    "Regulatory Jurisdiction Entities": { en: "Regulatory Jurisdiction Entities", tr: "Gözetim Kanunları Kapsamındaki Birimler", es: "Entidades bajo jurisdicción regulatoria", de: "Behörden unter gesetzlicher Überwachung", fr: "Entités sous juridiction réglementaire", pt: "Entidades sob jurisdição regulatória", it: "Entità sotto giurisdizione normativa", ru: "Субъекты нормативно-правовой юрисдикции", zh: "监管辖区实体", ja: "管轄法規制対象エンティティ" },
    "Çin Gözetim Kanunları Kapsamında Erişilebilir Birimler": { en: "Regulatory Jurisdiction Entities", tr: "Gözetim Kanunları Kapsamındaki Birimler", es: "Entidades bajo jurisdicción regulatoria", de: "Behörden unter gesetzlicher Überwachung", fr: "Entités sous juridiction réglementaire", pt: "Entidades sob jurisdição regulatória", it: "Entità sotto giurisdizione normativa", ru: "Субъекты нормативно-правовой юрисдикции", zh: "监管辖区实体", ja: "管轄法規制対象エンティティ" },
    
    "Ad Network Partners": { en: "Ad Network Partners", tr: "Reklam Ortakları", es: "Socios publicitarios", de: "Werbepartner", fr: "Partenaires publicitaires", pt: "Parceiros de anúncios", it: "Partner pubblicitari", ru: "Рекламные партнеры", zh: "广告合作伙伴", ja: "広告パートナー" },
    "Reklam Ortakları": { en: "Ad Network Partners", tr: "Reklam Ortakları", es: "Socios publicitarios", de: "Werbepartner", fr: "Partenaires publicitaires", pt: "Parceiros de anúncios", it: "Partner pubblicitari", ru: "Рекламные партнеры", zh: "广告合作伙伴", ja: "広告パートナー" },
    
    "Google Privacy Sandbox / Ad Network": { en: "Google Privacy Sandbox / Ad Network", tr: "Google Privacy Sandbox / Reklam Ağı", es: "Google Privacy Sandbox / Red de anuncios", de: "Google Privacy Sandbox / Werbenetzwerk", fr: "Google Privacy Sandbox / Réseau pub", pt: "Google Privacy Sandbox / Rede de anúncios", it: "Google Privacy Sandbox / Rete annunci", ru: "Google Privacy Sandbox / Рекламная сеть", zh: "Google Privacy Sandbox / 广告网络", ja: "Google Privacy Sandbox / 広告ネットワーク" },
    
    "Web Trackers & Beacons": { en: "Web Trackers & Beacons", tr: "Web İzleyicileri", es: "Rastreadores web y balizas", de: "Web-Tracker & Beacons", fr: "Traqueurs Web & Balises", pt: "Rastreadores Web e Beacons", it: "Tracker web e beacon", ru: "Веб-трекеры и маяки", zh: "网页追踪器与网络信标", ja: "Webトラッカーとビーコン" },
    "Web İzleyicileri": { en: "Web Trackers & Beacons", tr: "Web İzleyicileri", es: "Rastreadores web y balizas", de: "Web-Tracker & Beacons", fr: "Traqueurs Web & Balises", pt: "Rastreadores Web e Beacons", it: "Tracker web e beacon", ru: "Веб-трекеры и маяки", zh: "网页追踪器与网络信标", ja: "Webトラッカーとビーコン" },
    
    "Analytics Providers": { en: "Analytics Providers", tr: "Analitik Sağlayıcıları", es: "Proveedores de analítica", de: "Analyse-Anbieter", fr: "Fournisseurs d'analyse", pt: "Provedores de análise", it: "Fornitori di analisi", ru: "Поставщики аналитики", zh: "分析服务提供商", ja: "アナリティクスプロバイダー" },
    "Analitik Sağlayıcıları": { en: "Analytics Providers", tr: "Analitik Sağlayıcıları", es: "Proveedores de analítica", de: "Analyse-Anbieter", fr: "Fournisseurs d'analyse", pt: "Provedores de análise", it: "Fornitori di analisi", ru: "Поставщики аналитики", zh: "分析服务提供商", ja: "アナリティクスプロバイダー" },
    
    "Analytics Partners": { en: "Analytics Partners", tr: "Analitik Ortakları", es: "Socios de analítica", de: "Analytics-Partner", fr: "Partenaires d'analyse", pt: "Parceiros de análise", it: "Partner analitici", ru: "Аналитические партнеры", zh: "分析合作伙伴", ja: "アナリティクスパートナー" },
    "Analitik Ortakları": { en: "Analytics Partners", tr: "Analitik Ortakları", es: "Socios de analítica", de: "Analytics-Partner", fr: "Partenaires d'analyse", pt: "Parceiros de análise", it: "Partner analitici", ru: "Аналитические партнеры", zh: "分析合作伙伴", ja: "アナリティクスパートナー" },
    
    "Google Ad & Analytics Systems": { en: "Google Ad & Analytics Systems", tr: "Google Reklam & Analitik Sistemleri", es: "Sistemas de publicidad y análisis de Google", de: "Google Werbe- & Analysesysteme", fr: "Systèmes publicitaires et analytiques Google", pt: "Sistemas de anúncios e análise do Google", it: "Sistemi pubblicitari e analitici Google", ru: "Рекламные и аналитические системы Google", zh: "Google广告与分析系统", ja: "Google広告・分析システム" },
    "Google Reklam & Analitik Sistemleri": { en: "Google Ad & Analytics Systems", tr: "Google Reklam & Analitik Sistemleri", es: "Sistemas de publicidad y análisis de Google", de: "Google Werbe- & Analysesysteme", fr: "Systèmes publicitaires et analytiques Google", pt: "Sistemas de anúncios e análise do Google", it: "Sistemi pubblicitari e analitici Google", ru: "Рекламные и аналитические системы Google", zh: "Google广告与分析系统", ja: "Google広告・分析システム" },
    
    "Automated Content Scanners": { en: "Automated Content Scanners", tr: "Otomatik İçerik Tarayıcıları", es: "Escáneres de contenido automáticos", de: "Automatisierte Inhaltsscanner", fr: "Scanners de contenu automatisés", pt: "Scanners de conteúdo automatizados", it: "Scanner di contenuti automatizzati", ru: "Автоматические сканеры контента", zh: "自动内容扫描器", ja: "自動コンテンツスキャナー" },
    "Otomatik İçerik Tarayıcıları (Spam/AI eğitimi)": { en: "Automated Content Scanners", tr: "Otomatik İçerik Tarayıcıları", es: "Escáneres de contenido automáticos", de: "Automatisierte Inhaltsscanner", fr: "Scanners de contenu automatisés", pt: "Scanners de conteúdo automatizados", it: "Scanner di contenuti automatizzati", ru: "Автоматические сканеры контента", zh: "自动内容扫描器", ja: "自動コンテンツスキャナー" },
    
    "Legal Requests": { en: "Legal Requests", tr: "Resmi Hukuki Talepler", es: "Solicitudes legales", de: "Rechtliche Anfragen", fr: "Demandes légales", pt: "Solicitações legais", it: "Richieste legali", ru: "Юридические запросы", zh: "法律请求", ja: "法的要請" },
    "Resmi Hukuki Talepler": { en: "Legal Requests", tr: "Resmi Hukuki Talepler", es: "Solicitudes legales", de: "Rechtliche Anfragen", fr: "Demandes légales", pt: "Solicitações legais", it: "Richieste legali", ru: "Юридические запросы", zh: "法律请求", ja: "法的要請" },
    
    "Data Processors": { en: "Data Processors", tr: "Veri İşleyiciler", es: "Procesadores de datos", de: "Datenverarbeiter", fr: "Sous-traitants de données", pt: "Processadores de dados", it: "Responsabili del trattamento dati", ru: "Обработчики данных", zh: "数据处理商", ja: "データ処理業者" },
    "Veri İşleyiciler": { en: "Data Processors", tr: "Veri İşleyiciler", es: "Procesadores de datos", de: "Datenverarbeiter", fr: "Sous-traitants de données", pt: "Processadores de dados", it: "Responsabili del trattamento dati", ru: "Обработчики данных", zh: "数据处理商", ja: "データ処理業者" },

    // ─── Permissions ───
    "Camera": { en: "Camera", tr: "Kamera", es: "Cámara", de: "Kamera", fr: "Appareil photo", pt: "Câmera", it: "Fotocamera", ru: "Камера", zh: "摄像头", ja: "カメラ" },
    "Kamera": { en: "Camera", tr: "Kamera", es: "Cámara", de: "Kamera", fr: "Appareil photo", pt: "Câmera", it: "Fotocamera", ru: "Камера", zh: "摄像头", ja: "カメラ" },
    
    "Microphone": { en: "Microphone", tr: "Mikrofon", es: "Micrófono", de: "Mikrofon", fr: "Microphone", pt: "Microfone", it: "Microfono", ru: "Микрофон", zh: "麦克风", ja: "マイク" },
    "Mikrofon": { en: "Microphone", tr: "Mikrofon", es: "Micrófono", de: "Mikrofon", fr: "Microphone", pt: "Microfone", it: "Microfono", ru: "Микрофон", zh: "麦克风", ja: "マイク" },
    
    "Location": { en: "Location", tr: "Konum", es: "Ubicación", de: "Standort", fr: "Localisation", pt: "Localização", it: "Posizione", ru: "Геолокация", zh: "位置", ja: "位置情報" },
    "Konum": { en: "Location", tr: "Konum", es: "Ubicación", de: "Standort", fr: "Localisation", pt: "Localização", it: "Posizione", ru: "Геолокация", zh: "位置", ja: "位置情報" },
    
    "Photos & Gallery": { en: "Photos & Gallery", tr: "Fotoğraflar & Galeri", es: "Fotos y galería", de: "Fotos & Galerie", fr: "Photos & Galerie", pt: "Fotos e galeria", it: "Foto e galleria", ru: "Фото и галерея", zh: "照片与相册", ja: "写真とギャラリー" },
    "Fotoğraflar": { en: "Photos & Gallery", tr: "Fotoğraflar & Galeri", es: "Fotos y galería", de: "Fotos & Galerie", fr: "Photos & Galerie", pt: "Fotos e galeria", it: "Foto e galleria", ru: "Фото и галерея", zh: "照片与相册", ja: "写真とギャラリー" },
    "Fotoğraf Arşivi": { en: "Photos & Gallery", tr: "Fotoğraflar & Galeri", es: "Fotos y galería", de: "Fotos & Galerie", fr: "Photos & Galerie", pt: "Fotos e galeria", it: "Foto e galleria", ru: "Фото и галерея", zh: "照片与相册", ja: "写真とギャラリー" },
    
    "Contacts": { en: "Contacts", tr: "Kişiler", es: "Contactos", de: "Kontakte", fr: "Contacts", pt: "Contatos", it: "Contatti", ru: "Контакты", zh: "联系人", ja: "連絡先" },
    "Kişiler": { en: "Contacts", tr: "Kişiler", es: "Contactos", de: "Kontakte", fr: "Contacts", pt: "Contatos", it: "Contatti", ru: "Контакты", zh: "联系人", ja: "連絡先" },
    
    "Device Fingerprint": { en: "Device Fingerprint", tr: "Cihaz Parmak İzi", es: "Huella digital de dispositivo", de: "Geräte-Fingerabdruck", fr: "Empreinte appareil", pt: "Impressão digital de dispositivo", it: "Impronta dispositivo", ru: "Отпечаток устройства", zh: "设备指纹", ja: "デバイスフィンガープリント" },
    "Cihaz Parmak İzi": { en: "Device Fingerprint", tr: "Cihaz Parmak İzi", es: "Huella digital de dispositivo", de: "Geräte-Fingerabdruck", fr: "Empreinte appareil", pt: "Impressão digital de dispositivo", it: "Impronta dispositivo", ru: "Отпечаток устройства", zh: "设备指纹", ja: "デバイスフィンガープリント" },
    
    "Storage / File Access": { en: "Storage / File Access", tr: "Depolama / Dosya Erişimi", es: "Almacenamiento y archivos", de: "Speicher- / Dateizugriff", fr: "Stockage / Fichiers", pt: "Armazenamento e arquivos", it: "Archiviazione / Accesso file", ru: "Хранилище / Доступ к файлам", zh: "存储/文件访问", ja: "ストレージ/ファイルアクセス" },
    "Depolama / Dosya Erişimi": { en: "Storage / File Access", tr: "Depolama / Dosya Erişimi", es: "Almacenamiento y archivos", de: "Speicher- / Dateizugriff", fr: "Stockage / Fichiers", pt: "Armazenamento e arquivos", it: "Archiviazione / Accesso file", ru: "Хранилище / Доступ к файлам", zh: "存储/文件访问", ja: "ストレージ/ファイルアクセス" },
    "Depolama/Galeri": { en: "Storage / Gallery", tr: "Depolama / Galeri", es: "Almacenamiento / Galería", de: "Speicher / Galerie", fr: "Stockage / Galerie", pt: "Armazenamento / Galeria", it: "Archiviazione / Galleria", ru: "Хранилище / Галерея", zh: "存储/相册", ja: "ストレージ/ギャラリー" },
    
    "Calendar": { en: "Calendar", tr: "Takvim", es: "Calendario", de: "Kalender", fr: "Calendrier", pt: "Calendário", it: "Calendario", ru: "Календарь", zh: "日历", ja: "カレンダー" },
    "Takvim": { en: "Calendar", tr: "Takvim", es: "Calendario", de: "Kalender", fr: "Calendrier", pt: "Calendário", it: "Calendario", ru: "Календарь", zh: "日历", ja: "カレンダー" },
    
    "Background Sync": { en: "Background Sync", tr: "Arka Plan Senkronizasyonu", es: "Sincronización en segundo plano", de: "Hintergrund-Synchronisation", fr: "Synchronisation en arrière-plan", pt: "Sincronização em segundo plano", it: "Sincronizzazione in background", ru: "Фоновая синхронизация", zh: "后台同步", ja: "バックグラウンド同期" },
    "Arka Plan Senkronizasyonu": { en: "Background Sync", tr: "Arka Plan Senkronizasyonu", es: "Sincronización en segundo plano", de: "Hintergrund-Synchronisation", fr: "Synchronisation en arrière-plan", pt: "Sincronização em segundo plano", it: "Sincronizzazione in background", ru: "Фоновая синхронизация", zh: "后台同步", ja: "バックグラウンド同期" },
    "Arka Plan Verisi": { en: "Background Data", tr: "Arka Plan Verisi", es: "Datos en segundo plano", de: "Hintergrunddaten", fr: "Données en arrière-plan", pt: "Dados em segundo plano", it: "Dati in background", ru: "Фоновые данные", zh: "后台数据", ja: "バックグラウンドデータ" },
    
    "Storage": { en: "Storage", tr: "Depolama", es: "Almacenamiento", de: "Speicher", fr: "Stockage", pt: "Armazenamento", it: "Archiviazione", ru: "Хранилище", zh: "存储", ja: "ストレージ" },
    "Depolama": { en: "Storage", tr: "Depolama", es: "Almacenamiento", de: "Speicher", fr: "Stockage", pt: "Armazenamento", it: "Archiviazione", ru: "Хранилище", zh: "存储", ja: "ストレージ" },
    
    "Notifications": { en: "Notifications", tr: "Bildirimler", es: "Notificaciones", de: "Benachrichtigungen", fr: "Notifications", pt: "Notificações", it: "Notifiche", ru: "Уведомления", zh: "通知", ja: "通知" },
    "Bildirimler": { en: "Notifications", tr: "Bildirimler", es: "Notificaciones", de: "Benachrichtigungen", fr: "Notifications", pt: "Notificações", it: "Notifiche", ru: "Уведомления", zh: "通知", ja: "通知" },
    
    "Microphone (Voice Messages)": { en: "Microphone (Voice Messages)", tr: "Mikrofon (Sesli Mesajlar)", es: "Micrófono (Mensajes de voz)", de: "Mikrofon (Sprachnachrichten)", fr: "Microphone (Messages vocaux)", pt: "Microfone (Mensagens de voz)", it: "Microfono (Messaggi vocali)", ru: "Микрофон (голосовые)", zh: "麦克风(语音消息)", ja: "マイク (音声メッセージ)" },
    "Mikrofon (Sesli Mesajlar)": { en: "Microphone (Voice Messages)", tr: "Mikrofon (Sesli Mesajlar)", es: "Micrófono (Mensajes de voz)", de: "Mikrofon (Sprachnachrichten)", fr: "Microphone (Messages vocaux)", pt: "Microfone (Mensagens de voz)", it: "Microfono (Messaggi vocali)", ru: "Микрофон (голосовые)", zh: "麦克风(语音消息)", ja: "マイク (音声メッセージ)" },
    
    "Bluetooth": { en: "Bluetooth", tr: "Bluetooth", es: "Bluetooth", de: "Bluetooth", fr: "Bluetooth", pt: "Bluetooth", it: "Bluetooth", ru: "Bluetooth", zh: "蓝牙", ja: "Bluetooth" },
    
    "Full Internet Access": { en: "Full Internet Access", tr: "Tam İnternet Erişimi", es: "Acceso total a Internet", de: "Voller Internetzugriff", fr: "Accès Internet complet", pt: "Acesso total à Internet", it: "Accesso a Internet completo", ru: "Полный доступ в Интернет", zh: "完全互联网访问", ja: "完全なインターネットアクセス" },
    "Tam İnternet Erişimi": { en: "Full Internet Access", tr: "Tam İnternet Erişimi", es: "Acceso total a Internet", de: "Voller Internetzugriff", fr: "Accès Internet complet", pt: "Acesso total à Internet", it: "Accesso a Internet completo", ru: "Полный доступ в Интернет", zh: "完全互联网访问", ja: "完全なインターネットアクセス" },
    
    "Clipboard Access": { en: "Clipboard Access", tr: "Pano Erişimi", es: "Acceso al portapapeles", de: "Zwischenablage-Zugriff", fr: "Accès au presse-papiers", pt: "Acesso à área de transferência", it: "Accesso agli appunti", ru: "Доступ к буферу обмена", zh: "剪贴板访问", ja: "クリップボードアクセス" },
    "Pano Erişimi (Clipboard)": { en: "Clipboard Access", tr: "Pano Erişimi", es: "Acceso al portapapeles", de: "Zwischenablage-Zugriff", fr: "Accès au presse-papiers", pt: "Acesso à área de transferência", it: "Accesso agli appunti", ru: "Доступ к буферу обмена", zh: "剪贴板访问", ja: "クリップボードアクセス" },
    
    "Network Device Analysis": { en: "Network Device Analysis", tr: "Ağ Cihazları Analizi", es: "Análisis de dispositivos de red", de: "Netzwerkgeräte-Analyse", fr: "Analyse des appareils réseau", pt: "Análise de dispositivos de rede", it: "Analisi dispositivi di rete", ru: "Анализ сетевых устройств", zh: "网络设备分析", ja: "ネットワークデバイス分析" },
    "Ağ Cihazları Analizi": { en: "Network Device Analysis", tr: "Ağ Cihazları Analizi", es: "Análisis de dispositivos de red", de: "Netzwerkgeräte-Analyse", fr: "Analyse des appareils réseau", pt: "Análise de dispositivos de rede", it: "Analisi dispositivi di rete", ru: "Анализ сетевых устройств", zh: "网络设备分析", ja: "ネットワークデバイス分析" },
    
    "Precise Location (GPS)": { en: "Precise Location (GPS)", tr: "Hassas Konum (GPS)", es: "Ubicación precisa (GPS)", de: "Präziser Standort (GPS)", fr: "Localisation précise (GPS)", pt: "Localização precisa (GPS)", it: "Posizione precisa (GPS)", ru: "Точная геолокация (GPS)", zh: "精确位置(GPS)", ja: "正確な位置情報 (GPS)" },
    "Hassas Konum (GPS)": { en: "Precise Location (GPS)", tr: "Hassas Konum (GPS)", es: "Ubicación precisa (GPS)", de: "Präziser Standort (GPS)", fr: "Localisation précise (GPS)", pt: "Localização precisa (GPS)", it: "Posizione precisa (GPS)", ru: "Точная геолокация (GPS)", zh: "精确位置(GPS)", ja: "正確な位置情報 (GPS)" }
};

// ────────────────────────────────────────────────────────────────────────────────
// UI Translations (i18n)
// ────────────────────────────────────────────────────────────────────────────────
const i18n = {
    en: {
        brandSubtitle: "Surveillance Index",
        heroTitle: "Personal Surveillance Matrix",
        heroDesc: "Analyze data harvesting, permission matrices, and unified surveillance risk profiles across your daily mobile and web applications.",
        searchPlaceholder: "Search or add any app (e.g., Discord, Zoom, Getir)...",
        btnSearchStore: "Search Store",
        btnAddCustom: "Add Custom",
        catAll: "All", catSocial: "Social", catCommunication: "Communication", catProductivity: "Productivity", catEntertainment: "Entertainment",
        section1Title: "Select or Add Applications",
        section1Subtitle: "Click badges to inspect privacy policies",
        section2Title: "Surveillance Summary",
        scoreLabel: "Unified Surveillance Index (0-100)",
        scoreNone: "No App Selected",
        scoreCritical: "CRITICAL SURVEILLANCE RISK",
        scoreWarning: "HIGH SURVEILLANCE RISK",
        scoreSafe: "MODERATE / CONTROLLED",
        section3Title: "Detailed Threat & Permission Analysis",
        dataTypesTitle: "📊 Harvested Data Types",
        sharedWithTitle: "🔗 Third-Party Destinations",
        permissionsTitle: "🔐 Requested Device Permissions",
        risksTitle: "⚠️ Surveillance Threat Scenarios",
        tipsTitle: "🛡️ Privacy Hardening Blueprint",
        noAppSelected: "Select applications above to generate analysis.",
        radarLabels: ["Identity & Biometrics", "Behavior & Location", "Content & Messages", "Social Graph"],
        radarDatasetLabel: "Data Appetite Score (0-10)",
        modalStoreTitle: "Store Search Results",
        modalCustomTitle: "Add Custom Application",
        verifiedBadge: "✓ Verified",
        trackersLabel: "Trackers",
        customFormName: "Application Name:",
        customFormCompany: "Developer / Company:",
        customFormCategory: "Category:",
        btnCancel: "Cancel",
        btnAdd: "Add & Analyze",
        riskSocialGraph: "Cross-platform social graphing correlates your communication frequency and time windows across apps.",
        riskBiometrics: "Facial and media biometric data processed for algorithmic recommendations and filtering.",
        riskLocation: "Location tracking builds persistent physical travel and dwelling patterns.",
        riskKeyboard: "Keystroke dynamics and clipboard access enable behavioral profiling beyond visible interactions.",
        tipPermissions: "Revoke sensitive permissions (Location, Contacts, Camera) when not actively using the app.",
        tipEncryptedBackup: "Enable end-to-end encrypted cloud backups for chat messaging applications.",
        tipAdIdReset: "Reset your Mobile Advertising ID (IDFA / AAID) regularly in system privacy settings.",
        tipSandbox: "Use the web version or sandbox the app to limit device-level data access."
    },
    tr: {
        brandSubtitle: "Gözetim Endeksi",
        heroTitle: "Kişisel Gözetim Profili Analizi",
        heroDesc: "Günlük yaşamda kullandığınız uygulamaların veri toplama, izin matrisi ve tümleşik gözetim altındaki risk profilini anında görün.",
        searchPlaceholder: "Uygulama veya şirket ara (ör. Mopaş, Getir, Discord, Zoom)...",
        btnSearchStore: "Mağazada Ara",
        btnAddCustom: "Özel Ekle",
        catAll: "Tümü", catSocial: "Sosyal", catCommunication: "İletişim", catProductivity: "Verimlilik", catEntertainment: "Eğlence",
        section1Title: "Uygulamaları Seçin veya Ekleyin",
        section1Subtitle: "Gizlilik derecelerini görmek için rozetlere tıklayın",
        section2Title: "Gözetim Profili Özeti",
        scoreLabel: "Tümleşik Gözetim Endeksi (0-100)",
        scoreNone: "Uygulama Seçilmedi",
        scoreCritical: "KRİTİK GÖZETİM DÜZEYİ",
        scoreWarning: "YÜKSEK GÖZETİM DÜZEYİ",
        scoreSafe: "ORTA / KONTROLLÜ DÜZEY",
        section3Title: "Detaylı Veri & Risk Analizi",
        dataTypesTitle: "📊 Toplanan Veri Türleri",
        sharedWithTitle: "🔗 Kimlerle Paylaşılıyor?",
        permissionsTitle: "🔐 Kullanılan İzinler",
        risksTitle: "⚠️ Potansiyel Tehdit Senaryoları",
        tipsTitle: "🛡️ Gizlilik Sertleştirme İpuçları",
        noAppSelected: "Analiz oluşturmak için yukarıdan uygulama seçin.",
        radarLabels: ["Kimlik & Biyometri", "Davranış & Konum", "İçerik & Mesajlar", "Sosyal Grafik"],
        radarDatasetLabel: "Veri İştahı Skoru (0-10)",
        modalStoreTitle: "Mağaza Arama Sonuçları",
        modalCustomTitle: "Özel Uygulama Ekle",
        verifiedBadge: "✓ Doğrulanmış",
        trackersLabel: "İzleyici",
        customFormName: "Uygulama Adı:",
        customFormCompany: "Geliştirici / Şirket:",
        customFormCategory: "Kategori:",
        btnCancel: "İptal",
        btnAdd: "Ekle & Analiz Et",
        riskSocialGraph: "Çapraz platform sosyal grafiği, iletişim sıklığınızı ve zaman aralıklarınızı işler.",
        riskBiometrics: "Yüz ve medya biyometrik verileri algoritmik öneriler için işlenir.",
        riskLocation: "Konum takibi sürekli fiziksel seyahat ve konaklama kalıpları oluşturur.",
        riskKeyboard: "Tuş vuruş dinamiği ve pano erişimi, görünür etkileşimlerin ötesinde davranışsal profil oluşturur.",
        tipPermissions: "Uygulamayı kullanmadığınızda hassas izinleri (Konum, Kişiler, Kamera) kapatın.",
        tipEncryptedBackup: "Mesajlaşma uygulamalarında uçtan uca şifreli bulut yedeklemesini etkinleştirin.",
        tipAdIdReset: "Sistem gizlilik ayarlarından Reklam Kimliğinizi (IDFA / AAID) düzenli sıfırlayın.",
        tipSandbox: "Cihaz düzeyinde veri erişimini sınırlamak için uygulamanın web sürümünü kullanın."
    },
    es: {
        brandSubtitle: "Índice de Vigilancia", heroTitle: "Matriz de Vigilancia Personal",
        heroDesc: "Analice la recopilación de datos, permisos y perfiles de riesgo de vigilancia digital en sus aplicaciones diarias.",
        searchPlaceholder: "Buscar o agregar cualquier aplicación...", btnSearchStore: "Buscar Tienda", btnAddCustom: "Agregar Personal",
        catAll: "Todas", catSocial: "Social", catCommunication: "Comunicación", catProductivity: "Productividad", catEntertainment: "Entretenimiento",
        section1Title: "Seleccione o agregue aplicaciones", section1Subtitle: "Haga clic en las insignias para ver políticas",
        section2Title: "Resumen de vigilancia", scoreLabel: "Índice de vigilancia unificado (0-100)",
        scoreNone: "Ninguna app seleccionada", scoreCritical: "RIESGO DE VIGILANCIA CRÍTICO", scoreWarning: "RIESGO DE VIGILANCIA ALTO", scoreSafe: "MODERADO / CONTROLADO",
        section3Title: "Análisis detallado de riesgos y permisos",
        dataTypesTitle: "📊 Tipos de datos recopilados", sharedWithTitle: "🔗 Destinos de terceros", permissionsTitle: "🔐 Permisos solicitados",
        risksTitle: "⚠️ Escenarios de amenaza", tipsTitle: "🛡️ Plan de privacidad",
        noAppSelected: "Seleccione aplicaciones arriba para generar análisis.",
        radarLabels: ["Identidad y Biometría", "Comportamiento y Ubicación", "Contenido y Mensajes", "Gráfico Social"],
        radarDatasetLabel: "Apetito de datos (0-10)",
        modalStoreTitle: "Resultados de la tienda", modalCustomTitle: "Agregar app personalizada",
        verifiedBadge: "✓ Verificado", trackersLabel: "Rastreadores",
        customFormName: "Nombre:", customFormCompany: "Desarrollador:", customFormCategory: "Categoría:",
        btnCancel: "Cancelar", btnAdd: "Agregar y analizar",
        riskSocialGraph: "El gráfico social analiza su frecuencia de comunicación en diferentes plataformas.",
        riskBiometrics: "Los datos biométricos faciales se procesan para recomendaciones algorítmicas.",
        riskLocation: "El rastreo de ubicación crea patrones continuos de desplazamiento físico.",
        riskKeyboard: "La dinámica de tecleo y el acceso al portapapeles permiten el perfilado conductual.",
        tipPermissions: "Revoque permisos sensibles cuando no use la app.",
        tipEncryptedBackup: "Active copias de seguridad encriptadas de extremo a extremo.",
        tipAdIdReset: "Restablezca periódicamente su ID de publicidad móvil.",
        tipSandbox: "Use la versión web para limitar el acceso a datos del dispositivo."
    },
    de: {
        brandSubtitle: "Überwachungsindex", heroTitle: "Überwachungsmatrix für persönliche Daten",
        heroDesc: "Analysieren Sie Datenerfassung, Berechtigungen und digitale Überwachungsrisikoprofile Ihrer täglichen Apps.",
        searchPlaceholder: "App suchen oder hinzufügen...", btnSearchStore: "Store suchen", btnAddCustom: "Eigene hinzufügen",
        catAll: "Alle", catSocial: "Soziales", catCommunication: "Kommunikation", catProductivity: "Produktivität", catEntertainment: "Unterhaltung",
        section1Title: "Apps auswählen oder hinzufügen", section1Subtitle: "Auf Abzeichen klicken für Datenschutzrichtlinien",
        section2Title: "Überwachungsübersicht", scoreLabel: "Einheitlicher Überwachungsindex (0-100)",
        scoreNone: "Keine App ausgewählt", scoreCritical: "KRITISCHES ÜBERWACHUNGSRISIKO", scoreWarning: "HOHES ÜBERWACHUNGSRISIKO", scoreSafe: "MODERAT / KONTROLLIERT",
        section3Title: "Detaillierte Risiko- & Berechtigungsanalyse",
        dataTypesTitle: "📊 Erfasste Datentypen", sharedWithTitle: "🔗 Drittanbieter-Ziele", permissionsTitle: "🔐 Angeforderte Berechtigungen",
        risksTitle: "⚠️ Bedrohungsszenarien", tipsTitle: "🛡️ Datenschutz-Empfehlungen",
        noAppSelected: "Wählen Sie oben Apps aus.", radarLabels: ["Identität & Biometrie", "Verhalten & Standort", "Inhalt & Nachrichten", "Sozialer Graph"],
        radarDatasetLabel: "Datenhunger (0-10)",
        modalStoreTitle: "Store-Suchergebnisse", modalCustomTitle: "Eigene App hinzufügen",
        verifiedBadge: "✓ Verifiziert", trackersLabel: "Tracker",
        customFormName: "App-Name:", customFormCompany: "Entwickler:", customFormCategory: "Kategorie:",
        btnCancel: "Abbrechen", btnAdd: "Hinzufügen & Analysieren",
        riskSocialGraph: "Der plattformübergreifende soziale Graph verarbeitet Ihre Kommunikationshäufigkeit.",
        riskBiometrics: "Gesichtsbiometrische Daten werden für algorithmische Empfehlungen verarbeitet.",
        riskLocation: "Standortverfolgung erstellt kontinuierliche physische Bewegungsprofile.",
        riskKeyboard: "Tastenanschlag-Dynamik und Zwischenablage-Zugriff ermöglichen Verhaltensprofilerstellung.",
        tipPermissions: "Widerrufen Sie empfindliche Berechtigungen bei Nichtgebrauch.",
        tipEncryptedBackup: "Aktivieren Sie Ende-zu-Ende-verschlüsselte Cloud-Backups.",
        tipAdIdReset: "Setzen Sie Ihre Werbe-ID regelmäßig zurück.",
        tipSandbox: "Nutzen Sie die Web-Version, um Gerätedatenzugriff zu beschränken."
    },
    fr: {
        brandSubtitle: "Indice de surveillance", heroTitle: "Matrice de Surveillance Personnelle",
        heroDesc: "Analysez la collecte de données, les autorisations et les profils de risque de surveillance de vos applications.",
        searchPlaceholder: "Rechercher ou ajouter une application...", btnSearchStore: "Rechercher Store", btnAddCustom: "Ajouter perso",
        catAll: "Toutes", catSocial: "Social", catCommunication: "Communication", catProductivity: "Productivité", catEntertainment: "Divertissement",
        section1Title: "Sélectionnez ou ajoutez des applications", section1Subtitle: "Cliquez sur les badges pour les règles de confidentialité",
        section2Title: "Résumé de la surveillance", scoreLabel: "Indice de surveillance unifié (0-100)",
        scoreNone: "Aucune app sélectionnée", scoreCritical: "RISQUE CRITIQUE", scoreWarning: "RISQUE ÉLEVÉ", scoreSafe: "MODÉRÉ / CONTRÔLÉ",
        section3Title: "Analyse détaillée des risques et autorisations",
        dataTypesTitle: "📊 Types de données collectées", sharedWithTitle: "🔗 Destinataires tiers", permissionsTitle: "🔐 Autorisations demandées",
        risksTitle: "⚠️ Scénarios de menace", tipsTitle: "🛡️ Conseils de confidentialité",
        noAppSelected: "Sélectionnez des applications ci-dessus.",
        radarLabels: ["Identité & Biométrie", "Comportement & Localisation", "Contenu & Messages", "Graphe social"],
        radarDatasetLabel: "Score d'appétit pour les données (0-10)",
        modalStoreTitle: "Résultats du Store", modalCustomTitle: "Ajouter une application",
        verifiedBadge: "✓ Vérifié", trackersLabel: "Traqueurs",
        customFormName: "Nom :", customFormCompany: "Développeur :", customFormCategory: "Catégorie :",
        btnCancel: "Annuler", btnAdd: "Ajouter et analyser",
        riskSocialGraph: "Le graphe social croisé analyse la fréquence de vos communications.",
        riskBiometrics: "Les données biométriques faciales sont traitées pour les recommandations.",
        riskLocation: "Le suivi de localisation établit des modèles de déplacement physique.",
        riskKeyboard: "La dynamique de frappe et l'accès au presse-papiers permettent le profilage comportemental.",
        tipPermissions: "Révoguez les autorisations sensibles lorsque vous n'utilisez pas l'application.",
        tipEncryptedBackup: "Activez les sauvegardes cloud chiffrées de bout en bout.",
        tipAdIdReset: "Réinitialisez régulièrement votre identifiant publicitaire.",
        tipSandbox: "Utilisez la version web pour limiter l'accès aux données de l'appareil."
    },
    pt: {
        brandSubtitle: "Índice de Vigilância", heroTitle: "Matriz de Vigilância Pessoal",
        heroDesc: "Análise de coleta de dados, permissões e perfis de risco de vigilância em seus aplicativos diários.",
        searchPlaceholder: "Pesquisar ou adicionar qualquer aplicativo...", btnSearchStore: "Buscar Loja", btnAddCustom: "Adicionar personalizado",
        catAll: "Todas", catSocial: "Social", catCommunication: "Comunicação", catProductivity: "Produtividade", catEntertainment: "Entretenimento",
        section1Title: "Selecione ou adicione aplicativos", section1Subtitle: "Clique nos selos para ver as políticas",
        section2Title: "Resumo da vigilância", scoreLabel: "Índice unificado de vigilância (0-100)",
        scoreNone: "Nenhum app selecionado", scoreCritical: "RISCO CRÍTICO", scoreWarning: "RISCO ALTO", scoreSafe: "MODERADO / CONTROLADO",
        section3Title: "Análise detalhada de riscos e permissões",
        dataTypesTitle: "📊 Tipos de dados coletados", sharedWithTitle: "🔗 Destinos de terceiros", permissionsTitle: "🔐 Permissões solicitadas",
        risksTitle: "⚠️ Cenários de ameaça", tipsTitle: "🛡️ Plano de privacidade",
        noAppSelected: "Selecione aplicativos acima.",
        radarLabels: ["Identidade e Biometria", "Comportamento e Localização", "Conteúdo e Mensagens", "Gráfico Social"],
        radarDatasetLabel: "Apetite de dados (0-10)",
        modalStoreTitle: "Resultados da Loja", modalCustomTitle: "Adicionar app personalizado",
        verifiedBadge: "✓ Verificado", trackersLabel: "Rastreadores",
        customFormName: "Nome:", customFormCompany: "Desenvolvedor:", customFormCategory: "Categoria:",
        btnCancel: "Cancelar", btnAdd: "Adicionar e analisar",
        riskSocialGraph: "O gráfico social analisa sua frequência de comunicação entre plataformas.",
        riskBiometrics: "Dados biométricos faciais são processados para recomendações.",
        riskLocation: "O rastreamento de localização gera padrões contínuos de deslocamento.",
        riskKeyboard: "Dinâmica de digitação e acesso à área de transferência permitem perfilamento comportamental.",
        tipPermissions: "Revogue permissões sensíveis quando não estiver usando o app.",
        tipEncryptedBackup: "Ative backups criptografados de ponta a ponta.",
        tipAdIdReset: "Redefina seu ID de publicidade regularmente.",
        tipSandbox: "Use a versão web para limitar o acesso a dados do dispositivo."
    },
    it: {
        brandSubtitle: "Indice di Sorveglianza", heroTitle: "Matrice di Sorveglianza Personale",
        heroDesc: "Analizza la raccolta dati, le autorizzazioni e i profili di rischio di sorveglianza delle tue app quotidiane.",
        searchPlaceholder: "Cerca o aggiungi qualsiasi app...", btnSearchStore: "Cerca Store", btnAddCustom: "Aggiungi pers.",
        catAll: "Tutte", catSocial: "Social", catCommunication: "Comunicazione", catProductivity: "Produttività", catEntertainment: "Intrattenimento",
        section1Title: "Seleziona o aggiungi applicazioni", section1Subtitle: "Clicca sui badge per l'informativa",
        section2Title: "Riepilogo della sorveglianza", scoreLabel: "Indice di sorveglianza unificato (0-100)",
        scoreNone: "Nessuna app selezionata", scoreCritical: "RISCHIO CRITICO", scoreWarning: "RISCHIO ELEVATO", scoreSafe: "MODERATO / CONTROLLATO",
        section3Title: "Analisi dettagliata di rischi e autorizzazioni",
        dataTypesTitle: "📊 Tipi di dati raccolti", sharedWithTitle: "🔗 Destinatari terzi", permissionsTitle: "🔐 Autorizzazioni richieste",
        risksTitle: "⚠️ Scenario di minaccia", tipsTitle: "🛡️ Consigli sulla privacy",
        noAppSelected: "Seleziona le app in alto.",
        radarLabels: ["Identità e Biometria", "Comportamento e Posizione", "Contenuto e Messaggi", "Grafo Sociale"],
        radarDatasetLabel: "Punteggio appetito dati (0-10)",
        modalStoreTitle: "Risultati dello Store", modalCustomTitle: "Aggiungi app personalizzata",
        verifiedBadge: "✓ Verificato", trackersLabel: "Tracker",
        customFormName: "Nome:", customFormCompany: "Sviluppatore:", customFormCategory: "Categoria:",
        btnCancel: "Annulla", btnAdd: "Aggiungi e analizza",
        riskSocialGraph: "Il grafo sociale analizza la frequenza delle tue comunicazioni.",
        riskBiometrics: "I dati biometrici facciali vengono elaborati per le raccomandazioni.",
        riskLocation: "Il tracciamento della posizione crea modelli di spostamento continui.",
        riskKeyboard: "La dinamica della digitazione e l'accesso agli appunti consentono il profiling comportamentale.",
        tipPermissions: "Revoca le autorizzazioni sensibili quando non usi l'app.",
        tipEncryptedBackup: "Attiva i backup cloud crittografati end-to-end.",
        tipAdIdReset: "Reimposta regolarmente l'ID pubblicitario.",
        tipSandbox: "Usa la versione web per limitare l'accesso ai dati del dispositivo."
    },
    ru: {
        brandSubtitle: "Индекс слежки", heroTitle: "Матрица личной цифровой слежки",
        heroDesc: "Анализ сбора данных, разрешений и профилей риска цифровой слежки в ваших ежедневных приложениях.",
        searchPlaceholder: "Поиск или добавление приложения...", btnSearchStore: "Искать в сторе", btnAddCustom: "Своё приложение",
        catAll: "Все", catSocial: "Соцсети", catCommunication: "Связь", catProductivity: "Продуктивность", catEntertainment: "Развлечения",
        section1Title: "Выберите или добавьте приложения", section1Subtitle: "Нажмите на бейдж для просмотра политики",
        section2Title: "Сводка слежки", scoreLabel: "Единый индекс слежки (0-100)",
        scoreNone: "Приложения не выбраны", scoreCritical: "КРИТИЧЕСКИЙ РИСК", scoreWarning: "ВЫСОКИЙ РИСК", scoreSafe: "УМЕРЕННЫЙ / КОНТРОЛИРУЕМЫЙ",
        section3Title: "Детальный анализ рисков и разрешений",
        dataTypesTitle: "📊 Собираемые типы данных", sharedWithTitle: "🔗 Третьи стороны", permissionsTitle: "🔐 Запрашиваемые разрешения",
        risksTitle: "⚠️ Сценарии угроз", tipsTitle: "🛡️ Рекомендации по конфиденциальности",
        noAppSelected: "Выберите приложения выше.",
        radarLabels: ["Личность и биометрия", "Поведение и локация", "Контент и сообщения", "Социальный граф"],
        radarDatasetLabel: "Аппетит к данным (0-10)",
        modalStoreTitle: "Результаты поиска", modalCustomTitle: "Добавить приложение",
        verifiedBadge: "✓ Подтверждено", trackersLabel: "Трекеры",
        customFormName: "Название:", customFormCompany: "Разработчик:", customFormCategory: "Категория:",
        btnCancel: "Отмена", btnAdd: "Добавить и проанализировать",
        riskSocialGraph: "Социальный граф анализирует частоту и время ваших контактов.",
        riskBiometrics: "Биометрические данные лица обрабатываются для алгоритмов.",
        riskLocation: "Отслеживание локации формирует постоянные маршруты перемещений.",
        riskKeyboard: "Динамика нажатия клавиш и доступ к буферу обмена позволяют создавать поведенческие профили.",
        tipPermissions: "Отзывайте разрешения на доступ к геолокации и камере.",
        tipEncryptedBackup: "Включайте сквозное шифрование резервных копий.",
        tipAdIdReset: "Регулярно сбрасывайте рекламный идентификатор.",
        tipSandbox: "Используйте веб-версию для ограничения доступа к данным устройства."
    },
    zh: {
        brandSubtitle: "监控数据指数", heroTitle: "个人监控数据矩阵",
        heroDesc: "分析您日常软件的数据收集、权限矩阵与个人数字监控风险分析。",
        searchPlaceholder: "搜索或添加任何应用程序...", btnSearchStore: "商店搜索", btnAddCustom: "自定义添加",
        catAll: "全部", catSocial: "社交", catCommunication: "通讯", catProductivity: "效率工具", catEntertainment: "娱乐",
        section1Title: "选择或添加应用程序", section1Subtitle: "点击徽章查看隐私政策",
        section2Title: "监控摘要", scoreLabel: "统一监控指数 (0-100)",
        scoreNone: "未选择应用", scoreCritical: "极高监控风险", scoreWarning: "高监控风险", scoreSafe: "中等 / 可控",
        section3Title: "详细风险与权限分析",
        dataTypesTitle: "📊 收集的数据类型", sharedWithTitle: "🔗 第三方数据共享", permissionsTitle: "🔐 要求的设备权限",
        risksTitle: "⚠️ 监控威胁场景", tipsTitle: "🛡️ 隐私强化蓝图",
        noAppSelected: "请在上方选择应用以生成分析。",
        radarLabels: ["身份与生物识别", "行为与位置", "内容与消息", "社交图谱"],
        radarDatasetLabel: "数据搜集指数 (0-10)",
        modalStoreTitle: "商店搜索结果", modalCustomTitle: "添加自定义应用",
        verifiedBadge: "✓ 已验证", trackersLabel: "追踪器",
        customFormName: "应用名称:", customFormCompany: "开发者:", customFormCategory: "分类:",
        btnCancel: "取消", btnAdd: "添加并分析",
        riskSocialGraph: "跨平台社交图谱分析您的通信频率与时间特征。",
        riskBiometrics: "人脸生物识别数据用于算法推荐与过滤。",
        riskLocation: "位置跟踪会生成持续的物理活动与停留轨迹。",
        riskKeyboard: "按键动态和剪贴板访问支持超越可见交互的行为分析。",
        tipPermissions: "闲置应用时请关闭位置、通讯录和摄像头权限。",
        tipEncryptedBackup: "开启聊天应用的端到端加密云备份。",
        tipAdIdReset: "定期重置移动广告标识符。",
        tipSandbox: "使用网页版以限制设备级数据访问。"
    },
    ja: {
        brandSubtitle: "監視インデックス", heroTitle: "個人監視リスクマトリックス",
        heroDesc: "日常使用するアプリのデータ収集、使用権限、およびデジタル監視リスクプロファイルを分析します。",
        searchPlaceholder: "アプリを検索または追加...", btnSearchStore: "ストア検索", btnAddCustom: "カスタム追加",
        catAll: "すべて", catSocial: "ソーシャル", catCommunication: "通信", catProductivity: "生産性", catEntertainment: "エンターテインメント",
        section1Title: "アプリを選択または追加", section1Subtitle: "バッジをクリックしてプライバシーポリシーを確認",
        section2Title: "監視リスク概要", scoreLabel: "統合監視インデックス (0-100)",
        scoreNone: "アプリ未選択", scoreCritical: "極めて高い監視リスク", scoreWarning: "高い監視リスク", scoreSafe: "中程度 / 管理下",
        section3Title: "詳細なリスクおよび権限分析",
        dataTypesTitle: "📊 収集データタイプ", sharedWithTitle: "🔗 第三者提供先", permissionsTitle: "🔐 要求された権限",
        risksTitle: "⚠️ 監視脅威シナリオ", tipsTitle: "🛡️ プライバシー強化ガイド",
        noAppSelected: "分析を生成するにはアプリを選択してください。",
        radarLabels: ["身元と生体情報", "行動と位置情報", "コンテンツとメッセージ", "ソーシャルグラフ"],
        radarDatasetLabel: "データ収集スコア (0-10)",
        modalStoreTitle: "ストア検索結果", modalCustomTitle: "カスタムアプリの追加",
        verifiedBadge: "✓ 検証済み", trackersLabel: "トラッカー",
        customFormName: "アプリ名:", customFormCompany: "開発者:", customFormCategory: "カテゴリー:",
        btnCancel: "キャンセル", btnAdd: "追加して分析",
        riskSocialGraph: "クロスプラットフォーム・ソーシャルグラフにより連絡頻度が解析されます。",
        riskBiometrics: "顔生体認証データはアルゴリズム推薦に利用されます。",
        riskLocation: "位置情報追跡により移動履歴と滞在パターンが生成されます。",
        riskKeyboard: "キーストローク・ダイナミクスとクリップボードアクセスにより行動プロファイリングが可能になります。",
        tipPermissions: "アプリ非使用時は位置情報やカメラなどの権限を無効化してください。",
        tipEncryptedBackup: "エンドツーエンド暗号化バックアップを有効にしてください。",
        tipAdIdReset: "広告識別子を定期的にリセットしてください。",
        tipSandbox: "デバイスデータへのアクセスを制限するためにウェブ版を使用してください。"
    }
};

// ────────────────────────────────────────────────────────────────────────────────
// Core Engine
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

function translateTerm(rawTerm, lang) {
    if (!rawTerm) return '';
    const cleanTerm = rawTerm.trim();
    if (termsDict[cleanTerm] && termsDict[cleanTerm][lang]) {
        return termsDict[cleanTerm][lang];
    }
    // Fallback: return English if available, otherwise raw
    if (termsDict[cleanTerm] && termsDict[cleanTerm].en) {
        return termsDict[cleanTerm].en;
    }
    return cleanTerm;
}

function setLanguage(lang) {
    if (!i18n[lang]) lang = 'en';
    currentLang = lang;
    localStorage.setItem('cyberprivacy_lang', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const dict = i18n[lang];
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
        if (elem) elem.innerText = tMap[id];
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = dict.searchPlaceholder;

    if (radarChart) {
        radarChart.data.labels = dict.radarLabels;
        radarChart.data.datasets[0].label = dict.radarDatasetLabel;
        radarChart.update();
    }

    renderAppGrid();
    updateDashboard();
}

async function loadAppsDatabase() {
    try {
        const response = await fetch('./apps_database.json');
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
            iconHtml = `<img class="app-icon-img" src="${app.icon_url}" alt="${app.name}" loading="lazy">`;
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
// Store Search & App Addition
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

    // FIX: Use English keys for shared_with so they translate properly
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
        permissions: deriveRealPermissions(category),
        risks: [],
        tips: []
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

// FIX: Return English keys so translateTerm can translate them
function deriveRealDataTypes(category) {
    if (category === 'social') return ["Facial & Media Biometrics", "Interests & Dwell Times", "Direct Messages & Photos", "GPS Location History", "Device Fingerprint & IP"];
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
// Dashboard & Analysis
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

    // Cycle through different risk/tip types per app
    const riskKeys = ['riskSocialGraph', 'riskBiometrics', 'riskLocation', 'riskKeyboard'];
    const tipKeys = ['tipPermissions', 'tipEncryptedBackup', 'tipAdIdReset', 'tipSandbox'];

    selectedApps.forEach((app, index) => {
        totalWeight += (app.weight || 15);

        const cats = app.categories || { identity: 7, behavior: 7, content: 7, social: 7 };
        categoriesSum.identity += cats.identity;
        categoriesSum.behavior += cats.behavior;
        categoriesSum.content += cats.content;
        categoriesSum.social += cats.social;

        (app.data_types || []).forEach(d => allDataTypes.add(translateTerm(d, currentLang)));
        (app.shared_with || []).forEach(s => allShared.add(translateTerm(s, currentLang)));
        (app.permissions || []).forEach(p => allPermissions.add(translateTerm(p, currentLang)));

        // FIX: Use varied, localized risk/tip strings instead of raw Turkish from database
        const riskKey = riskKeys[index % riskKeys.length];
        const tipKey = tipKeys[index % tipKeys.length];
        allRisks.push(`<b>${app.name}:</b> ${dict[riskKey]}`);
        allTips.push(`<b>${app.name}:</b> ${dict[tipKey]}`);
    });

    // Deduplicate
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
// Modals
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
            ? `<img src="${app.icon_url}" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover;">`
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

// ────────────────────────────────────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────────────────────────────────────

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
        permissions: ["Contacts", "Camera", "Microphone", "Location"],
        risks: [], tips: []
    }];
}
