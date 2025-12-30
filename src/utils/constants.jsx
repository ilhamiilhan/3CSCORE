// src/utils/constants.js

// Admin kullanıcısının e-posta adresi (Yönetici yetkisi için kullanılır)
// Admin kullanıcısının e-posta adresi (Yönetici yetkisi için kullanılır)
export const ADMIN_EMAIL = "agharta55@hotmail.com";

// Turnuva Düzenleme Yetkisine Sahip Kullanıcılar (Legacy + Başlangıç)
export const TOURNAMENT_MANAGERS = [
    ADMIN_EMAIL,
    "ilhamiilhan@gmail.com",
];

export const SUPER_ADMINS = [
    ADMIN_EMAIL
];

// Sayfalama için bir sayfada gösterilecek öğe sayısı
export const ITEMS_PER_PAGE = 10;

// Türkiye İlleri Listesi (Kayıt Formu için)
export const CITIES_OF_TURKEY = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya",
    "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu",
    "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır",
    "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep",
    "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul",
    "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli",
    "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin",
    "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun",
    "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli",
    "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt",
    "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır",
    "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];