const products = [
    {
        id: 1,
        name: "Whey Protein Isolate",
        category: "proteina",
        price: 45.99,
        stock: 45,
        img: "img/wheyprotein.webp",
        brand: "Optimum Nutrition",
        description: "Proteína de suero aislada de alta pureza, baja en grasa y carbohidratos. Ideal para quienes buscan recuperación rápida y definición muscular.",
        benefits: [
            "24 g de proteína por porción",
            "Absorción rápida post-entreno",
            "Bajo en lactosa y fácil digestión",
            "Apoya el crecimiento y mantenimiento muscular"
        ],
        usage: "Mezcla 1 scoop (30 g) con 250 ml de agua fría. Toma después de entrenar o entre comidas."
    },
    {
        id: 2,
        name: "Creatina Monohidratada",
        category: "creatina",
        price: 29.99,
        stock: 8,
        img: "img/cratina.jpg",
        brand: "MuscleTech",
        description: "Creatina monohidratada micronizada de alta calidad. Aumenta la fuerza, la potencia y el rendimiento en entrenamientos de alta intensidad.",
        benefits: [
            "Mejora fuerza y potencia en levantamientos",
            "Aumenta la capacidad de trabajo muscular",
            "Favorece la hidratación celular (volumen muscular)",
            "Suplemento respaldado por décadas de investigación"
        ],
        usage: "5 g diarios mezclados con agua o tu batido de proteína. Puede tomarse en cualquier momento del día."
    },
    {
        id: 3,
        name: "BCAA Amino Energy",
        category: "aminoacidos",
        price: 24.50,
        stock: 22,
        img: "img/bcaa.png",
        brand: "ON",
        description: "Fórmula de aminoácidos ramificados (BCAA) con energía adicional. Perfecta para entrenamientos largos o en ayunas.",
        benefits: [
            "Reduce la fatiga muscular durante el ejercicio",
            "Apoya la recuperación entre series",
            "Ayuda a preservar masa muscular",
            "Sabor refrescante para hidratarte mientras entrenas"
        ],
        usage: "1 scoop en 350 ml de agua. Consume antes o durante tu sesión de entrenamiento."
    },
    {
        id: 4,
        name: "C4 Pre-Workout",
        category: "pre-workout",
        price: 35.00,
        stock: 15,
        img: "img/prework.webp",
        brand: "Cellucor",
        description: "Pre-entreno de referencia con cafeína, beta-alanina y óxido nítrico. Diseñado para máxima energía, enfoque y pump muscular.",
        benefits: [
            "Energía inmediata y concentración mental",
            "Mayor resistencia muscular (beta-alanina)",
            "Mejor flujo sanguíneo y bombeo",
            "Rendimiento superior en sesiones intensas"
        ],
        usage: "1 porción con 200 ml de agua, 20–30 minutos antes de entrenar. No exceder 1 porción al día."
    },
    {
        id: 5,
        name: "ISO 100 Protein",
        category: "proteina",
        price: 55.00,
        stock: 5,
        img: "img/iso100.avif",
        brand: "Dymatize",
        description: "Hidrolizado de proteína de suero 100% ISO. La opción premium para digestión ultrarrápida y máxima pureza proteica.",
        benefits: [
            "25 g de proteína de rápida absorción",
            "Prácticamente cero grasa y carbohidratos",
            "Ideal post-entreno o al despertar",
            "Textura suave y excelente solubilidad"
        ],
        usage: "1 scoop con agua o leche descremada después del entrenamiento o al iniciar el día."
    },
    {
        id: 6,
        name: "Creatine HCL",
        category: "creatina",
        price: 32.00,
        stock: 30,
        img: "img/hcl.avif",
        brand: "Kaged Muscle",
        description: "Creatina en forma de clorhidrato, más soluble y con menor retención de agua. Dosis más pequeña con gran efectividad.",
        benefits: [
            "Alta solubilidad y fácil digestión",
            "Dosis reducida con efectos similares a la monohidratada",
            "Menor sensación de hinchazón",
            "Apoya fuerza y rendimiento sin volumen excesivo"
        ],
        usage: "1.5 g diarios mezclado con agua. No requiere fase de carga."
    },
    {
        id: 7,
        name: "Mass Gainer Extreme",
        category: "proteina",
        price: 48.00,
        stock: 18,
        img: "img/gainer.webp",
        brand: "GAT Sport",
        description: "Ganador de peso con alto aporte calórico, proteínas y carbohidratos. Pensado para ectomorfos y quienes buscan subir de volumen.",
        benefits: [
            "Alto aporte calórico para ganar masa",
            "Combinación de proteína y carbohidratos complejos",
            "Apoya el superávit calórico diario",
            "Ideal para atletas con metabolismo acelerado"
        ],
        usage: "2 scoops mezclados con leche o agua, 1–2 veces al día entre comidas o post-entreno."
    },
    {
        id: 8,
        name: "L-Glutamine 5000",
        category: "aminoacidos",
        price: 19.99,
        stock: 3,
        img: "img/glutamine.jpg",
        brand: "Now Sports",
        description: "L-Glutamina pura en polvo. Aminoácido clave para recuperación, sistema inmune y salud intestinal del atleta.",
        benefits: [
            "Acelera la recuperación muscular",
            "Apoya el sistema inmunológico bajo estrés de entreno",
            "Favorece la salud del tracto digestivo",
            "Reduce el dolor muscular post-entreno (DOMS)"
        ],
        usage: "5 g (1 scoop) con agua, preferiblemente después de entrenar o antes de dormir."
    }
];

