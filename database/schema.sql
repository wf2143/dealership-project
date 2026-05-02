-- =============================================================
--  dealership_db  –  schema + demo seed data
--  Safe to re-run: CREATE IF NOT EXISTS + INSERT IGNORE
-- =============================================================

CREATE DATABASE IF NOT EXISTS dealership_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE dealership_db;

-- -------------------------------------------------------------
--  EMPLOYEE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employee (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name  VARCHAR(100),
    username   VARCHAR(100) UNIQUE,
    password   VARCHAR(255),
    role       VARCHAR(100),
    email      VARCHAR(255),
    phone      VARCHAR(20),
    hire_date  DATE,
    end_date   DATE,
    salary     DOUBLE,
    active     TINYINT(1)   DEFAULT 1
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
    days_on_lot INT
);

-- -------------------------------------------------------------
--  CUSTOMER
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200),
    phone       VARCHAR(20),
    email       VARCHAR(255)
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

-- =============================================================
--  SEED DATA  (INSERT IGNORE keeps re-runs idempotent)
-- =============================================================

-- -------------------------------------------------------------
--  Employees  –  password for all demo accounts: demo123
-- -------------------------------------------------------------
INSERT IGNORE INTO employee
    (id, first_name, last_name, username, password, role,               email,                        phone,          hire_date,   salary, active)
VALUES
    (1,  'Gary',     'Mitchell','gmanager','demo123','General Manager',  'g.mitchell@dealership.com',  '555-100-0001', '2019-03-15', 95000, 1),
    (2,  'James',    'Smith',   'jsmith',  'demo123','Sales Associate',  'j.smith@dealership.com',     '555-100-0002', '2021-06-01', 52000, 1),
    (3,  'Maria',    'Wilson',  'mwilson', 'demo123','Finance Manager',  'm.wilson@dealership.com',    '555-100-0003', '2020-01-10', 78000, 1),
    (4,  'Tom',      'Larson',  'tlot',    'demo123','Lot Manager',      't.larson@dealership.com',    '555-100-0004', '2018-09-20', 60000, 1),
    (5,  'Sara',     'Chen',    'stech',   'demo123','Service Advisor',  's.chen@dealership.com',      '555-100-0005', '2022-02-14', 55000, 1);

-- -------------------------------------------------------------
--  Vehicles
-- -------------------------------------------------------------
INSERT IGNORE INTO vehicle
    (id, vin,               make,       model,      trim,      color,        year, mileage, price,    body_type, fuel_type, status,     lot, days_on_lot)
