-- Hortti Inventory - Seeds

BEGIN;

INSERT INTO users (id, username, password_hash)
VALUES (
  '65b68556-6fcc-4262-9ed1-db3d09c780c7',
  'admin',
  'pbkdf2$100000$hRqfssUo14ad5/uvvAEVIA==$ds44uaO8Des60/pF1rYzxXs1leb795lMeMX/Icbg8oo='
)
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username,
    password_hash = EXCLUDED.password_hash;

INSERT INTO products (id, name, category, price_cents, image_path)
VALUES
  ('1077cb72-dced-4d26-af26-ec8ccf72f34a', 'Banana Prata', 'fruta', 399, NULL),
  ('eb0d50a3-5af6-4647-8d45-59d20ae50596', 'Maçã Gala', 'fruta', 599, NULL),
  ('4066a8e2-4b40-4777-b062-24d67f7b30ea', 'Alface Crespa', 'verdura', 299, NULL),
  ('3f4f20a6-abe8-4928-bb39-78272d2827ef', 'Tomate', 'legume', 799, NULL),
  ('fd535ff3-0af6-4aea-a72a-d83fd437145f', 'Cenoura', 'legume', 499, NULL)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    price_cents = EXCLUDED.price_cents,
    image_path = EXCLUDED.image_path;

COMMIT;