const bestsellerCategories = ['proteina', 'creatina', 'aminoacidos', 'pre-workout'];
const productsStorageKey = 'puntofit-products';

function loadProducts() {
    try {
        const stored = localStorage.getItem(productsStorageKey);
        if (stored) return JSON.parse(stored);
    } catch {
        /* usar catálogo por defecto */
    }
    return JSON.parse(JSON.stringify(products));
}

function saveProducts(productList) {
    localStorage.setItem(productsStorageKey, JSON.stringify(productList));
}

function getBestsellers() {
    const list = loadProducts();
    return bestsellerCategories.map(cat => list.find(p => p.category === cat)).filter(Boolean);
}

const categoryInfo = {
    proteina: {
        title: "Proteínas",
        icon: "fa-dumbbell",
        description: "Las proteínas son el pilar para la recuperación y el crecimiento muscular. Ideales después del entrenamiento o como complemento diario según tu objetivo.",
        benefits: [
            "Apoyan la síntesis de proteína muscular",
            "Mejoran la recuperación post-entreno",
            "Ayudan a alcanzar tu requerimiento diario de proteína"
        ],
        usage: "1 scoop (25–30 g) mezclado con agua o leche, preferiblemente después de entrenar."
    },
    creatina: {
        title: "Creatinas",
        icon: "fa-bolt",
        description: "La creatina aumenta la energía disponible para ejercicios de alta intensidad, mejorando fuerza y rendimiento en series cortas y explosivas.",
        benefits: [
            "Incrementan fuerza y potencia",
            "Mejoran el rendimiento en entrenamientos intensos",
            "Uno de los suplementos más estudiados y seguros"
        ],
        usage: "5 g diarios, en cualquier momento del día. Mantén hidratación adecuada."
    },
    aminoacidos: {
        title: "Aminoácidos",
        icon: "fa-flask",
        description: "Los aminoácidos (BCAA, glutamina, etc.) apoyan la recuperación, reducen el cansancio muscular y ayudan a preservar masa magra.",
        benefits: [
            "Apoyan la recuperación muscular",
            "Pueden reducir la fatiga durante el entreno",
            "Complementan tu plan de nutrición deportiva"
        ],
        usage: "Según el producto: generalmente antes, durante o después del entrenamiento."
    },
    "pre-workout": {
        title: "Pre-Entrenos",
        icon: "fa-fire",
        description: "Fórmulas diseñadas para darte energía, enfoque y resistencia antes de entrenar. Perfectas para sesiones exigentes.",
        benefits: [
            "Más energía y concentración",
            "Mejor bombeo muscular (pump)",
            "Rendimiento optimizado en cada sesión"
        ],
        usage: "1 porción 20–30 minutos antes de entrenar. No exceder la dosis recomendada."
    }
};