VALUES
    ( 1, '1HGBH41JXMN109186','Honda',   'Civic',    'EX',      'Pearl White', 2023,   4200, 27500.00, 'Sedan',   'Gas',     'available','A',   12),
    ( 2, '2T1BURHE0JC012345','Toyota',  'Corolla',  'LE',      'Midnight Blue',2022, 18500, 22900.00, 'Sedan',   'Gas',     'available','A',   28),
    ( 3, '3VWFE21C04M000001','Toyota',  'Camry',    'XSE',     'Lunar Rock',  2023,   1100, 34200.00, 'Sedan',   'Hybrid',  'available','A',    5),
    ( 4, '1FTFW1ET5DFC10312','Ford',    'F-150',    'XLT',     'Oxford White',2022,  32000, 41500.00, 'Truck',   'Gas',     'available','B',   45),
    ( 5, '1GC4K0E8XGF200001','Chevy',   'Silverado','LT',      'Black',       2023,   8900, 46800.00, 'Truck',   'Gas',     'available','B',   19),
    ( 6, '5FNRL6H75NB000123','Honda',   'Odyssey',  'EX-L',    'Sonic Gray',  2022,  22000, 38900.00, 'Minivan', 'Gas',     'available','B',   33),
    ( 7, 'WBA5A5C57GD520900','BMW',     '3 Series', '330i',    'Alpine White',2022,  14500, 44500.00, 'Sedan',   'Gas',     'available','C',   21),
    ( 8, 'KMHD84LF9KU100001','Hyundai', 'Elantra',  'SEL',     'Phantom Black',2023,  3300, 24100.00, 'Sedan',   'Gas',     'available','A',    8),
    ( 9, '1N4BL4BV2KC100001','Nissan',  'Altima',   '2.5 SV',  'Gun Metallic',2022,  28000, 26400.00, 'Sedan',   'Gas',     'available','A',   52),
    (10, '5TDKZ3DC8LS000001','Toyota',  'Sienna',   'XLE',     'Blizzard Pearl',2023, 6600, 48200.00, 'Minivan', 'Hybrid',  'available','B',   14),
    (11, 'JM3KFBDM5M0400001','Mazda',   'CX-5',     'Touring', 'Soul Red',    2022,  19000, 31900.00, 'SUV',     'Gas',     'available','C',   37),
    (12, '2HKRW2H50NH600001','Honda',   'CR-V',     'Sport',   'Radiant Red', 2023,   5500, 35700.00, 'SUV',     'Gas',     'available','C',   10),
    (13, '1C4RJFBG8LC100001','Jeep',    'Grand Cherokee','Laredo','Diamond Black',2022,41000,37200.00,'SUV',    'Gas',     'hold',     'B',   60),
    (14, 'WVGZZZ5NZKW000001','VW',      'Tiguan',   'SEL',     'Deep Black',  2023,   2200, 36800.00, 'SUV',     'Gas',     'hold',     'C',   17),
    (15, '1FMCU9HD0KUA00001','Ford',    'Escape',   'Titanium','Rapid Red',   2022,  25000, 29900.00, 'SUV',     'Gas',     'hold',     'A',   41),
    (16, '5YJSA1E22MF000001','Tesla',   'Model 3',  'Long Range','Pearl White',2022, 31000, 49900.00, 'Sedan',   'Electric','incoming', 'C',    0),
    (17, '2C3CDZAG0NH000001','Dodge',   'Charger',  'R/T',     'TorRed',      2023,   1800, 44700.00, 'Sedan',   'Gas',     'incoming', 'C',    0),
    (18, '1G1BC5SM5H7000001','Chevy',   'Cruze',    'LT',      'Mosaic Black',2021,  52000, 18400.00, 'Sedan',   'Gas',     'sold',     'A',   88),
    (19, '3MW5R7J07L8B00001','BMW',     '2 Series', '230i',    'Mineral White',2021, 47000, 38100.00, 'Coupe',   'Gas',     'sold',     'C',   75),
    (20, '1ZVBP8CF4E5000001','Ford',    'Mustang',  'GT',      'Race Red',    2021,  61000, 34500.00, 'Coupe',   'Gas',     'sold',     'B',  102);

-- -------------------------------------------------------------
--  Customers
-- -------------------------------------------------------------
INSERT IGNORE INTO customer (customer_id, name,               phone,          email)
VALUES
    (1, 'Robert Nguyen',    '555-200-0001', 'r.nguyen@email.com'),
    (2, 'Amanda Torres',    '555-200-0002', 'a.torres@email.com'),
    (3, 'Derek Phillips',   '555-200-0003', 'd.phillips@email.com'),
    (4, 'Lisa Harrington',  '555-200-0004', 'l.harrington@email.com'),
    (5, 'Kevin Oduya',      '555-200-0005', 'k.oduya@email.com');

-- -------------------------------------------------------------
--  Transactions  (reference the 3 sold vehicles: 18, 19, 20)
-- -------------------------------------------------------------
INSERT IGNORE INTO `transaction`
    (transaction_id, date,         amount,    payment_type, customer_id, vehicle_id)
VALUES
    (1, '2025-03-14', 18400.00, 'Finance',  1, 18),
    (2, '2025-03-22', 38100.00, 'Finance',  3, 19),
    (3, '2025-04-05', 34500.00, 'Cash',     2, 20);
