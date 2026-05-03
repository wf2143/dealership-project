-- =============================================================
--  dealership_db  –  schema + demo seed data
--  Safe to re-run: CREATE IF NOT EXISTS + INSERT IGNORE
-- =============================================================

CREATE DATABASE IF NOT EXISTS dealership_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE dealership_db;

-- -------------------------------------------------------------
--  APP_USER  (employees who log in to the system)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_user (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    username   VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    email      VARCHAR(255) UNIQUE,
    role       VARCHAR(100),
    start_date VARCHAR(50)
);

-- -------------------------------------------------------------
--  VEHICLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicle (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    vin         VARCHAR(17)  UNIQUE,
    make        VARCHAR(100),
    model       VARCHAR(100),
    trim        VARCHAR(100),
    color       VARCHAR(50),
    year        INT,
    mileage     INT,
    price       DOUBLE,
    body_type   VARCHAR(50),
    fuel_type   VARCHAR(50),
    status      VARCHAR(50),
    lot         VARCHAR(10),
    days_on_lot INT,
    add_date    DATE,
    change_date DATE
);

-- -------------------------------------------------------------
--  CUSTOMER
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200),
    phone       VARCHAR(20)  UNIQUE,
    email       VARCHAR(255) UNIQUE
);

-- -------------------------------------------------------------
--  TRANSACTION  (backtick-quoted – reserved word in MySQL)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transaction` (
    transaction_id BIGINT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    date           DATE,
    amount         DOUBLE,
    payment_type   VARCHAR(50),
    customer_id    BIGINT,
    vehicle_id     BIGINT,
    CONSTRAINT fk_txn_customer FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    CONSTRAINT fk_txn_vehicle  FOREIGN KEY (vehicle_id)  REFERENCES vehicle(id)
);

-- employee login lookup by username (app_user.username already has a UNIQUE constraint,
-- which implicitly creates an index)


-- =============================================================
--  VIEW: sale_summary
--  Joins transaction → customer → vehicle for reporting.
-- =============================================================
CREATE OR REPLACE VIEW sale_summary AS
SELECT
    t.transaction_id,
    t.date,
    t.amount,
    t.payment_type,
    c.customer_id,
    c.name         AS customer_name,
    c.phone        AS customer_phone,
    v.id           AS vehicle_id,
    v.year         AS vehicle_year,
    v.make         AS vehicle_make,
    v.model        AS vehicle_model,
    v.vin          AS vehicle_vin,
    v.price        AS list_price
FROM `transaction` t
JOIN customer c ON t.customer_id = c.customer_id
JOIN vehicle  v ON t.vehicle_id  = v.id;

-- =============================================================
--  TRIGGER: trg_mark_vehicle_sold
--  After a transaction is inserted, automatically marks the
--  associated vehicle status as 'sold'.
-- =============================================================
DROP TRIGGER IF EXISTS trg_mark_vehicle_sold;

DELIMITER $$
CREATE TRIGGER trg_mark_vehicle_sold
AFTER INSERT ON `transaction`
FOR EACH ROW
BEGIN
    UPDATE vehicle
    SET    status = 'sold'
    WHERE  id     = NEW.vehicle_id
      AND  status = 'available';
END$$
DELIMITER ;

-- =============================================================
--  SEED DATA  (INSERT IGNORE keeps re-runs idempotent)
-- =============================================================

-- -------------------------------------------------------------
--  Employees (app_user) – password for all accounts: demo123
-- -------------------------------------------------------------
INSERT IGNORE INTO app_user
    (id,   first_name,    last_name,    username,      password,  role,               email,                          start_date)
VALUES
    (1001, 'Jerry',       'Mouse',      'jmouse',      'demo123', 'Sales Associate',  'j.mouse@dealership.com',       '2020-01-15'),
    (1002, 'Tom',         'Cat',        'tcat',        'demo123', 'Finance Manager',  't.cat@dealership.com',         '2019-06-01'),
    (1003, 'Mickey',      'Michaels',   'mmichaels',   'demo123', 'General Manager',  'm.michaels@dealership.com',    '2018-03-10'),
    (1004, 'Minnie',      'MouseHouse', 'mmousehouse', 'demo123', 'Service Advisor',  'm.mousehouse@dealership.com',  '2021-09-20'),
    (1005, 'Jeffrey',     'Palmer',     'jpalmer',     'demo123', 'Lot Manager',      'j.palmer@dealership.com',      '2020-11-05'),
    (1006, 'Jean-Michel', 'Basquiat',   'jbasquiat',   'demo123', 'Sales Associate',  'j.basquiat@dealership.com',    '2022-04-18');

-- -------------------------------------------------------------
--  Vehicles
-- -------------------------------------------------------------
INSERT IGNORE INTO vehicle
    (id, vin,                  make,        model,       trim, color,   year, mileage,  price,    body_type, fuel_type, status,      lot, days_on_lot)
VALUES
    (1, '1NKCMUEX8BR285459',  'Ford',       'F-150',     NULL, 'Black', 1990, 120000,  7000.00,  'Truck',   'Gas',     'available', 'A', 0),
    (2, '1FTSF30Y75E471696',  'Honda',      'Accord',    NULL, 'Red',   2020,  30000, 25000.00,  'Sedan',   'Gas',     'available', 'A', 0),
    (3, '2FAPP36X6JB175858',  'Chrysler',   'Sebring',   NULL, 'Blue',  2013,  59000, 21000.00,  'Coupe',   'Gas',     'available', 'B', 0),
    (4, '1M2AM20C94M003987',  'Ford',       'Expedition',NULL, 'Black', 1990, 234000,  7500.00,  'SUV',     'Gas',     'available', 'B', 0),
    (5, '1GCEC14Z77Z197928',  'Chevrolet',  '2500',      NULL, 'Green', 2011, 264000, 10000.00,  'Truck',   'Diesel',  'available', 'C', 0);

-- -------------------------------------------------------------
--  Customers
-- -------------------------------------------------------------
INSERT IGNORE INTO customer (customer_id, name,              phone,          email)
VALUES
    (1, 'John Smith',       '555-300-0001', 'j.smith@email.com'),
    (2, 'James Doe',        '555-300-0002', 'j.doe@email.com'),
    (3, 'Kate Mclaughlin',  '555-300-0003', 'k.mclaughlin@email.com'),
    (4, 'Kim Paul',         '555-300-0004', 'k.paul@email.com'),
    (5, 'Leon Silva',       '555-300-0005', 'l.silva@email.com');
