-- ============================================================
-- Punto Fit — Ampliación del catálogo
-- Pega TODO este archivo en: Supabase → SQL Editor → New query → Run
-- Agrega 8 productos reales más (2 por categoría) a la tabla `productos`
-- que ya usa la tienda pública y el panel admin.
-- ============================================================

INSERT INTO public.productos (nombre, categoria, precio, inventario, imagen_url, descripcion, marca) VALUES
('Gold Standard 100% Whey',   'proteina',     42.99, 28, 'img/gold-standard-whey.jpg',        'Proteína de suero estándar de la industria, con 24 g de proteína por porción y mezcla suave.',        'Optimum Nutrition'),
('Syntha-6',                  'proteina',     39.99, 20, 'img/syntha6-protein.jpg',           'Mezcla de proteínas de múltiples fuentes con sabor premium, ideal para batidos cremosos.',             'BSN'),
('Creatine Monohydrate',      'creatina',     18.99, 40, 'img/creatine-monohydrate-bulk.jpg', 'Creatina monohidratada pura micronizada, sin sabor ni aditivos.',                                      'BulkSupplements'),
('Creapure Creatine Powder',  'creatina',     26.99, 25, 'img/creapure-creatine.jpg',         'Creatina Creapure de grado alemán, el estándar de pureza más alto del mercado.',                       'Now Sports'),
('Xtend BCAA',                'aminoacidos',  31.99, 18, 'img/xtend-bcaa.jpg',                'BCAA 7 g por porción con electrolitos, ideal para hidratación y recuperación durante el entreno.',    'Scivation'),
('L-Carnitine 1000',          'aminoacidos',  17.99, 12, 'img/l-carnitine.jpg',               'L-Carnitina en cápsulas para apoyo metabólico y aprovechamiento de grasas como energía.',              'Now Foods'),
('Ghost Legend Pre-Workout',  'pre-workout',  41.99, 15, 'img/ghost-legend-preworkout.jpg',   'Pre-entreno premium con sabores icónicos, cafeína y beta-alanina para máxima energía.',                'Ghost'),
('N.O.-Xplode',               'pre-workout',  36.99, 22, 'img/no-xplode-preworkout.jpg',      'El pre-entreno original de BSN, con complejo energético y enfoque explosivo.',                         'BSN');
